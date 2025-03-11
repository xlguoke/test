<template>
  <AppProvider>
    <a-card
      class="h-full flex flex-col"
      :body-style="{ flex: 1, height: 0, padding: '16px' }"
    >
      <a-flex class="h-full">
        <Types
          v-if="!selectedMode"
          ref="typesRef"
          class="w-[280px]"
          @select="onSelect"
        />
        <List
          ref="listRef"
          class="w-0 flex-1"
          :selected-mode="selectedMode"
        />
      </a-flex>
    </a-card>
  </AppProvider>
</template>

<script setup lang='ts'>
import { Modal, message } from 'ant-design-vue'
import Types, { type TreeData } from './components/Types.vue'
import List from './components/List.vue'
import type { DataSource } from './api'
import { STANDARD_TYPE_DICT } from './'

const props = defineProps({
  // 是否为选择数据模式
  selectedMode: {
    type: Boolean,
    default: false,
  },
  useType: {
    type: String,
    default: '',
  },
})

const typesRef = ref()
const listRef = ref()
function onSelect(tree?: TreeData) {
  listRef.value.refreshList(tree?.id)
}

function refreshTypes() {
  typesRef.value.refreshList()
}

provide('parentRefreshTypes', refreshTypes)

// 是否为选择数据模式
const selectedMode = ref(false)
// 规程类型
const useType = ref<string>('')

/**
 * ## 选择规程，在jsp页面通过layer弹窗调用方式说明
 * 1. 路径示例：'/ilis2/standard/view/list.do?selectedMode=1&useType=1'
 * 2. 参数：
 *  - selectedMode：是否为选择数据模式，1为选择数据模式
 *  - useType：使用类型，1为检测依据，2为评定标准，3为检测依据和评定标准，不传默认为3
 */
// 获取url参数
const urlParam = new URLSearchParams(location.search)
selectedMode.value = urlParam.has('selectedMode')
if (selectedMode.value) {
  const type = urlParam.get('useType') || ''
  if (STANDARD_TYPE_DICT.getLabelByKey(type)) {
    useType.value = type
  }
}
else {
  /**
   * ## 选择规程，在vue页面中以组件形式调用
   * 1. 示例：必须指定容器高度，否则规程列表表格无法计算高度，自适应滚动条
   * ```
   *  <a-modal v-model:open="visible" title="选择规程" width="90%" centered :body-style="{height: '75vh'}">
          <Standard selected-mode :use-type="useType" :key="useType"/>
      </a-modal>
   * ```
   */
  selectedMode.value = props.selectedMode
  if (selectedMode.value) {
    if (STANDARD_TYPE_DICT.getLabelByKey(props.useType)) {
      useType.value = props.useType
    }
    else {
      useType.value = ''
    }
  }
}
provide('urlParams', { selectedMode, useType })

// 获取选中行数据
window.getSelectedRows = () => unref(listRef.value.selectedRows)

// 切换为本单位规程
window.changeThisUnit = async (rows: DataSource[], cb: () => void) => {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    await listRef.value.whetherThisUnitChanges(row)
  }
  if (cb)
    cb()
}

function getSelectedRows() {
  const data = unref(listRef.value.selectedRows)

  return new Promise((resove) => {
    const notWhetherThisUnit = data.filter(i => i.whetherThisUnit !== '1')

    if (notWhetherThisUnit.length > 0) {
      Modal.confirm({
        title: '含非本单位规程信息！',
        content: `所选规程[${notWhetherThisUnit.map(i => i.standardName).join(',')}]非本单位规程，是否将其设为本单位规程后继续提交？`,
        onOk: async () => {
          resove(data)
          for (let i = 0; i < notWhetherThisUnit.length; i++) {
            await listRef.value.whetherThisUnitChanges(notWhetherThisUnit[i], true)
          }
          message.success('修改成功')
        },
        onCancel: () => {
          resove(data)
        },
      })
    }
    else {
      resove(data)
    }
  })
}

defineExpose({
  getSelectedRows,
})
</script>

<style>
#standard_manage{
  height: 100%;
}
</style>
