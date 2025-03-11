<template>
  <div>
    <HtModal
      v-model:open="visible"
      :title="title"
      width="80%"
      :after-close="onClosed"
    >
      <a-spin tip="加载中..." :spinning="detailLoading">
        <TitleBar class="mt-4">
          核查基础信息
        </TitleBar>
        <a-form
          ref="formRef"
          class="mt-4"
          :model="formState"
          :label-col="{ style: { width: '85px' } }"
          :wrapper-col="{ style: { flex: 1 } }"
        >
          <a-row>
            <a-col span="12">
              <a-form-item label="计划名称" name="name" :rules="[{ required: true, message: '请输入计划名称！' }]">
                <span v-if="isDetail">{{ formState.name }}</span>
                <a-input v-else v-model:value="formState.name" placeholder="请输入" />
              </a-form-item>
            </a-col>
            <a-col span="12">
              <a-form-item label="计划编号" name="planCode">
                <span v-if="isDetail">{{ formState.code }}</span>
                <a-input v-else v-model:value="formState.code" disabled placeholder="保存后自动生成" />
              </a-form-item>
            </a-col>
            <a-col span="12">
              <a-form-item label="计划说明" name="memo">
                <span v-if="isDetail">{{ formState.description }}</span>
                <a-input v-else v-model:value="formState.description" placeholder="请输入" />
              </a-form-item>
            </a-col>
            <a-col span="12">
              <a-form-item label="计划日期" name="planDate" :rules="[{ required: true, message: '请选择计划日期！' }]">
                <span v-if="isDetail">{{ formState.startDate }} ~ {{ formState.endDate }}</span>
                <a-range-picker v-else v-model:value="formState.planDate" class="w-full" :value-format="EDateFormatType.YYYY_MM_DD" />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>

        <TitleBar class="mt-4">
          核查设备
        </TitleBar>

        <a-space class="mt-4">
          <a-tree-select
            v-model:value="deviceQueryForm.departId"
            class="w-[220px]"
            :tree-data="treeData"
            :field-names="{
              label: 'text',
              value: 'id',
            }"
            allow-clear
            placeholder="请选择所属部门"
            tree-node-filter-prop="text"
          />
          <a-input v-model:value.trim="deviceQueryForm.keyword" class="w-[220px]" placeholder="请输入设备名称或设备编号后查询" />
          <a-button type="primary" @click="onSearch">
            查询
          </a-button>
          <a-button @click="onReset">
            重置
          </a-button>
        </a-space>

        <div v-if="!isDetail" class="mt-2">
          <a-space>
            <a-button @click="onSelectEq">
              添加设备
            </a-button>
            <a-button @click="onBatchEdit">
              批量编辑
            </a-button>
            <a-button @click="onBatchDel">
              删除
            </a-button>
          </a-space>
        </div>

        <a-alert v-if="!isDetail" message="核查部门、核查人、核查项目需填写完整后，才允许提交审核" type="info" show-icon class="mt-2" />

        <div class="mt-2">
          <a-table
            row-key="equipmentId"
            :columns="columns"
            :data-source="deviceList"
            :pagination="false"
            :loading="loading"
            :scroll="{ y: 180 }"
            :row-selection="getRowSelection()"
            bordered
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'checkDepartmentId'">
                <span v-if="isDetail">{{ record.checkDepartment }}</span>
                <a-tree-select
                  v-else
                  v-model:value="record.checkDepartmentId"
                  class="w-full"
                  :tree-data="treeData"
                  :field-names="{
                    label: 'text',
                    value: 'id',
                  }"
                  allow-clear
                  placeholder="请选择"
                  tree-node-filter-prop="text"
                  :disabled="isDetail"
                  @change="(id, names) => { selectDepartment(record, id, names) }"
                />
              </template>
              <template v-if="column.dataIndex === 'checkUserId'">
                <span v-if="isDetail">{{ record.checkUser }}</span>
                <a-input-group v-else compact>
                  <a-input v-model:value="record.checkUser" placeholder="请选择" readonly style="width: calc(100% - 48px)" />
                  <a-button @click="onSelectUser(record)">
                    <UnorderedListOutlined style="font-size: 16px;" />
                  </a-button>
                </a-input-group>
              </template>
              <template v-if="column.dataIndex === 'checkItems'">
                <span v-if="isDetail" :title="record.checkItemsStr">{{ record.checkItemsStr }}</span>
                <a-input-group v-else compact>
                  <a-input v-model:value="record.checkItemsStr" :title="record.checkItemsStr" readonly placeholder="请选择" style="width: calc(100% - 48px)" />
                  <a-button @click="onSelectCheckItem(record)">
                    <UnorderedListOutlined style="font-size: 16px;" />
                  </a-button>
                </a-input-group>
              </template>
              <template v-if="column.dataIndex === 'remark'">
                <span v-if="isDetail" :title="record.remark">{{ record.remark }}</span>
                <a-input v-else v-model:value.trim="record.remark" placeholder="请输入" />
              </template>
            </template>
          </a-table>
        </div>
      </a-spin>

      <template #footer>
        <a-button @click="visible = false">
          {{ isDetail ? '关闭' : '取消' }}
        </a-button>
        <a-button v-if="!isDetail" type="primary" :loading="loading" @click="handleOk">
          确定
        </a-button>
      </template>
    </HtModal>

    <PersonSelector v-model:show="userSelectorVisible" @confirm="selectPerson" />
  </div>
