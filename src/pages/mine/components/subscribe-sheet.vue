<template>
  <tui-bottom-popup
    :show="showTypeSheet === 1"
    background-color="#FFFFFF"
    :z-index="1002"
    :mask-z-index="1001"
    @close="bottomPopupClose"
  >
    <view class="sheet">
      <view class="sheet-top">
        <tui-text
          size="28"
          color="#4AD975"
          text="取消"
          font-weight="400"
          @click="bottomPopupClose"
        />
        <tui-text
          size="32"
          color="#666666"
          :text="type === 0 ? '订阅详情' : '取消订阅'"
          font-weight="400"
        />
        <tui-text
          size="28"
          color="#666666"
          :text="type === 0 ? '确定' : '确定取消'"
          font-weight="400"
          @click="clickSure"
        />
      </view>
      <view class="sheet-content">
        <scroll-view scroll-y style="height: 100%" class="scrollView" @touchmove.stop>
          <view
            v-for="item in firstLevelAry"
            :key="item.fistLevelId"
            class="sheet-content-left-item"
            :class="{ 'item-active': item.fistLevelId === firstLeveId }"
            @click="firstClick(item)"
          >
            <view
              v-if="item.fistLevelId === firstLeveId"
              class="sheet-content-left-item-line"
            ></view>
            <tui-text
              style="margin-left: 24px"
              size="28"
              :color="item.fistLevelId === firstLeveId ? '#4AD975' : '#666666'"
              :text="item.firstLevelName"
              font-weight="500"
            />
          </view>
        </scroll-view>
        <scroll-view
          scroll-y
          style="width: 70%; height: 100%; background-color: #f5f5f5"
          @touchmove.stop
        >
          <view
            v-for="item in secondLevelsAry"
            :key="item.secondLevelId"
            class="item-active sheet-content-right-item"
            @click="secondClick(item)"
          >
            <tui-text
              style="margin-left: 8px"
              size="28"
              :text="item.secondLevelName"
              font-weight="500"
            />
            <tui-checkbox
              v-if="type === 1"
              :checked="checked(item)"
              color="#4AD975"
              border-color="#999"
            >
            </tui-checkbox>
          </view>
        </scroll-view>
      </view>
    </view>
  </tui-bottom-popup>
</template>

<script setup lang="ts">
import { deleteUserSubscribeMonitor } from '../api/mine-api';
const props = withDefaults(
  defineProps<{
    showTypeSheet: number;
    subscribeList: any;
    type: number; // 0: 查看详情 1: 取消订阅
    showId: string;
  }>(),
  {
    showTypeSheet: -1,
    subscribeList: () => [],
    type: 0,
    showId: ''
  }
);
const emits = defineEmits<{
  (e: 'update:showTypeSheet', val: number): void;
  (e: 'deleteSubscribeSuccess'): void;
}>();
const firstLeveId = ref(-1);
const secondLeveId = ref(-1);
const cancelSubscribeData = ref<any>({});
const firstLevelAry = computed(() => {
  const list: any = [];
  props.subscribeList.forEach((item: any) => {
    list.push({
      fistLevelId: item.perform_id,
      firstLevelName: item.perform_name
    });
    firstLeveId.value = list[0].fistLevelId;
  });
  return list;
});
const secondLevelsAry = computed(() => {
  const sencondList = props.subscribeList.find(
    (item: any) => item.perform_id === firstLeveId.value
  );
  let list: any = [];
  if (sencondList) {
    list = sencondList.tickets.map((item: any) => ({
      secondLevelId: item.sku_id,
      secondLevelName: item.price_name,
      checked: false
    }));
  }
  return list;
});
const clickSure = async () => {
  if (props.type === 1) {
    // 取消订阅
    console.log('取消订阅');
    console.log('showId', props.showId);
    console.log('cancelSubscribeData', cancelSubscribeData.value);
    const perform_keys = Object.keys(cancelSubscribeData.value);
    const delete_list: any = [];
    perform_keys.forEach((key) => {
      const sku_ids = cancelSubscribeData.value[key];
      delete_list.push({
        show_id: props.showId,
        perform_id: key,
        sku_ids
      });
    });
    console.log('delete_list', delete_list);
    const params = {
      delete_list
    };
    const result: any = await deleteUserSubscribeMonitor(params);
    uni.showToast({
      title: result.message || '取消订阅成功',
      icon: 'none'
    });
    console.log('result', result);
    emits('deleteSubscribeSuccess');
  }
  bottomPopupClose();
};
function bottomPopupClose() {
  console.log('bottomPopupClose---');
  // 清空数据
  cancelSubscribeData.value = {};
  emits('update:showTypeSheet', -1);
}
const firstClick = (item: any) => {
  firstLeveId.value = item.fistLevelId;
};
const secondClick = (item: any) => {
  console.log('secondClick---item', props.type);
  if (props.type === 1) {
    secondLeveId.value = item.secondLevelId;
    if (cancelSubscribeData.value[firstLeveId.value] === undefined) {
      cancelSubscribeData.value[firstLeveId.value] = [];
    }
    if (cancelSubscribeData.value[firstLeveId.value].includes(item.secondLevelId)) {
      cancelSubscribeData.value[firstLeveId.value].splice(
        cancelSubscribeData.value[firstLeveId.value].indexOf(item.secondLevelId),
        1
      );
    } else {
      cancelSubscribeData.value[firstLeveId.value].push(item.secondLevelId);
    }
    console.log('secondClick---cancelSubscribeData', cancelSubscribeData.value);
  }
};
const checked = (item: any) => {
  return cancelSubscribeData.value[firstLeveId.value]?.includes(item.secondLevelId);
};
</script>

<style scoped lang="scss">
.scrollView {
  width: 30%;
}
.sheet {
  height: 400px;
  background-color: #fff;
  &-top {
    @include normalFlex(row, space-between, center);
    box-sizing: border-box;
    padding: 0 16px;
    border-bottom: 1px solid #f5f5f5;
    height: 64px;
  }
  &-content {
    height: 100%;
    @include normalFlex(row, flex-start, center);
  }
}
.sheet-content-left-item {
  @include normalFlex(row, flex-start, center);
  position: relative;
  box-sizing: border-box;
  padding: 8px 0;
  background-color: #fff;
  &-line {
    position: absolute;
    left: 16px;
    top: 50%;
    border-radius: 14px;
    min-width: 4px;
    height: 14px;
    background: #4ad975;
    transform: translateY(-50%);
  }
}
.sheet-content-right-item {
  @include normalFlex(row, space-between, center);
  box-sizing: border-box;
  padding: 8px;
}
.item-active {
  background-color: #f5f5f5;
}
</style>
