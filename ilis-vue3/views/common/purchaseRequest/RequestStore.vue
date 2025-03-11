<template>
  <AppProvider>
    <a-card
      :bordered="false"
      :body-style="{ padding: '0 16px 0 0' }"
    >
      <a-space v-if="requestType === RequestType.耗材" size="large">
        <a-space>
          <span><i class="text-red-500 mr-1">*</i>经手人：</span>
          <a-input-group compact class="w-[220px]">
            <a-input v-model:value="formState.operatorName" readonly style="width: calc(100% - 60px)" />
            <a-button type="primary" @click="setOperatorVisible(true)">
              选择
            </a-button>
          </a-input-group>
        </a-space>
        <a-space>
          <span><i class="text-red-500 mr-1">*</i>保管人：</span>
          <a-input-group compact class="w-[220px]">
            <a-input v-model:value="formState.managerName" readonly style="width: calc(100% - 60px)" />
            <a-button type="primary" @click="setManagerVisible(true)">
              选择
            </a-button>
          </a-input-group>
        </a-space>
        <a-space>
          <span><i class="text-red-500 mr-1">*</i>核查人：</span>
          <a-input-group compact class="w-[220px]">
            <a-input v-model:value="formState.auditPersonName" readonly style="width: calc(100% - 60px)" />
            <a-button type="primary" @click="setAuditerVisible(true)">
              选择
            </a-button>
          </a-input-group>
        </a-space>
      </a-space>

      <a-space v-if="requestType === RequestType.化学品" size="large">
        <a-space>
          <span><i class="text-red-500 mr-1">*</i>保管人：</span>
          <a-input-group compact class="w-[220px]">
            <a-input readonly :value="keepers" style="width: calc(100% - 60px)" />
            <a-button type="primary" @click="setKeeperVisible(true)">
              选择
            </a-button>
          </a-input-group>
        </a-space>
        <a-space>
          <span>监管人：</span>
          <a-input-group compact class="w-[220px]">
            <a-input readonly :value="managers" style="width: calc(100% - 60px)" />
            <a-button type="primary" @click="setManagerCVisible(true)">
              选择
            </a-button>
          </a-input-group>
        </a-space>
      </a-space>

      <p class="my-2">
        采购申请单
      </p>
      <IlisTable
        show-index
        row-key="id"
        :loading="loading"
        :data-source="dataSource"
        :entity="PurChaseRecordEntity"
        :custom-columns="customColumns"
        :pagination="getPagination()"
        :custom-row="customRow"
        :row-class-name="rowClassName"
      >
        <template #bodyCell="{ record, column }">
          <template v-if="column.dataIndex === 'requestTime'">
            {{ record.requestTime ? dayjs(record.requestTime).format("YYYY-MM-DD HH:mm:ss") : "" }}
          </template>
          <template v-if="column.dataIndex === 'status'">
            {{ RequestStatusDict.getLabelByKey(record.status) }}
          </template>
        </template>
      </IlisTable>

      <p>
        入库明细
      </p>
      <a-space class="my-2">
        <a-input
          v-if="requestType === RequestType.化学品"
          v-model:value.trim="quickQuery"
          class="w-[220px]"
          placeholder="化学名称、品名、化学品编号"
        />
        <a-input
          v-else
          v-model:value.trim="quickQuery"
          class="w-[220px]"
          placeholder="管理编号、耗材名称"
        />
        <a-button @click="onSearch">
          查询
        </a-button>
        <a-button @click="onBatchDel">
          删除
        </a-button>
      </a-space>
      <div class="pb-2">
        <a-table
          bordered
          row-key="_id"
          :columns="checkColumns"
          :data-source="itemList"
          :pagination="false"
          :loading="checkLoading"
          :row-selection="getRowSelection()"
          :scroll="{ y: 320 }"
        >
          <template #headerCell="{ column }">
            <template v-if="['name', 'type', 'amountUnit', 'amount', 'recordCount', 'recordDate', 'departId', 'putawayDate', 'productionDate', 'invalidDate', 'categoryName'].includes(column.dataIndex)">
              <span class="text-red-500">*</span>
              {{ column.title }}
            </template>
            <template v-if="requestType === RequestType.化学品 && 'sn' === column.dataIndex">
              <span class="text-red-500">*</span>
              {{ column.title }}
            </template>
          </template>
          <template #bodyCell="{ record, column }">
            <template v-if="['sn', 'name', 'amountUnit', 'standard', 'site', 'specification', 'storageLocation', 'categoryName'].includes(column.dataIndex)">
              <a-input v-if="requestType === RequestType.化学品 && ['categoryName'].includes(column.dataIndex)" v-model:value="record[column.dataIndex]" disabled></a-input>
              <a-input v-else-if="requestType === RequestType.耗材 && record.consumableId && ['sn', 'name', 'amountUnit', 'standard'].includes(column.dataIndex)" v-model:value="record[column.dataIndex]" disabled></a-input>
              <a-input v-else v-model:value="record[column.dataIndex]" placeholder="请输入" />
            </template>
            <template v-if="['recordCount', 'amount'].includes(column.dataIndex)">
              <a-input-number v-model:value="record[column.dataIndex]" :min="0" />
            </template>
            <template v-if="['type'].includes(column.dataIndex)">
              <a-select
                v-model:value="record.type"
                class="w-full"
                placeholder="请选择"
                :options="typeOptions"
              ></a-select>
            </template>
            <template v-if="['departId'].includes(column.dataIndex)">
              <a-tree-select
                v-model:value="record[column.dataIndex]"
                :tree-data="orgComboTree"
                allow-clear
                tree-default-expand-all
                placeholder="请选择"
                :field-names="{
                  label: 'text',
                  value: 'id',
                }"
                class="w-full"
                :dropdown-match-select-width="220"
                @change="(id, item) => { onSelectDepartment(record, item) }"
              />
            </template>
            <template v-if="['recordDate', 'putawayDate', 'productionDate', 'invalidDate'].includes(column.dataIndex)">
              <a-date-picker
                v-model:value="record[column.dataIndex]"
                class="w-full"
                :value-format="EDateFormatType.YYYY_MM_DD"
                placeholder="请选择"
              />
            </template>
            <template v-if="column.dataIndex === 'Action'">
              <a-button type="link" danger @click="onDel(record)">
                删除
              </a-button>
            </template>
          </template>
        </a-table>
      </div>
    </a-card>

    <!-- 选择经手人 -->
    <PersonSelector v-model:show="operatorVisible" :checked-ids="[formState.operatorId]" @confirm="onSelectOperator" />

    <!-- 选择保管人 -->
    <PersonSelector v-model:show="managerVisible" :checked-ids="[formState.managerId]" @confirm="onSelectManager" />

    <!-- 选择核查人 -->
    <PersonSelector v-model:show="auditerVisible" :checked-ids="[formState.auditPersonId]" @confirm="onSelectAuditer" />

    <!-- 选择化学保管人 -->
    <PersonSelector
      v-model:show="keeperVisible"
      multiple
      :checked-ids="formState.keeperIds"
      @confirm="onSelectChemicalKeeper"
    />

    <!-- 选择监管人 -->
    <PersonSelector
      v-model:show="managerCVisible"
      multiple
      :checked-ids="formState.managerIds"
      @confirm="onSelectChemicalManager"
    />
  </AppProvider>
