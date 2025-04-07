<template>
  <view class="container">
    <view class="bg-code">
      <tui-lazyload-img
        width="100%"
        height="370rpx"
        :src="`data:image/png;base64,${base64Image}` || ''"
        mode="aspectFit"
      ></tui-lazyload-img>
      <view class="code-title" @click="saveImage">
        <text>保存二维码</text>
      </view>
    </view>
    <tui-button
      type="gray-primary"
      :size="34"
      bold
      width="372rpx"
      height="84rpx"
      margin="40rpx auto"
      @click="previewImage"
      >1、生成二维码</tui-button
    >
    <tui-button
      type="gray-primary"
      :size="34"
      bold
      width="372rpx"
      height="104rpx"
      margin="40rpx auto"
      @click="verifyLogin"
      >2、验证查询是否扫码登录</tui-button
    >
    <tui-button
      type="gray-primary"
      :size="34"
      bold
      width="372rpx"
      height="104rpx"
      margin="40rpx auto"
      @click="scanSuccessLogin"
      >3、扫码成功后调用登录</tui-button
    >
    <tui-button
      type="gray-primary"
      :size="34"
      bold
      width="372rpx"
      height="104rpx"
      margin="40rpx auto"
      @click="getDamaiUserInfo"
      >4、获取大麦网用户信息</tui-button
    >
    <!-- 展示2、3、4接口的打印信息 -->
    <view class="info-box">
      <view class="info-item">
        <text class="info-title">第{{ index }}接口：{{ URL }}</text>
        <text class="info-content">{{ requestInfo }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import {
  Dama_DoLoginByPlatform,
  Dama_GetLoginQrcode,
  Dama_GetLoginStatus,
  Dama_LoginQueryByPlatform
} from './api/damai-login-api';
const base64Image = ref('');
const index = ref(0);
const URL = ref('');
const requestInfo = ref('');
const previewImage = async () => {
  console.log('previewImage---');
  const res: any = await Dama_GetLoginQrcode({
    platform: 'DM'
  });
  console.log('res', res);
  base64Image.value = res.base64_data;
};
const verifyLogin = async () => {
  console.log('verifyLogin---');
  index.value = 2;
  URL.value = '/api/v1/web/login.query.by.platform';
  const res: any = await Dama_LoginQueryByPlatform({
    platform: 'DM'
  });
  console.log('res', res);
  if (typeof res === 'object') {
    requestInfo.value = JSON.stringify(res);
  } else {
    requestInfo.value = res;
  }
};
const scanSuccessLogin = async () => {
  console.log('scanSuccessLogin---');
  index.value = 3;
  URL.value = '/api/v1/web/dologin.by.platform';
  const res: any = await Dama_DoLoginByPlatform({
    platform: 'DM'
  });
  if (typeof res === 'object') {
    requestInfo.value = JSON.stringify(res);
  } else {
    requestInfo.value = res;
  }
};
const getDamaiUserInfo = async () => {
  console.log('getDamaiUserInfo---');
  index.value = 4;
  URL.value = '/api/v1/web/userinfo.by.platform';
  const res: any = await Dama_GetLoginStatus({
    platform: 'DM'
  });
  if (typeof res === 'object') {
    requestInfo.value = JSON.stringify(res);
  } else {
    requestInfo.value = res;
  }
};
const showAuthModal = () => {
  uni.showModal({
    title: '提示',
    content: '需要相册权限保存图片，是否去设置？',
    success: (res) => {
      if (res.confirm) uni.openSetting();
    }
  });
};
const saveImage = async () => {
  if (!base64Image.value) {
    uni.showToast({ title: '图片未加载', icon: 'none' });
    return;
  }
  try {
    // 检查权限
    const { authSetting } = await uni.getSetting({});
    if (!authSetting['scope.writePhotosAlbum']) {
      // 尝试主动授权（可能在小程序端受限）
      await uni.authorize({ scope: 'scope.writePhotosAlbum' });
    }
    // 保存到相册
    // 在微信小程序环境中使用wx.env.USER_DATA_PATH
    // #ifdef MP-WEIXIN
    let filePath = `${wx.env.USER_DATA_PATH}/qrcode_${Date.now()}.png`;
    // #endif

    // 其他环境使用临时路径
    // #ifndef MP-WEIXIN
    filePath = `${
      uni.getStorageSync('_doc_dir') || plus.io.convertLocalFileSystemURL('_doc/')
    }/qrcode_${Date.now()}.png`;
    // #endif
    console.log('filePath---', filePath);
    // 将 base64 转换为 ArrayBuffer (去掉 base64 头部信息)
    let base64Data = base64Image.value;
    // 如果包含 data:image 前缀，需要去除
    if (base64Data.includes('data:image')) {
      base64Data = base64Data.split(',')[1];
    }
    console.log('filePath', filePath);
    const fs = wx.getFileSystemManager();
    fs.writeFileSync(filePath, base64Data, 'base64');
    await uni.saveImageToPhotosAlbum({ filePath });
    uni.showToast({ title: '保存成功', icon: 'none' });
  } catch (error: any) {
    console.log('saveImage---error', error);
    // 处理授权或保存失败
    if (error.errMsg.includes('auth deny')) {
      showAuthModal(); // 提示用户开启权限
    } else {
      uni.showToast({ title: '保存失败', icon: 'none' });
    }
  }
};
</script>

<style scoped lang="scss">
.container {
  @include normalContainer();
}
.bg-code {
  width: 100%;
  height: 370rpx;
  background-color: #f5f5f5;
  position: relative;
  .code-img {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
  }
  .code-title {
    position: absolute;
    bottom: 10px;
    right: 10px;
    text-align: center;
    font-size: 28rpx;
    color: #fff;
    background-color: rgba(0, 0, 0, 0.5);
    padding: 10px;
    border-radius: 4px;
  }
}
.info-box {
  margin-top: 20px;
  .info-item {
    margin-bottom: 10px;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    .info-title {
      font-size: 30rpx;
    }
    .info-content {
      font-size: 28rpx;
      color: #999;
    }
  }
}
</style>
