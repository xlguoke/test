<script setup lang="ts">
import { inject, onMounted, ref, watchEffect } from 'vue'
import { Spin } from 'ant-design-vue'
import { debounce } from '@/utils/index'
import NoData from '@/components/noData/index.vue'

const emits = defineEmits(['load'])
// 当前已加载数据条数
const dataLength = ref(inject('dataLength') as number)
// 数据总条数
const total = ref(inject('total') as number)
const loading = ref(inject('loading') as boolean)

const scrollWrap = ref()
onMounted(() => {
  scrollWrap.value.addEventListener('scroll', handleScroll)
})
function handleScroll(e: Event) {
  if (dataLength.value === 0 || total.value <= dataLength.value)
    return
  debounce(() => {
    const el = e.target as any
    const _top = el.scrollTop
    const h = el.clientHeight
    const totalH = el.scrollHeight
    if (totalH - _top - h < 100)
      emits('load')
  }, 200)
}

let oldLen = 0
watchEffect(() => {
  // 新的数据条数小于等于历史条数，说明是点击了查询，需要滚动到顶部
  if (oldLen && oldLen >= dataLength.value)
    scrollWrap.value.scrollTop = 0

  oldLen = dataLength.value
})
</script>

<template>
  <div ref="scrollWrap" class="rolling-loading">
    <Spin :spinning="loading" :delay="100" />
    <slot />
    <slot name="noData">
      <NoData v-if="dataLength === 0" />
      <p v-else-if="total <= dataLength" class="load-finish">
        到底了
      </p>
      <p v-else class="load-finish" @click="emits('load')">
        加载更多
      </p>
    </slot>
  </div>
</template>

<style lang="less" scoped>
.rolling-loading {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  font-size: 16px;
  .ant-spin-spinning {
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    &::after {
      position: absolute;
      top: 0;
      inset-inline-end: 0;
      bottom: 0;
      inset-inline-start: 0;
      z-index: 10;
      width: 100%;
      height: 100%;
      background: rgba(255, 255, 255, 0.5);
      transition: all 0.3s;
      content: '';
      pointer-events: none;
    }
    :deep(.ant-spin-dot) {
      z-index: 100;
    }
  }

  .load-finish {
    padding: 2rem 0;
    color: #aaa;
    text-align: center;
  }
}
</style>