</template>

<script setup lang='ts'>
import { Modal, message } from 'ant-design-vue'
import dayjs from 'dayjs'
import type { TestTaskDataItem } from '~/views/common/humiture/res/api/getTestTask.ts'
import { PurChaseRecordEntity } from '~/views/common/purchaseRequest/PurChaseRecordEntity.ts'
import {
  RequestStatusDict,
  RequestStatusType,
  RequestType,
  getRequestType,
} from '~/views/common/purchaseRequest/index.ts'
import { IlisTable } from '~/components/ilisComponent'
import { useTableHooks } from '~/hooks/useTableHooks.ts'
import type { GetPurchaseListParams, PurchaseListItem } from '~/views/common/purchaseRequest/interface/purchaseList.ts'
import { purchaseDetails, purchaseList } from '~/views/common/purchaseRequest/api.ts'
import PersonSelector from '~/components/PersonSelector.vue'
import { useStateHooks } from '~/hooks/useStateHooks.ts'
import {
  PurchaseChemicalStoreEntity,
  PurchaseStoreEntity,
} from '~/views/common/purchaseRequest/interface/purchaseStore.ts'
import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity.ts'
import type { IDepartmentEntity } from '~/interface/IDepartmentEntity.ts'
import { getListByGroupId, getOrgComboTree } from '~/api/common.ts'

