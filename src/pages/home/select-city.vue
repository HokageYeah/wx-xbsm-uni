<template>
  <view class="page">
    <scroll-view
      class="scrollList"
      scroll-y
      :scroll-into-view="scrollViewId"
      :style="{ height: `${winHeight}px` }"
    >
      <!-- 搜索栏 -->
      <view class="search-bar">
        <view class="search-bar-form">
          <view class="search-bar-box">
            <input
              confirm-type="search"
              class="search-bar-input"
              placeholder="输入城市名称"
              placeholder-class="phcolor"
              :value="inputVal"
              :focus="inputShowed"
              @input="inputTyping"
            />
            <view v-if="inputVal" class="icon-clear" @tap="clearInput">
              <!-- #ifdef APP-PLUS || MP -->
              <icon type="clear" :size="15"></icon>
              <!-- #endif -->
              <!-- #ifdef H5 -->
              <tui-icon name="close-fill" :size="16" color="#bfbfbf"></tui-icon>
              <!-- #endif -->
            </view>
          </view>
          <label v-if="!inputShowed" class="search-bar-label" @tap="showInput">
            <view class="search-bar-text">输入城市名称或首字母查询</view>
          </label>
        </view>
      </view>

      <!-- 搜索结果 -->
      <view v-if="inputShowed" class="tui-list search-result">
        <view
          v-for="(item, index) in searchResult"
          :key="index"
          class="tui-list-cell"
          hover-class="tui-list-cell-hover"
          :data-name="item"
          :hover-stay-time="150"
          @tap="selectCity"
        >
          <view class="tui-list-cell-navigate">{{ item.cityName }}</view>
        </view>
      </view>

      <!-- 城市列表 -->
      <template v-if="!inputVal">
        <!-- 当前城市 -->
        <view class="current-city">
          <view class="title">定位城市</view>
          <view class="city-name">
            <tui-icon name="position-fill" color="#5677fc" :size="18"></tui-icon>
            {{ localCity }}
          </view>
        </view>

        <!-- 热门城市 -->
        <view class="hot-city">
          <view class="title">热门城市</view>
          <view class="city-names">
            <view
              v-for="(item, index) in hotCities"
              :key="index"
              class="city-name-item"
              hover-class="tap-city"
              :hover-stay-time="150"
              :data-name="item"
              @tap="selectCity"
            >
              {{ item.cityName }}
            </view>
          </view>
        </view>

        <!-- 城市列表 -->
        <view class="tui-list city-list">
          <template v-for="(list, index) in lists" :key="index">
            <template v-if="list.data[0]">
              <view :id="index === 0 ? 'suoyin' : list.prefix" class="tui-list-cell-divider">
                {{ list.prefix }}
              </view>
              <view
                v-for="(item, index2) in list.data"
                :key="index2"
                class="tui-list-cell"
                hover-class="tui-list-cell-hover"
                :data-name="item"
                :hover-stay-time="150"
                @tap="selectCity"
              >
                <view
                  class="tui-list-cell-navigate"
                  :class="[list.data.length - 1 === index ? 'last' : '']"
                >
                  {{ item.cityName }}
                </view>
              </view>
            </template>
          </template>
        </view>
      </template>
    </scroll-view>

    <!-- 索引栏 -->
    <view
      v-if="!inputVal"
      class="tui-indexed-list-bar"
      :style="{ height: `${indexBarHeight}px` }"
      @touchstart="touchStart"
      @touchmove.stop.prevent="touchMove"
      @touchend.stop="touchEnd"
      @touchcancel.stop="touchCancel"
    >
      <text
        v-for="(items, index) in lists"
        :key="index"
        class="tui-indexed-list-text"
        :style="{ height: `${indexBarItemHeight}px` }"
        @tap="handleClick(index)"
      >
        {{ index === 0 ? '索引' : items.prefix }}
      </text>
    </view>

    <!-- 索引提示 -->
    <view v-if="touchmove && lists[touchmoveIndex]?.prefix" class="tui-indexed-list-alert">
      {{ lists[touchmoveIndex].prefix }}
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue';
// import cityData from '@/pages/home/hooks/city-data';
import { getH5AlConcertCityListByPlatform } from '@/pages/home/hooks/api-hooks';

