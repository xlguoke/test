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

      <BaseTitle class="mt-2">
        采购申请单
      </BaseTitle>
      <IlisTable
        show-index
        row-key="id"
        :loading="loading"
        :data-source="dataSource"
        :table-width="1100"
        :entity="PurChaseRecordEntity"
        :custom-columns="customColumns"
        :field-list="fieldList"
        :row-selection="getRowSelection({ type: selectedType })"
        :pagination="getPagination()"
        :custom-row="getCustomRow()"
        @change="onTableChange"
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

      <BaseTitle>
        入库明细
      </BaseTitle>
      <a-space class="mb-2">
        <a-input
          v-if="requestType === RequestType.化学品"
          v-model:value.trim="quickQuery"
          class="!w-[220px]"
          placeholder="化学名称、品名、化学品编号"
        />
        <a-input
          v-else
          v-model:value.trim="quickQuery"
          class="!w-[220px]"
          placeholder="管理编号、耗材名称"
        />
        <a-button type="primary" @click="onSearch">
          查询
        </a-button>
        <a-button @click="onBatchDel">
          删除
        </a-button>
      </a-space>
      <a-table
        bordered
        row-key="_id"
        :columns="checkColumns"
        :data-source="itemList"
        :pagination="false"
        :loading="checkLoading"
        :row-selection="handleRowSelection()"
      >
        <template #headerCell="{ column }">
          <template v-if="['categoryName', 'name', 'type', 'amountUnit', 'amount', 'recordCount', 'recordDate', 'departId', 'putawayDate', 'productionDate', 'invalidDate', 'categoryName'].includes(column.dataIndex)">
            <span class="text-red-500">*</span>
            {{ column.title }}
            <a-tooltip v-if="['categoryName', 'name'].includes(column.dataIndex)" placement="top">
              <template #title>
                <span v-if="column.dataIndex === 'categoryName'">精确描述化学结构，唯一识别物质</span>
                <span v-else>通用名称、俗名、商品名或法规名录中的名称</span>
              </template>
              <ExclamationCircleOutlined />
            </a-tooltip>
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
import type { IDepartmentEntity } from '~/interface/IDepartmentEntity.ts'
import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity.ts'
import type { TestTaskDataItem } from '~/views/common/humiture/res/api/getTestTask.ts'
import type { GetPurchaseListParams, PurchaseListItem } from '~/views/common/purchaseRequest/interface/purchaseList.ts'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import dayjs from 'dayjs'
import { getListByGroupId, getOrgComboTree } from '~/api/common.ts'
import PersonSelector from '~/components/PersonSelector.vue'
import { useStateHooks } from '~/hooks/useStateHooks.ts'
import { useTableHooks } from '~/hooks/useTableHooks.ts'
import { purchaseDetails, purchaseList } from '~/views/common/purchaseRequest/api.ts'
import {
  getRequestType,
  getSelectedType,
  RequestStatusDict,
  RequestStatusType,
  RequestType,
} from '~/views/common/purchaseRequest/index.ts'
import {
  PurchaseChemicalStoreEntity,
  PurchaseStoreEntity,
} from '~/views/common/purchaseRequest/interface/purchaseStore.ts'
import { PurChaseRecordEntity } from '~/views/common/purchaseRequest/PurChaseRecordEntity.ts'

const requestType = getRequestType()

const selectedType = getSelectedType()

