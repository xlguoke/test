<template>
  <div class="navBar">
    <div class="l">
      <span style="color: #355ea5; margin-right: 10px">当前</span>
      <span style="color: #368dff">{{ name }}</span>
    </div>
    <div class="goBackBtn" @click="goBack()">
      <img src="@/assets/images/deviceSmallScreen/goBackBtnIcon.svg" alt="" />
      <span>返回</span>
    </div>
  </div>
</template>
<script lang="ts" setup>
defineProps<{
  name: string
}>()

function goBack() {
  window.history.go(-1)
}
</script>
<style lang="less" scoped>
.navBar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 28px;
  .l {
    padding: 18px 60px 18px 24px;
    border-left: 3px solid #0067ff;
    background: #000b32;
  }
  .goBackBtn {
    cursor: pointer;
    padding: 10px 30px;
    color: #368dff;
    border-radius: 30px;
    border: 1px solid #0067ff;
    display: flex;
    align-items: center;

    &:active {
      opacity: 0.8;
    }

    img {
      margin-right: 10px;
      height: 18px;
      width: 20px;
    }
  }
}
</style>
