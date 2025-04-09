<template>
  <view class="container">
    <tui-navigation-bar background-color="#78d782" @init="initNavigation">
      <view class="bar" :style="{ marginTop: `${top}px`, fontSize: '16px' }">我的</view>
    </tui-navigation-bar>
    <!-- 导航栏占位 -->
    <view :style="{ height: `${safeAreaInsets?.top ? safeAreaInsets?.top + 10 : 10}px` }"> </view>
    <view class="container-head" :class="[{ 'container-head-login': isLogin }]">
      <!-- 未登陆 -->
      <view v-if="!isLogin" class="container-head-bg" @click="clickToMine(0)">
        <image
          class="container-head-bg-img"
          mode="aspectFill"
          src="@/static/images/mine/user_unselect_img.png"
        ></image>
        <view class="container-head-bg-text">
          <tui-text size="24" color="#222222" text="登录"></tui-text>
          <tui-text size="24" color="#999999" text="请点击登录您的账号"></tui-text>
        </view>
      </view>
      <!-- 登录 -->
      <view v-else class="container-head-bg-login">
        <view class="container-head-bg-login-user" @click="testClick">
          <image
            class="container-head-bg-img"
            mode="aspectFill"
            src="@/static/images/mine/revision-home-desigin-user-select-img.png"
          ></image>
          <view class="container-head-bg-text">
            <view style="display: flex">
              <tui-text
                size="28"
                color="#222222"
                font-weight="600"
                :text="`${userInfo.username || '微信用户'}`"
              ></tui-text>
            </view>
            <view class="container-head-bg-text-info">{{ userInfoTitle }}</view>
          </view>
        </view>
      </view>
    </view>
    <view class="container-body">
      <view v-for="(item, index) in bodyList" :key="index" class="container-body-list">
        <tui-list-cell
          v-for="itemdif in item"
          :key="itemdif.type"
          arrow
          unlined
          radius="30"
          @click="clickToMine(itemdif.type)"
        >
          <view style="display: flex; align-items: center">
            <image
              :src="`/static/images/mine/${itemdif.img}.png`"
              style="margin: auto 0; margin-right: 16rpx; width: 40rpx; height: 40rpx"
            ></image>
            <text>{{ itemdif.title }}</text>
          </view>
        </tui-list-cell>
      </view>
    </view>
  </view>
  <loginModals v-model:showLoginModal="showLoginModal" />
</template>

<script setup lang="ts">
import loginModals from '@/pages/components/login-modals.vue';
import { uniShowToast } from '@/uni-module-common/utils/uiUtile';
const top = ref(0);
const height = ref(44);
const statusBarHeight = ref();
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync();
const { isLogin, userAgent, userInfo, setToken } = useStore('user');
const userInfoTitle = ref('微信注册用户');
const showLoginModal = ref(false);
const router = useRouter();

const bodyList: any = ref([
  [
    {
      title: '联系我们',
      img: 'my_phone',
      type: 1
    },
    {
      title: '我的订阅',
      img: 'tabbar_xin_unselect',
      type: 2
    }
    // {
    //   title: '儿童隐私保护政策',
    //   img: 'my_child_privacy',
    //   type: 3
    // }
  ],
  [
    {
      title: '设置',
      img: 'my_setting',
      type: 4
    }
  ]
]);
watch(
  isLogin,
  (newVal) => {
    if (isLogin.value && userInfo.value.jut === 2) {
      bodyList.value[1].push({
        title: '大麦平台登录',
        img: 'my_privacy',
        type: 5
      });
    }
  },
  { immediate: true }
);
function initNavigation(e: any) {
  console.log('initNavigation---', e);
  top.value = e.top;
  statusBarHeight.value = e.statusBarHeight;
  height.value = e.height;
}

const clickToMine = (type: number) => {
  console.log('type---', type, isLogin.value);
  if (!isLogin.value) {
    showLoginModal.value = true;
    return;
  }
  switch (type) {
    case 1:
      // 联系我们
      uniShowToast('功能暂未开放');
      break;
    case 2:
      // 我的订阅
      router.push({
        path: '/pages/mine/subscribe-list'
      });
      break;
    case 4:
      // 设置
      router.push({
        path: '/pages/mine/setting'
      });
      break;
    case 5:
      // 大麦平台登录
      router.push({
        path: '/pages/mine/damai-login'
      });
      break;
  }
};
const testClick = () => {
  console.log('testClick---');
};
</script>

<style scoped lang="scss">
.bar {
  display: flex;
  position: fixed;
  top: 0;
  z-index: 99999;
  justify-content: center;
  align-items: center;
  box-sizing: border-box;
  padding: 0 12rpx;
  width: 100%;
  height: 32px;
  font-weight: medium;
  transform: translateZ(0);
}
@mixin normalHeadBg() {
  margin-top: 20px;
  padding: 0 16px;
  height: 70px;
}
.container-head-bg-text-info {
  overflow: hidden; /* 内容超出后隐藏 */
  width: 115px;
  text-overflow: ellipsis; /* 超出内容显示为省略号 */
  font-size: 12px;
  color: #666;
  white-space: nowrap; /* 文本不进行换行 */
}
.container {
  @include normalContainer();
  background: linear-gradient(190deg, #a1f6bb 0%, #f9f9f9 30%, #fff 80%);
  &-head {
    overflow: hidden;
    height: 140px;
  }
  &-head-bg {
    @include normalHeadBg();
    /* background-color: orange; */
    @include normalFlex(row, flex-start);
    &-img {
      width: 36px;
      height: 36px;
    }
    &-text {
      margin-left: 8px;
      height: 44px;
      @include normalFlex(column, space-around, flex-start);
    }
  }
  &-head-bg-login {
    @include normalHeadBg();
    @include normalFlex();
    &-user {
      @include normalFlex(row, flex-start);
    }
    &-switch {
      margin-left: 8rpx;
      @include normalFlex(column);
      &-img {
        width: 20px;
        height: 20px;
      }
    }
  }
}
.container-body {
  padding: 0 16px;
  height: 50px;
  &-list {
    margin-bottom: 16px;
    border-radius: 30rpx;
    background-color: #fff;
  }
}
</style>
