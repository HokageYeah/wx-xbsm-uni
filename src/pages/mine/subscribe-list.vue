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
    <tui-virtual-list
      v-if="!skeletonShow && subScribeList.length > 0"
      ref="virtualList"
      :item-buffer="15"
      background="#fff"
      @change="onChange"
      @scrolltolower="onScrollToLower"
    >
      <tui-virtual-item v-for="item in subScribeList" :key="item.showid" @click="itemClick(item)">
        <tui-list-cell padding="0">
          <view class="tui-list__item">
            <tui-lazyload-img
              class="tui-skeleton-rect tui-skeleton-rect"
              width="168rpx"
              height="268rpx"
              radius="8rpx"
              :src="item.cover_url"
            ></tui-lazyload-img>
            <view class="tui-label_box">
              <tui-overflow-hidden :line-clamp="2" bold :size="28">
                {{ item.show_name }}
              </tui-overflow-hidden>
              <view class="tui-label_box-content tui-skeleton-rect">
                <tui-icon name="location" :size="16"></tui-icon>
                {{ `${item.venue_name}-${item.venue_city_name}` }}
              </view>
              <view class="tui-label_box-content tui-skeleton-rect">
                <tui-text size="26" color="#222222" text="平台:"></tui-text>
                <tui-text size="26" color="#222222" :text="item.platform"></tui-text>
              </view>
              <view class="tui-label_box-content tui-skeleton-rect">
                共订阅
                <span style="margin-left: 5px; font-weight: bold; color: #4ad975">{{
                  item.performances.length
                }}</span>
                场
                <span style="margin: 0 5px; font-weight: bold; color: #4ad975">{{
                  item.performances.reduce(
                    (total: number, performance: any) => total + performance.tickets.length,
                    0
                  )
                }}</span>
                价格
              </view>
              <view class="tui-label_box-content tui-skeleton-rect">
                <tui-text size="26" color="#222222" text="状态:"></tui-text>
                <tui-text size="26" color="#4ad975" text="已订阅"></tui-text>
              </view>
              <view class="tui-label_box-content tui-skeleton-rect">
                <tui-form-button
                  background="#4ad975"
                  border-color="transparent"
                  width="80px"
                  height="30px"
                  size="24"
                  @click="handleClick(item, 'detail')"
                  >查看详情</tui-form-button
                >
                <tui-form-button
                  style="margin-left: 10px"
                  background="#e45a5a"
                  border-color="transparent"
                  width="80px"
                  height="30px"
                  size="24"
                  @click="handleClick(item, 'cancel')"
                  >取消订阅</tui-form-button
                >
              </view>
            </view>
          </view>
        </tui-list-cell>
      </tui-virtual-item>
    </tui-virtual-list>
    <xxt-empty
      v-if="!skeletonShow && subScribeList.length < 1"
      tip-image="/static/images/mine/empty.png"
      tip-message="暂无订阅"
    />
  </view>
  <xxt-skeleton :skeleton-show="skeletonShow" :is-list="true"></xxt-skeleton>
  <tui-actionsheet
    :show="isRotate"
    :item-list="platformSelectList"
    :z-index="10000"
    @click="sheetActionClick"
    @cancel="isRotate = false"
  >
  </tui-actionsheet>
  <SubscribeSheet
    v-model:showTypeSheet="showTypeSheet"
    :subscribe-list="subscribeSheetList"
    :show-id="showId"
    :type="sheetType"
    @delete-subscribe-success="deleteSubscribeSuccess"
  ></SubscribeSheet>
  <tui-loading v-if="disablePullUp"></tui-loading>
</template>

