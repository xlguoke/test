<template>
  <ht-modal
    v-model:open="internalOpen"
    width="90%"
    fixed-height

    :title="param.isReadonly ? '检校录入详情' : `${param.id ? '编辑' : '新增'}检校录入`"
    :after-close="onClosed"
    :loading="loading"
  >
    <template #footer>
      <a-space v-if="!param.isReadonly">
        <a-button @click="internalOpen = false">
          取消
        </a-button>
        <a-button :loading="loading" type="primary" @click="handleConfirm">
          确定
        </a-button>
      </a-space>
      <a-button v-else @click="internalOpen = false">
        关闭
      </a-button>
    </template>
    <AddByDeviceFormPage
      :id="param.id"
      ref="addByDeviceFormPageRef"
      :is-readonly="param.isReadonly"
      :equipment10="param.EQUIPMENT_10"
    ></AddByDeviceFormPage>
  </ht-modal>
</template>

<script setup lang="ts">
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { IAnalysisData } from '~/interface/IAnalysisData'
import { message } from 'ant-design-vue'
import { ref } from 'vue'
import { saveOrEditEquipmentCheckConfirm } from '../api'
import AddByDeviceFormPage from './AddByDeviceFormPage.vue'

const props = defineProps<IDialogPropsParam<null, IProps>>()

interface IProps {
  /** # 系统控制参数 检校确认仅支持从已通过审批的计划中引用设备 */
  EQUIPMENT_10: boolean
  /** # 检校确认数据id（编辑详情传入） */
  id?: string
  /** # 是否只读 */
  isReadonly?: boolean
  /** # AI解析数据 */
  analysisData: IAnalysisData
}

provide('analysisData', props.param.analysisData)

const addByDeviceFormPageRef = ref()

const internalOpen = ref(true)

const loading = ref(false)
/**
 * # 确认
 */
async function handleConfirm() {
  const data = await addByDeviceFormPageRef.value?.getData()

  if (!data) {
    return
  }

  // #45971
  delete data.confirmTime

  loading.value = true
  await saveOrEditEquipmentCheckConfirm(data).finally(() => {
    loading.value = false
  })
  message.success('操作成功')
  internalOpen.value = false
  props.onConfirm(null)
}
</script>
