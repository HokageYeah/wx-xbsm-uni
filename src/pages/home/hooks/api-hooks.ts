import type { IAlConcertByPlatformType } from './api-types';
import ajax from '@/uni-module-common/http';
/**
 *  获取网页平台下的演唱会搜索所有数据
 */
export function getAlConcertByPlatform(data: IAlConcertByPlatformType) {
  return ajax({
    url: '/api/v1/web/search.concert.by.platform',
    method: 'GET',
    data,
    custom: {
      showLoading: true
    }
  });
}
