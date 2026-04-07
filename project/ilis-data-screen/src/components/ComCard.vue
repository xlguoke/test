<template>
  <div :class="`s-card ${isLong ? 's-card-long' : ''} ${hideBorder ? 'hide-border' : ''}`">
    <div ref="cardHead" class="s-card-head">
      <img
        v-if="unitCode === 'yljc'"
        class="card-head-icon"
        src="@/assets/images/dataScreen/yljc/title-icon.png"
      />
      <img v-else class="card-head-icon" src="@/assets/images/title-icon.png" />
      <span class="s-card-title font-ys">{{ title }}</span>

      <template v-if="filterOptions.length">
        <template v-if="filterType === 'select'">
          <div class="s-card-select">
            <a-select
              popup-class-name="s-card-select-popup"
              :value="checked"
              :options="filterOptions"
              @select="(val, item) => onSelect(item)"
            ></a-select>
          </div>
        </template>
        <template v-else>
          <div class="s-card-filter">
            <div
              v-for="item in filterOptions"
              :key="item.value as any"
              class="s-card-filter-item"
              :class="{
                active: item.value === checked
              }"
              @click="onSelect(item)"
            >
              {{ item.label }}
            </div>
          </div>
        </template>
      </template>
    </div>
    <div class="s-card-body">
      <slot></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IOption } from "@/interface/IOption"
import { onMounted, ref, PropType } from "vue"
import { useUnitDataHooks } from "@/hooks/useUnitDataHooks"

defineProps({
  title: {
    type: String,
    default: ""
  },
  /** 加长卡片 */
  isLong: {
    type: Boolean,
    default: false
  },
  hideBorder: Boolean,
  /** 过滤项 */
  filterOptions: {
    type: Array<IOption>,
    default: () => []
  },
  filterType: {
    type: String as PropType<"radio" | "select">,
    default: "radio"
  },
  /** 过滤选中 */
  checked: {
    type: [String, Number],
    default: ""
  }
})

const emits = defineEmits(["select", "update:checked"])

onMounted(() => {
  setBgPosition()
})

const { unitCode } = useUnitDataHooks()

const cardHead = ref()
const setBgPosition = () => {
  const winW = window.innerWidth || document.body.clientWidth
  const winH = window.innerHeight || document.body.clientHeight
  const wh = winW / winH
  if (wh > 2.7) {
    cardHead.value.style.backgroundPosition = "left center"
  } else {
    cardHead.value.style.backgroundPosition = "right center"
  }
}

function onSelect(item: IOption) {
  emits("update:checked", item.value)
  emits("select", item)
}
</script>

<style scoped lang="less">
.bottom-border(@color) {
  position: relative;
  &::before {
    content: "";
    position: absolute;
    left: -1px;
    bottom: -1px;
    width: 0.12rem;
    height: 0.12rem;
    border-bottom: 2px solid @color;
    border-left: 2px solid @color;
  }
  &::after {
    content: "";
    position: absolute;
    right: -1px;
    bottom: -1px;
    width: 0.12rem;
    height: 0.12rem;
    border-bottom: 2px solid @color;
    border-right: 2px solid @color;
  }
}
.s-card {
  width: 100%;
  height: 100%;
  &:not(.no-border):not(.hide-border) {
    border: 1px solid #05234a;
    .bottom-border(#128cff);
  }
  .s-card-head {
    position: relative;
    display: flex;
    align-items: center;
    padding-left: 0.06rem;
    line-height: 0.56rem;
    font-size: 0.22rem;
    border-image-source: url("@/assets/images/border-bg.png");
    border-image-slice: 3 64 3 50 fill;
    border-image-width: 0.03rem 0.5rem;
    background: url("@/assets/images/juxing-bg.png") no-repeat right center/auto 60%,
      linear-gradient(to right, #021f3a, #030a20);
    text-shadow: 0.02rem 0 0.08rem #128cff;
    .card-head-icon {
      margin: 0 0.08rem;
      width: 0.24rem;
      height: 0.28rem;
    }
  }
  .s-card-body {
    height: calc(100% - 0.56rem);
    padding: 0.1rem;
    box-sizing: border-box;
  }
}

.s-card.hide-border {
  border: none;
  .s-card-body {
    padding: 0;
  }
}

.s-card-filter {
  margin-left: auto;
  display: flex;
  align-items: center;
  border: 1px solid #2c60d3;
  background: rgba(0, 102, 236, 0.1);
  margin-right: 0.12rem;
  font-size: 0.14rem;
  height: 0.28rem;

  .s-card-filter-item {
    padding: 0 0.16rem;
    cursor: pointer;
    height: 100%;
    line-height: normal;
    display: flex;
    align-items: center;

    &.active,
    &:hover {
      background: #128cff;
      color: #fff;
    }
  }
}

.s-card-title {
  flex: 1;
}

.s-card-select {
  margin-left: auto;
  display: flex;
  align-items: center;
  margin: 0;
  margin-right: 0.12rem;
  font-size: 0.14rem;
  height: 0.28rem;
  width: 1.6rem;

  .ant-select {
    width: 2rem;
  }

  :deep(.ant-select-selector) {
    background: transparent;
    border-color: #2c60d3;
    color: #fff;
  }

  :deep(.ant-select-arrow) {
    color: #fff;
  }
}
</style>
<style lang="less">
.s-card-select-popup {
  background: #092244;
  border: solid 1px #2c60d3;

  .ant-select-item-option {
    color: #fff;
  }

  .ant-select-item-option-active,
  .ant-select-item-option-selected {
    background-color: #128cff !important;
    color: #fff !important;
  }
}
</style>
