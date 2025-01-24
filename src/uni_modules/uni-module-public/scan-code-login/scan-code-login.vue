<template>
  <view class="container">
    <camera
      v-if="scanFlag"
      class="camera"
      device-position="back"
      mode="scanCode"
      @scancode="scancode"
      @error="error"
    >
      <cover-view class="content"> </cover-view>
      <cover-view class="content-title">
        <cover-view>扫描模拟登录的二维码</cover-view>
        <cover-view class="scan-block">
          <!-- <cover-view class="scan-line"></cover-view> -->
        </cover-view>
      </cover-view>
    </camera>
    <!-- <cover-view class="content"> </cover-view>
    <cover-view class="content-title">
      <view>扫描书籍的 ISBN 条码</view>
      <view class="scan-block">
        <view class="scan-line"></view>
      </view>
      <view class="scan-bottom">扫不出来？试试手动输入</view>
    </cover-view> -->
  </view>
</template>

<script setup lang="ts">
import { getAuthorize } from '@/uni-module-common/utils/util';
import { dealLoginOutToken, loginInfoDealGradeTerm } from '@/uni-module-common/hooks/useLoginHooks';
import { newloginInfoDealSingUserInfo } from '@/uni-module-common/utils/login-info';
import { isLoginFunc } from '@/uni-module-common/store/user';
import { saveCookies } from '@/uni-module-common/http/index';
const router = useRouter();
const scanFlag = ref(false);
const instance: any = getCurrentInstance();
const eventChannel = instance?.proxy.getOpenerEventChannel();
const { userInfo } = useStore('user');
const error = (e: any) => {
  console.log(e.detail);
};
const barCodeError = (type: number, message: any) => {
  uni.navigateBack({
    success() {
      setTimeout(() => {
        uni.showToast({
          title: message,
          icon: type === 0 ? 'error' : 'success',
          duration: 2000
        });
      }, 200);
    }
  });
};
// 模拟登录数据处理
const mockLogin = (res: any) => {
  const { setDeafultGradeTerm, updateUserData, userAgent, userInfo, useToken } = useStore('user');
  const { setTabBar, getTabBarItem, spliceTabBarItem, appConfig } = useStore('appConfig');
  // 先清空本地的登录数据
  dealLoginOutToken();
  // 在吧获取的cookie写入store中做临时登录
  const isLogin = isLoginFunc(res.cookies);
  console.log('小程序扫描二维码成功---res.data--isLogin---', isLogin);
  if (!isLogin) {
    uni.showToast({
      title: '登录失败',
      icon: 'error',
      duration: 2000
    });
    return;
  }
  saveCookies(res.cookies);
  // 临时登录，需要去除本地存储
  uni.removeStorageSync('token');
  // 本地记录标记为临时登录
  uni.setStorageSync('isTempLogin', true);
  console.log('小程序扫描二维码成功---res.data--useToken---', useToken.value);

  // 处理数据
  const jsonResult = res.data.jsonResult;
  const cookies = res.cookies;
  const xinzxInfo = jsonResult.xinzxInfo;
  const userInfo2 = jsonResult.userInfo;
  const newObj = {
    ...userInfo2,
    ...xinzxInfo,
    xinzxUserType: userInfo2.jxlxUserType,
    accountId: xinzxInfo.accountId,
    xinzxStudentName: xinzxInfo.studentName,
    xinzxUserName: xinzxInfo.teacherName,
    xinzxUserId: xinzxInfo.teacherId,
    xinzxStudentId: xinzxInfo.studentId,
    xinzxClassId: xinzxInfo.classId,
    xinzxClassName: xinzxInfo.className,
    xinzxSchoolId: xinzxInfo.schoolId,
    xinzxSchoolName: xinzxInfo.schoolName,
    xinzxGradeId: userInfo2.gradeId,
    nickName: userInfo2.nickName,
    useXinzxData: xinzxInfo.useXinzxData
  };

  const userNowRoleInfo = newloginInfoDealSingUserInfo(newObj, xinzxInfo.accountId);
  console.log('小程序扫描二维码成功---res.data--userNowRoleInfo---', userNowRoleInfo);
  const deafultGradeTerm = loginInfoDealGradeTerm(userNowRoleInfo);
  console.log('小程序扫描二维码成功---res.data--deafultGradeTerm---', deafultGradeTerm);
  setDeafultGradeTerm(deafultGradeTerm);
  console.log('小程序扫描二维码成功---res.data--appConfig---', appConfig.value);
  updateUserData(userNowRoleInfo, 500);
  console.log('小程序扫描二维码成功---res.data--userInfo---', userInfo.value);
};
const scancode = async (res: any) => {
  console.log(res);
  const { result } = res.detail;
  // 只能扫描二维码
  if (result && res.detail.type === 'QR_CODE') {
    console.log('小程序扫描二维码成功');
    // https://login.xxt.cn/login/ajax/login-by-unified-sso-token.do?url=https%3A%2F%2Fwww.xxt.cn%2F&token=a7LdMTnNMawa9UnC8eFTRYjzn9BhjbBFZGh7fcW0yhb50lh0Ruvb9BfU1fvCQZC4
    // 分离出url 和后面的参数
    const url = result.split('?')[0];
    const paramsStr = result.split('?')[1];
    let token = '';
    let valueUrl = '';
    if (paramsStr && paramsStr.includes('&')) {
      const paramsAry = paramsStr.split('&');
      const paramsNewary = paramsAry.map((item: any) => {
        const ary = item.split('=');
        const key = ary[0];
        let value = ary[1];
        // value是个api地址
        if (key === 'url' || value.includes('http')) {
          value = decodeURIComponent(value);
        }
        return [key, value];
      });
      const params = Object.fromEntries(paramsNewary);
      token = params.token;
      valueUrl = params.url;
      console.log('参数请求查看----', url, params);
    }
    // 请求接口
    if (token && url) {
      uni.showLoading({
        title: '登录中...'
      });
      const data = {
        token,
        url: valueUrl,
        up: 'true',
        entry: 'an_hnxxt'
      };
      console.log('encodeURIComponent---data---', data);
      uni.request({
        url,
        method: 'POST',
        data,
        header: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        success(res) {
          console.log('小程序扫描二维码成功---res--data--', res);
          uni.hideLoading();
          if (res.statusCode === 200) {
            const data: any = res.data;
            const jsonResult = data.jsonResult;
            console.log('小程序扫描二维码成功---res.data--', data);
            if (data._rc === 'success' && jsonResult) {
              mockLogin(res);
              barCodeError(1, '模拟登录-成功');
            } else {
              barCodeError(0, '模拟登录-失败');
            }
          }
        }
      });
    }
  } else {
    // uniShowToast('扫描失败,请重新扫描');
    console.log('扫描失败,请重新扫描');
    barCodeError(0, '识别到无效的二维码，请重新扫描');
  }
};
onLoad(async (opt: any) => {
  try {
    // 相机授权
    await getAuthorize(
      'scope.camera',
      '相机权限申请',
      '需要获取您的相机权限，请在设置中打开相机权限',
      '去设置',
      true
    );
    scanFlag.value = true;
  } catch {
    barCodeError(0, '请授予摄像头权限以使用扫码功能');
  }
});
</script>

