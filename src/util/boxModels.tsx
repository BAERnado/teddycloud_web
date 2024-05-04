// MockUp?, ToDo Replace with tonieboxes.json like tonies.json, 
// crop is used later to crop the image that they have the same size. 03-0013-i.png is kind of reference image 
// crop [x, y, width, height] means crop image starting from x,y with width and height.
export const boxModelImages = [
  { id: '03-0013', name: 'Green', img_src: 'https://cdn.tonies.de/thumbnails/03-0013-i.png' },
  { id: '03-0012', name: 'Light Blue', img_src: 'https://cdn.tonies.de/thumbnails/03-0012-i.png' },
  { id: '03-0011', name: 'Red', img_src: 'https://cdn.tonies.de/thumbnails/03-0011-i.png' },
  { id: '03-0014', name: 'Pink', img_src: 'https://cdn.tonies.de/thumbnails/03-0014-i.png' },
  { id: '03-0010', name: 'Purple', img_src: 'https://cdn.tonies.de/thumbnails/03-0010-i.png' },
  { id: '03-0009', name: 'Grey', img_src: 'https://cdn.tonies.de/thumbnails/03-0009-i.png' },
  { id: '10001853', name: 'Red - Disney 100 Limited Edition', img_src: 'https://cdn.tonies.de/thumbnails/10001853_Toniebox_Disney_d.png', crop: [110,13,930,930] },
  { id: '03-0005', name: 'Dark Grey - Unter meinem Bett Limited Edition', img_src: 'https://cdn.tonies.de/thumbnails/03-0005-i.png' },
  { id: '10000490', name: 'Black - 3 Fragezeichen Limited Edition', img_src: 'https://cdn.tonies.de/thumbnails/10000490-i.png', crop: [0,15,480,480]},
  { id: '03-0008', name: 'Turquoise - Limited Edition', img_src: 'https://cdn.tonies.de/thumbnails/03-0008-i.png' },
  { id: '10002192', name: 'Gulli - Limited Edition', img_src: 'https://cdn.tonies.de/thumbnails/10002192_Toniebox_gulli_d.png', crop: [110,13,930,930] },
  // not real box models, only offical tonie covers
  { id: '99-0001', name: 'Box Cover Sleepy Bear', img_src: 'https://278163f382d2bab4b036-4f5ec62496a160f3570d3b6e48fc4516.ssl.cf3.rackcdn.com/Tonies_Cover_SleepyB-Z4RAvhCP.png', crop: [210,120,770,770] },
  { id: '99-0002', name: 'Box Cover Sleepy Sheep', img_src: 'https://278163f382d2bab4b036-4f5ec62496a160f3570d3b6e48fc4516.ssl.cf3.rackcdn.com/Tonies_Cover_SleepyS-e5lq1qK_.png', crop: [210,120,770,770] },
  { id: '99-0003', name: 'Box Cover Sleepy Rabbit', img_src: 'https://278163f382d2bab4b036-4f5ec62496a160f3570d3b6e48fc4516.ssl.cf3.rackcdn.com/Tonies_Cover_SleepyR-oenxTNhu.png', crop: [210,120,770,770] },
];