</template>

<script lang="ts" setup>
import { Modal, message } from 'ant-design-vue'
import type { ColumnType } from 'ant-design-vue/es/table'
import { UnorderedListOutlined } from '@ant-design/icons-vue'
import type { EquipmentFunCheckPlanEntity } from '../EquipmentFunCheckPlanEntity.ts'
import BatchEdit from './BatchEdit.vue'
import CheckItemSelector from './CheckItemSelector.vue'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper.ts'
import PersonSelector from '~/components/PersonSelector.vue'
import { useStateHooks } from '~/hooks/useStateHooks.ts'
import type { IDepartmentEntity } from '~/interface/IDepartmentEntity.ts'
import { getOrgComboTree } from '~/api/common.ts'
import type { IUserSelectVoEntity } from '~/interface/IUserSelectVoEntity.ts'
import TitleBar from '~/components/TitleBar.vue'
import {
  AddPlanEntity,
  EquipmentFunctionCheckItemDTOOnCreate,
  EquipmentFunctionCheckPlanDetailDTOOnCreate,
  addPlan,
  getPlanDetail,
  updatePlan,
} from '~/views/equipment/funcationalInspect/plan/api.ts'
import type { ScreenTypeEntity } from '~/views/admin/screen/configuration'
import EqSelector from '~/views/equipment/funcationalInspect/record/component/EqSelector.vue'
import type { SelectEqItem } from '~/views/equipment/funcationalInspect/record/api.ts'

const props = defineProps<IDialogPropsParam<null, EquipmentFunCheckPlanEntity>>()

const formRef = ref()

const visible = ref(true)

const [userSelectorVisible, setUserSelectorVisible] = useStateHooks(false)

const rowData = ref<EquipmentFunCheckPlanEntity>(props.param.record)

const isAdd = computed(() => !rowData.value)

const isEdit = computed(() => props.param.isEdit)

const isDetail = computed(() => props.param.isDetail)

const deviceQueryForm = ref({
  keyword: '',
  departId: undefined,
})

const title = computed(() => {
  if (isEdit.value) {
    return '编辑计划'
  }
  if (isDetail.value) {
    return '查看计划'
  }
  return '新增计划'
})

const loading = ref(false)

const detailLoading = ref(false)

const originDeviceList = ref<EquipmentFunctionCheckPlanDetailDTOOnCreate[]>([])

const deviceList = ref<EquipmentFunctionCheckPlanDetailDTOOnCreate[]>([])

const formState = ref(new AddPlanEntity())

const selectedRowKeys = ref([])

const selectedRows = ref<EquipmentFunctionCheckPlanDetailDTOOnCreate[]>([])

const treeData = ref<IDepartmentEntity[]>([])

const actionId = ref<string>()

const columns: ColumnType[] = [
  {
    title: '设备名称',
    dataIndex: 'equipmentName',
    width: 180,
  },
  {
    title: '设备编号',
    dataIndex: 'equipmentCode',
    width: 180,
  },
  {
    title: '规格型号',
    dataIndex: 'standard',
    width: 150,
  },
  {
    title: '所属部门',
    dataIndex: 'department',
    width: 180,
  },
  {
    title: '核查部门',
    dataIndex: 'checkDepartmentId',
    width: 220,
  },
  {
    title: '核查人',
    dataIndex: 'checkUserId',
    width: 180,
  },
  {
    title: '核查项目',
    dataIndex: 'checkItems',
    width: 220,
    ellipsis: true,
  },
  {
    title: '备注',
    dataIndex: 'remark',
    width: 180,
    ellipsis: true,
  },
]

init()

function init() {
  getTreeData()

  if (!isAdd.value) {
    getDetail()
  }
}

async function getTreeData() {
  const { data } = await getOrgComboTree()
  treeData.value = data
}

async function getDetail() {
  detailLoading.value = true
  const res = await getPlanDetail(rowData.value.id).finally(() => {
    detailLoading.value = false
  })
  const data = res.data
  const details = data.details || []

  details.forEach((i) => {
    i.checkItemsStr = i.checkItems.map(i => i.name).join(';')
  })

  formState.value = data
  originDeviceList.value = details
  deviceList.value = originDeviceList.value
  formState.value.planDate = [data.startDate, data.endDate]
}

