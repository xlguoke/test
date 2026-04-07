<template>
  <ht-modal
    v-model:open="visible"
    title="新增视频监控配置"
    width="460px"
    :confirm-loading="saveLoading"
    :after-close="onClosed"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="formState" :label-col="{ style: 'width: 100px' }" :wrapper-col="{ style: 'flex: 1' }">
      <a-form-item name="type" label="驾驶舱名称" :rules="[{ required: true, message: '请选择驾驶舱名称！' }]">
        <a-select
          v-model:value="formState.type"
          placeholder="请选择"
          class="w-full"
        >
          <a-select-option v-for="item in dashboardTypeDict" :key="item.key" :value="item.key">
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item name="model" label="视频模块" :rules="[{ required: true, message: '请输入视频模块！' }]">
        <a-input v-model:value="formState.model" placeholder="请输入" class="w-full" />
      </a-form-item>
      <a-form-item name="labId" label="功能室" :rules="[{ required: true, message: '请选择功能室！' }]">
        <a-select
          v-model:value="formState.labId"
          placeholder="请选择"
          class="w-full"
          @change="changeLab"
        >
          <a-select-option v-for="item in param.labDatas" :key="item.id" :value="item.id">
            {{ item.name }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item name="labConfigIdArr" label="设备名称" :rules="[{ required: true, message: '请选择视频模块！' }]">
        <a-select v-model:value="formState.labConfigIdArr" placeholder="请选择" mode="multiple" class="w-full">
          <a-select-option v-for="item in getConfigEqList(formState as ConfigList)" :key="item.id" :value="item.id">
            {{ item.equName }}
          </a-select-option>
        </a-select>
      </a-form-item>
    </a-form>
  </ht-modal>
</template>

<script setup lang="ts">
import type { ConfigList } from '../../api'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { dashboardTypeDict, saveVideoConfig } from '../../api'

interface LabData {
  name: string
  id: string
  labConfigNames: string
  departNames: string
  departIds: string
  labConfigs: {
    id: string
    equName: string
    equType: string
    equVendor: string
  }[]
}

interface PropParam {
  labDatas: LabData[]
}

const props = defineProps<IDialogPropsParam<null, PropParam>>()

const visible = ref(true)

const datas = ref<ConfigList[]>([])

const formRef = ref()

const formState = ref<ConfigList>({
  id: undefined,
  labId: undefined,
  labName: undefined,
  type: undefined,
  model: undefined,
  labConfigId: undefined,
  labConfigName: undefined,
  labConfigIdArr: [],
  labConfigNameArr: [],
})

// 修改功能室
function changeLab() {
  formState.value.labConfigId = ''
  formState.value.labConfigName = ''
  formState.value.labConfigIdArr = []
  formState.value.labConfigNameArr = []
}

// 当前功能室设备列表
function getConfigEqList(row: ConfigList) {
  if (!row.labId) {
    row.labConfigId = ''
    row.labConfigName = ''
    row.labConfigIdArr = []
    row.labConfigNameArr = []
    return []
  }

  const item = props.param.labDatas.find(d => d.id === row.labId)
  if (!item)
    return []
  return item.labConfigs || []
}

const saveLoading = ref(false)
async function handleOk() {
  formRef.value.validateFields().then(async () => {
    saveLoading.value = true

    const submitData: any[] = datas.value.map((item: ConfigList) => ({
      ...item,
      labConfigId: item.labConfigIdArr.join(','),
      labConfigName: item.labConfigNameArr.join(','),
      labConfigIdArr: undefined,
      labConfigNameArr: undefined,
    }))

    await saveVideoConfig(submitData).finally(() => {
      saveLoading.value = false
    })
    visible.value = false
    props.onConfirm(null)
  })
}
</script>
