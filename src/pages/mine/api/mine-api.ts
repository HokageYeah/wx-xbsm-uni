import type { UserSubscribeListType } from './api-types';
import ajax from '@/uni-module-common/http';

/**
 *  获取用户订阅监控列表
 */
export function getUserSubscribeList(data: UserSubscribeListType) {
  return ajax({
    url: '/api/v1/wx/mini.get.user.subscribe.monitor.list',
    method: 'POST',
    data,
    custom: {
      showLoading: true
    }
  });
}
