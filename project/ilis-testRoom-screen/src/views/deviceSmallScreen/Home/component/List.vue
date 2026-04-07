<template>
  <div class="list-main">
    <img src="@/assets/images/deviceSmallScreen/scrollUp.svg" alt="" />
    <div class="list-content">
      <div
        v-for="(item, index) in data"
        :key="index"
        :class="['item', currentDevice.id === item.id ? 'active' : '']"
        @click="handleClick(item)"
      >
        <div class="name">{{ item[nameKey] }}</div>
        <div class="value">{{ item[valueKey] }}</div>
      </div>
    </div>
    <img src="@/assets/images/deviceSmallScreen/scrollDown.svg" alt="" />
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  data: Array<any>
  nameKey: string
  valueKey: string
  currentDevice: any
}>()

const emits = defineEmits(["update:currentDevice"])

function handleClick(item: any) {
  emits("update:currentDevice", item)
}
</script>

<style lang="less" scoped>
.list-main {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  overflow: hidden;
  font-size: 28px;
  line-height: 36px;
  text-align: center;
  color: #355ea5;
  > img {
    width: 30px;
  }
  .list-content {
    flex: 1;
    width: 100%;
    overflow-y: auto;
    .item {
      cursor: pointer;
      padding: 20px 40px;
      &.active {
        position: relative;
        text-shadow: 0px 0px 4px #0066ec;
        color: #eef5ff;
        background: linear-gradient(
          270deg,
          rgba(0, 19, 82, 0) 0%,
          #001352 51%,
          rgba(0, 19, 82, 0) 100%
        );
        &::after {
          content: "";
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          width: 4px;
          background: linear-gradient(
            180deg,
            rgba(0, 103, 255, 0) 0%,
            #0067ff 50%,
            rgba(0, 103, 255, 0) 100%
          );
        }
      }
      .name,
      .value {
        text-align: left;
        width: 100%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }
  }
}
</style>
