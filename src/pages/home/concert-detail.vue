<template>
  <view class="container">
    <view class="concert-detail-header">
      <tui-lazyload-img
        class="tui-skeleton-rect tui-skeleton-rect"
        width="168rpx"
        height="268rpx"
        radius="8rpx"
        :src="showDetail?.verticalPic"
      ></tui-lazyload-img>
      <view class="concert-detail-header-box">
        <tui-overflow-hidden :line-clamp="3" bold :size="30" class="tui-skeleton-rect">
          {{ showDetail?.showname }}
        </tui-overflow-hidden>
        <view class="concert-detail-header-box-content tui-skeleton-rect">
          {{ showDetail?.showtime }}
        </view>
        <view
          class="concert-detail-header-box-content concert-detail-header-box-content-venue tui-skeleton-rect"
        >
          {{ `${showDetail?.venuecity}｜${showDetail?.venue}` }}
        </view>
        <view
          class="concert-detail-header-box-content concert-detail-header-box-content-venueaddr tui-skeleton-rect"
        >
          {{ showDetail?.venueAddr }}
        </view>
        <view v-if="showDetail?.description" class="concert-detail-header-box-content">
          <view class="concert-detail-header-box-content-description tui-skeleton-rect">
            <tui-overflow-hidden :line-clamp="2" size="25">
              {{ showDetail?.description }}
            </tui-overflow-hidden>
          </view>
        </view>
        <view class="concert-detail-header-box-content tui-skeleton-rect">
          {{ `票价: ${showDetail?.price_str}` }}
        </view>
        <view
          v-if="showDetail?.showstatus"
          class="concert-detail-header-box-content tui-skeleton-rect"
        >
          {{ `状态: ${showDetail?.showstatus}` }}
        </view>
      </view>
    </view>
    <view class="concert-detail-content">
      <view
        v-for="(item, index) in radioList"
        :key="index"
        class="concert-detail-content-config tui-skeleton-rect"
      >
        <text class="tui-text">{{ item.title }}</text>
        <tui-checkbox-group>
          <tui-label v-for="(content, cindex) in item.content" :key="cindex">
            <tui-list-cell>
              <view class="thorui-align__center">
                <tui-checkbox
                  :checked="content.checked"
                  :value="content.value"
                  color="#4ad975"
                  @change="handleChange"
                >
                </tui-checkbox>
                <text class="tui-text">{{ content.name }}</text>
              </view>
            </tui-list-cell>
          </tui-label>
        </tui-checkbox-group>
      </view>
      <view class="concert-detail-content-config tui-skeleton-rect">
        <text class="tui-text">监控持续时间</text>
        <tui-checkbox-group>
          <tui-label>
            <tui-list-cell>
              <view class="thorui-align__center" @click="handleDeadline">
                <tui-icon style="margin-right: 8px" name="calendar" :size="16" unit="px"></tui-icon>
                <tui-text>{{ dateTimeFormat }}</tui-text>
              </view>
            </tui-list-cell>
          </tui-label>
        </tui-checkbox-group>
      </view>
    </view>
    <view class="concert-detail-content-sku tui-skeleton-rect">
      <view
        v-for="(item, index) in perform_skuList"
        :key="index"
        class="concert-detail-content-sku-item"
      >
        <view class="concert-detail-content-sku-item-title" @click="handleSku(item)">
          <tui-icon
            class="concert-detail-content-sku-item-title-icon"
            :name="performChecked(item) ? 'circle-fill' : 'circle'"
            :color="performChecked(item) ? '#4ad975' : '#999'"
            :size="16"
            unit="px"
          ></tui-icon>
          <tui-text size="26" color="#222222" :text="item.performName"></tui-text>
        </view>
        <view class="concert-detail-content-sku-item-sku">
          <view
            v-for="skuitem in item.skuList"
            :key="skuitem.skuId"
            class="concert-detail-content-sku-item-sku-item"
            :class="[{ 'concert-detail-content-sku-item-sku-item-active': skuitem.checked }]"
            @click="skuSelectHandle(skuitem)"
            >{{ `${skuitem.priceName} - ￥${skuitem.price}` }}
            <view
              v-if="skuitem.skuSalable !== 'false'"
              class="concert-detail-content-sku-item-sku-item-tag"
              >缺货</view
            >
          </view>
        </view>
      </view>
    </view>
  </view>
  <view class="container-footer">
    <tui-form-button background="#4ad975" :disabled="submitDisabled" @click="handleSubmit">{{
      submitText
    }}</tui-form-button>
  </view>
  <tui-skeleton
    v-if="skeletonShow"
    :preload-data="preloadData"
    background-color="white"
  ></tui-skeleton>
  <tui-datetime
    ref="dateTime"
    :radius="true"
    :set-date-time="dateTimeFormat"
    type="7"
    @confirm="dateTimeChange"
  ></tui-datetime>
