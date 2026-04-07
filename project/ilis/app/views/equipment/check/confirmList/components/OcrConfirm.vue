<template>
  <ht-modal
    v-model:open="internalOpen"
    width="90%"
    fixed-height
    :title="title"
    :after-close="onClosed"
    :loading="loading"
  >
    <template #footer>
      <a-space>
        <a-button v-if="param.rowData.ocrStatus !== 'CONFIRMED' && param.equipmentMatched" @click="internalOpen = false">
          取消
        </a-button>
        <a-button v-else @click="internalOpen = false">
          关闭
        </a-button>
        <a-button v-if="param.rowData.ocrStatus !== 'CONFIRMED' && param.equipmentMatched" :loading="loading" type="primary" @click="handleOcrConfirm">
          确定
        </a-button>
      </a-space>
    </template>
    <AddByDeviceFormPage
      :id="param.id"
      ref="addByDeviceFormPageRef"
      :is-readonly="param.isReadonly"
      :equipment10="param.EQUIPMENT_10"
      :is-ocr-confirm="isOcrConfirm"
    ></AddByDeviceFormPage>
  </ht-modal>
</template>

<script setup lang="ts">
import type { OcrRecordEntity } from '../../ocr'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { IAnalysisData } from '~/interface/IAnalysisData'
import { message } from 'ant-design-vue'
import { ref } from 'vue'
import { confirmOcr } from '../../ocr/api'
import AddByDeviceFormPage from './AddByDeviceFormPage.vue'

const props = defineProps<IDialogPropsParam<null, IProps>>()

// const {
//   getList,
// } = useTableHooks<OcrRecordEntity>({
//   api: getOcrPage,
//   totalKey: 'count',
// })

interface IProps {
  /** # 系统控制参数 检校确认仅支持从已通过审批的计划中引用设备 */
  EQUIPMENT_10: boolean
  /** # 检校确认数据id（编辑详情传入） */
  id?: string
  /** # 是否只读 */
  isReadonly?: boolean // 解析确认从来都不允许编辑
  /** # AI解析数据 */
  analysisData: IAnalysisData
  /** # 设备匹配状态 */
  equipmentMatched: boolean
  /** # 设备行数据 */
  rowData: OcrRecordEntity
}
provide('analysisData', props.param.analysisData)

const title = computed(() => {
  if (props.param.equipmentMatched && props.param.rowData.ocrStatus !== 'CONFIRMED') { // 解析成功
    return '解析确认'
  }
  return '解析详情'
})

const isOcrConfirm = computed(() => {
  if (props.param.equipmentMatched) {
    return true
  }
  return false
})
const addByDeviceFormPageRef = ref()

const internalOpen = ref(true)

const loading = ref(false)
async function handleOcrConfirm() {
  const rowData = [{ ...props.param.rowData }]
  if (rowData !== null && rowData.length > 0) {
    loading.value = true
    await confirmOcr(rowData)?.finally(() => {
      loading.value = false
    })
    message.success('操作成功')
    internalOpen.value = false
    props.onConfirm(null)
  }
}
</script>
