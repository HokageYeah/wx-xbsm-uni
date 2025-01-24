<template>
  <view class="container tui-skeleton">
    <image class="logo tui-skeleton-rect" src="/static/logo.png" />
    <view class="text-area tui-skeleton-rect">
      <text class="title tui-skeleton-rect">{{ title }}</text>
      <text class="title tui-skeleton-rect">演出首页</text>
      <button class="login-btn" @click="login">登录</button>
    </view>
  </view>
  <xxt-skeleton :skeleton-show="skeletonShow" :is-list="false"></xxt-skeleton>
</template>

<script setup lang="ts">
const title = ref('Hello');
const skeletonShow = ref(true);
const instance = getCurrentInstance();
onLoad(() => {
  // 模拟
  setTimeout(() => {
    skeletonShow.value = false;
  }, 2000);
});
const login = () => {
  console.log('login----');
  instance?.proxy
    ?.$uniAjax({
      url: '/api/v1/wx/mini.login.by.code',
      data: { code: 'wx_code123456' },
      method: 'POST',
      custom: {
        auth: false
      }
      // header: {
      //   'custom-header': 'hello' // 自定义请求头信息
      // }
    })
    .then((res: any) => {
      console.log('res', res);
    });
};
</script>

<style scoped lang="scss">
.container {
  @include normalContainer();
  @include normalFlex(column, flex-start, center);
}
.logo {
  margin-left: auto;
  margin-right: auto;
  margin-top: 100px;
  width: 100px;
  height: 100px;
}
.text-area {
  margin-top: 10px;
  @include normalFlex(column, flex-start, center);
}
.title {
  font-size: 18px;
  color: #8f8f94;
}
.login-btn {
  margin-top: 10px;
  width: 100px;
  background-color: #4ad975;
  color: #fff;
}
</style>
