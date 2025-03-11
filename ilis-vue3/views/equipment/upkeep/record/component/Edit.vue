<template>
  <HtModal
    v-model:open="visible"
    :title="`${initData.name}（${initData.equipmentSn}）保养记录`"
    width="70vw"
    :confirm-loading="loading"
    :after-close="onClosed"
    @ok="handleOk"
  >
    <div class=" h-full grid grid-cols-2 gap-3">
      <div class=" h-full overflow-y-auto">
        <BaseTitle>保养项目</BaseTitle>
        <ProjectTable
          ref="projectTableRef"
          multiple
          :checked-rows="checkedRows"
        ></ProjectTable>
      </div>
      <div>
        <BaseTitle>信息登记</BaseTitle>
        <EditForm
          ref="formRef"
          :init-data="initData"
          show-file
        ></EditForm>
      </div>
    </div>
  </HtModal>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue'
import { EquipmentUpkeepRecordEntity } from '../EquipmentUpkeepRecordEntity'
import { saveEquipmentUpkeepRecord } from '../api.ts'
import { EquipmentUpkeepDeviceEntity } from '../../plan/EquipmentUpkeepDeviceEntity.ts'
import ProjectTable from './ProjectTable.vue'
import EditForm from './EditForm.vue'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { IDictByBackend } from '~/interface/IDictByBackend.ts'

interface IDialogProps {
  data: EquipmentUpkeepRecordEntity
  isDetail?: boolean
}

const props = defineProps<IDialogPropsParam<null, IDialogProps>>()

const loading = ref(false)

const visible = ref(true)

const initData = ref(new EquipmentUpkeepRecordEntity())

const checkedRows = ref<IDictByBackend[]>([])

const formRef = ref()

const projectTableRef = ref()

async function init() {
  if (props.param?.data?.id) {
    initData.value = props.param.data
    if (initData.value?.upkeepTime && initData.value?.upkeepTimeEnd) {
      initData.value.commonDate = [initData.value?.upkeepTime, initData.value?.upkeepTimeEnd]
    }

    checkedRows.value = EquipmentUpkeepDeviceEntity.getOptions('upkeepProjectName')
      ?.filter(item => initData.value.upkeepProject
        ?.split(',')
        ?.includes(item.value as string),
      )
      ?.map((item) => {
        return {
          typeName: item.label,
          typeCode: item.value?.toString(),
        }
      }) || []
  }
}
init()

async function handleOk() {
  const projectData = await projectTableRef.value?.getData() as IDictByBackend[]
  if (!projectData?.length) {
    return message.warning('请选择保养项目')
  }
  const formData = await formRef.value?.getData() as EquipmentUpkeepRecordEntity
  formData.upkeepTime = formData.commonDate?.[0]
  formData.upkeepTimeEnd = formData.commonDate?.[1]
  formData.upkeepProject = projectData.map(item => item.typeCode).join(',')
  loading.value = true
  await saveEquipmentUpkeepRecord(formData!).finally(() => {
    loading.value = false
  })
  message.success('操作成功！')
  props.onConfirm(null)
  visible.value = false
}
</script>
