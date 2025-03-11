<template>
  <IlisContainer app-id="evaluate_model">
    <div class=" h-full flex flex-col gap-3">
      <IlisFormSearch
        :entity="EquipmentRentEntity"
        @reset="handleReset"
        @search="handleSearch"
      ></IlisFormSearch>
      <a-space>
        <a-button @click="handleEdit(EquipmentRentEntity.fromJSON({}))">
          新增
        </a-button>
        <a-button @click="handlePrint">
          打印
        </a-button>
        <a-button @click="handleExport('rest/eq/rent/controller/export')">
          导出
        </a-button>
      </a-space>
      <div ref="tableBoxRef" class="flex-1">
        <IlisTable
          row-key="id"
          :loading="loading"
          :data-source="dataSource"
          :entity="EquipmentRentEntity"
          :table-height="tableHeight"
          :pagination="getPagination()"
          :row-selection="getRowSelection({
            type: 'radio',
          })"
          :custom-row="getCustomRow"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'operation'">
              <a-button
                v-if="(record.applyStatus === EquipmentRentStatus.WAIT_APPROVE && record.signerStatus === EquipmentRentSignStatus.NO_RENT)
                  || (record.applyStatus === EquipmentRentStatus.APPROVE_SUCCESS && record.signerStatus === EquipmentRentSignStatus.NO_RETURN)
                "
                type="link"
                size="small"
                @click="handleSign(record as EquipmentRentEntity)"
              >
                签字
              </a-button>
              <a-button
                v-if="(record as EquipmentRentEntity).applyStatus !== EquipmentRentStatus.APPROVE_ING"
                type="link"
                size="small"
                @click="handleDelete([record] as EquipmentRentEntity[])"
              >
                删除
              </a-button>
              <a-button
                v-if="[EquipmentRentStatus.WAIT_APPROVE, EquipmentRentStatus.APPROVE_REJECT, EquipmentRentStatus.APPROVE_FAIL].includes(record.applyStatus)"
                type="link"
                size="small"
                @click="handleEdit(EquipmentRentEntity.fromJSON(record))"
              >
                编辑
              </a-button>
              <a-button
                v-if="[EquipmentRentStatus.WAIT_APPROVE, EquipmentRentStatus.APPROVE_REJECT, EquipmentRentStatus.APPROVE_FAIL].includes(record.applyStatus)"
                type="link"
                size="small"
                @click="handleProcess(record as EquipmentRentEntity)"
              >
                提交
              </a-button>
              <a-button
                v-if="[EquipmentRentStatus.APPROVE_SUCCESS].includes(record.applyStatus)"
                type="link"
                size="small"
                @click="handleReturn(EquipmentReturnEntity.fromJSON(record))"
              >
                归还
              </a-button>
              <a-button
                v-if="[EquipmentRentStatus.RETURNED].includes(record.applyStatus)"
                type="link"
                size="small"
                @click="AnyDialogHelper.showModel(Return, { data: EquipmentReturnEntity.fromJSON(record), isDetail: true })"
              >
                归还记录
              </a-button>
              <a-button
                type="link"
                size="small"
                @click="AnyDialogHelper.showModel(Detail, EquipmentRentEntity.fromJSON(record))"
              >
                详情
              </a-button>
              <a-button
                type="link"
                size="small"
                @click="AnyDialogHelper.showModel(LogModalByApi, {
                  id: record.id,
                  logType: '19',
                })"
              >
                日志
              </a-button>
            </template>
          </template>
        </IlisTable>
      </div>
    </div>
  </IlisContainer>
</template>

