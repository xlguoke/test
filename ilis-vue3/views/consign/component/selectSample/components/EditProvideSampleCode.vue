<template>
  <a-modal
    v-model:open="open"
    title="设置来样编号"
    width="640px"
    :mask-closable="false"
    destroy-on-close
    @cancel="handleCancel"
  >
    <div style="min-height: 320px">
      <a-table
        size="small"
        :columns="columns"
        :data-source="objectCodeArr"
        :pagination="false"
        bordered
        class="mt-4"
        :scroll="{ y: 320 }"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'index'">
            {{ index + 1 }}
          </template>
          <template v-if="column.dataIndex === 'text'">
            <a-input v-model:value="record.text" placeholder="请输入" />
          </template>
        </template>
      </a-table>
    </div>

    <template #footer>
      <a-button @click="handleCancel">
        取消
      </a-button>
      <a-button type="primary" :loading="submitLoading" @click="handleOk">
        确定
      </a-button>
    </template>
  </a-modal>
</template>

<script setup lang='ts'>
import type { ColumnsType } from 'ant-design-vue/es/table'
import type { UseBasicInfo } from '~/views/consign/component/selectSample/modules/UseBasicInfo.ts'
import type { UseCodesInfo } from '~/views/consign/component/selectSample/modules/UseCodesInfo.ts'
import type { UseTestParams } from '~/views/consign/component/selectSample/modules/UseTestParams.ts'

interface DataItem {
  text: string
}

const props = defineProps({
  open: {
    type: Boolean,
    default: false,
  },
})

const emits = defineEmits(['update:open', 'onSave'])

// 基础信息
const useBasicInfo = inject('useBasicInfo') as UseBasicInfo
// 参数信息
const useTestParams = inject('useTestParams') as UseTestParams
// 编号信息
const useCodesInfo = inject('useCodesInfo') as UseCodesInfo

const columns: ColumnsType = [
  { title: '序号', dataIndex: 'index', width: '15%' },
  { title: '来样编号', dataIndex: 'text', width: '85%' },
]

const open = computed(() => props.open)

const submitLoading = ref(false)

const objectCodeArr = ref<DataItem[]>([])

const sampleAmount = computed(() => useBasicInfo.data.sampleAmount)

watch(open, (val) => {
  if (val) {
    initDataSource()
  }
  else {
    objectCodeArr.value = []
  }

  emits('update:open', val)
})

// 初始化样品编号
// 来样编号明细长度与样品组数保持一致
function initDataSource() {
  const dataSource = useCodesInfo.data.provideToCustomerSampleMultipleCode.split(';').map(text => ({ text }))
  const result: DataItem[] = []

  for (let i = 1; i <= sampleAmount.value; i++) {
    const item = dataSource[i - 1]

    if (item) {
      result.push(item)
    }
    else {
      result.push({
        text: '',
      })
    }
  }

  objectCodeArr.value = result
}

// 取消
const handleCancel = function () {
  emits('update:open', false)
}

// 提交
const handleOk = async function () {
  const str = objectCodeArr.value.map(i => i.text).join(';')
  const hasCode = objectCodeArr.value.find(i => i.text)

  useCodesInfo.setDataField('provideToCustomerSampleMultipleCode', str)

  if (hasCode) {
    submitLoading.value = true
    await useCodesInfo.formatToProvideToCustomerCode(sampleAmount.value, useTestParams.selectedRowKey).finally(() => {
      submitLoading.value = false
    })
  }
  else {
    useCodesInfo.setDataField('provideToCustomerSampleCode', '')
  }

  handleCancel()
}
</script>
