export interface IAlConcertByPlatformType {
  platform: string; // 平台 1:大麦DM 2:猫眼MM 3:票星球PS
  cty: string; // 城市
  keyword?: string; // 搜索关键字
  ctl?: string; // 地区
  otherData?: string; // 其他数据
}

export interface IAlConcertDetailType {
  platform: string; // 平台 1:大麦DM 2:猫眼MM 3:票星球PS
  show_id: string; // 演唱会id
  session_id?: string; // 场次id
}

export interface IRecordWebConcertMonitorType {
  show_id: string; // 演唱会id
  show_name: string; // 演唱会名称
  deadline: string; // 监控持续时间
  cover_url: string; // 封面图片
  venue_city_name: string; // 场馆城市
  venue_name: string; // 场馆名称
  venue_addr: string; // 场馆地址
  ticket_perform: any[]; // 票价信息
}