<script setup lang='ts'>
import { message } from 'ant-design-vue'
import { EquipmentRentEntity, EquipmentRentSignStatus, EquipmentRentStatus } from './EquipmentRentEntity'
import { deleteEquipmentRent, getEquipmentRentList, submitEquipmentRentProcess, submitEquipmentRentProcessBySign, submitEquipmentReturn } from './api'
import Audit from './component/Audit.vue'
import AddEdit from './component/AddEdit.vue'
import Detail from './component/Detail.vue'
import Return from './component/Return.vue'
import { EquipmentReturnEntity } from './EquipmentReturnEntity'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { IlisContainer, IlisFormSearch, IlisSignature, IlisTable } from '~/components/ilisComponent'
import { useTableHooks } from '~/hooks/useTableHooks'
import LogModalByApi from '~/components/commonSystemLog/LogModalByApi.vue'
import { ProcessType } from '~/components/commonProcess'
import { SignType } from '~/components/IlisSignature'
import { getQrcodeLink } from '~/components/IlisSignature/api'

const {
  loading,
  dataSource,
  selectedRows,
  tableBoxRef,
  tableHeight,
  getPagination,
  getRowSelection,
  getCustomRow,
  handleSearch,
  handleReset,
  handleExport,
  handleDelete,
  handleReloadTable,
} = useTableHooks<EquipmentRentEntity>({
  api: getEquipmentRentList,
  delApi: deleteEquipmentRent,
  sizeKey: 'rows',
})

async function handlePrint() {
  if (!selectedRows.value?.length) {
    message.warning('请先选择一条数据')
    return
  }

  // const selType = await AnyDialogHelper.showModel(IlisSelectModal, {
  //   title: '打印',
  //   options: [
  //     { label: '设备借用申请', value: 'rent' },
  //     { label: '设备归还申请', value: 'back' },
  //   ],
  //   defaultValue: 'rent',
  // })

  // if (selType === 'rent') {
  //   const UDRTypeMap = { 1: 'EquipmentRentOut', 2: 'EquipmentRentIn', 3: 'EquipmentRentInterior' }
  //   const UDRPrint = new IlisPrintUdr()
  //   UDRPrint.commonPrint(selectedRows.value.map(item => item.id), UDRTypeMap[selectedRows.value[0].rentType])
  // }

  const UDRTypeMap = { 1: 'EquipmentRentOut', 2: 'EquipmentRentIn', 3: 'EquipmentRentInterior' }
  const UDRPrint = new IlisPrintUdr()
  UDRPrint.commonPrint(selectedRows.value.map(item => item.id), UDRTypeMap[selectedRows.value[0].rentType])
}

async function handleSign(data: EquipmentRentEntity) {
  let type = SignType.BORROW
  let api = submitEquipmentRentProcessBySign
  if (data.applyStatus === EquipmentRentStatus.WAIT_APPROVE && data.signerStatus === EquipmentRentSignStatus.NO_RENT) {
    type = SignType.BORROW
    api = submitEquipmentRentProcessBySign
  }
  else if (data.applyStatus === EquipmentRentStatus.APPROVE_SUCCESS && data.signerStatus === EquipmentRentSignStatus.NO_RETURN) {
    type = SignType.RETURN
    api = submitEquipmentReturn
  }

  const linkQuery = {
    keyId: data.keyId,
    id: data.id,
    type,
  }
  const { data: link } = await getQrcodeLink()
  const res = await AnyDialogHelper.showModel(IlisSignature, {
    value: `${link}&${new URLSearchParams(linkQuery)}`,
  })
  if (!res) {
    return
  }
  const unitCode = localStorage.getItem('unitCode') || ''
  loading.value = true
  await api(unitCode, data.id, data.keyId, res as string)
    .finally(() => {
      loading.value = false
    })
  handleReloadTable()
  message.success('操作成功')
}

async function handleProcess(row: EquipmentRentEntity) {
  await AnyDialogHelper.showModel(Audit, {
    processType: ProcessType.EQ_RENT,
    processId: row.id,
    queryParams: { id: row.id },
    submitAuditApi: submitEquipmentRentProcess,
    rentType: row.rentType,
  })
  handleReloadTable()
}

async function handleEdit(row: EquipmentRentEntity) {
  await AnyDialogHelper.showModel(AddEdit, row)
  handleReloadTable()
}

async function handleReturn(row: EquipmentReturnEntity) {
  await AnyDialogHelper.showModel(Return, { data: row, isDetail: false })
  handleReloadTable()
  return row
}
</script>

<style>

</style>