</template>

<script setup lang="ts">
import {
  getH5AlConcertDetail,
  getH5AlConcertTicketDetail,
  recordWebConcertMonitor
} from './hooks/api-hooks';
const showDetail = ref<any>(null);
const perform_skuList = ref<any>([]);
const skeletonShow = ref(true);
const preloadData = ref();
const submitText = ref('');
const submitDisabled = ref(true);
const deadline = ref<any>('');
const dateTime = ref();
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
// 格式化时间
const dateTimeFormat = computed(() => {
  console.log('deadline.value---2222', deadline.value);
  const year = deadline.value.getFullYear();
  const month = deadline.value.getMonth() + 1;
  const day = deadline.value.getDate();
  const hour = deadline.value.getHours();
  const minute = deadline.value.getMinutes();
  const second = deadline.value.getSeconds();
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
});
onLoad(async (options: any) => {
  console.log('options---', options);
  // 获取演唱会详情
  const res: any = await getH5AlConcertDetail({
    platform: options.platform,
    show_id: options.id
  });
  const retstr = res.ret[0];
  if (retstr.includes('SUCCESS')) {
    showDetail.value = res.data.legacy;
  }
  // 获取演唱会票价详情（检测当前场次是否有票）
  let resDetail: any = await getH5AlConcertTicketDetail({
    platform: options.platform,
    show_id: options.id
  });
  if (resDetail.ret[0].includes('SUCCESS')) {
    let performViews_true = resDetail.data.result.performViews.filter(
      (item: any) => item.checked === 'true'
    );
    resDetail.data.result.skuList.forEach((skuitem: any) => {
      skuitem.checked = true;
    });
    performViews_true[0].skuList = resDetail.data.result.skuList;
    perform_skuList.value.push(performViews_true[0]);
    const performViews_false = resDetail.data.result.performViews.filter(
      (item: any) => item.checked === 'false'
    );
    for (const item of performViews_false) {
      resDetail = await getH5AlConcertTicketDetail({
        platform: 'DM',
        show_id: options.id,
        session_id: item.performId
      });
      performViews_true = resDetail.data.result.performViews.filter(
        (item: any) => item.checked === 'true'
      );
      resDetail.data.result.skuList.forEach((skuitem: any) => {
        skuitem.checked = true;
      });
      performViews_true[0].skuList = resDetail.data.result.skuList;
      perform_skuList.value.push(performViews_true[0]);
    }
    console.log('perform_skuList', perform_skuList.value);
  }
  // // 获取当前时间
  // const now = new Date();
  // // 获取当前时间后一天
  // const nextDay = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  deadline.value = new Date();
  console.log('deadline.value---', deadline.value);
  setTimeout(() => {
    skeletonShow.value = false;
  }, 1000);
  console.log('showDetail', showDetail.value);
});

watch(
  () => perform_skuList.value,
  (newVal) => {
    const skulist = perform_skuList.value.filter((item: any) => {
      return item.skuList.some((skuitem: any) => skuitem.checked);
    });
    // 场次
    let perform_skuList_select = 0;
    perform_skuList.value.forEach((item: any) => {
      const skulist_select = item.skuList.filter((skuitem: any) => skuitem.checked);
      perform_skuList_select += skulist_select.length;
    });
    submitDisabled.value = perform_skuList_select === 0;
    const str = `开始订阅（公订阅${skulist.length}场 共${perform_skuList_select}价格）`;
    submitText.value = str;
  },
  {
    deep: true
  }
);

