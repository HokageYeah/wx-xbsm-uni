<template>
  <view class="container tui-skeleton"> </view>
</template>

<script setup lang="ts">
import { getAlConcertDetail } from './hooks/api-hooks';
const showDetail = ref<any>(null);
onLoad(async (options: any) => {
  // 获取演唱会详情
  showDetail.value = await getAlConcertDetail({
    platform: 'DM',
    show_id: options.id
  });
  console.log('showDetail', showDetail.value);
});
</script>

<style scoped lang="scss">
.container {
  @include normalContainer();
}
</style>
