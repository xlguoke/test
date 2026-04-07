<template>
  <div>
    <ht-modal
      v-model:open="visible"
      title="样品制备"
      width="750px"
      hide-confirm
      :loading="loading"
      :after-close="onClosed"
      @cancel="handleCancel"
    >
      <BaseTitle>样品信息</BaseTitle>
      <a-descriptions bordered size="small" :column="2" :label-style="{ width: '80px', textAlign: 'center' }">
        <a-descriptions-item label="样品名称">
          {{ dataInfo.name }}
        </a-descriptions-item>
        <a-descriptions-item label="样品编号">
          {{ dataInfo.code }}
        </a-descriptions-item>
        <a-descriptions-item label="规格型号">
          {{ dataInfo.standard }}
        </a-descriptions-item>
        <a-descriptions-item label="样品描述">
          {{ dataInfo.description }}
        </a-descriptions-item>
      </a-descriptions>

      <BaseTitle class="mt-8">
        制备记录
      </BaseTitle>
      <a-alert type="info" show-icon message="若在添加制备记录后变更检测参数或变更检测人员，将在对应的制备记录中同步移除相关信息" />
      <a-space class="my-2">
        <a-button @click="handleAdd('')">
          <PlusOutlined />新增
        </a-button>
      </a-space>
      <a-table
        :columns="columns"
        :data-source="dataSource"
        :pagination="false"
        row-key="id"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'index'">
            {{ index + 1 }}
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <a-button type="link" size="small" @click="handleAdd(record.id)">
              编辑
            </a-button>
            <a-button type="link" size="small" @click="handlePrint(record.id)">
              打印
            </a-button>
            <a-button type="link" danger size="small" @click="handleDelete(record.id, index)">
              删除
            </a-button>
          </template>
        </template>
      </a-table>
    </ht-modal>
  </div>
</template>

<script setup lang='ts'>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { PlusOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { IlisPrintUdr } from '~/utils/IlisPrintUdr.ts'
import { sp_delete, sp_getData } from '../api'
import SamplePreparationAdd from './SamplePreparationAdd.vue'

interface PropParam {
  taskId: string
}

const props = defineProps<IDialogPropsParam<null, PropParam>>()
const ilisPrintUdr = new IlisPrintUdr()
const visible = ref(true)
const loading = ref(false)
const dataInfo = ref({
  id: '',
  name: '',
  code: '',
  standard: '',
  description: '',
})
const dataSource = ref([])
const columns = [
  { title: '序号', dataIndex: 'index', width: 60 },
  { title: '检测参数', dataIndex: 'param' },
  { title: '制备人员', dataIndex: 'person' },
  { title: '制备日期', dataIndex: 'preparationDate' },
  { title: '操作', dataIndex: 'action', width: 150 },
]

onMounted(() => {
  initData()
})

async function initData() {
  loading.value = true
  try {
    const { data } = await sp_getData(props.param.taskId)
    dataInfo.value = data.sample
    dataSource.value = data.items
  }
  finally {
    loading.value = false
  }
}

/** 新增/编辑 */
async function handleAdd(id?: string) {
  await AnyDialogHelper.showModel(SamplePreparationAdd, {
    taskId: props.param.taskId,
    id,
  })
  initData()
}

/**  打印 */
function handlePrint(id: string) {
  ilisPrintUdr.commonPrint([id], 'SamplePreparation')
}

/** 删除 */
function handleDelete(id: string, ind: number) {
  Modal.confirm({
    title: '删除确认',
    content: '确定删除该条数据吗？',
    onOk: async () => {
      try {
        await sp_delete(id)
        dataSource.value.splice(ind, 1)
        message.success('删除成功')
      }
      catch (err) {
        console.error(err)
      }
    },

  })
}

function handleCancel() {
  visible.value = false
}
</script>

<style>

</style>
