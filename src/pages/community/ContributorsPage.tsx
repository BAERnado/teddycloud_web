import { useTranslation } from "react-i18next";
import { Typography } from "antd";

import {
    HiddenDesktop,
    StyledBreadcrumb,
    StyledContent,
    StyledLayout,
    StyledSider,
} from "../../components/StyledComponents";
import { CommunitySubNav } from "../../components/community/CommunitySubNav";
import { TonieMeetingElement } from "../../components/TonieMeeting";

const { Paragraph } = Typography;

export const ContributorsPage = () => {
    const { t } = useTranslation();

    return (
        <>
            <StyledSider>
                <CommunitySubNav />
            </StyledSider>
            <StyledLayout>
                <HiddenDesktop>
                    <CommunitySubNav />
                </HiddenDesktop>
                <StyledBreadcrumb
                    items={[
                        { title: t("home.navigationTitle") },
                        { title: t("community.navigationTitle") },
                        { title: t("community.contributors.navigationTitle") },
                    ]}
                />
                <StyledContent>
                    <h1>{t(`community.contributors.title`)}</h1>
                    <Paragraph>tbd.</Paragraph>
                    <Paragraph>
                        <TonieMeetingElement
                            maxNoOfGuests={100}
                            toniesSize={150}
                            showQuestionMark={false}
                            height={150}
                        ></TonieMeetingElement>
                    </Paragraph>
                </StyledContent>
            </StyledLayout>
        </>
    );
};