function onSearch() {
  let data = originDeviceList.value

  if (deviceQueryForm.value.departId) {
    data = data.filter(i => i.departmentId === deviceQueryForm.value.departId)
  }

  if (deviceQueryForm.value.keyword) {
    data = data.filter(i => (i.equipmentName || '').includes(deviceQueryForm.value.keyword) || (i.equipmentCode || '').includes(deviceQueryForm.value.keyword))
  }

  deviceList.value = data
}

function onReset() {
  deviceQueryForm.value.keyword = ''
  deviceQueryForm.value.departId = undefined

  onSearch()
}

function getRowSelection() {
  if (isDetail.value) {
    return undefined
  }

  return {
    fixed: true,
    selectedRowKeys: selectedRowKeys.value,
    onChange: (keys: string[], rows) => {
      selectedRowKeys.value = keys
      selectedRows.value = rows
    },
  }
}

async function onSelectEq() {
  const rows: SelectEqItem[] = await AnyDialogHelper.showModel(EqSelector, {
    isSelect: true,
  })

  rows.forEach((item) => {
    if (!originDeviceList.value.find(i => i.equipmentId === item.equipmentId)) {
      const eqItem = new EquipmentFunctionCheckPlanDetailDTOOnCreate()
      eqItem.equipmentId = item.equipmentId
      eqItem.equipmentName = item.equipmentName || ''
      eqItem.equipmentCode = item.equipmentCode || ''
      eqItem.standard = item.standard
      eqItem.department = item.department
      eqItem.departmentId = item.departmentId
      originDeviceList.value.push(eqItem)
    }
  })

  onSearch()
}

function selectDepartment(item: EquipmentFunctionCheckPlanDetailDTOOnCreate, id, names) {
  if (id) {
    item.checkDepartment = names[0]
  }
  else {
    item.checkDepartment = ''
  }
}

function selectPerson(rows: IUserSelectVoEntity[]) {
  const [row] = rows
  const index = deviceList.value.findIndex(i => i.equipmentId === actionId.value)

  if (index !== -1) {
    deviceList.value[index].checkUserId = row.id
    deviceList.value[index].checkUser = row.name
  }

  setUserSelectorVisible(false)
}

function onSelectUser(record: EquipmentFunctionCheckPlanDetailDTOOnCreate) {
  actionId.value = record.equipmentId
  setUserSelectorVisible(true)
}

async function onSelectCheckItem(record: EquipmentFunctionCheckPlanDetailDTOOnCreate) {
  const rows: ScreenTypeEntity[] = await AnyDialogHelper.showModel(CheckItemSelector, record)
  const checkItems: EquipmentFunctionCheckItemDTOOnCreate[] = []

  rows.forEach((row) => {
    const cItem = new EquipmentFunctionCheckItemDTOOnCreate()
    cItem.dictId = row.id
    cItem.name = row.typename
    checkItems.push(cItem)
  })

  record.checkItems = checkItems
  record.checkItemsStr = checkItems.map(i => i.name).join(';')
}

async function onBatchEdit() {
  if (!selectedRowKeys.value.length) {
    message.warn('请勾选要批量操作的设备！')
    return
  }

  const data: EquipmentFunctionCheckPlanDetailDTOOnCreate = await AnyDialogHelper.showModel(BatchEdit)
  selectedRows.value.forEach((item) => {
    item.remark = data.remark
    item.checkDepartment = data.checkDepartment
    item.checkDepartmentId = data.checkDepartmentId
    item.checkUser = data.checkUser
    item.checkUserId = data.checkUserId
    item.checkItems = data.checkItems
    item.checkItemsStr = data.checkItemsStr
  })
}

function onBatchDel() {
  if (!selectedRowKeys.value.length) {
    message.warn('请勾选要删除的设备！')
    return
  }

  Modal.confirm({
    title: '提示',
    content: '确认删除勾选的设备？',
    onOk: async () => {
      originDeviceList.value = originDeviceList.value.filter(i => !selectedRowKeys.value.includes(i.equipmentId))
      onSearch()
    },
  })
}

async function handleOk() {
  formRef.value.validateFields().then(async () => {
    const formData = {
      ...formState.value,
      details: originDeviceList.value,
    }

    if (formData.planDate && formData.planDate.length === 2) {
      formData.startDate = formData.planDate[0]
      formData.endDate = formData.planDate[1]
    }
    else {
      formData.startDate = ''
      formData.endDate = ''
    }
    delete formData.planDate

    loading.value = true
    if (isAdd.value) {
      await addPlan(formData).finally(() => {
        loading.value = false
      })
    }
    else {
      await updatePlan(formData).finally(() => {
        loading.value = false
      })
    }

    message.success('操作成功！')
    props.onConfirm(null)
    visible.value = false
  })
}
</script>
