export interface IAlConcertByPlatformType {
  platform: string; // 平台 1:大麦DM 2:猫眼MM 3:票星球PS
  cty: string; // 城市
  keyword?: string; // 搜索关键字
  ctl?: string; // 地区
}

export interface IAlConcertDetailType {
  platform: string; // 平台 1:大麦DM 2:猫眼MM 3:票星球PS
  show_id: string; // 演唱会id
}