// 响应式状态
const lists: any = ref([]);
const touchmove = ref(false);
const touchmoveIndex = ref(-1);
const titleHeight = ref(0);
const indexBarHeight = ref(0);
const indexBarItemHeight = ref(0);
const scrollViewId = ref('');
const winHeight = ref(0);
const inputShowed = ref(false);
const inputVal = ref('');
const searchResult: any = ref([]);
const localCity = ref('');
const localCityId = ref('');
// 热门城市列表
const hotCities: any = ref([]);
const instance = getCurrentInstance();
const eventBus = instance!.appContext.config.globalProperties.$eventBus;
const router = useRouter();

onLoad(async (options: any) => {
  console.log('options', options);
  // 获取城市列表
  const res: any = await getH5AlConcertCityListByPlatform({ platform: options.platform });
  console.log('res----', res);
  const ret = res.ret[0];
  if (!ret.includes('SUCCESS')) {
    uni.showToast({
      title: '获取城市列表失败',
      icon: 'none'
    });
    return;
  }
  const data = res.data;
  console.log('data', data);
  localCity.value = options.currentCity || '北京';
  localCityId.value = options.currentCityId || '852';
  hotCities.value = data.city_list.hotCities;
  lists.value = data.city_list.cities;
  setTimeout(() => {
    uni.getSystemInfo({
      success(res) {
        const height = res.windowHeight;
        const barHeight = height - uni.upx2px(204);
        indexBarHeight.value = barHeight;
        winHeight.value = height;
        indexBarItemHeight.value = barHeight / 25;

        // #ifdef APP-PLUS
        winHeight.value = barHeight;
        indexBarItemHeight.value = barHeight / 30;
        // #endif

        titleHeight.value = uni.upx2px(132);
        // lists.value = cityData.list;
      }
    });
  }, 50);
});

// 方法
const showInput = () => {
  inputShowed.value = true;
};

const clearInput = () => {
  inputVal.value = '';
  inputShowed.value = false;
  searchResult.value = [];
  uni.hideKeyboard();
};

const searchCity = () => {
  const result: any = [];
  lists.value.forEach((item1: any) => {
    item1.data.forEach((item2: any) => {
      if (item2.cityName.includes(inputVal.value.toLocaleUpperCase())) {
        result.push(item2);
      }
    });
  });
  searchResult.value = result;
};

const inputTyping = (e: any) => {
  inputVal.value = e.detail.value;
  searchCity();
};

const selectCity = (e: any) => {
  const cityItem = e.currentTarget.dataset.name;
  console.log('cityItem', cityItem);
  eventBus.emit('emitSelectCity', cityItem);
  router.back();
  // uni.navigateBack({ delta: 1 });
};

const touchStart = (e: any) => {
  touchmove.value = true;
  const pageY = e.touches[0].pageY;
  const index = Math.floor((pageY - titleHeight.value) / indexBarItemHeight.value);
  const item = lists.value[index === 0 ? 1 : index];
  if (item) {
    scrollViewId.value = item.prefix;
    touchmoveIndex.value = index;
  }
};

const touchMove = (e: any) => {
  const pageY = e.touches[0].pageY;
  const index = Math.floor((pageY - titleHeight.value) / indexBarItemHeight.value);
  const item = lists.value[index === 0 ? 1 : index];
  if (item) {
    scrollViewId.value = item.prefix;
    touchmoveIndex.value = index;
  }
};

const touchEnd = () => {
  touchmove.value = false;
  touchmoveIndex.value = -1;
};

const touchCancel = () => {
  touchmove.value = false;
  touchmoveIndex.value = -1;
};

const handleClick = (index: any) => {
  if (index === undefined || touchmove.value) return;
  const item: any = lists.value[index];
  if (item) {
    scrollViewId.value = item.prefix;
    touchmoveIndex.value = index;
  }
};
</script>

