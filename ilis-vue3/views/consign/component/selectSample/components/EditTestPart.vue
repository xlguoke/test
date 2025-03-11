<template>
  <a-modal
    v-model:open="open"
    title="设置检测部位"
    width="640px"
    :mask-closable="false"
    destroy-on-close
    @cancel="handleCancel"
  >
    <div style="min-height: 320px">
      <a-table
        size="small"
        :columns="columns"
        :data-source="testPartArr"
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
      <a-button type="primary" @click="handleOk">
        确定
      </a-button>
    </template>
  </a-modal>
</template>

<script setup lang='ts'>
import type { ColumnsType } from 'ant-design-vue/es/table'
import type { UseSampleInfo } from '~/views/consign/component/selectSample/modules/UseSampleInfo.ts'
import type { UseBasicInfo } from '~/views/consign/component/selectSample/modules/UseBasicInfo.ts'

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

// 基本信息
const useBasicInfo = inject('useBasicInfo') as UseBasicInfo
// 样品信息
const useSampleInfo = inject('useSampleInfo') as UseSampleInfo

const columns: ColumnsType = [
  { title: '序号', dataIndex: 'index', width: '15%' },
  { title: '检测部位', dataIndex: 'text', width: '85%' },
]

const open = computed(() => props.open)

const testPartArr = ref<DataItem[]>([])

const sampleAmount = computed(() => useBasicInfo.data.sampleAmount)

watch(open, (val) => {
  if (val) {
    initDataSource()
  }
  else {
    testPartArr.value = []
  }

  emits('update:open', val)
})

// 初始化检测部位
// 检测部位长度与样品组数保持一致
function initDataSource() {
  const dataSource = useSampleInfo.data.testPart.split(';').map(text => ({ text }))
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

  testPartArr.value = result
}

// 取消
const handleCancel = function () {
  emits('update:open', false)
}

// 提交
const handleOk = async function () {
  const str = testPartArr.value.map(i => i.text).join(';')

  useSampleInfo.setDataField('testPart', str)

  if (!useSampleInfo.Third_Party_BIM) {
    useSampleInfo.setDataField('projectPartAndUse', str)
  }

  handleCancel()
}
</script>
