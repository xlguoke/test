<template>
  <div>
    <a-button v-if="!disabled" type="text" class="mb-1" @click="addRow">
      <PlusCircleOutlined />
      新增
    </a-button>
    <a-table
      :columns="columns"
      :data-source="dataSource"
      :pagination="false"
    >
      <template #headerCell="{ column }">
        <template v-if="column.dataIndex === 'witness'">
          <span class="text-red-500">* </span>
          {{ column.title }}
        </template>
      </template>
      <template #bodyCell="{ column, record, index }">
        <template v-if="disabled">
          <template v-if="column.dataIndex === 'type'">
            {{ record.type === EWitnessType.BUILD ? '建设单位见证人' : '监理单位见证人' }}
          </template>
        </template>
        <template v-else>
          <template v-if="column.dataIndex === 'witnessPhone'">
            <a-input-number
              v-model:value="record.witnessPhone"
              :controls="false" style="width :100%"
              placeholder="请输入"
              @blur="handleBlur(record, column.dataIndex as string)"
            />
          </template>
          <template v-else-if="column.dataIndex === 'type'">
            <a-select v-model:value="record.type" placeholder="请选择" class="w-full">
              <a-select-option value="1">
                建设单位
              </a-select-option>
              <a-select-option value="2">
                监理单位
              </a-select-option>
            </a-select>
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <a-button type="link" size="small" danger @click="dataSource?.splice(index, 1)">
              删除
            </a-button>
          </template>
          <a-input
            v-else
            v-model:value="record[column.dataIndex as string]"
            placeholder="请输入"
            @blur="handleBlur(record, column.dataIndex as string)"
          />
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang='ts'>
import type { IConsignWitness } from '~/api/consign/consign-management/types'
import { PlusCircleOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { EWitnessType } from '~/api/consign/consign-management'
import { useConsignProcessor } from '../../composables/useProviderInject'

interface Witness extends IConsignWitness {
  type: string
}

const { consignProcessor } = useConsignProcessor()
const pageStateService = consignProcessor.pageStateService

const columns = ref<any[]>([
  { title: '见证人', dataIndex: 'witness' },
  { title: '见证人证号', dataIndex: 'witnessLicenseNumber' },
  { title: '见证人手机号', dataIndex: 'witnessPhone' },
  { title: '见证人类型', dataIndex: 'type', width: '24%' },
  { title: '操作', dataIndex: 'action', width: 100, align: 'center' },
])

const emptyRow: Witness = {
  witness: '',
  witnessLicenseNumber: '',
  witnessPhone: '',
  type: EWitnessType.SUPERVISION,
}

const dataSource = ref<Witness[]>([])

const disabled = computed(() => {
  if (pageStateService.readonly)
    return true
  return false
})

watch(() => disabled.value, (bol) => {
  if (bol)
    columns.value.pop()
}, {
  immediate: true,
})

watch(
  () => [consignProcessor.data.buildWitnesses, consignProcessor.data.witnesses],
  ([buildWitnesses, witnesses]) => {
    const list: Witness[] = []
    ;(witnesses || []).forEach((i) => {
      list.push({
        ...i,
        type: EWitnessType.SUPERVISION,
      })
    })
    ;(buildWitnesses || []).forEach((i) => {
      list.push({
        ...i,
        type: EWitnessType.BUILD,
      })
    })
    dataSource.value = list
  },
)

function addRow() {
  dataSource.value.push({ ...emptyRow })
}

const phoneRegex = /^1\d{10}$/
function handleBlur(row: any, field: string) {
  if (field === 'witnessPhone') {
    if (!row.witnessPhone)
      return true
    if (!phoneRegex.test(row.witnessPhone)) {
      message.error('见证人手机号格式错误')
      return
    }
    const repeat = dataSource.value.filter(d => d.witnessPhone === row.witnessPhone)
    if (repeat.length > 1) {
      const names = repeat.map(d => d.witness).join(',')
      message.error(`见证人${names}的手机号重复！`)
      return
    }
  }
  return true
}

function saveData() {
  const unValid = dataSource.value.some(d => !d.witness)
  if (unValid) {
    message.error('“见证人”为必填项，请检查并填写完整后再保存！')
    return null
  }
  const unValidTel = dataSource.value.some(d => !handleBlur(d, 'witnessPhone'))
  if (unValidTel)
    return null

  return {
    buildWitnesses: dataSource.value.filter(d => d.type === EWitnessType.BUILD),
    witnesses: dataSource.value.filter(d => d.type === EWitnessType.SUPERVISION),
  }
}

defineExpose({
  saveData,
})
</script>

<style>

</style>
