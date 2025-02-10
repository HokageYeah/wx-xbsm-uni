<template>
  <view class="container tui-skeleton">
    <view class="header">
      <!-- 演唱会平台筛选 -->
      <view class="platform-select" @click="platformSelect">
        <view class="platform-select-text-triangle" :class="{ 'rotate-180': isRotate }"></view>
        <tui-text
          size="26"
          color="#222222"
          :text="platformSelectList[platformSelectIndex].text"
        ></tui-text>
      </view>
      <!-- 搜索框 -->
      <view class="search-view-box-right">
        <tui-input
          :value="searchValue"
          placeholder="请输入关键词"
          radius="34"
          :size="30"
          color="#999999"
          padding="20rpx 34rpx 20rpx 22rpx"
          background-color="#F9F9F9"
          :maxlength="20"
          @input="seacrhInput($event)"
        >
          <template #left>
            <view class="thorui-align__center paddingright13">
              <tui-icon name="search" color="#999" :size="16" unit="px"></tui-icon>
            </view>
          </template>
          <template #right>
            <view style="display: flex; align-items: center; flex-shrink: 0">
              <view
                v-if="isShut"
                class="thorui-align__center"
                style="padding-right: 20rpx"
                @click="shutChange"
              >
                <tui-icon name="close" :size="16"></tui-icon>
              </view>
              <view class="thorui-align__center">
                <view
                  style="font-weight: bold; font-size: 15px; color: #4ad975"
                  @click="seacrhTopic"
                  >搜索</view
                >
              </view>
            </view>
          </template>
        </tui-input>
      </view>
    </view>
    <!-- <tui-virtual-list
      ref="virtualList"
      :item-buffer="30"
      background="#fff"
      @change="onChange"
      @scrolltolower="onScrollToLower"
    >
      <tui-virtual-item v-for="(item, index) in virtualItems" :key="index" @click="itemClick(item)">
        <tui-list-cell padding="0">
          <view class="tui-list__item">
            <tui-lazyload-img
              width="68rpx"
              height="68rpx"
              radius="8rpx"
              :src="item.avatar"
            ></tui-lazyload-img>
            <view class="tui-name">{{ `${item.id}-${item.name}` }}</view>
          </view>
        </tui-list-cell>
      </tui-virtual-item>
    </tui-virtual-list> -->
    <image class="logo tui-skeleton-rect" src="/static/logo.png" />
    <view class="text-area tui-skeleton-rect">
      <text class="title tui-skeleton-rect">{{ title }}</text>
      <text class="title tui-skeleton-rect">演出首页</text>
      <button class="login-btn" @click="login">登录</button>
    </view>
  </view>
  <xxt-skeleton :skeleton-show="skeletonShow" :is-list="false"></xxt-skeleton>
  <tui-actionsheet
    :show="isRotate"
    :item-list="platformSelectList"
    :z-index="10000"
    @click="sheetActionClick"
    @cancel="isRotate = false"
  >
  </tui-actionsheet>
</template>

<script setup lang="ts">
import { getAlConcertByPlatform } from './hooks/api-hooks';
const title = ref('Hello');
const skeletonShow = ref(true);
const instance = getCurrentInstance();
const alConcertByPlatform = ref<any>(null);
// 输入框输入值
const searchValue = ref('');
// 是否显示关闭按钮
const isShut = ref(false);
// 是否旋转
const isRotate = ref(false);
// 平台筛选文本
const platformSelectIndex = ref(0);
// 平台筛选列表
const platformSelectList = computed(() => {
  const list = [
    {
      text: '全部',
      color: '#2B2B2B',
      platform: ''
    },
    {
      text: '大麦',
      color: '#2B2B2B',
      platform: 'DM'
    },
    {
      text: '猫眼',
      color: '#2B2B2B',
      platform: 'MY'
    }
  ];
  list[platformSelectIndex.value].color = '#4ad975';
  return list;
});
// #ifdef MP-WEIXIN
watch(isRotate, (newVal) => {
  console.log('newVal', newVal);
  if (newVal) {
    uni.hideTabBar();
  } else {
    setTimeout(() => {
      uni.showTabBar();
    }, 200);
  }
});
// #endif
// 清空搜索内容
const shutChange = () => {
  isShut.value = false;
  searchValue.value = '';
};

// 搜索
const seacrhTopic = () => {
  console.log('搜索', searchValue.value);
  loadConcertByPlatform(
    platformSelectList.value[platformSelectIndex.value].platform,
    '',
    searchValue.value
  );
};

// 平台筛选
const platformSelect = () => {
  isRotate.value = !isRotate.value;
};
// 平台筛选点击
const sheetActionClick = (e: any) => {
  console.log('e', e);
  platformSelectIndex.value = e.index;
  isRotate.value = false;
  console.log(
    'list[platformSelectIndex.value].platform',
    platformSelectList.value[platformSelectIndex.value].platform
  );
  loadConcertByPlatform(platformSelectList.value[platformSelectIndex.value].platform, '');
};

// 输入框输入值
const seacrhInput = (e: any) => {
  searchValue.value = e;
  if (searchValue.value.length !== 0) {
    isShut.value = true;
  } else {
    isShut.value = false;
  }
};
// 获取演唱会数据 默认获取大麦演唱会数据
async function loadConcertByPlatform(platform: string, cty: string, keyword = '') {
  alConcertByPlatform.value = await getAlConcertByPlatform({
    platform,
    cty,
    keyword
  });
}

onLoad(async () => {
  // 模拟
  setTimeout(() => {
    skeletonShow.value = false;
  }, 2000);
  // 首次加载 获取演唱会数据 默认获取所有数据
  loadConcertByPlatform('', '');
  // 获取演唱会数据 默认获取大麦演唱会数据DM
  // alConcertByPlatform.value = await getAlConcertByPlatform({
  //   platform: 'DM',
  //   cty: '北京'
  // });
});
// 登录
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
}
.header {
  @include normalFlex(row, flex-start, center);
  flex-shrink: 0;
  padding: 10px;
  /* width: 100%; */
  background-color: #fff;
  .search-view-box-right {
    flex: 1;
    .paddingright13 {
      padding-right: 13px;
    }
  }
  .search-view-box-right :deep(.tui-input__border-bottom) {
    border-bottom: none !important;
  }
  .platform-select {
    @include normalFlex(row, space-between, center);
    padding: 0 10px 0 0;
    width: 50px;
    height: 44px;
    /* background-color: red; */
    &-text-triangle {
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 8px solid #222;
      width: 0;
      height: 0;
      transition: transform 0.3s ease;
      &.rotate-180 {
        transform: rotate(180deg);
      }
    }
  }
}

// 以下是测试用的
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
