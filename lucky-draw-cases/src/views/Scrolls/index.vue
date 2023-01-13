<!--
 * @Author: Lee
 * @Date: 2023-01-11 11:40:57
 * @LastEditors: Lee
 * @LastEditTime: 2023-01-13 11:43:20
 * @Description: 
-->

<script setup lang="ts">
// -- imports
import { reactive, onMounted, ref } from 'vue';
import json from './data.json';
import LuckyDraw from '@/utils/LuckyDraw';
import PageBack from '@/components/PageBack/index.vue';
import Big from 'lg-big';
import { ElMessage } from 'element-plus';

// -- interfaces
interface BoxProps {
  productId: number;
  allProbability: number;
  price: number;
  armsName: string;
  skinsName: string;
  rarityColor: string;
  image: string;
  wearDegree: string;
}
interface DataProps {
  title: string;
  price: number;
  pmsBoxProductAbbrList: Array<BoxProps>;
}
interface StateProps {
  /** 数据源 */
  data: DataProps | null;
  /** 抽奖数据（需特殊处理） */
  luckyDrawData: Array<BoxProps> | null;
  /** 中奖结果 */
  luckyDrawResults: BoxProps | null;
  /** 是否展示中间结果 */
  luckyDrawResultsVisible: boolean;
  /** 是否启用音效 */
  openSound: boolean;
  /** 是否启用动效 */
  openAnimation: boolean;
  /** 奖品元素的宽度 */
  itemWidth: number;
  /** 是否正在执行动效 */
  isAnimating: boolean;
  /** 余额 */
  balance: number;
}

// -- refs
const luckyDrawRef = ref();
const luckyDrawWrapRef = ref();
// -- state
const state = reactive<StateProps>({
  data: null,
  luckyDrawData: null,
  luckyDrawResults: null,
  luckyDrawResultsVisible: false,
  openSound: true,
  openAnimation: true,
  itemWidth: 0,
  isAnimating: false,
  balance: 1000,
});

// -- life circles
onMounted(() => {
  getData();
  getBoundings();
});

// -- methods
const getStyle = (el: any, attr: string) => {
  if (el.currentStyle) {
    return el.currentStyle[attr];
  } else {
    // @ts-ignore
    return getComputedStyle(el, null)[attr];
  }
};
const getBoundings = () => {
  const w = parseInt(getStyle(luckyDrawRef.value, 'width'));
  state.itemWidth = w / 7;
};
const getBgColor = (colorStop: string) => {
  return `linear-gradient(to bottom, #000 50%, ${colorStop} 100%)`;
};

const getData = () => {
  state.data = json;
  state.luckyDrawData = LuckyDraw.getLuckyDrawDataList<BoxProps>({
    source: json.pmsBoxProductAbbrList,
    total: 70,
    visibleCount: 7,
  });
};

// -- events
const onOpenBox = () => {
  if (!state.data || !state.luckyDrawData || state.isAnimating) return;
  if (state.balance < state.data.price) {
    ElMessage.info('余额不足');
    return;
  }
  state.luckyDrawResultsVisible = false;
  state.balance = new Big(state.balance).minus(state.data.price).parse();
  state.isAnimating = true;
  // -- 模拟ajax请求，获取中奖物品
  const len = state.data.pmsBoxProductAbbrList.length;
  const index = Math.floor(Math.random() * len);
  const openResults = state.data.pmsBoxProductAbbrList[index];
  state.luckyDrawResults = openResults;
  // -- 执行动画
  LuckyDraw.draw({
    winningID: openResults.productId,
    winningIDs: state.luckyDrawData.map((item) => item.productId),
    wrap: luckyDrawWrapRef.value,
    itemWidth: state.itemWidth,
    visibleItemCount: 7,
    openAnimation: state.openAnimation,
    openSound: state.openSound,
    audioUriForStart: '/mp3s/case-one.mp3',
    audioUriForEnd: '/mp3s/case-coin.mp3',
    completed: () => {
      state.isAnimating = false;
      state.luckyDrawResultsVisible = true;
    },
  });
};