<script setup lang="ts">
import { getUserSubscribeList } from './api/mine-api';
import SubscribeSheet from './components/subscribe-sheet.vue';
const subScribeList = ref<any>([]);
const skeletonShow = ref(true);
// 是否旋转
const isRotate = ref(false);
// 平台筛选文本
const platformSelectIndex = ref(0);
// 下拉刷新当前页码
let pageIndex = 1;
const pageSize = 10;
// 是否禁用上拉
const disablePullUp = ref(false);
// 输入框输入值
const searchValue = ref('');
// 是否显示关闭按钮
const isShut = ref(false);
// 是否显示取消订阅弹窗
const showTypeSheet = ref(-1);
// 取消订阅类型
const sheetType = ref(0);
// 取消订阅列表
const subscribeSheetList = ref<any>([]);
// 取消订阅id
const showId = ref('');
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
    }
    // {
    //   text: '猫眼',
    //   color: '#2B2B2B',
    //   platform: 'MY'
    // }
  ];
  list[platformSelectIndex.value].color = '#4ad975';
  return list;
});
// 平台
const getPlatformStr = (platform: string) => {
  const platformList = {
    DM: '大麦'
    // MY: '猫眼'
  };
  return platformList[platform as keyof typeof platformList];
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
  loadConcertByPlatform(platformSelectList.value[platformSelectIndex.value].platform);
};
// 清空搜索内容
const shutChange = () => {
  isShut.value = false;
  searchValue.value = '';
};
// 搜索
const seacrhTopic = () => {
  console.log('本地搜索', searchValue.value);
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
// 点击订阅列表
const itemClick = (item: any) => {
  console.log('检测订阅列表', item);
};
// 虚拟列表滚动
const onChange = (e: any) => {
  console.log('e', e);
};
async function loadConcertByPlatform(platform: string) {
  if (disablePullUp.value) {
    return;
  }
  disablePullUp.value = true;
  if (pageIndex === 1) {
    subScribeList.value = [];
  }
  const res: any = await getUserSubscribeList({
    page: pageIndex,
    pageSize,
    platform
  });
  if (pageIndex === 1) {
    skeletonShow.value = false;
  }
  console.log('getUserSubscribeList------res------', res);
  subScribeList.value.push(...res);
  disablePullUp.value = false;
}
// 虚拟列表滚动到底部
const onScrollToLower = (e: any) => {
  console.log('e', e);
  pageIndex++;
  loadConcertByPlatform(platformSelectList.value[platformSelectIndex.value].platform);
};
// 点击查看详情、取消订阅
const handleClick = (item: any, type: 'detail' | 'cancel') => {
  const obj = {
    detail: 0,
    cancel: 1
  };
  console.log('item', item);
  console.log('type', type);
  showTypeSheet.value = 1;
  sheetType.value = obj[type];
  subscribeSheetList.value = item.performances;
  showId.value = item.show_id;
  console.log('item', item);
  console.log('type', type);
};
onLoad(() => {
  loadConcertByPlatform(platformSelectList.value[platformSelectIndex.value].platform);
});
// 取消订阅成功
const deleteSubscribeSuccess = () => {
  loadConcertByPlatform(platformSelectList.value[platformSelectIndex.value].platform);
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
    // 不放大也不缩小
    // platform-select 和 select-city 的宽度一样
    padding: 0 10px 0 0;
    min-width: 50px;
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
/* 虚拟列表 */
.container :deep(.tui-virtual-list),
.container :deep(.tui-virtual__scroll-view) {
  height: 90vh !important;
  /* background-color: red !important; */
}
/* 虚拟列表item */
.container :deep(.tui-virtual-item) {
  height: auto !important;
}
.tui-list__item {
  display: flex;
  align-items: flex-start;
  box-sizing: border-box;
  padding: 10px;
  width: 100%;
  min-height: 150px;
  .tui-label_box {
    flex: 1;
    margin-left: 10px;
    height: 100%;
    /* background-color: #4ad975; */
    &-content {
      margin-top: 5px;
      font-size: 12px;
      @include normalFlex(row, flex-start, center);
      :first-child {
        margin-right: 5px;
      }
    }
  }
}
</style>
