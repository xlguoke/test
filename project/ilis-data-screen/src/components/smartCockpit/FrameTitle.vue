<template>
  <div class="frame-title">
    <img class="frame-title-icon" src="../../assets/images/smartCockpit/title-icon.svg" />
    <span class="frame-title-text">
      <slot></slot>
    </span>
    <div class="flex items-center">
      <slot name="filter-before"></slot>
      <div v-if="options.length" class="frame-title-filter">
        <div
          v-for="(item, index) in options"
          :key="index"
          :class="{
            active: item.value === checked,
            disabled: disabled
          }"
          @click="disabled ? undefined : onSelect(item)"
        >
          {{ item.label }}
        </div>
      </div>
      <slot name="filter-after"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"

const emits = defineEmits(["onSelect", "update:checked"])

interface IOption {
  label: String
  value: String | Number
}

const props = defineProps({
  checked: {
    type: [String, Number],
    default: ""
  },
  options: {
    type: Array<IOption>,
    default: () => []
  },
  disabled: {
    type: Boolean,
    default: false
  }
})

const options = computed(() => props.options)

const checked = computed(() => props.checked)

function onSelect(item: IOption) {
  emits("update:checked", item.value)
  emits("onSelect", item.value, item)
}
</script>

<style lang="less" scoped>
.frame-title {
  display: flex;
  position: relative;
  height: 1.2rem;
  background: linear-gradient(270deg, rgba(64, 231, 213, 0) 0%, rgba(64, 231, 213, 0.2) 100%);
  padding-left: 0.8rem;
  align-items: center;
  justify-content: space-between;

  &::before {
    position: absolute;
    left: 0;
    bottom: 0;
    height: 0.05rem;
    width: 0.8rem;
    background-color: #40e7d5;
    content: "";
  }

  &::after {
    position: absolute;
    left: 1.5rem;
    bottom: 0;
    height: 0.05rem;
    width: calc(100% - 1.5rem);
    background: linear-gradient(90deg, #40e7d5, rgba(64, 231, 214, 0.6), transparent);
    content: "";
  }

  .frame-title-text {
    font-variation-settings: "opsz" auto;
    background: linear-gradient(180deg, #ffffff 0%, #80fff1 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    font-size: 0.48rem;
    font-weight: bold;
  }

  .frame-title-icon {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    height: 0.66rem;
  }

  .frame-title-filter {
    height: 0.66rem;
    display: flex;
    align-items: center;
    background: rgba(76, 184, 176, 0.1);
    border: 1px solid #4cb8b0;

    & > div {
      font-family: Source Han Sans;
      font-size: 0.36rem;
      font-weight: 500;
      font-variation-settings: "opsz" auto;
      color: #ffffff;
      padding: 0 0.28rem;
      cursor: pointer;
      color: #73cbc5;
      height: 100%;
      display: flex;
      align-items: center;

      &.active,
      &:hover {
        background: #4cb8b0;
        color: #fff;
      }
      &.disabled {
        cursor: not-allowed;
      }
    }
  }
}
</style>
