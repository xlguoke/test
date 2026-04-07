<template>
  <div class="empty">
    <img src="@/assets/images/cutRoomScreen/empty.svg" alt="" />
    <span class="desc">暂无数据</span>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="less" scoped>
.empty {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 44, 106, 0.5);
  gap: 18px;
  img {
    width: 95px;
    height: 70px;
  }
  .desc {
    font-size: 14px;
    color: #4882e5;
  }
}
</style>