<style scoped lang="scss">
.container {
  @include normalContainer();
  background-color: rgba(0, 0, 0);
}
.camera {
  position: relative;
  width: 100vw;
  height: 100vh;
}
.content {
  /* background-color: #222222; */
  /* 透明遮罩层 */
  /* opacity: 0.4; */
  position: absolute;
  width: 100vw;
  height: 100vh;
}
.content-title {
  position: absolute;
  left: 50%;
  top: 50%;
  font-size: 16px;
  color: #fff;
  transform: translate(-50%, -50%);
  @include normalFlex(column, flex-start, center);
}
.scan-block {
  position: relative;
  margin-top: 20px;
  border: 1px solid #fff;
  border-radius: 16px;
  width: 215px;
  height: 215px;
  /* opacity: 0.2; */
  background-color: transparent;
}
@keyframes move {
  0% {
    transform: translate(-50%, -100%);
  }
  100% {
    transform: translate(-50%, 100%);
  }
}
.scan-line {
  position: absolute;
  left: 50%;
  top: 0;
  border-radius: 2px;
  width: 80%;
  height: 4px;
  background: #4ad975;
  box-shadow: 0 0 10px rgba(74, 217, 117, 1); /* 模糊效果 */
  transform: translate(-50%, 0);
  animation: move 8s linear infinite;
}
/* 实现动画从上倒下 */
.scan-bottom {
  margin-top: 20px;
  padding: 8px 16px;
  border-radius: 8px;
  background-color: #222;
  opacity: 0.8;
}
</style>
