<template>
  <HtModal
    v-model:open="visible"
    title="批量编辑"
    width="460px"
    :confirm-loading="loading"
    :after-close="onClosed"
    @ok="handleOk"
  >
    <div class=" h-full flex gap-3">
      <div
        v-if="param.batchType && param.batchType === 'project'"
        class="flex-1 h-full overflow-y-auto"
      >
        <BaseTitle>保养项目</BaseTitle>
        <ProjectTable
          ref="projectTableRef"
          multiple
          :checked-rows="checkedRows"
        ></ProjectTable>
      </div>
      <div
        v-if="param.batchType && param.batchType === 'baseData'"
        class="flex-1"
      >
        <BaseTitle>信息登记</BaseTitle>
        <EditForm
          ref="formRef"
          :init-data="initData"
        ></EditForm>
      </div>
    </div>
  </HtModal>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue'
import { EquipmentUpkeepRecordEntity } from '../EquipmentUpkeepRecordEntity'
import { updateEquipmentUpkeepRecordBaseData, updateEquipmentUpkeepRecordProject } from '../api.ts'
import ProjectTable from './ProjectTable.vue'
import EditForm from './EditForm.vue'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import type { IDictByBackend } from '~/interface/IDictByBackend.ts'

interface IDialogProps {
  data: EquipmentUpkeepRecordEntity[]
  isDetail?: boolean
  batchType?: 'project' | 'baseData'
}

const props = defineProps<IDialogPropsParam<null, IDialogProps>>()

const loading = ref(false)

const visible = ref(true)

const initData = ref(new EquipmentUpkeepRecordEntity())

const checkedRows = ref<IDictByBackend[]>([])

const formRef = ref()

const projectTableRef = ref()

async function handleOk() {
  if (props.param.batchType === 'project') {
    await editProject()
  }
  else {
    await editForm()
  }
  message.success('操作成功！')
  props.onConfirm(null)
  visible.value = false
}

async function editProject() {
  const projectData = await projectTableRef.value?.getData() as IDictByBackend[]
  if (!projectData?.length) {
    return message.warning('请选择保养项目')
  }
  const params = {
    ids: props.param?.data?.map(item => item.id)?.join(','),
    upkeepProject: projectData.map(item => item.typeCode).join(','),
  }
  loading.value = true
  await updateEquipmentUpkeepRecordProject(params).finally(() => {
    loading.value = false
  })
}

async function editForm() {
  const formData = await formRef.value?.getData() as EquipmentUpkeepRecordEntity
  formData.upkeepTime = formData.commonDate?.[0]
  formData.upkeepTimeEnd = formData.commonDate?.[1]
  const params = {
    ...formData,
    ids: props.param?.data?.map(item => item.id)?.join(','),
  }
  loading.value = true
  await updateEquipmentUpkeepRecordBaseData(params).finally(() => {
    loading.value = false
  })
}
</script>
