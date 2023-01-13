<!--
 * @Author: Lee
 * @Date: 2023-01-11 11:40:43
 * @LastEditors: Lee
 * @LastEditTime: 2023-01-13 11:40:53
 * @Description: 
-->

<script setup lang="ts">
import { RouterLink } from 'vue-router';
</script>
<template>
  <div class="page">
    <img class="logo" src="@/assets/logo.jpeg" width="125" height="125" />
    <div class="wrapper">
      <div class="tips">
        <div class="title">抽奖代码示例</div>
        <p>
          点击下方链接可查看示例，如果您觉得不错，欢迎在
          <a
            target="_blank"
            href="https://gitee.com/lihongyao/lucky-draws-examples"
            >Gitee</a
          >
          /
          <a
            target="_blank"
            href="https://github.com/lihongyao/lucky-draws-examples"
            >Github</a
          >
          /
          <a target="_blank" href="https://juejin.cn/post/7187976478468866104"
            >Github</a
          >

          点赞关注一波~
        </p>
      </div>
      <nav>
        <RouterLink to="/scrolls">01.滚动抽奖</RouterLink>
        <RouterLink to="/turntable">02.大转盘</RouterLink>
        <RouterLink to="/lattice">03.九宫格</RouterLink>
      </nav>
    </div>
  </div>

  <!-- 外层容器 -->
  <div class="lucky-draw">
    <!-- 中间标识线（表示中奖的物品） -->
    <div class="lucky-draw-line"></div>
    <!-- 奖品容器，后续通过设置 transition + translateX 值实现滚动效果 -->
    <div class="lucky-draw-wrap">
      <!-- 奖品xn，撑起奖品容器的宽度 -->
      <div class="lucky-draw-item"></div>
      ...
    </div>
    <!-- 展示抽奖结果 -->
    <div class="lucky-draw-results"></div>
  </div>
</template>

<style lang="less" scoped>
.page {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo {
  margin-right: 20px;
  border-radius: 20px;
}

a,
.title {
  text-decoration: none;
  color: hsla(160, 100%, 37%, 1);
}

.tips {
  max-width: 340px;
  margin-bottom: 12px;
  .title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 8px;
  }
  p {
    color: #999;
  }
}
nav a:not(:last-child) {
  &::after {
    content: '|';
    margin: 0 20px;
  }
}
</style>