const requestType = getRequestType()

const checkColumns = computed(() => {
  if (requestType === RequestType.化学品) {
    return [
      { title: '化学名称', dataIndex: 'categoryName' },
      { title: '品名', dataIndex: 'name' },
      { title: '化学品编号', dataIndex: 'sn' },
      { title: '规格', dataIndex: 'specification' },
      { title: '入库数量', dataIndex: 'amount', width: '120px' },
      { title: '入库日期', dataIndex: 'putawayDate' },
      { title: '生产日期', dataIndex: 'productionDate' },
      { title: '失效日期', dataIndex: 'invalidDate' },
      { title: '存放位置', dataIndex: 'storageLocation' },
      { title: '操作', dataIndex: 'Action', width: '80px' },
    ]
  }

  return [
    { title: '管理编号', dataIndex: 'sn' },
    { title: '耗材名称', dataIndex: 'name' },
    { title: '规格', dataIndex: 'standard' },
    { title: '耗材类别', dataIndex: 'type' },
    { title: '数量', dataIndex: 'recordCount', width: '120px' },
    { title: '单位', dataIndex: 'amountUnit', width: '120px' },
    { title: '入库日期', dataIndex: 'recordDate' },
    { title: '存放地点', dataIndex: 'site' },
    { title: '所属部门', dataIndex: 'departId' },
    { title: '操作', dataIndex: 'Action', width: '80px' },
  ]
})

const quickQuery = ref('')

const localUserInfo = getLocalUserInfo()

const [operatorVisible, setOperatorVisible] = useStateHooks(false)

const [managerVisible, setManagerVisible] = useStateHooks(false)

const [auditerVisible, setAuditerVisible] = useStateHooks(false)

const [keeperVisible, setKeeperVisible] = useStateHooks(false)

const [managerCVisible, setManagerCVisible] = useStateHooks(false)

const customColumnsType = computed(() => {
  if (requestType === RequestType.化学品) {
    return 'purchase_request_chemical'
  }
  else {
    return 'purchase_request_consumable'
  }
})

const checkLoading = ref(false)

const itemList = ref<Array<PurchaseStoreEntity | PurchaseChemicalStoreEntity>>([])

const selectedRowKeys = ref([])

const selectedRows = ref([])

const selectedRow = ref<PurchaseListItem>()

const formState = ref<PurchaseStoreEntity | PurchaseChemicalStoreEntity>({})

const orgComboTree = ref<IDepartmentEntity[]>([])

const typeOptions = ref([])

const queryForm = ref<GetPurchaseListParams>({
  requestType,
  status: RequestStatusType.已完成,
})

const keepers = computed(() => {
  if (formState.value.keepers && formState.value.keepers.length > 0) {
    return formState.value.keepers.join(',')
  }
  return ''
})

const managers = computed(() => {
  if (formState.value.managers && formState.value.managers.length > 0) {
    return formState.value.managers.join(',')
  }
  return ''
})

const {
  loading,
  customColumns,
  dataSource,
  getPagination,
} = useTableHooks<PurchaseListItem>({
  api: purchaseList,
  customType: customColumnsType.value,
  query: queryForm,
  responseDataTransform: (res) => {
    return {
      rows: res.rows,
      total: res.count,
    }
  },
})

init()

async function init() {
  if (requestType === RequestType.耗材) {
    formState.value.operatorId = localUserInfo?.userId
    formState.value.operatorName = localUserInfo?.realName
    formState.value.managerId = localUserInfo?.userId
    formState.value.managerName = localUserInfo?.realName

    const res = await getOrgComboTree()
    const data = res.data as IDepartmentEntity[]
    data.shift()
    orgComboTree.value = data

    getTypeOptions()
  }
}

