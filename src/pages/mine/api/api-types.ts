export interface UserSubscribeListType {
  pageSize: number; // 平台 1:大麦DM 2:猫眼MM 3:票星球PS
  page: number; // 城市
  platform: string; // 平台
}

export interface DeleteUserSubscribeMonitorType {
  delete_list: {
    show_id: string;
    perform_id: string;
    sku_ids: string[];
  }[];
}
