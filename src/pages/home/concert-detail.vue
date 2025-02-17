<template>
  <view class="container">
    <view class="concert-detail-header">
      <tui-lazyload-img
        class="tui-skeleton-rect tui-skeleton-rect"
        width="168rpx"
        height="268rpx"
        radius="8rpx"
        :src="showDetail.verticalPic"
      ></tui-lazyload-img>
      <view class="concert-detail-header-box">
        <tui-overflow-hidden :line-clamp="3" bold :size="30" class="tui-skeleton-rect">
          {{ showDetail.showname }}
        </tui-overflow-hidden>
        <view class="concert-detail-header-box-content tui-skeleton-rect">
          {{ showDetail.showtime }}
        </view>
        <view class="concert-detail-header-box-content tui-skeleton-rect">
          {{ `${showDetail.venuecity}-${showDetail.venue}` }}
        </view>
        <view class="concert-detail-header-box-content tui-skeleton-rect">
          <view class="concert-detail-header-box-content-description">
            <tui-overflow-hidden :line-clamp="2" size="25">
              {{ showDetail.description }}
            </tui-overflow-hidden>
          </view>
        </view>
        <view class="concert-detail-header-box-content tui-skeleton-rect">
          {{ `票价: ${showDetail.price_str}` }}
        </view>
        <view class="concert-detail-header-box-content tui-skeleton-rect">
          {{ `状态: ${showDetail.showstatus}` }}
        </view>
      </view>
    </view>
  </view>
  <tui-skeleton
    v-if="skeletonShow"
    :preload-data="preloadData"
    background-color="white"
  ></tui-skeleton>
</template>

<script setup lang="ts">
import { getH5AlConcertDetail } from './hooks/api-hooks';
const showDetail = ref<any>(null);
const skeletonShow = ref(true);
const preloadData = ref();
// #ifdef MP-WEIXIN
// 在微信中拿不到节点信息，此处手动塞一个默认值
preloadData.value = [
  {
    id: '',
    dataset: {},
    left: 10,
    right: 365,
    top: 20,
    bottom: 40,
    width: 355,
    height: 20,
    skeletonType: 'rect'
  },
  {
    id: '',
    dataset: {},
    left: 10,
    right: 365,
    top: 50,
    bottom: 70,
    width: 355,
    height: 20,
    skeletonType: 'rect'
  },
  {
    id: '',
    dataset: {},
    left: 10,
    right: 365,
    top: 100,
    bottom: 120,
    width: 355,
    height: 20,
    skeletonType: 'rect'
  },
  {
    id: '',
    dataset: {},
    left: 10,
    right: 365,
    top: 130,
    bottom: 150,
    width: 355,
    height: 20,
    skeletonType: 'rect'
  },
  {
    id: '',
    dataset: {},
    left: 10,
    right: 365,
    top: 180,
    bottom: 200,
    width: 355,
    height: 20,
    skeletonType: 'rect'
  },
  {
    id: '',
    dataset: {},
    left: 10,
    right: 365,
    top: 210,
    bottom: 230,
    width: 355,
    height: 20,
    skeletonType: 'rect'
  },
  {
    id: '',
    dataset: {},
    left: 10,
    right: 365,
    top: 260,
    bottom: 280,
    width: 355,
    height: 20,
    skeletonType: 'rect'
  },
  {
    id: '',
    dataset: {},
    left: 10,
    right: 365,
    top: 290,
    bottom: 310,
    width: 355,
    height: 20,
    skeletonType: 'rect'
  }
];
// #endif
onLoad(async (options: any) => {
  // 获取演唱会详情
  const res: any = await getH5AlConcertDetail({
    platform: 'DM',
    show_id: options.id
  });
  const retstr = res.ret[0];
  if (retstr.includes('SUCCESS')) {
    showDetail.value = res.data.legacy;
  }
  setTimeout(() => {
    skeletonShow.value = false;
  }, 1000);
  console.log('showDetail', showDetail.value);
});
</script>

<style scoped lang="scss">
.container {
  @include normalContainer();
  padding: 10px;
}
.concert-detail-header {
  overflow: hidden;
  border-radius: 8rpx;
  min-height: 134px;
  background-color: #f5f5f5;
  @include normalFlex(row, flex-start, center);
  .concert-detail-header-box {
    flex: 1;
    margin-left: 10px;
    height: 100%;
    background-color: aqua;
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