async function getTypeOptions() {
  const { data } = await getListByGroupId('fcc166c7340845a8ad97d7014e6b565f')
  typeOptions.value = data.obj.map(item => ({
    label: item.typecode,
    value: item.typecode,
  }))
}

function customRow(record: PurchaseListItem) {
  return {
    onClick: () => {
      if (selectedRow.value?.id !== record.id) {
        selectedRow.value = { ...record }
        getPurchaseDetails(record.id)
      }
    },
  }
}

function rowClassName(record: PurchaseListItem) {
  return selectedRow.value?.id === record.id ? 'table-striped' : ''
}

function getRowSelection() {
  return {
    selectedRowKeys: selectedRowKeys.value,
    onChange: (keys: string[], rows: TestTaskDataItem[]) => {
      selectedRows.value = rows
      selectedRowKeys.value = keys
    },
  }
}

async function getPurchaseDetails(id) {
  checkLoading.value = true
  const res = await purchaseDetails(id).finally(() => {
    checkLoading.value = false
  })

  const data = res.data
  const list: Array<PurchaseStoreEntity | PurchaseChemicalStoreEntity> = []

  if (requestType === RequestType.耗材) {
    data.items.forEach((item) => {
      const obj = new PurchaseStoreEntity()

      obj._id = item.id
      obj.sn = item.code
      obj.name = item.name
      obj.standard = item.standard
      obj.recordCount = item.amount
      obj.amountUnit = item.unit

      obj.departId = data.requestDepartmentId
      obj.depart = data.requestDepartment
      obj.recordDate = dayjs(new Date()).format(EDateFormatType.YYYY_MM_DD)
      obj.consumableId = item.sourceId

      list.push(obj)
    })
  }

  if (requestType === RequestType.化学品) {
    data.items.forEach((item) => {
      const obj = new PurchaseChemicalStoreEntity()

      obj._id = item.id
      obj.sn = item.code
      obj.name = item.name
      obj.specification = item.standard
      obj.amount = item.amount
      obj.unit = item.unit
      obj.categoryId = item.sourceId
      obj.categoryName = item.name

      list.push(obj)
    })
  }

  itemList.value = list
}

function onSearch() {
  itemList.value.forEach((item) => {
    if (quickQuery.value) {
      if (requestType === RequestType.耗材 && (item.sn?.indexOf(quickQuery.value) >= 0 || item.name?.indexOf(quickQuery.value) >= 0)) {
        item.isSearch = true
      }
      else if (requestType === RequestType.化学品 && (item.sn?.indexOf(quickQuery.value) >= 0 || item.name?.indexOf(quickQuery.value) >= 0 || item.categoryName?.indexOf(quickQuery.value) >= 0)) {
        item.isSearch = true
      }
      else {
        item.isSearch = false
      }
    }
    else {
      item.isSearch = false
    }
  })

  itemList.value.sort((a, b) => Number(b.isSearch) - Number(a.isSearch))
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
      itemList.value = itemList.value.filter(i => !selectedRowKeys.value.includes(i._id))
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
      itemList.value = itemList.value.filter(i => i._id !== record._id)
      selectedRowKeys.value = []
      selectedRows.value = []
    },
  })
}

function onSelectOperator(rows: IUserSelectVoEntity[]) {
  const row = rows[0]
  formState.value.operatorId = row.id
  formState.value.operatorName = row.name
  setOperatorVisible(false)
}

function onSelectManager(rows: IUserSelectVoEntity[]) {
  const row = rows[0]
  formState.value.managerId = row.id
  formState.value.managerName = row.name
  setManagerVisible(false)
}

function onSelectAuditer(rows: IUserSelectVoEntity[]) {
  const row = rows[0]
  formState.value.auditPersonId = row.id
  formState.value.auditPersonName = row.name
  setAuditerVisible(false)
}

function onSelectChemicalKeeper(rows: IUserSelectVoEntity[]) {
  formState.value.keeperIds = rows.map(i => i.id)
  formState.value.keepers = rows.map(i => i.name)
  setKeeperVisible(false)
}

