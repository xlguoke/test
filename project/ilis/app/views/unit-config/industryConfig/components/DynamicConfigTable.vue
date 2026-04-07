<template>
  <a-form-item-rest>
    <p class="mb-1 text-right text-red-400">
      字段名称和字段属性为空时，不会保存该行数据
    </p>
    <a-table
      :columns="columns"
      :data-source="dataSource"
      :pagination="false"
    >
      <template #headerCell="{ column }">
        <template v-if="column.dataIndex === 'name' || column.dataIndex === 'fieldCode'">
          <span class="text-[red]">* </span>
          {{ column.title }}
        </template>
      </template>
      <template #bodyCell="{ column, record, index }">
        <template v-if="!record.isSystem">
          <template v-if="column.dataIndex === 'required'">
            <a-switch v-model:checked="record.required" />
          </template>
          <template v-else-if="column.dataIndex === 'formType'">
            <a-select v-model:value="record.formType" class="w-full" placeholder="请选择">
              <a-select-option value="input">
                文本输入框
              </a-select-option>
              <a-select-option value="select">
                数据字典
              </a-select-option>
            </a-select>
          </template>
          <template v-else-if="column.dataIndex === 'dictCode'">
            <a-input
              v-if="record.formType === 'select'"
              v-model:value="record.dictCode"
              placeholder="请输入数据字典编码"
            />
            <span v-else>-</span>
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <MinusCircleOutlined
              v-if="!record.isSystem"
              class="text-[red]"
              @click="dataSource.splice(index, 1)"
            />
          </template>
          <template v-else>
            <a-input
              v-model:value="record[column.dataIndex as string]"
              placeholder="请输入"
              @blur="handleBlur(record as ProcessorConfigInfo_2, column.dataIndex as string)"
            />
          </template>
        </template>
        <template v-else>
          <template v-if="column.dataIndex === 'required'">
            {{ record.required ? '是' : '否' }}
          </template>
          <template v-else-if="column.dataIndex === 'formType'">
            {{ record.formType === 'select' ? '数据字典' : '文本输入框' }}
          </template>
          <template v-else>
            {{ record[column.dataIndex as string] || '-' }}
          </template>
        </template>
      </template>
    </a-table>
    <a-button type="primary" class="mt-2" @click="dataSource.push({ ...emptyRow })">
      新增{{ config.name }}
    </a-button>
  </a-form-item-rest>
</template>

<script setup lang='ts'>
import type { ProcessorConfigInfo, ProcessorConfigInfo_2 } from '../interface'
import { MinusCircleOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

const props = defineProps<{
  config: ProcessorConfigInfo
  defaultData?: Record<string, ProcessorConfigInfo_2>
}>()

const emits = defineEmits(['change'])

const columns: any[] = [
  {
    title: '字段名称',
    dataIndex: 'name',
  },
  {
    title: '字段属性',
    dataIndex: 'fieldCode',
    width: '18%',
  },
  {
    title: '是否必填',
    dataIndex: 'required',
    width: '12%',
    align: 'center',
  },
  {
    title: '表单类型',
    dataIndex: 'formType',
    width: '18%',
  },
  {
    title: '字典编码',
    dataIndex: 'dictCode',
    width: '18%',
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: '8%',
    align: 'center',
  },
]
const emptyRow: any = {
  name: '',
  fieldCode: '',
  formType: 'input',
  dictCode: '',
  required: false,
  isSystem: false,
  scope: props.config.scope,
  scalable: props.config.scalable,
}
const dataSource = ref<ProcessorConfigInfo_2[]>([])

function initDefaultField() {
  const list: ProcessorConfigInfo_2[] = []
  const properties = props.config?.properties || {}
  for (const k in properties) {
    const v = properties[k]
    list.push({
      ...v,
      formType: v.dictCode ? 'select' : v.formType,
      fieldCode: k,
      isSystem: true,
    })
  }
  if (props.defaultData && Object.keys(props.defaultData).length > 0) {
    for (const k in props.defaultData) {
      const v = props.defaultData[k]
      if (properties[k])
        continue
      list.push({
        ...v,
        formType: v.dictCode ? 'select' : v.formType,
        fieldCode: k,
      })
    }
  }
  if (list.length === 0) {
    list.push({ ...emptyRow })
  }
  dataSource.value = list
}

onMounted(() => {
  initDefaultField()
})
/** 验证重复 */
function validRepeat(key: string, field: string) {
  return dataSource.value.filter((d: any) => d[key].toLowerCase() === field.toLowerCase()).length > 1
}

function handleBlur(row: ProcessorConfigInfo_2, field: string) {
  if (field === 'name' && validRepeat('name', row.name)) {
    row.name = ''
    message.error('字段名称不能重复')
  }

  if (field === 'fieldCode' && validRepeat('fieldCode', row.fieldCode || '')) {
    row.fieldCode = ''
    message.error('字段属性不能重复')
  }
}

watch(() => dataSource.value, (datas) => {
  emits('change', datas.filter(d => d.name && d.fieldCode))
}, {
  deep: true,
})
</script>

<style>

</style>
