<template>
  <view>
    <view class="container">
      <image class="container-img" src="/static/images/mine/setting-logout.png" mode="aspectFill" />
      <tui-text
        class="container-text"
        size="28"
        color="#999999"
        text="更多功能,敬请期待"
      ></tui-text>
      <view class="container-back-button" @click="backAction">返回</view>
      <view class="container-logout" background="#ffffff" @click="logOut">退出登录</view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import { dealLoginOutToken } from '@/uni-module-common/hooks/useLoginHooks';
const { isLogin } = useStore('user');
const useroute = useRouter();
const logOut = async () => {
  dealLoginOutToken();
  useroute.back();
};
function backAction() {
  uni.navigateBack({
    delta: 1
  });
}
</script>

<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: column;
  justify-items: center;
  align-items: center;
  padding-top: 20px;
  &-img {
    width: 200px;
    height: 200px;
  }
  &-text {
    margin-top: 16px;
  }
  &-back-button {
    margin-top: 16px;
    border: 1px solid #ffb700;
    border-radius: 36px;
    width: 104px;
    height: 36px;
    line-height: 36px;
    text-align: center;
    font-size: 14px;
    color: #666;
  }
  &-logout {
    position: absolute;
    left: 50%;
    bottom: 20px;
    border: 1px solid #4ad975;
    border-radius: 58px;
    width: 80% !important;
    height: 48px;
    line-height: 48px;
    text-align: center;
    font-weight: bold;
    font-size: 16px;
    color: #4ad975;
    transform: translateX(-50%);
  }
}
</style>