function onSelectChemicalManager(rows: IUserSelectVoEntity[]) {
  formState.value.managerIds = rows.map(i => i.id)
  formState.value.managers = rows.map(i => i.name)
  setManagerCVisible(false)
}

function onSelectDepartment(record: PurchaseStoreEntity, names: string[]) {
  record.depart = names[0]
}

function getFormData() {
  if (!formState.value.operatorId || !formState.value.managerId || !formState.value.auditPersonId) {
    message.warn('请选择经手人、保管人和核查人！')
    return false
  }

  if (!selectedRow.value) {
    message.warn('请选择采购申请单！')
    return false
  }

  if (!itemList.value.length) {
    message.warn('无入库明细，请确认后再提交！')
    return false
  }

  if (requestType === RequestType.耗材) {
    if (itemList.value.some(i => !i.name || !i.type || !i.recordCount || !i.amountUnit || !i.recordDate || !i.departId)) {
      Modal.info({
        title: '提示',
        content: `请将入库明细中的【耗材名称、耗材类型、数量（数量不能为0）、单位、入库日期、所属部门】填写完整后提交！`,
      })
      return false
    }
  }

  itemList.value.forEach((obj) => {
    obj.auditPersonId = formState.value.auditPersonId
    obj.auditPersonName = formState.value.auditPersonName
    obj.operatorId = formState.value.operatorId
    obj.operatorName = formState.value.operatorName
    obj.managerId = formState.value.managerId
    obj.managerName = formState.value.managerName
  })

  return unref(itemList.value)
}

// 化学品
function getFormDataChemical() {
  const submitData = []
  const formData = formState.value as PurchaseChemicalStoreEntity
  const list = itemList.value as PurchaseChemicalStoreEntity[]

  if (!formData.keeperIds || !formData.keeperIds.length) {
    message.warn('请选择保管人！')
    return false
  }

  if (!selectedRow.value) {
    message.warn('请选择采购申请单！')
    return false
  }

  if (!itemList.value.length) {
    message.warn('无入库明细，请确认后再提交！')
    return false
  }

  if (requestType === RequestType.化学品) {
    if (list.some(i => !i.name || !i.sn || !i.amount || !i.putawayDate || !i.productionDate || !i.invalidDate)) {
      Modal.info({
        title: '提示',
        content: `请将入库明细中的【品名、化学品编号、入库数量（入库数量不能为0）、入库日期、生产日期、失效日期】填写完整后提交！`,
      })
      return false
    }
  }

  list.forEach((item) => {
    submitData.push({
      attachments: [],
      chemicalVO: {
        categoryName: item.categoryName,
        categoryId: item.categoryId,
        name: item.name,
        sn: item.sn,
        manageLevel: '',
        manageLevelId: '',
        unit: '',
        purity: '',
        concentration: '',
        specification: item.specification,
        effect: '',
        packing: '',
        sourceFrom: '',
        status: '',
        acronym: '',
        productionDate: item.productionDate,
        invalidDate: item.invalidDate,
        remark: '备注',
        keepers: formData.keepers.join(','),
        keeperIds: formData.keeperIds.join(','),
        managers: formData.managers ? formData.managers.join(',') : '',
        managerIds: formData.managerIds ? formData.managerIds.join(',') : '',
        allowChangeContainer: '',
        storageLocation: item.storageLocation,
      },
      customValues: [],
      inventoryInVO: {
        batchSn: '',
        batch: '',
        type: '',
        amount: item.amount,
        putawayDate: item.putawayDate,
        id: '',
      },
      purchaseVO: {
        manufacturer: '',
        batchSn: '',
        certificateSn: '',
        supplier: '',
        purchaseDate: '',
        purchaseSn: '',
        purchaseAmount: '',
        id: '',
      },
    })
  })

  return submitData
}

window.getFormData = getFormData
window.getFormDataChemical = getFormDataChemical
</script>

<style scoped lang="less">
:deep(.table-striped) td {
  background-color: rgba(0, 102, 236, 0.4)!important;
}
</style>
