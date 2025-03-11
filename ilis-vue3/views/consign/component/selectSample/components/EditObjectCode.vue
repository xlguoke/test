<template>
  <a-modal
    v-model:open="open"
    title="设置样品编号"
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
          <template v-if="column.dataIndex === 'objectCodeMainBody'">
            <a-input v-model:value="record.objectCodeMainBody" placeholder="请输入" />
          </template>
          <template v-if="column.dataIndex === 'objectCodeSuffix'">
            <a-input v-model:value="record.objectCodeSuffix" placeholder="请输入" />
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
import { Modal } from 'ant-design-vue'
import type { UseBasicInfo } from '~/views/consign/component/selectSample/modules/UseBasicInfo.ts'
import type { UseCodesInfo } from '~/views/consign/component/selectSample/modules/UseCodesInfo.ts'
import { ObjectCodeItem } from '~/views/consign/component/selectSample/modules/UseCodesInfo.ts'
import type { UseTestParams } from '~/views/consign/component/selectSample/modules/UseTestParams.ts'

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
  { title: '样品编号', dataIndex: 'objectCodeMainBody', width: '15%' },
  { title: '自定义后缀', dataIndex: 'objectCodeSuffix', width: '10%' },
]

const open = computed(() => props.open)

const submitLoading = ref(false)

const objectCodeArr = ref<ObjectCodeItem[]>([])

const sampleAmount = computed(() => useBasicInfo.data.sampleAmount)

watch(open, (val) => {
  if (val) {
    initObjectCodeArr()
  }
  else {
    objectCodeArr.value = []
  }

  emits('update:open', val)
})

// 初始化样品编号
// 样品编号明细长度与样品组数保持一致
function initObjectCodeArr() {
  const dataSource = useCodesInfo.data.objectCodeArr
  const result: ObjectCodeItem[] = []

  for (let i = 1; i <= sampleAmount.value; i++) {
    const item = dataSource[i - 1]

    if (item) {
      result.push(item)
    }
    else {
      result.push(new ObjectCodeItem())
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
  useCodesInfo.setObjectCodeArr(objectCodeArr.value)

  const hasCode = objectCodeArr.value.find(i => i.objectCodeMainBody)
  if (hasCode) {
    submitLoading.value = true
    await useCodesInfo.formatTestObjectCodes(sampleAmount.value, useTestParams.selectedRowKey).finally(() => {
      submitLoading.value = false
    })

    if (objectCodeArr.value.find(i => !i.objectCodeMainBody)) {
      Modal.warning({
        title: '提示',
        content: `存在编号为空的数据，请将${objectCodeArr.value.length}个编号全部手动填充完毕，否则直接完成委托将采用系统生成的编号！`,
      })
    }
  }
  else {
    useCodesInfo.setDataField('testObjectCode', '')
  }

  handleCancel()
}
</script>
