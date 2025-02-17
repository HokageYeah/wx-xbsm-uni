<template>
  <view class="container">
    <tui-lazyload-img
      class="tui-skeleton-rect tui-skeleton-rect"
      width="168rpx"
      height="268rpx"
      radius="8rpx"
      src="https://img.alicdn.com/bao/uploaded/https://img.alicdn.com/imgextra/i3/2251059038/O1CN01SubuZH2GdSfusjsb1_!!2251059038.png"
    ></tui-lazyload-img>
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
  showDetail.value = await getH5AlConcertDetail({
    platform: 'DM',
    show_id: options.id
  });
  skeletonShow.value = false;
  console.log('showDetail', showDetail.value);
});
</script>

<style scoped lang="scss">
.container {
  @include normalContainer();
  padding: 10px;
}
</style>
