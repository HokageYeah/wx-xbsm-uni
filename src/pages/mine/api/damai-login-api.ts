import ajax from '@/uni-module-common/http';

/**
 *  1、获取大麦登录二维码
 */
export function Dama_GetLoginQrcode(data: any) {
  return ajax({
    url: '/api/v1/web/login.qrcode.by.platform',
    method: 'GET',
    data,
    custom: {
      showLoading: true
    }
  });
}

/**
 *  2、调用网站验证查询是否扫码登录
 */
export function Dama_LoginQueryByPlatform(data: any) {
  return ajax({
    url: '/api/v1/web/login.query.by.platform',
    method: 'POST',
    data,
    custom: {
      showLoading: true
    }
  });
}

/**
 *  3、扫码成功后调用登录
 */
export function Dama_DoLoginByPlatform(data: any) {
  return ajax({
    url: '/api/v1/web/dologin.by.platform',
    method: 'GET',
    data,
    custom: {
      showLoading: true
    }
  });
}

/**
 *  4、获取大麦网用户信息(主要获取_m_h5_tk 和 _m_h5_tk_enc)
 */
export function Dama_GetLoginStatus(data: any) {
  return ajax({
    url: '/api/v1/web/userinfo.by.platform',
    method: 'GET',
    data,
    custom: {
      showLoading: true
    }
  });
}