const onSell = () => {
  state.luckyDrawResultsVisible = false;
  state.balance = new Big(state.balance)
    .plus(state.luckyDrawResults?.price || 0)
    .parse();
};
</script>

<template>
  <div class="page ff-DIN-Bold">
    <div class="contents">
      <PageBack />
      <!-- Header Start -->
      <div class="top">
        <img class="logo" src="../../assets/logo.png" />
        <div class="title">{{ state.data?.title }}</div>
        <div class="controls flex-h-center">
          <div class="item flex-h-center">
            <span class="label">SOUND:</span>
            <el-switch
              v-model="state.openSound"
              style="--el-switch-on-color: #5fb878"
            />
          </div>
          <div class="item flex-h-center">
            <span class="label">ANIMATION:</span>
            <el-switch
              v-model="state.openAnimation"
              style="--el-switch-on-color: #5fb878"
            />
          </div>
        </div>
      </div>
      <!-- Header End -->

      <!-- Lucky-draw Start -->
      <div class="lucky-draw" ref="luckyDrawRef">
        <!-- 抽奖标识线 -->
        <div class="lucky-line"></div>
        <!-- 抽奖物品容器 -->
        <div class="lucky-draw-wrap" ref="luckyDrawWrapRef">
          <template v-for="(item, index) in state.luckyDrawData" :key="index">
            <div
              class="lucky-draw-item"
              :style="{
                width: state.itemWidth + 'px',
                background: getBgColor(item.rarityColor),
              }"
            >
              <div class="chance">
                <div>CHANCE</div>
                <div>{{ item.allProbability }}%</div>
              </div>
              <img :src="item.image" />
              <div class="infos">
                <div class="arms">{{ item.armsName }}</div>
                <div class="skins">{{ item.skinsName }}</div>
              </div>
            </div>
          </template>
        </div>
        <!-- 抽奖结果 -->
        <div
          class="lucky-draw-results flex-h-center"
          :class="{ visible: state.luckyDrawResultsVisible }"
        >
          <div class="infos flex-h-center">
            <div class="a-item">
              <div>{{ state.luckyDrawResults?.wearDegree }}</div>
              <div>
                <div>CHANCE</div>
                <div>{{ state.luckyDrawResults?.allProbability }}%</div>
              </div>
            </div>
            <img :src="state.luckyDrawResults?.image" />
            <div class="a-item">
              <div class="armsName">{{ state.luckyDrawResults?.armsName }}</div>
              <div class="skinsName">
                {{ state.luckyDrawResults?.skinsName }}
              </div>
              <div class="price">$ {{ state.luckyDrawResults?.price }}</div>
            </div>
          </div>
        </div>
      </div>
      <!-- Lucky-draw End -->

      <!-- Balance Start -->
      <div class="balance">BALANCE:&nbsp;&nbsp;${{ state.balance }}</div>
      <!-- Balance End -->
      <!-- Actions Start -->
      <div v-if="state.luckyDrawResultsVisible" class="flex-h-center">
        <div
          class="action-button"
          @click="state.luckyDrawResultsVisible = false"
        >
          &lt;
        </div>
        <div class="action-button" @click="onSell">
          Sell ${{ state.luckyDrawResults?.price }}
        </div>
        <div class="action-button" @click="onOpenBox">Open again</div>
      </div>
      <div v-else class="start-button" @click="onOpenBox">
        {{
          state.isAnimating ? 'OPENING...' : `OPEN FOR $${state.data?.price} `
        }}
      </div>
      <!-- Actions End -->
    </div>
  </div>
</template>

