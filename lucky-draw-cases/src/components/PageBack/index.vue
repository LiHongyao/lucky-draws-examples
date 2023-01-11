<!--
 * @Author: Lee
 * @Date: 2023-01-11 16:16:41
 * @LastEditors: Lee
 * @LastEditTime: 2023-01-11 16:19:59
 * @Description: 
-->
<template>
  <div class="page-back" @click="$router.back()">&lt; RETURN TO HOME PAGE</div>
</template>

<style lang="less" scoped>
.page-back {
  display: inline-block;
  background-color: #000;
  padding: 8px 15px;
  border-radius: 8px;
  cursor: pointer;
  color: #b4b8cd;
  font-weight: 700;
  margin-bottom: 20px;
  &:hover {
    color: #fff;
  }
}
</style>