const checkColumns = computed(() => {
  if (requestType === RequestType.化学品) {
    return [
      { title: '化学名称', dataIndex: 'categoryName' },
      { title: '品名', dataIndex: 'name' },
      { title: '品名编号', dataIndex: 'sn' },
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

const detailSelectedRowKeys = ref<string[]>([])

const detailSelectedRows = ref<TestTaskDataItem[]>([])

// 记录每个申请单对应的明细 ID 列表（用于多选模式下的精准删除）
const requestItemMap = ref<Map<string, Set<string>>>(new Map())

// 记录每个明细 ID 被哪些申请单共享（用于取消选择时的精准删除）
const itemRequestMap = ref<Map<string, Set<string>>>(new Map())

// 记录每个申请单对每条明细的数量贡献（用于取消选择时的数量扣减）
const requestItemQuantityMap = ref<Map<string, Map<string, number>>>(new Map())

const formState = ref<PurchaseStoreEntity | PurchaseChemicalStoreEntity>({})

const orgComboTree = ref<IDepartmentEntity[]>([])

const typeOptions = ref([])

const fieldList = computed(() => {
  const fields = PurChaseRecordEntity.getTableFieldList()
  return fields.filter(item => item !== 'Action')
})

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
  selectedRowKeys,
  getRowSelection,
  getPagination,
  getCustomRow,
} = useTableHooks<PurchaseListItem>({
  api: purchaseList,
  customType: customColumnsType.value,
  query: queryForm,
  isCacheSelect: true,
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

  // 初始化时清空映射关系
  requestItemMap.value = new Map()
  itemRequestMap.value = new Map()
  requestItemQuantityMap.value = new Map()
}

async function getTypeOptions() {
  const { data } = await getListByGroupId('fcc166c7340845a8ad97d7014e6b565f')
  typeOptions.value = data.obj.map(item => ({
    label: item.typecode,
    value: item.typecode,
  }))
}

function handleRowSelection() {
  return {
    detailSelectedRowKeys: detailSelectedRowKeys.value,
    onChange: (keys: any[], rows: TestTaskDataItem[]) => {
      detailSelectedRows.value = rows
      detailSelectedRowKeys.value = keys
    },
  }
}

watch(() => selectedRowKeys.value, (newIds: any[]) => {
  // 获取之前选中的 ID
  const prevIds = requestItemMap.value.size === 0 ? [] : Array.from(requestItemMap.value.keys())

  // 新增的选中 ID
  const addedIds = newIds.filter(id => !prevIds.includes(id))

  // 取消的选中 ID
  const removedIds = prevIds.filter(id => !newIds.includes(id))
  // 处理新增选中
  if (addedIds.length > 0) {
    addedIds.forEach(id => loadRequestDetails(id))
  }

  // 处理取消选中
  if (removedIds.length > 0) {
    removedIds.forEach(id => removeRequestDetails(id))
  }

  // 如果是单选模式且只有一个选中项，加载详情
  if (selectedType !== 'checkbox' && newIds.length === 1) {
    getPurchaseDetails(newIds[0])
  }
}, { immediate: true, deep: true })

async function getPurchaseDetails(id: string) {
  checkLoading.value = true
  try {
    const res = await purchaseDetails(id)
    const data = res.data

    // 使用通用映射函数
    const list = mapApiItemsToEntities(data, requestType)

    itemList.value = list
  }
  finally {
    checkLoading.value = false
  }
}

/**
 * 判断两个化学品明细是否重复（基于四个关键字段）
 */
function isChemicalDuplicate(
  item1: PurchaseChemicalStoreEntity,
  item2: PurchaseChemicalStoreEntity,
): boolean {
  return (
    item1.categoryName === item2.categoryName
    && item1.name === item2.name
    && item1.sn === item2.sn
    && item1.specification === item2.specification
  )
}

/**
 * 查找重复的明细项（仅化学品需要）
 */
function findDuplicateIndex(
  itemList: Array<PurchaseStoreEntity | PurchaseChemicalStoreEntity>,
  newItem: PurchaseStoreEntity | PurchaseChemicalStoreEntity,
): number {
  if (requestType !== RequestType.化学品) {
    return -1
  }

  return itemList.findIndex((existingItem) => {
    return isChemicalDuplicate(
      existingItem as PurchaseChemicalStoreEntity,
      newItem as PurchaseChemicalStoreEntity,
    )
  })
}

/**
 * 将 API 返回的 item 数组映射为实体对象数组
 */
function mapApiItemsToEntities(
  data: any,
  type: RequestType,
): Array<PurchaseStoreEntity | PurchaseChemicalStoreEntity> {
  const entities: Array<PurchaseStoreEntity | PurchaseChemicalStoreEntity> = []

  if (type === RequestType.耗材) {
    data.items.forEach((item: any) => {
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
      entities.push(obj)
    })
  }
  else if (type === RequestType.化学品) {
    data.items.forEach((item: any) => {
      const obj = new PurchaseChemicalStoreEntity()
      obj._id = item.id
      obj.sn = item.code
      obj.name = item.name
      obj.specification = item.standard
      obj.amount = item.amount
      obj.unit = item.unit
      obj.categoryId = item.sourceId
      obj.categoryName = item.name
      entities.push(obj)
    })
  }

  return entities
}

/**
 * 多选模式下加载申请单详情并添加到列表
 */
async function loadRequestDetails(requestId: string) {
  checkLoading.value = true
  try {
    const res = await purchaseDetails(requestId)
    const data = res.data

    // 使用通用映射函数
    const newItems = mapApiItemsToEntities(data, requestType)
    const itemIds = new Set<string>()

    // 记录该申请单对每条明细的数量贡献
    const quantityMap = new Map<string, number>()

    // 逐个处理新明细项
    newItems.forEach((newItem) => {
      const duplicateIndex = findDuplicateIndex(itemList.value, newItem)

      if (duplicateIndex !== -1) {
        // 发现重复项，叠加数量（仅化学品）
        const existingItem = itemList.value[duplicateIndex] as PurchaseChemicalStoreEntity
        const newChemicalItem = newItem as PurchaseChemicalStoreEntity

        // 叠加数量
        existingItem.amount = (existingItem.amount || 0) + (newChemicalItem.amount || 0)

        // 记录该申请单对这个明细的数量贡献
        quantityMap.set(newItem._id!, newChemicalItem.amount || 0)

        // 使用已存在项的 ID
        itemIds.add(existingItem._id!)
      }
      else {
        // 不重复，直接添加
        itemList.value.push(newItem)

        // 记录数量贡献
        const quantity = requestType === RequestType.化学品
          ? (newItem as PurchaseChemicalStoreEntity).amount || 0
          : (newItem as PurchaseStoreEntity).recordCount || 0
        quantityMap.set(newItem._id!, quantity)

        itemIds.add(newItem._id!)
      }
    })

    // 更新映射关系
    requestItemMap.value.set(requestId, itemIds)
    requestItemQuantityMap.value.set(requestId, quantityMap)

    // 更新反向映射（记录每个明细被哪些申请单共享）
    itemIds.forEach((itemId) => {
      if (!itemRequestMap.value.has(itemId)) {
        itemRequestMap.value.set(itemId, new Set())
      }
      itemRequestMap.value.get(itemId)!.add(requestId)
    })
  }
  finally {
    checkLoading.value = false
  }
}

/**
 * 多选模式下移除申请单对应的明细
 */
function removeRequestDetails(requestId: string) {
  const itemIds = requestItemMap.value.get(requestId)
  const quantityMap = requestItemQuantityMap.value.get(requestId)

  if (!itemIds || !quantityMap)
    return

  // 找出需要删除的明细 ID（只删除不被其他申请单共享的）
  const toRemove: string[] = []
  itemIds.forEach((itemId) => {
    const requestSet = itemRequestMap.value.get(itemId)
    if (requestSet) {
      requestSet.delete(requestId)

      // 如果没有其他申请单引用该明细，则删除
      if (requestSet.size === 0) {
        toRemove.push(itemId)
        itemRequestMap.value.delete(itemId)
      }
      else {
        // 还有其他申请单共享，需要扣减数量
        if (requestType === RequestType.化学品 && quantityMap) {
          const quantityToSubtract = quantityMap.get(itemId) || 0
          const existingItem = itemList.value.find(item => item._id === itemId) as PurchaseChemicalStoreEntity
          if (existingItem && quantityToSubtract > 0) {
            existingItem.amount = Math.max(0, (existingItem.amount || 0) - quantityToSubtract)
          }
        }
      }
    }
  })

  // 从列表中删除明细（只删除完全不被共享的）
  if (toRemove.length > 0) {
    itemList.value = itemList.value.filter(item => !toRemove.includes(item._id!))
  }

  // 删除映射关系
  requestItemMap.value.delete(requestId)
  requestItemQuantityMap.value.delete(requestId)
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
  if (!detailSelectedRowKeys.value.length) {
    message.warn('请勾选要删除的申请明细！')
    return
  }

  Modal.confirm({
    title: '提示',
    content: '确认删除吗？',
    onOk: async () => {
      itemList.value = itemList.value.filter(i => !detailSelectedRowKeys.value.includes(i._id))
      detailSelectedRowKeys.value = []
      detailSelectedRows.value = []
    },
  })
}

function onDel(record) {
  Modal.confirm({
    title: '提示',
    content: '确认删除吗？',
    onOk: async () => {
      itemList.value = itemList.value.filter(i => i._id !== record._id)
      detailSelectedRowKeys.value = []
      detailSelectedRows.value = []
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

/**
 * 表格变化处理（处理全选/取消全选）
 */
function onTableChange(_pagination: any, _filters: any, _sorter: any, options: any) {
  // 处理全选/取消全选
  if (options.action === 'change' && options.selectedRowKeys) {
    const currentIds = options.selectedRowKeys as string[]
    const prevIds = Array.from(requestItemMap.value.keys())

    // 如果是全选操作（当前选中的比之前多）
    if (currentIds.length > prevIds.length) {
      const addedIds = currentIds.filter(id => !prevIds.includes(id))
      addedIds.forEach(id => loadRequestDetails(id))
    }
    // 如果是取消全选操作（当前选中的比之前少）
    else if (currentIds.length < prevIds.length) {
      const removedIds = prevIds.filter(id => !currentIds.includes(id))
      removedIds.forEach(id => removeRequestDetails(id))
    }
  }
}

function getFormData() {
  if (!formState.value.operatorId || !formState.value.managerId || !formState.value.auditPersonId) {
    message.warn('请选择经手人、保管人和核查人！')
    return false
  }

  if (!selectedRowKeys.value.length) {
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
        content: `请将入库明细中的【耗材名称、耗材类型、数量（数量不能为 0）、单位、入库日期、所属部门】填写完整后提交！`,
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
  const submitData: any[] = []
  const formData = formState.value as PurchaseChemicalStoreEntity
  const list = itemList.value as PurchaseChemicalStoreEntity[]

  if (!formData.keeperIds || !formData.keeperIds.length) {
    message.warn('请选择保管人！')
    return false
  }

  if (!selectedRowKeys.value.length) {
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
        content: `请将入库明细中的【品名、化学品编号、入库数量（入库数量不能为 0）、入库日期、生产日期、失效日期】填写完整后提交！`,
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
