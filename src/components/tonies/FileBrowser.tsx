import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useTranslation } from "react-i18next";
import { Modal, Table, Tooltip, message } from "antd";
import { Key } from "antd/es/table/interface"; // Import Key type from Ant Design
import { SortOrder } from "antd/es/table/interface";

import { useAudioContext } from "../audio/AudioContext";

import { CloudServerOutlined, PlayCircleOutlined, TruckOutlined } from "@ant-design/icons";
import { humanFileSize } from "../../util/humanFileSize";

export const FileBrowser: React.FC<{
    special: string;
    overlay?: string;
    maxSelectedRows?: number;
    trackUrl?: boolean;
    selectTafOnly?: boolean;
    showDirOnly?: boolean;
    onFileSelectChange?: (files: any[], path: string, special: string) => void;
}> = ({
    special,
    overlay = "",
    maxSelectedRows = 0,
    selectTafOnly = true,
    trackUrl = true,
    showDirOnly = false,
    onFileSelectChange,
}) => {
    const { t } = useTranslation();

    const { playAudio } = useAudioContext();
    const [messageApi, contextHolder] = message.useMessage();
    const [files, setFiles] = useState([]);
    const [path, setPath] = useState("");
    const [rebuildList, setRebuildList] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const [currentFile, setCurrentFile] = useState("");

    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

    const [jsonData, setJsonData] = useState(null);
    const [jsonViewerModalOpened, setJsonViewerModalOpened] = useState(false);

    const fetchJsonData = async (url: string) => {
        try {
            const response = await fetch(url);
            const data = await response.json();
            setJsonData(data);
        } catch (error) {
            console.error("Error fetching JSON data:", error);
        }
    };

    const showJsonViewer = (file: string) => {
        fetchJsonData(process.env.REACT_APP_TEDDYCLOUD_API_URL + "/content" + file);
        setCurrentFile(file);
        setJsonViewerModalOpened(true);
    };

    const handleJsonViewerModalClose = () => {
        setJsonViewerModalOpened(false);
    };
    const rowClassName = (record: any) => {
        return selectedRowKeys.includes(record.key) ? "highlight-row" : "";
    };
    const onSelectChange = (newSelectedRowKeys: Key[]) => {
        if (selectTafOnly) {
            const rowCount = newSelectedRowKeys.length;
            newSelectedRowKeys = newSelectedRowKeys.filter((key) => {
                const file = files.find((f: any) => f.name === key) as any;
                return file && file.tafHeader !== undefined;
            });
            if (rowCount !== newSelectedRowKeys.length) {
                message.warning(t("fileBrowser.selectTafOnly"));
            }
        }
        if (newSelectedRowKeys.length > maxSelectedRows) {
            message.warning(
                t("fileBrowser.maxSelectedRows", {
                    maxSelectedRows: maxSelectedRows,
                })
            );
        } else {
            setSelectedRowKeys(newSelectedRowKeys);
        }

        const selectedFiles = files?.filter((file: any) => newSelectedRowKeys.includes(file.name)) || [];
        if (onFileSelectChange !== undefined) onFileSelectChange(selectedFiles, path, special);
    };

    useEffect(() => {
        // Function to parse the query parameters from the URL
        const queryParams = new URLSearchParams(location.search);
        const initialPath = queryParams.get("path") || ""; // Get the 'path' parameter from the URL, default to empty string if not present

        setPath(initialPath); // Set the initial path
    }, [location]);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        queryParams.set("path", "");
        setPath("");
        const newUrl = `${window.location.pathname}?${queryParams.toString()}`;
        window.history.replaceState(null, "", newUrl);
        setRebuildList(!rebuildList);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [overlay]);

    useEffect(() => {
        // TODO: fetch option value with API Client generator
        fetch(
            `${process.env.REACT_APP_TEDDYCLOUD_API_URL}/api/fileIndexV2?path=${path}&special=${special}` +
                (overlay ? `&overlay=${overlay}` : "")
        )
            .then((response) => response.json())
            .then((data) => {
                var list: never[] = data.files;

                if (showDirOnly) list = list.filter((file: any) => file.isDir);

                setFiles(list);
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [path, special, showDirOnly, rebuildList]);

    const handleDirClick = (dirPath: string) => {
        const newPath = dirPath === ".." ? path.split("/").slice(0, -1).join("/") : `${path}/${dirPath}`;
        if (trackUrl) {
            navigate(`?path=${newPath}`); // Update the URL with the new path using navigate
        }
        setPath(newPath); // Update the path state
    };

    const getFieldValue = (obj: any, keys: string[]) => {
        return keys.reduce((acc, currentKey) => {
            if (acc && acc[currentKey] !== undefined) {
                return acc[currentKey];
            }
            return undefined;
        }, obj);
    };
    const defaultSorter = (a: any, b: any, dataIndex: string | string[]) => {
        // Get the values of the fields
        const fieldA = Array.isArray(dataIndex) ? getFieldValue(a, dataIndex) : a[dataIndex];
        const fieldB = Array.isArray(dataIndex) ? getFieldValue(b, dataIndex) : b[dataIndex];

        if (fieldA === undefined && fieldB === undefined) {
            return 0; // Both values are undefined, consider them equal
        } else if (fieldA === undefined) {
            return 1; // Field A is undefined, consider it greater than B
        } else if (fieldB === undefined) {
            return -1; // Field B is undefined, consider it greater than A
        }

        if (typeof fieldA === "string" && typeof fieldB === "string") {
            return fieldA.localeCompare(fieldB);
        } else if (typeof fieldA === "number" && typeof fieldB === "number") {
            return fieldA - fieldB;
        } else {
            console.log("Unsupported types for sorting:", a, b);
            console.log("Unsupported types for sorting field:", dataIndex, fieldA, fieldB);
            return 0;
        }
    };
    const dirNameSorter = (a: any, b: any) => {
        if (a.isDir === b.isDir) {
            return defaultSorter(a, b, "name");
        }
        return a.isDir ? -1 : 1;
    };

    const migrateContent2Lib = (ruid: string, libroot: boolean, overlay?: string) => {
        try {
            messageApi.open({
                type: "loading",
                content: t("fileBrowser.messages.migrationOngoing"),
                duration: 0,
            });

            const body = `ruid=${ruid}&libroot=${libroot}`;
            fetch(
                process.env.REACT_APP_TEDDYCLOUD_API_URL +
                    "/api/migrateContent2Lib" +
                    (overlay ? "?overlay=" + overlay : ""),
                {
                    method: "POST",
                    body: body,
                    headers: {
                        "Content-Type": "text/plain",
                    },
                }
            )
                .then(() => {
                    messageApi.destroy();
                    messageApi.open({
                        type: "success",
                        content: t("fileBrowser.messages.migrationSuccessful"),
                    });

                    // now the page shall reload
                    setRebuildList(!rebuildList);
                })
                .catch((error) => {
                    messageApi.destroy();
                    messageApi.open({
                        type: "error",
                        content: t("fileBrowser.messages.migrationFailed") + ": " + error,
                    });
                });
        } catch (error) {
            messageApi.destroy();
            messageApi.open({
                type: "error",
                content: t("fileBrowser.messages.migrationFailed") + ": " + error,
            });
        }
    };

    var columns = [
        {
            title: "",
            dataIndex: ["tonieInfo", "picture"],
            key: "picture",
            sorter: undefined,
            render: (picture: string) =>
                picture && <img src={picture} alt={t("tonies.content.toniePicture")} style={{ width: 100 }} />,
            showOnDirOnly: false,
        },
        {
            title: t("fileBrowser.name"),
            dataIndex: "name",
            key: "name",
            sorter: dirNameSorter,
            defaultSortOrder: "ascend" as SortOrder,
            render: (name: string, record: any) => (record.isDir ? "[" + name + "]" : name),
            showOnDirOnly: true,
        },
        {
            title: t("fileBrowser.size"),
            dataIndex: "size",
            key: "size",
            render: (size: number, record: any) => (record.isDir ? "<DIR>" : humanFileSize(size)),
            showOnDirOnly: false,
        },
        {
            title: t("fileBrowser.model"),
            dataIndex: ["tonieInfo", "model"],
            key: "model",
            showOnDirOnly: false,
        },
        {
            title: t("fileBrowser.series"),
            dataIndex: ["tonieInfo", "series"],
            key: "series",
            showOnDirOnly: false,
        },
        {
            title: t("fileBrowser.episode"),
            dataIndex: ["tonieInfo", "episode"],
            key: "episode",
            showOnDirOnly: false,
        },
        {
            title: t("fileBrowser.date"),
            dataIndex: "date",
            key: "date",
            render: (timestamp: number) => new Date(timestamp * 1000).toLocaleString(),
            showOnDirOnly: true,
        },
        {
            title: "",
            dataIndex: "name",
            key: "controls",
            sorter: undefined,
            render: (name: string, record: any) =>
                record.tafHeader
                    ? [
                          special !== "library" ? (
                              <Tooltip title={t("fileBrowser.migrateContentToLib")}>
                                  <CloudServerOutlined
                                      onClick={() => migrateContent2Lib(path.replace("/", "") + name, false, overlay)}
                                      style={{ margin: "0 16px 0 0" }}
                                  />
                              </Tooltip>
                          ) : (
                              ""
                          ),
                          special !== "library" ? (
                              <Tooltip title={t("fileBrowser.migrateContentToLibRoot")}>
                                  <TruckOutlined
                                      onClick={() => migrateContent2Lib(path.replace("/", "") + name, true, overlay)}
                                      style={{ margin: "0 16px 0 0" }}
                                  />
                              </Tooltip>
                          ) : (
                              ""
                          ),
                          <Tooltip title={t("fileBrowser.playFile")}>
                              <PlayCircleOutlined
                                  onClick={() =>
                                      playAudio(
                                          process.env.REACT_APP_TEDDYCLOUD_API_URL +
                                              "/content" +
                                              path +
                                              "/" +
                                              name +
                                              "?ogg=true&special=" +
                                              special +
                                              (overlay ? `&overlay=${overlay}` : ""),
                                          record.tonieInfo
                                      )
                                  }
                              />
                          </Tooltip>,
                      ]
                    : "",
            showOnDirOnly: false,
        },
    ];

    columns.forEach((column) => {
        if (!column.hasOwnProperty("sorter")) {
            (column as any).sorter = (a: any, b: any) => defaultSorter(a, b, column.dataIndex);
        }
    });

    if (showDirOnly) columns = columns.filter((column) => column.showOnDirOnly);

    return (
        <>
            {contextHolder}
            <Modal
                width={700}
                title={"File: " + currentFile}
                open={jsonViewerModalOpened}
                onCancel={handleJsonViewerModalClose}
                onOk={handleJsonViewerModalClose}
            >
                {jsonData ? <pre style={{ overflow: "auto" }}>{JSON.stringify(jsonData, null, 2)}</pre> : "Loading..."}
            </Modal>
            <Table
                dataSource={files}
                columns={columns}
                rowKey="name"
                pagination={false}
                onRow={(record) => ({
                    onDoubleClick: () => {
                        if (record.isDir) {
                            handleDirClick(record.name);
                        } else if (record.name.includes(".json")) {
                            console.log("json");
                            showJsonViewer(path + "/" + record.name);
                        }
                    },
                })}
                rowClassName={rowClassName}
                rowSelection={
                    maxSelectedRows > 0
                        ? {
                              selectedRowKeys,
                              onChange: onSelectChange,
                          }
                        : undefined
                }
            />
        </>
    );
};
