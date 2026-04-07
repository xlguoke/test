<template>
  <ht-modal
    v-model:open="visible"
    title="视频监控配置"
    width="800px"
    :loading="loading"
    :confirm-loading="saveLoading"
    :after-close="onClosed"
    @ok="handleOk"
  >
    <a-button @click="onAdd">
      新增
    </a-button>
    <a-table class="mt-2" :data-source="datas" :columns="columns" bordered :scroll="{ y: 420 }" :pagination="false">
      <template #bodyCell="{ record, column }">
        <template v-if="column.dataIndex === 'name'">
          <a-select
            v-if="record.isAddRow"
            v-model:value="record.type"
            placeholder="请选择"
            class="w-full"
          >
            <a-select-option v-for="item in dashboardTypeDict" :key="item.key" :value="item.key">
              {{ item.label }}
            </a-select-option>
          </a-select>
          <template v-else>
            {{ dashboardTypeDict.getLabelByKey(record.type) }}
          </template>
        </template>
        <template v-if="column.dataIndex === 'model'">
          <a-input v-if="record.isAddRow" v-model:value="record.model" placeholder="请输入" class="w-full" />
        </template>
        <template v-if="column.dataIndex === 'labId'">
          <a-select
            v-model:value="record.labId"
            class="w-full"
            allow-clear
            @change="() => changeLab(record as ConfigList)"
          >
            <a-select-option v-for="item in param.labDatas" :key="item.id" :value="item.id">
              {{ item.name }}
            </a-select-option>
          </a-select>
        </template>
        <template v-if="column.dataIndex === 'labConfigId'">
          <a-select
            v-if="record.labId"
            v-model:value="record.labConfigIdArr"
            mode="multiple"
            class="w-full"
            allow-clear
            @change="changeLabConfig(record as ConfigList)"
          >
            <a-select-option v-for="item in getConfigEqList(record as ConfigList)" :key="item.id" :value="item.id">
              {{ item.equName }}
            </a-select-option>
          </a-select>
        </template>
        <template v-if="column.dataIndex === 'Action'">
          <a-button type="link" danger @click="onDel(record)">
            删除
          </a-button>
        </template>
      </template>
    </a-table>
  </ht-modal>
</template>

<script setup lang="ts">
import type { ConfigList } from '../../api'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { Modal } from 'ant-design-vue'
import { dashboardTypeDict, getVideoConfigList, saveVideoConfig } from '../../api'

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
const loading = ref(false)
const columns = [
  { title: '驾驶舱名称', dataIndex: 'name', width: '120px' },
  { title: '视频模块', dataIndex: 'model', width: '120px' },
  { title: '功能室', dataIndex: 'labId', width: '200px' },
  { title: '设备名称', dataIndex: 'labConfigId' },
  { title: '操作', dataIndex: 'Action', width: 65, align: 'center' },
]
const datas = ref<ConfigList[]>([])

onMounted(() => {
  getData()
})

function onAdd() {
  // AnyDialogHelper.showModel(AddVideoConfig, {
  //   labDatas: props.param.labDatas,
  // }).then(() => getData())
  datas.value.push({
    id: generateGUID(),
    labId: undefined,
    labName: undefined,
    type: undefined,
    model: undefined,
    labConfigId: undefined,
    labConfigName: undefined,
    labConfigIdArr: [],
    labConfigNameArr: [],
    isAddRow: true,
  })
}

function onDel(record: ConfigList) {
  Modal.confirm({
    title: '提示',
    content: '确认删除吗？',
    onOk: () => {
      datas.value = datas.value.filter((item: ConfigList) => item.id !== record.id)
    },
  })
}

// 获取视频配置列表
async function getData() {
  try {
    loading.value = true
    const { data } = await getVideoConfigList()
    datas.value = data.map((item: ConfigList) => ({
      ...item,
      labConfigIdArr: item.labConfigId ? item.labConfigId.split(',') : [],
      labConfigNameArr: item.labConfigName ? item.labConfigName.split(',') : [],
    }))
  }
  catch (err) {
    console.error(err)
  }
  loading.value = false
}

// 修改功能室
function changeLab(row: ConfigList) {
  if (!row.labId) {
    row.labName = ''
  }
  else {
    const item = props.param.labDatas.find(d => d.id === row.labId)
    row.labName = item?.name || ''
  }
  row.labConfigId = ''
  row.labConfigName = ''
  row.labConfigIdArr = []
  row.labConfigNameArr = []
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

// 修改设备
function changeLabConfig(row: ConfigList) {
  const options = getConfigEqList(row)

  row.labConfigNameArr = row.labConfigIdArr.map((i) => {
    const item = options.find(j => j.id === i)
    return item ? item.equName : ''
  })
}

const saveLoading = ref(false)
async function handleOk() {
  const submitData: any[] = datas.value.map((item: ConfigList) => ({
    ...item,
    labConfigId: item.labConfigIdArr.join(','),
    labConfigName: item.labConfigNameArr.join(','),
    labConfigIdArr: undefined,
    labConfigNameArr: undefined,
  }))

  const errRow = submitData.find(i => !i.type || !i.model || !i.labId || !i.labConfigId)
  if (errRow) {
    Modal.warn({
      title: '提示',
      content: '存在未填写完整项，请填写完整后再保存！',
    })
    return
  }

  saveLoading.value = true
  await saveVideoConfig(submitData).finally(() => {
    saveLoading.value = false
  })
  visible.value = false
  props.onConfirm(null)
}
</script>
