<template>
  <a-spin :spinning="loading">
    <div v-if="ocrResult?.length" class="overflow-auto">
      <div
        v-for="page in ocrResult"
        :key="page.page"
        :style="{
          height: `${getHeight(page)}px`,
        }"
        class="relative overflow-auto bg-cyan-50 mb-4"
      >
        <span
          v-for="(item, index) in page.cells"
          :key="index"
          class="absolute whitespace-nowrap glass"
          :style="{
            left: `${getX(item)}px`,
            top: `${getY(item)}px`,
            border: '1px solid #ccc',
          }"
          @click="handleCopy(item)"
        >
          {{ getText(item) }}
        </span>
      </div>
    </div>
    <a-empty v-else>
      <template #description>
        未获取到解析数据
      </template>
    </a-empty>
  </a-spin>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue'
import type { IOcrQueryParams, IOrcResult, OcrCellItem } from './ocrResultMockData.ts'
import { checkOcr } from './api.ts'

const props = defineProps<{
  ocr: IOcrQueryParams
}>()

const ocrResult = ref<IOrcResult[]>()

const loading = ref(false)

async function getData() {
  // ocr的数据靠props传入，在jsp使用时从parent.ocr中获取
  if (!props.ocr && !parent.ocr) {
    return
  }
  const ocr = props.ocr || parent.ocr
  loading.value = true
  const { data } = await checkOcr(ocr, loading)
  const ocrData = data[0] || ''
  ocrResult.value = JSON.parse(ocrData) || []
  loading.value = false
}

function getX(item: OcrCellItem) {
  return item.lt[0]
}
function getY(item: OcrCellItem) {
  return item.lt[1]
}
function getHeight(item: IOrcResult) {
  const heightArrTwo = item.cells.map(item => [item.rb[1], item.lb[1]]) as never[][]
  const heightArr = [].concat(...heightArrTwo)
  return Math.max(...heightArr) + 50
}

function getWidth() {
  if (!ocrResult.value?.length) {
    return 500
  }
  const pageCells = [].concat(...ocrResult.value?.map(item => item.cells) as never[]) as OcrCellItem[]
  const maxXItem = pageCells.reduce((pre, cur) => {
    if ((cur.rb[0] > pre.rb[0] && cur.rb[0] > pre.rt[0]) || (cur.rt[0] > pre.rt[0] && cur.rt[0] > pre.rb[0])) {
      return cur
    }
    return pre
  })
  const maxX = Math.max(maxXItem.rb[0], maxXItem.rt[0])
  return maxX
}

/**
 * 将文本拷贝到剪切板
 */
function handleCopy(item: OcrCellItem) {
  const text = getText(item)
  // 拷贝到剪切板
  navigator.clipboard.writeText(text).then(() => {
    message.success('复制成功')
  }).catch(() => {
    message.error('复制失败')
  })
}

function getText(item: OcrCellItem) {
  return item.text
}

defineExpose({ getWidth })

getData()
</script>

<style scoped lang="less">
.glass{
  cursor: pointer;
  background: rgba( 255, 255, 255);
  box-shadow: 0 8px 32px 0 rgba( 31, 38, 135, 0.37 );
  border-radius: 10px;
  padding:0 10px;
  font-size: 14px;
  &:hover{
    z-index: 999;
    color: #fff;
    background-color: #0865e2;
  }
}
</style>
