<template>
  <AppProvider>
    <a-card
      class="h-full flex flex-col"
      :bordered="!selectedMode"
      :body-style="{ flex: 1, height: 0, padding: selectedMode ? 0 : '16px' }"
    >
      <a-flex class="h-full">
        <Types
          v-if="!selectedMode"
          ref="typesRef"
          class="w-[280px]"
          :is-loading="isLoading"
          @select="onSelect"
        />
        <List
          ref="listRef"
          v-model:is-loading="isLoading"
          class="w-0 flex-1"
          :selected-mode="selectedMode"
        />
      </a-flex>
    </a-card>
  </AppProvider>
</template>

<script setup lang='ts'>
import type { DataSource } from './api'
import type { TreeData } from './components/Types.vue'
import { message, Modal } from 'ant-design-vue'
import { STANDARD_TYPE_DICT } from './'
import List from './components/List.vue'
import Types from './components/Types.vue'

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
  /** 选择数据时，是否验证本单位规程 */
  checkWhetherThisUnit: {
    type: Boolean,
    default: true,
  },
})

const isLoading = ref(false)
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
onMounted(() => {
  initDatas()
})

function initDatas() {
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
    onSelect()
  }
  else {
    /**
     * ## 选择规程，在vue页面中以组件形式调用
     * 1. 示例：必须指定容器高度，否则规程列表表格无法计算高度，自适应滚动条
     * ```
     *  <ht-modal v-model:open="visible" title="选择规程" width="90%" centered :body-style="{height: '75vh'}">
            <Standard selected-mode :use-type="useType" :key="useType"/>
        </ht-modal>
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
      onSelect()
    }
  }
}
provide('urlParams', { selectedMode, useType })

// 获取选中行数据
window.getSelectedRows = () => unref(listRef.value.selectedRows)
/**
 * 兼容原vue2版本的回调方式
 * @param ind layer弹窗索引
 * @param cb 回调方法
 */
window.GetResult = (ind: number, cb: (i: number, res: DataSource[]) => void) => {
  if (cb)
    cb(ind, unref(listRef.value.selectedRows))
}

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
  const data: DataSource[] = unref(listRef.value.selectedRows)

  return new Promise((resove) => {
    const notWhetherThisUnit = data.filter(i => i.whetherThisUnit !== '1')

    if (notWhetherThisUnit.length > 0 && props.checkWhetherThisUnit) {
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
