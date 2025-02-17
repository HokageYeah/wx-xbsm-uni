import type { IAlConcertByPlatformType, IAlConcertDetailType } from './api-types';
import ajax from '@/uni-module-common/http';
/**
 *  获取网页web平台下的演唱会搜索所有数据
 */
export function getWebAlConcertByPlatform(data: IAlConcertByPlatformType) {
  return ajax({
    url: '/api/v1/web/search.concert.by.platform',
    method: 'GET',
    data,
    custom: {
      showLoading: true
    }
  });
}

/**
 * 获取网页H5平台下的演唱会搜索所有数据
 */
export function getH5AlConcertByPlatform(data: IAlConcertByPlatformType) {
  return ajax({
    url: '/api/v1/h5/search.concert.by.platform',
    method: 'GET',
    data
  });
}

/**
 * 获取演唱会详情
 */
export function getAlConcertDetail(data: IAlConcertDetailType) {
  return ajax({
    url: '/api/v1/web/get.item.detail.by.platform',
    method: 'GET',
    data
  });
}