<!-- 保持原有的 style 部分不变 -->
<style lang="scss" scoped>
page {
  overflow: hidden;
  height: 100%;
}
.page {
  overflow: hidden;
  height: 100%;
}
.scrollList {
  flex: 1;
}
.search-bar {
  display: flex;
  position: relative;
  align-items: center;
  padding: 27rpx 30rpx 35rpx;
  background-color: #fff;
}
.search-bar-form {
  position: relative;
  flex: 1;
  border-radius: 32rpx;
  background: #f2f5f7;
}
.search-bar-box {
  display: flex;
  position: relative;
  z-index: 1;
  align-items: center;
  padding-left: 20rpx;
  padding-right: 20rpx;
  height: 64rpx;
}
.search-bar-input {
  padding-left: 20rpx;
  width: 100%;
  line-height: normal;
  font-size: 30rpx;
  color: #333;
}
.phcolor {
  font-size: 30rpx;
}
.icon-clear {
  height: 38rpx;
}
.icon-clear .tui-icon-class {
  display: block;
}
.search-bar-label {
  display: flex;
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 2;
  justify-content: center;
  align-items: center;
  border-radius: 32rpx;
  height: 64rpx;
  background: #f2f5f7;
  color: #ccc;
}
.icon-search {
  position: relative;
  margin-right: 20rpx;
  height: 26rpx;
  font-size: inherit;
}
.search-bar-text {
  line-height: 32rpx;
  font-size: 30rpx;
}
.cancel-btn {
  padding-left: 30rpx;
}
.search-result::before {
  display: none;
}
.search-result::after {
  display: none;
}
.tui-list-cell {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.tui-list-cell-hover {
  background-color: #eee !important;
}
.tui-list-cell-navigate {
  position: relative;
  padding: 30rpx 0 30rpx 30rpx;
  width: 100%;
  font-size: 28rpx;
  color: #333;
}
.tui-list-cell-navigate::after {
  position: absolute;
  left: 30rpx;
  right: 0;
  bottom: 0;
  border-bottom: 1rpx solid #eaeef1;
  content: '';
  transform: scaleY(0.5);
  transform: scaleY(0.5);
}
.current-city {
  padding: 0 30rpx 30rpx;
  background: #fff;
}
.tui-icon-class {
  margin-right: 10rpx;
}
.current-city .title {
  line-height: 24rpx;
  font-size: 24rpx;
  color: #999;
}
.city-name {
  display: flex;
  align-items: center;
  margin-top: 17rpx;
  line-height: 30rpx;
  font-weight: bold;
  font-size: 30rpx;
  color: #333;
}
.hot-city .title {
  padding-left: 30rpx;
  height: 48rpx !important;
  background: #f2f5f7 !important;
  line-height: 48rpx !important;
  font-size: 24rpx !important;
  color: #999;
}
.city-names {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-content: space-between;
  padding: 12rpx 90rpx 26rpx 30rpx;
  width: 630rpx;
  background: #fff;
}
.city-name-item {
  display: flex;
  position: relative;
  justify-content: center;
  align-items: center;
  margin-top: 16rpx;
  /* border: solid 1rpx #ccc; */
  border-radius: 28rpx;
  width: 140rpx;
  height: 56rpx;
  font-size: 28rpx;
  color: #333;
}
.city-name-item::before {
  position: absolute;
  left: 0;
  top: 0;
  box-sizing: border-box;
  box-sizing: border-box;
  border: 1px solid #ccc;
  border-radius: 56rpx;
  width: 200%;
  height: 200%;
  content: '';
  transform: scale(0.5, 0.5);
  transform: scale(0.5, 0.5);
  transform-origin: 0 0;
  transform-origin: 0 0;
}
.tap-city {
  background: #5677fc;
  color: #fff;
  /* border: solid 1rpx #5677fc; */
}
.tui-list {
  display: flex;
  position: relative;
  flex-direction: column;
  padding-bottom: env(safe-area-inset-bottom);
  width: 100%;
  background-color: #fff;
}
.tui-list-cell-divider {
  display: flex;
  align-items: center;
  padding: 0 30rpx;
  padding-left: 30rpx;
  height: 48rpx;
  background: #f2f5f7;
  font-size: 24rpx;
  color: #999;
}
.tui-indexed-list-bar {
  display: flex;
  position: absolute;
  right: 0;
  top: 132rpx;
  z-index: 9999;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  padding-right: 10rpx;
  width: 44rpx;
}
.tui-indexed-list-text {
  font-size: 22rpx;
  white-space: nowrap;
}
.tui-indexed-list-bar.active {
  background-color: rgb(200, 200, 200);
}
.tui-indexed-list-alert {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 20;
  margin-left: -80rpx;
  margin-top: -80rpx;
  border-radius: 80rpx;
  width: 160rpx;
  height: 160rpx;
  background-color: rgba(0, 0, 0, 0.5);
  line-height: 160rpx;
  text-align: center;
  font-size: 70rpx;
  color: #fff;
}
</style>
@/pages/home/hooks/city-data
