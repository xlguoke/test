<template>
  <div class="table-title">
    <img src="@/assets/images/cutRoomScreen/tableTitleIcon.svg" alt="" />
    <span>
      <slot>title</slot>
    </span>
  </div>
</template>

<script setup lang="ts"></script>

<style lang="less" scoped>
.table-title {
  display: flex;
  gap: 8px;
  padding-bottom: 16px;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  text-shadow: 0px 0px 9px #159aff;
  background-image: url("@/assets/images/cutRoomScreen/tableTitleLineStart.svg"),
    url("@/assets/images/cutRoomScreen/tableTitleLine.svg"),
    url("@/assets/images/cutRoomScreen/tableTitleLineEnd.svg");
  background-repeat: no-repeat;
  background-position: bottom left, bottom left, bottom right;
  background-size: auto, calc(100% - 20px), auto;
}
</style>