<style lang="less" scoped>
.flex-h-center {
  display: flex;
  justify-content: center;
  align-items: center;
}
.page {
  padding-top: 100px;
  height: 100vh;
  background-color: #111114;
  color: #ffffff;
  font-size: 12px;
}
.contents {
  width: 80%;
  min-width: 1400px;
  max-width: 1680px;
  margin: 0 auto;
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  position: relative;
  .logo {
    height: 30px;
  }

  .title {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: 1px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  .controls {
    .item {
      .label {
        margin-right: 6px;
      }
      &:first-child {
        margin-right: 20px;
      }
    }
  }
}

.lucky-draw {
  height: 280px;
  background-color: transparent;
  position: relative;
  overflow: hidden;
  box-shadow: #42425433 0 0 0 5px;
  .lucky-line {
    height: 280px;
    width: 2px;
    background-color: #dcae64;
    position: absolute;
    z-index: 1;
    left: 50%;
    transform: translateX(-50%);
    &::before,
    &::after {
      content: '';
      display: block;
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      z-index: inherit;
      border-style: solid;
      border-width: 16px;
    }
    &::before {
      top: 0;
      border-color: #dcae64 transparent transparent transparent;
    }
    &::after {
      bottom: 0;
      border-color: transparent transparent #dcae64 transparent;
    }
  }

  .lucky-draw-wrap {
    white-space: nowrap;
    height: inherit;
  }

  .lucky-draw-item {
    display: inline-block;
    height: inherit;
    text-align: center;

    padding: 16px;
    position: relative;
    img {
      width: 80%;
      height: auto;
      margin: 16px 0;
    }
    .chance {
      text-align: right;
      color: #b4b8cd;
    }
    .infos {
      text-align: left;
      letter-spacing: 1px;
    }
    .arms {
      font-size: 14px;
      color: #b4b8cd;
      margin-bottom: 4px;
    }
    .skins {
      color: #fff;
      font-size: 16px;
    }
  }

  .lucky-draw-results {
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.75);
    position: absolute;
    top: 0;
    left: 0;
    z-index: -1;
    &.visible {
      z-index: 2;
    }
    .infos {
      border: 1px solid #a0804d;
      width: 330px;
      height: 230px;
      background-color: #1c1c24;
      color: #b4b8cd;
      font-weight: 700;
      padding: 16px;
      border-radius: 8px;
      position: inherit;
      img {
        width: 60%;
        height: auto;
        transition: all 0.25s linear;
      }
      &:hover img {
        transform: scale(0.75) rotateZ(10deg);
      }

      .a-item {
        width: 100%;
        padding: 0 12px;
        position: absolute;
        line-height: 17px;
        &:first-child {
          padding: 0 12px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          top: 12px;
        }
        &:last-child {
          bottom: 12px;
        }
        .skinsName {
          color: #fff;
        }
        .price {
          color: #dcae64;
        }
      }
    }
  }
}

.balance {
  text-align: center;
  margin: 30px 0 20px;
  font-size: 14px;
  letter-spacing: 1px;
}
.start-button {
  width: 226px;
  height: 60px;
  margin: 0 auto;
  border: 1px solid #50e36d;
  border-radius: 8px;
  cursor: pointer;
  line-height: 60px;
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  color: #50e36d;
  box-shadow: 0 0 6px rgb(80 227 109 / 40%), inset 0 0 6px rgb(80 227 109 / 40%);
  transition: all 0.25s linear;
  &:hover {
    background-color: #21282a;
  }
}

.action-button {
  width: 226px;
  height: 60px;
  border: 1px solid #50e36d;
  border-radius: 8px;
  font-weight: 700;
  font-size: 16px;
  color: #50e36d;
  box-shadow: 0 0 6px rgb(80 227 109 / 40%), inset 0 0 6px rgb(80 227 109 / 40%);
  background-color: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  &:hover {
    background-color: #21282a;
  }
  &:nth-child(1) {
    width: 80px;
    border-color: #b4b8cd;
    box-shadow: none;
    color: #b4b8cd;
  }
  &:nth-child(2) {
    margin: 0 20px;
  }
}
</style>
