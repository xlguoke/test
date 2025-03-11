<template>
  <IlisContainer>
    <a-spin tip="加载中..." :spinning="detailLoading">
      <TitleBar>核查基础信息</TitleBar>
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
              <span>{{ formState.name }}</span>
            </a-form-item>
          </a-col>
          <a-col span="12">
            <a-form-item label="计划编号" name="planCode">
              <span>{{ formState.code }}</span>
            </a-form-item>
          </a-col>
          <a-col span="12">
            <a-form-item label="计划说明" name="memo">
              <span>{{ formState.description }}</span>
            </a-form-item>
          </a-col>
          <a-col span="12">
            <a-form-item label="计划日期" name="planDate" :rules="[{ required: true, message: '请选择计划日期！' }]">
              <span>{{ formState.startDate }} ~ {{ formState.endDate }}</span>
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

      <div class="mt-4">
        <a-table
          row-key="equipmentId"
          :columns="columns"
          :data-source="deviceList"
          :pagination="false"
          bordered
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'checkDepartmentId'">
              <span>{{ record.checkDepartment }}</span>
            </template>
            <template v-if="column.dataIndex === 'checkUserId'">
              <span>{{ record.checkUser }}</span>
            </template>
            <template v-if="column.dataIndex === 'checkItems'">
              <span :title="record.checkItemsStr">{{ record.checkItemsStr }}</span>
            </template>
            <template v-if="column.dataIndex === 'remark'">
              <span :title="record.remark">{{ record.remark }}</span>
            </template>
          </template>
        </a-table>
      </div>
    </a-spin>
  </IlisContainer>
</template>

<script lang="ts" setup>
import type { ColumnType } from 'ant-design-vue/es/table'
import type { IDepartmentEntity } from '~/interface/IDepartmentEntity.ts'
import { getOrgComboTree } from '~/api/common.ts'
import TitleBar from '~/components/TitleBar.vue'
import type {
  EquipmentFunctionCheckPlanDetailDTOOnCreate,
} from '~/views/equipment/funcationalInspect/plan/api.ts'
import {
  AddPlanEntity,
  getPlanDetail,
} from '~/views/equipment/funcationalInspect/plan/api.ts'
import { IlisContainer } from '~/components/ilisComponent'

const urlParams = new URLSearchParams(location.search)

const businessKey = urlParams.get('businessKey')

const formRef = ref()

const deviceQueryForm = ref({
  keyword: '',
  departId: undefined,
})

const detailLoading = ref(false)

const originDeviceList = ref<EquipmentFunctionCheckPlanDetailDTOOnCreate[]>([])

const deviceList = ref<EquipmentFunctionCheckPlanDetailDTOOnCreate[]>([])

const formState = ref(new AddPlanEntity())

const treeData = ref<IDepartmentEntity[]>([])

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
  },
  {
    title: '备注',
    dataIndex: 'remark',
    width: 180,
  },
]

init()

function init() {
  getTreeData()
  getDetail()
}

async function getTreeData() {
  const { data } = await getOrgComboTree()
  treeData.value = data
}

async function getDetail() {
  if (!businessKey) {
    return
  }

  detailLoading.value = true
  const res = await getPlanDetail(businessKey).finally(() => {
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
}

function onSearch() {
  let data = originDeviceList.value

  if (deviceQueryForm.value.departId) {
    data = data.filter(i => i.departmentId === deviceQueryForm.value.departId)
  }

  if (deviceQueryForm.value.keyword) {
    data = data.filter(i => i.equipmentName.includes(deviceQueryForm.value.keyword) || i.equipmentCode.includes(deviceQueryForm.value.keyword))
  }

  deviceList.value = data
}

function onReset() {
  deviceQueryForm.value.keyword = ''
  deviceQueryForm.value.departId = undefined

  onSearch()
}
</script>
