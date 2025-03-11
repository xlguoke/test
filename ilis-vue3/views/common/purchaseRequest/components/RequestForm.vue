<template>
  <div>
    <a-spin :spinning="loading" tip="加载中...">
      <div class="pr-4">
        <a-form
          ref="formRef"
          :model="formState"
          class="pt-4 max-h-[70vh] overflow-auto"
          :label-col="{ style: 'width: 80px' }"
          :wrapper-col="{ style: 'flex: 1' }"
        >
          <a-row>
            <a-col :span="8">
              <a-form-item label="申请单号">
                <p v-if="isDetail" class="overflow-ellipsis overflow-hidden whitespace-nowrap" :title="formState.requestCode">
                  {{ formState.requestCode }}
                </p>
                <a-input v-else v-model:value.trim="formState.requestCode" disabled />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="申请原因">
                <p v-if="isDetail" class="overflow-ellipsis overflow-hidden whitespace-nowrap" :title="formState.requestReason">
                  {{ formState.requestReason }}
                </p>
                <a-input v-else v-model:value.trim="formState.requestReason" placeholder="请输入" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="申请部门">
                <p v-if="isDetail" class="overflow-ellipsis overflow-hidden whitespace-nowrap" :title="formState.requestDepartment">
                  {{ formState.requestDepartment }}
                </p>
                <a-tree-select
                  v-else
                  v-model:value="formState.requestDepartmentId"
                  :tree-data="orgComboTree"
                  allow-clear
                  tree-default-expand-all
                  placeholder="请选择"
                  :field-names="{
                    label: 'text',
                    value: 'id',
                  }"
                  @change="onSelectDepartment"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="申请人">
                <p v-if="isDetail" class="overflow-ellipsis overflow-hidden whitespace-nowrap" :title="formState.applicant">
                  {{ formState.applicant }}
                </p>
                <a-input v-else v-model:value.trim="formState.applicant" placeholder="请输入" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item label="备注" name="BZ">
                <p v-if="isDetail" class="overflow-ellipsis overflow-hidden whitespace-nowrap" :title="formState.description">
                  {{ formState.description }}
                </p>
                <a-input
                  v-else
                  v-model:value.trim="formState.description"
                  :title="formState.description"
                  placeholder="请输入"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>

        <p class="w-[80px] text-right pr-2">
          申请明细 :
        </p>
        <div class="pl-4">
          <a-space v-if="!isDetail" class="mt-4">
            <template v-if="requestType === RequestType.耗材">
              <a-button @click="setSelectConsumablesVisible(true)">
                选择新增
              </a-button>
              <a-button @click="onAddDetail">
                新增
              </a-button>
            </template>
            <a-button v-if="requestType === RequestType.化学品" @click="setSelectChemicalsVisible(true)">
              选择新增
            </a-button>
            <a-button @click="onBatchDel">
              删除
            </a-button>
          </a-space>
          <a-table
            class="mt-4"
            bordered
            row-key="index"
            :columns="columns"
            :data-source="detailList"
            :row-selection="isDetail ? null : getRowSelection()"
            :pagination="false"
            :scroll="{ y: 220 }"
          >
            <template #headerCell="{ column }">
              <template v-if="['name', 'amountUnit', 'amount', 'unit'].includes(column.dataIndex)">
                <span class="text-red-500">*</span>
                {{ column.title }}
              </template>
            </template>
            <template #bodyCell="{ record, column }">
              <template v-if="column.dataIndex === 'code'">
                <span v-if="isDetail">{{ record.code }}</span>
                <a-input
                  v-else
                  v-model:value.trim="record.code"
                  :maxlength="50"
                  placeholder="请输入"
                  :disabled="record.sourceId && requestType !== RequestType.化学品"
                />
              </template>
              <template v-if="column.dataIndex === 'name'">
                <span v-if="isDetail">{{ record.name }}</span>
                <a-input
                  v-else
                  v-model:value.trim="record.name"
                  :maxlength="50"
                  placeholder="请输入"
                  :disabled="record.sourceId || requestType === RequestType.化学品"
                />
              </template>
              <template v-if="column.dataIndex === 'standard'">
                <span v-if="isDetail">{{ record.standard }}</span>
                <a-input
                  v-else
                  v-model:value.trim="record.standard"
                  :maxlength="50"
                  placeholder="请输入"
                />
              </template>
              <template v-if="column.dataIndex === 'amount'">
                <span v-if="isDetail">{{ record.amount }}</span>
                <a-input-number
                  v-else
                  v-model:value="record.amount"
                  :min="0"
                  class="w-full"
                />
              </template>
              <template v-if="column.dataIndex === 'unit'">
                <span v-if="isDetail">{{ record.unit }}</span>
                <a-input
                  v-else
                  v-model:value.trim="record.unit"
                  placeholder="请输入"
                  :disabled="record.sourceId || requestType === RequestType.化学品"
                />
              </template>
              <template v-if="column.dataIndex === 'description'">
                <span v-if="isDetail">{{ record.description }}</span>
                <a-input v-else v-model:value.trim="record.description" placeholder="请输入" />
              </template>
              <template v-if="column.dataIndex === 'Action'">
                <a-button type="link" danger @click="onDel(record)">
                  删除
                </a-button>
              </template>
            </template>
          </a-table>
        </div>
      </div>
    </a-spin>

    <!-- 选择耗材 -->
    <SelectConsumables v-model:open="selectConsumablesVisible" @on-select="getSelectConsumables" />

    <!-- 选择化学品 -->
    <SelectChemicals v-model:open="selectChemicalsVisible" @on-select="getSelectChemicals" />
  </div>
</template>

