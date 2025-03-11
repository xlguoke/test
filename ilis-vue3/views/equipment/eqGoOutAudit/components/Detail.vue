<template>
  <div class="min-h-[50vh]">
    <a-descriptions
      :column="2"
      :label-style="{ width: '100px' }"
      :content-style="{ width: '36%' }"
      size="small"
      bordered
    >
      <a-descriptions-item label="借用人">
        {{ form?.borrowUser }}
      </a-descriptions-item>
      <a-descriptions-item label="关联任务">
        {{ form?.testTaskSn }}
      </a-descriptions-item>
      <a-descriptions-item label="关联工程项目" :span="2">
        <div v-for="d in form?.projects" :key="d.projectId">
          {{ d.projectName }}
          {{ d.projectCode ? `(${d.projectCode})` : '' }}
        </div>
      </a-descriptions-item>
      <a-descriptions-item label="外出时间">
        {{ form?.egressTime }}
      </a-descriptions-item>
      <a-descriptions-item label="预还时间">
        {{ form?.expectReturnTime }}
      </a-descriptions-item>
      <a-descriptions-item label="备注">
        {{ form?.remark }}
      </a-descriptions-item>
      <a-descriptions-item label="附件材料">
        <template v-if="form?.attachments">
          <a
            v-for="d in form.attachments" :key="d.attachmentId"
            :href="d.attachmentUrl"
            target="_blank"
            class="block text-[#0066ec]"
          >
            {{ d.attachmentTitle }}
          </a>
        </template>
      </a-descriptions-item>
    </a-descriptions>
    <a-table
      :data-source="form?.equipments"
      :columns="columns"
      :pagination="false"
      size="small"
      class="mt-2"
    >
    </a-table>
  </div>
</template>

<script setup lang='ts'>
import type { DetailData } from '../api'
import { detailApi } from '../api'

const props = defineProps({
  id: {
    type: String,
    default: '',
  },
})

const loading = ref(false)
const form = ref<DetailData>()

const columns = [
  {
    title: '设备名称',
    dataIndex: 'name',
    width: '20%',
  },
  {
    title: '设备编号',
    dataIndex: 'equipmentSn',
    width: '15%',
  },
  {
    title: '档案编号',
    dataIndex: 'archiveSn',
    width: '10%',
  },
  {
    title: '资产编号',
    dataIndex: 'assetSn',
    width: '10%',
  },
  {
    title: '规格型号',
    dataIndex: 'standard',
    width: '10%',
  },
  {
    title: '量程',
    dataIndex: 'eqRange',
    width: '15%',
  },
  {
    title: '精度',
    dataIndex: 'accuracy',
    width: '10%',
  },
  {
    title: '下次校验日期',
    dataIndex: 'nextCheckDate',
    width: '10%',
  },
]

onMounted(() => {
  getData()
})

async function getData() {
  loading.value = true
  const { data } = await detailApi(props.id)
  form.value = data
}
</script>

<style>

</style>
