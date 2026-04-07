<template>
  <ht-modal
    v-model:open="open"
    :title="`${term(('按样品维护试验数量'))}`"
    width="640px"
    :mask-closable="false"
    @cancel="cancel"
  >
    <a-table v-model:expanded-row-keys="expandedRowKeys" row-key="id" :columns="columns" :data-source="treeData" :pagination="false">
      <template #bodyCell="{ column, record }">
        <template v-if="'quantity' === column.dataIndex">
          <a-input-number v-model:value="record.quantity" :min="0" @blur="onSave(record)" />
        </template>
      </template>
    </a-table>
    <template #footer>
      <a-button @click="cancel">
        关闭
      </a-button>
    </template>
  </ht-modal>
</template>

<script setup lang='ts'>
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps.ts'
import type {
  TestQuantitySampleDTO,
} from '~/views/unit-config/paramTestCount/api/getTestQuantitySample.ts'
import { message } from 'ant-design-vue'
import { useIndustryStore } from '~/store/industryStore'
import {
  getTestQuantitySample,
} from '~/views/unit-config/paramTestCount/api/getTestQuantitySample.ts'
import { saveTestQuantitySample } from '~/views/unit-config/paramTestCount/api/saveTestQuantitySample.ts'

const props = defineProps<IDialogPropsParam<null, {
  paramId: string
  bigCategoryId: string
}>>()

const { term } = useIndustryStore()

const open = ref(true)

const treeData = ref<TestQuantitySampleDTO[]>([])

const expandedRowKeys = ref<string[]>([])

const columns = [
  { title: `${term('样品名称')}`, dataIndex: 'name', width: 200 },
  { title: '显示名称', dataIndex: 'displayName', width: 100 },
  { title: '数量', dataIndex: 'quantity', width: 100 },
]

getTestQuantitySample({
  bigCategoryId: props.param.bigCategoryId,
  paramId: props.param.paramId,
}).then((res) => {
  const data = res.data

  treeData.value = data

  data.forEach((item) => {
    if (item.children && item.children.length) {
      expandedRowKeys.value.push(item.id)
    }
  })
})

async function onSave(item: TestQuantitySampleDTO) {
  await saveTestQuantitySample({
    testQuantity: item.quantity,
    paramId: props.param.paramId,
    sampleId: item.id,
  })

  message.success('保存成功！')
}

// 关闭弹窗
function cancel() {
  open.value = false
  setTimeout(() => {
    props.onConfirm(null)
  }, 500)
}
</script>
