<!-- 移动端统一主列表卡片UI组件 -->
<!-- 如果后续产品或UI设计该组件现有逻辑满足不了，需要反复找产品沟通确认再考虑扩展该组件 -->
<template>
  <div class="mobile-list-card">
    <div v-if="title || $slots.title" class="mobile-list-card-head break-all">
      <van-checkbox v-if="enableCheckBox" v-model="checked" :shape="shape">
        <slot name="title">
          {{ title }}
        </slot>
      </van-checkbox>
      <slot v-else name="title">
        {{ title }}
      </slot>
    </div>

    <div class="mobile-list-card-body" :style="bodyStyle" @click="onClick">
      <slot>
        <div v-for="(item, index) in rows" v-show="item" :key="index" class="mobile-list-card-row">
          <template v-if="item">
            <div class="mobile-list-card-label">
              {{ item.label }}：
            </div>
            <div
              class="mobile-list-card-value" :style="{
                color: item.color || undefined,
              }"
            >
              {{ item.value || '--' }}
            </div>
          </template>
        </div>
      </slot>
    </div>

    <div class="mobile-list-card-foot">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang='ts'>
import type { CheckerShape } from 'vant/lib/checkbox/Checker'

const props = defineProps({
  title: {
    type: String,
  },
  rows: {
    type: Object as PropType<Array<{
      label: string
      value: any
      color?: string
    }>>,
  },
  // 开启复选
  enableCheckbox: {
    type: Boolean,
    default: false,
  },
  // 选中状态
  checked: {
    type: Boolean,
    default: false,
  },
  shape: {
    type: String as PropType<CheckerShape>,
    default: 'square',
  },
  bodyStyle: {
    type: Object as PropType<Record<string, any>>,
    default: () => ({}),
  },
})

const emits = defineEmits(['update:checked'])

const enableCheckBox = computed(() => props.enableCheckbox)

const checked = computed<boolean>({
  get() { return props.checked },
  set(value) { emits('update:checked', value) },
})

const rows = computed(() => (props.rows || []).filter(i => !!i))

const title = computed(() => props.title || '')

function onClick() {
  if (enableCheckBox.value) {
    checked.value = !checked.value
  }
}
</script>

<style lang="less" scoped>
:deep(.van-checkbox__label) {
   width: 100%;
 }

.mobile-list-card {
  background: #fff;
  margin-bottom: 16px;
  border: 1px solid #F5F5F5;
  border-radius: 8px;

  .mobile-list-card-head {
    padding: 12px 16px;
    font-size: 13px;
    position: relative;
    color: #151515;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 16px;
      right: 16px;
      height: 1px;
      display: block;
      background: #F5F5F5;
    }
  }

  .mobile-list-card-body {
    padding: 8px 16px;
    font-size: 12px;
    flex: 1;
    color: #666;
  }

  .mobile-list-card-label {
    color: #666666;
  }

  .mobile-list-card-value {
    flex: 1;
    text-align: right;
    color: #151515;
  }

  .mobile-list-card-foot {
    padding: 0 16px;

    :deep(.van-button) {
      padding: 0 12px;
      letter-spacing: 1px;
    }

    :deep(.van-button--default) {
      color: #151515;
      background: #eee;
    }
  }

  .mobile-list-card-row {
    display: flex;

    &:not(:last-child) {
      margin-bottom: 4px;
    }
  }
}
</style>
