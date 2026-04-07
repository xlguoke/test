<script setup lang="ts">
import { ref, toRefs } from 'vue'
import { UdrLifecycle } from '../../provider/UdrLifecycle'
import { udrCore } from '../../provider/UdrCore'
import { useUdrStore } from '@/views/udr/provider/useUdrStore'
import { useTouchSwipe } from '@/hooks/useTouchSwipe'

const udrStore = useUdrStore()
const { sheetName, panelManager } = toRefs(udrStore)

const { handleTouchStart, handleTouchEnd } = useTouchSwipe({
  handleLeftSwipe: () => {
    panelManager.value.leftAreaOpen = false
  },
})

const keyword = ref('')

const sheetList = ref<Array<{
  name: string
  visible: boolean
}>>([])

function initSheets() {
  sheetList.value = []

  const sheets = udrCore.$util.toArray(udrCore.$udr.getSheets().getSheets())
  const size = sheets.size()

  for (let idx = 0; idx < size; idx++) {
    const sheet = sheets.get(idx)
    if (sheet.isVisible()) {
      sheetList.value.push({
        name: sheet.getName(),
        visible: true,
      })
    }
  }
}

function openSheet(idOrName: string) {
  udrCore.$this.setActiveSheet(idOrName)
  sheetName.value = idOrName
}

function onFilter() {
  sheetList.value.forEach((item) => {
    item.visible = item.name.includes(keyword.value)
  })
}

UdrLifecycle.subscribe('OnFileOpenAfter', () => {
  initSheets()
})

UdrLifecycle.subscribe('onSheetStateChanged', () => {
  initSheets()

  const sheets = udrCore?.$udr?.getSheets()
  const name = sheets?.getActiveSheet()?.getName() || ''
  // 获取当前打开的表格并赋值
  sheetName.value = name

  udrCore.$this.setUdrVisibility(true)
})
</script>

<template>
  <div
    class="sheet-wrap"
    @touchstart="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <van-search v-model.trim="keyword" placeholder="请输入参数表格名称" @search="onFilter" />
    <div class="sheet-list">
      <div
        v-for="(item, index) in sheetList"
        v-show="item.visible"
        :key="index"
        class="sheet-list-li"
        :class="{ active: sheetName === item.name }"
        @click="openSheet(item.name)"
      >
        {{ item.name }}
      </div>
    </div>
  </div>
</template>

<style lang="less" scoped>
.sheet-wrap {
  width: 200px;
  padding: 12px;
  background: #fff;
  height: 100%;
  display: flex;
  flex-direction: column;

  :deep(.van-search) {
    padding: 0;
    border: solid 1px #e2e2e2;
    border-radius: 4px;

    .van-search__content {
      background: #fff;
    }
  }
}

.sheet-list {
  flex: 1;
  overflow-y: auto;
  padding-top: 12px;

  .sheet-list-li {
    padding: 12px;
    margin-bottom: 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
    line-height: 24px;

    &.active {
      color: #fff;
      background: #0066EC;
    }
  }
}
</style>
