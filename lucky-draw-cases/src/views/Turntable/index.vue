<!--
 * @Author: Lee
 * @Date: 2023-01-11 11:43:18
 * @LastEditors: Lee
 * @LastEditTime: 2023-01-12 11:40:23
 * @Description: 
-->

<script setup lang="ts">
// -- imports
import { ref } from 'vue';
import LuckyDraw from '@/utils/LuckyDraw';
import PageBack from '@/components/PageBack/index.vue';
import { ElMessage } from 'element-plus';

// -- refs
const turntableRef = ref();
const times = ref(1);
const isAnimating = ref(false);

// -- methods

// -- events
const onTurntable = () => {
  if (!turntableRef.value || isAnimating.value) return;
  if (times.value < 1) {
    ElMessage.closeAll();
    ElMessage.error("Uh-huh, there's no raffle！");
    return;
  }
  isAnimating.value = true;
  times.value--;
  LuckyDraw.turntable({
    wrap: turntableRef.value,
    count: 8,
    index: 3,
    audioUriForStart: '/mp3s/case-one.mp3',
    audioUriForEnd: '/mp3s/case-coin.mp3',
    duration: 10,
    loop: 8,
    completed: () => {
      isAnimating.value = false;
      ElMessage.success('Congratulations on winning the lottery!');
    },
  });
};
</script>
<template>
  <div class="page ff-DIN-Bold">
    <PageBack />
    <!-- 提示 -->
    <div class="tips">Times：{{ times }}</div>
    <!-- 容器 -->
    <div class="turntable">
      <div class="turntable-wrap">
        <img class="wheel" src="./images/big_wheel.png" ref="turntableRef" />
        <img class="point" src="./images/point.png" @click="onTurntable" />
      </div>
      <img class="support" src="./images/support.png" />
    </div>
  </div>
</template>

<style lang="less" scoped>
.page {
  padding-top: 80px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(to bottom, #111114 60%, #4b69ff);
  color: #fff;
}
.tips {
  margin-bottom: 20px;
  letter-spacing: 2px;
}
.turntable {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.turntable-wrap {
  width: 300px;
  height: 300px;
  background: url('./images/dis.png') no-repeat center center;
  background-size: cover;
  position: relative;
  z-index: 1;
  .wheel {
    width: 235px;
    height: 235px;
    position: absolute;
    top: 30px;
    left: 32px;
  }
  .point {
    width: 70px;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    cursor: pointer;
  }
}
.support {
  margin-top: -36px;
}
</style>