const radioList = ref([
  {
    id: '1',
    title: '推送方式',
    content: [
      { name: '订阅通知推送', value: '1-1', checked: true },
      { name: '订阅推送+手机短信推送', value: '1-2', checked: false }
    ]
  },
  {
    id: '2',
    title: '推送模式',
    content: [
      { name: '立即推送', value: '2-1', checked: true },
      { name: '智能预约推送', value: '2-2', checked: false }
    ]
  }
]);
const handleChange = (e: any) => {
  const { value, checked } = e;
  const [id] = value.split('-');
  const parentIndex = radioList.value.findIndex((item: any) => item.id === id);
  if (parentIndex !== -1) {
    const childIndex = radioList.value[parentIndex].content.findIndex(
      (item: any) => item.value === value
    );
    radioList.value[parentIndex].content.forEach((item: any) => {
      item.checked = false;
    });
    radioList.value[parentIndex].content[childIndex].checked = checked;
  }
};
const handleSku = (item: any) => {
  item.skuList.forEach((skuitem: any) => {
    skuitem.checked = !item.checked;
  });
};
const skuSelectHandle = (item: any) => {
  item.checked = !item.checked;
};
const performChecked = (item: any) => {
  item.checked = !item.skuList.some((skuitem: any) => !skuitem.checked);
  return item.checked;
};
const handleSubmit = async () => {
  const perform_skuList_select = perform_skuList.value.filter((item: any) => {
    return item.skuList.some((skuitem: any) => skuitem.checked);
  });
  // 整理提交的场次和票种
  const allperform_skuList = perform_skuList_select.map((item: any) => {
    return {
      perform_id: item.performId,
      perform_name: item.performName,
      sku_list: item.skuList
        .filter((skuitem: any) => skuitem.checked)
        .map((skuitem: any) => {
          return {
            sku_id: skuitem.skuId,
            price_id: skuitem.priceId,
            price_name: skuitem.priceName
          };
        })
    };
  });
  const handelData = {
    show_id: showDetail.value.showid,
    show_name: showDetail.value.showname,
    // 监控持续时间
    // deadline: '2025-03-18 00:00:00',
    deadline: dateTimeFormat.value,
    // 监控的微信id
    wx_token: '111',
    venue_city_name: showDetail.value.venuecity,
    venue_name: showDetail.value.venue,
    venue_addr: showDetail.value.venueAddr,
    ticket_perform: allperform_skuList
  };
  const res: any = await recordWebConcertMonitor(handelData);
  console.log('handelData---', res);
};
const handleDeadline = () => {
  dateTime.value && dateTime.value.show();
};
const dateTimeChange = (e: any) => {
  console.log('e---', e);
  const data = e.result;
  // 字符串 2025-02-26 23:57:43 转换为时间戳
  const timestamp = new Date(data);
  console.log('timestamp---', timestamp);
  // 判断data 不能小于 deadline.value
  if (timestamp < new Date()) {
    uni.showToast({
      title: '监控时间不能小于当前时间',
      icon: 'none'
    });
  } else {
    deadline.value = timestamp;
  }
};
</script>

<style scoped lang="scss">
.container {
  @include normalContainer();
  padding: 10px;
}
.concert-detail-header {
  overflow: hidden;
  box-sizing: border-box;
  padding: 10px;
  border-radius: 8rpx;
  min-height: 134px;
  background-color: #fff;
  @include normalFlex(row, flex-start, center);
  .concert-detail-header-box {
    flex: 1;
    margin-left: 10px;
    height: 100%;
    min-height: 134px;
    /* background-color: aqua; */
    &-content {
      margin-top: 5px;
      min-height: 16px;
      font-size: 12px;
      @include normalFlex(row, flex-start, center);
      :first-child {
        margin-right: 5px;
      }
    }
    &-content-venue {
      font-weight: bold;
    }
    &-content-venueaddr {
      margin-top: 2px;
      font-size: 12px;
      color: #999;
    }
  }
}
.concert-detail-content {
  overflow: hidden;
  margin-top: 10px;
  border-radius: 8rpx;
  background-color: #fff;
  &-config {
    box-sizing: border-box;
    padding: 10px 10px 0;
    width: 100%;
    min-height: 40px;
    background-color: red;
    @include normalFlex(row, flex-start, flex-start);
    .tui-text {
      font-size: 13px;
      color: #222;
    }
    :deep(.tui-list-class) {
      padding: 0 0 10px 10px !important;
    }
    :deep(.tui-checkbox__input) {
      margin-right: 5px;
      width: 16px;
      height: 16px;
    }
    :deep(.tui-label__box) {
      border-bottom: 1px solid transparent !important;
      .tui-list-cell {
        position: unset !important;
      }
    }
  }
}
.concert-detail-content-sku {
  overflow: hidden;
  margin-top: 10px;
  padding: 10px;
  border-radius: 8rpx;
  min-height: 60px;
  background-color: #fff;
  &-item-title {
    @include normalFlex(row, flex-start, center);
    &-icon {
      margin-right: 10px !important;
    }
  }
  &-item-sku {
    flex-wrap: wrap;
    margin-top: 10px;
    @include normalFlex(row, flex-start, center);
    &-item {
      position: relative;
      margin-right: 10px !important;
      margin-bottom: 10px !important;
      padding: 4px 8px;
      border-radius: 5px;
      background-color: #f5f5f5;
      font-size: 12px;
      color: #999;
    }
    &-item-active {
      background-color: #4ad975;
      color: #fff;
    }
    &-item-tag {
      // position: absolute !important;
      display: inline-block;
      right: 0;
      top: 0;
      margin-left: 6px;
      padding: 2px;
      border: 1px solid #6a7a99;
      border-radius: 5px;
      width: 40px;
      background-color: #f5f5f5;
      line-height: 20px;
      text-align: center;
      font-size: 12px;
      color: #6a7a99;
    }
  }
}
.container-footer {
  // 固定在底部
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