<script setup lang='ts'>
import { Modal, message } from 'ant-design-vue'
import SelectConsumables from './SelectConsumables.vue'
import SelectChemicals from './SelectChemicals.vue'
import { RequestType, getColumnsByType, getRequestType } from '~/views/common/purchaseRequest'
import { useStateHooks } from '~/hooks/useStateHooks.ts'
import type { TestTaskDataItem } from '~/views/common/humiture/res/api/getTestTask.ts'
import type { ChemicalDataItem, ConsumablesDataItem } from '~/views/common/purchaseRequest/api.ts'
import { purchaseDetails } from '~/views/common/purchaseRequest/api.ts'
import { PurchaseEntity, PurchaseRequestItem } from '~/views/common/purchaseRequest/interface/purchase.ts'
import { getOrgComboTree } from '~/api/common.ts'
import type { IDepartmentEntity } from '~/interface/IDepartmentEntity.ts'

const props = defineProps({
  editId: {
    type: String,
    default: null,
  },
  checkId: {
    type: String,
    default: null,
  },
})

const [selectConsumablesVisible, setSelectConsumablesVisible] = useStateHooks(false)

const [selectChemicalsVisible, setSelectChemicalsVisible] = useStateHooks(false)

const requestType = getRequestType()

const isDetail = computed(() => !!props.checkId)

const columns = computed(() => {
  if (isDetail.value) {
    return getColumnsByType(requestType)
  }
  return getColumnsByType(requestType).concat({ title: '操作', dataIndex: 'Action', width: '10%' })
})

const formRef = ref()

const loading = ref(false)

const selectedRowKeys = ref([])

const selectedRows = ref([])

const formState = ref(new PurchaseEntity())

const detailList = computed(() => formState.value.items)

const orgComboTree = ref<IDepartmentEntity[]>([])

function getRowSelection() {
  return {
    selectedRowKeys: selectedRowKeys.value,
    onChange: (keys: string[], rows: TestTaskDataItem[]) => {
      selectedRows.value = rows
      selectedRowKeys.value = keys
    },
  }
}

async function init() {
  const detailId = props.editId || props.checkId

  if (!orgComboTree.value.length) {
    const res = await getOrgComboTree()
    const data = res.data as IDepartmentEntity[]
    data.shift()
    orgComboTree.value = data
  }

  if (detailId) {
    loading.value = true
    const res = await purchaseDetails(detailId).finally(() => {
      loading.value = false
    })
    formState.value = res.data
    formState.value.requestTime = undefined
  }
  else {
    formState.value = new PurchaseEntity()
    formState.value.requestType = getRequestType()
  }
}

// 关闭弹窗
function onReset() {
  formRef.value.resetFields()
  formState.value = new PurchaseEntity()
}

function onSelectDepartment(id: string, names: string[]) {
  if (id) {
    formState.value.requestDepartment = names[0]
  }
  else {
    formState.value.requestDepartment = ''
  }
}

function getSelectConsumables(rows: ConsumablesDataItem[]) {
  rows.forEach((item) => {
    if (!detailList.value.some(i => i.sourceId === item.id)) {
      const obj = new PurchaseRequestItem()
      obj.sourceId = item.id
      obj.amount = item.amount
      obj.description = ''
      obj.standard = item.standard
      obj.unit = item.amountUnit
      obj.name = item.name
      obj.code = item.sn
      detailList.value.push(obj)
    }
  })

  updateIndex()
}

function getSelectChemicals(rows: ChemicalDataItem[]) {
  rows.forEach((item) => {
    if (!detailList.value.some(i => i.sourceId === item.id)) {
      const obj = new PurchaseRequestItem()
      obj.sourceId = item.id
      obj.amount = item.amount
      obj.description = ''
      obj.standard = ''
      obj.unit = item.unit
      obj.name = item.name
      // obj.code = item.sn
      detailList.value.push(obj)
    }
  })

  updateIndex()
}

function updateIndex() {
  formState.value.items = formState.value.items.map((i, index) => ({
    ...i,
    index,
  }))
}

function onAddDetail() {
  detailList.value.push({})
  updateIndex()
}

function onBatchDel() {
  if (!selectedRowKeys.value.length) {
    message.warn('请勾选要删除的申请明细！')
    return
  }

  Modal.confirm({
    title: '提示',
    content: '确认删除吗？',
    onOk: async () => {
      formState.value.items = formState.value.items.filter(i => !selectedRowKeys.value.includes(i.index))
      updateIndex()
      selectedRowKeys.value = []
      selectedRows.value = []
    },
  })
}

function onDel(record) {
  Modal.confirm({
    title: '提示',
    content: '确认删除吗？',
    onOk: async () => {
      formState.value.items = formState.value.items.filter(i => i.index !== record.index)
      updateIndex()
      selectedRowKeys.value = []
      selectedRows.value = []
    },
  })
}

function onSubmit(callback) {
  if (!detailList.value.length) {
    message.warn('请新增申请明细！')
    return
  }

  if (requestType === RequestType.耗材) {
    if (detailList.value.some(i => !i.name || !i.amount || !i.unit)) {
      Modal.info({
        title: '提示',
        content: `请将申请明细中的【耗材名称、数量（数量不能为0）、单位】填写完整后提交！`,
      })
      return
    }
  }

  if (requestType === RequestType.化学品) {
    if (detailList.value.some(i => !i.name || !i.amount || !i.unit)) {
      Modal.info({
        title: '提示',
        content: `请将申请明细中的【化学名称、数量（数量不能为0）、单位】填写完整后提交！`,
      })
      return
    }
  }

  formRef.value.validateFields().then(async () => {
    callback(formState.value)
  })
}

defineExpose({
  init,
  onReset,
  onSubmit,
})
</script>
