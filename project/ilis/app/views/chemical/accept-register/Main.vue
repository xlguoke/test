<template>
  <IlisContainer app-id="chemical_purchase_verify">
    <div class="h-full flex flex-col gap-3">
      <IlisFormSearch
        :entity="AcceptRegisterQueryEntity"
        @reset="handleReset"
        @search="handleSearch"
      />

      <HtButtonGroup>
        <a-button v-permission="'accept::register::edit'" type="primary" @click="onAdd">
          新增验收登记
        </a-button>
        <a-button v-permission="'accept::register::export'" @click="handleExport(`/rest/chemical/purchase/register/export/${CUSTOM_TYPE}`)">
          导出
        </a-button>
        <IlisCustomColumns
          :type="CUSTOM_TYPE"
          @confirm="handleReloadTable()"
        />
      </HtButtonGroup>

      <div ref="tableBoxRef" class="flex-1 h-0">
        <IlisTable
          row-key="id"
          :loading="loading"
          :table-height="tableHeight"
          :data-source="dataSource"
          :entity="AcceptRegisterEntity"
          :custom-columns="customColumns"
          :pagination="getPagination()"
          show-index
          resizable
          @change="handleSortChange"
        >
          <template #bodyCell="{ record, column }">
            <template v-if="column.dataIndex === 'status'">
              <a-tag :color="purchaseApplyStatusDict.getColorByKey(record.status)">
                {{ purchaseApplyStatusDict.getLabelByKey(record.status) }}
              </a-tag>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <a-button type="link" @click.stop="onViewDetail(record as AcceptRegisterEntity)">
                详情
              </a-button>
              <a-button
                v-if="record.status === EPurchaseApplyStatus.PENDING_SUBMIT || record.status === EPurchaseApplyStatus.IN_FILLING"
                v-permission="'accept::register::edit'"
                type="link"
                @click.stop="onEdit(record as AcceptRegisterEntity)"
              >
                编辑
              </a-button>
              <a-button
                v-if="record.status === EPurchaseApplyStatus.IN_FILLING || record.status === EPurchaseApplyStatus.NOT_APPROVED"
                v-permission="'accept::register::verify'"
                type="link"
                @click.stop="onVerify(record as AcceptRegisterEntity)"
              >
                验收
              </a-button>
              <a-button
                v-if="record.status === EPurchaseApplyStatus.PENDING_SUBMIT || record.status === EPurchaseApplyStatus.NOT_APPROVED"
                v-permission="'accept::register::submit'"
                type="link"
                @click.stop="onSubmit(record as AcceptRegisterEntity)"
              >
                提交
              </a-button>
              <a-button
                v-if="record.status === EPurchaseApplyStatus.UNDER_REVIEW"
                v-permission="'accept::register::recall'"
                type="link"
                @click.stop="onRevoke(record as AcceptRegisterEntity)"
              >
                撤回
              </a-button>
              <a-button v-permission="'accept::register::print'" type="link" @click.stop="onPrint(record as AcceptRegisterEntity)">
                打印
              </a-button>
              <a-button type="link" @click.stop="onLog(record as AcceptRegisterEntity)">
                日志
              </a-button>
            </template>
          </template>
        </IlisTable>
      </div>
    </div>
  </IlisContainer>
</template>

<script setup lang="ts">
import type { IProcessForm } from '~/components/commonProcess'
import { message } from 'ant-design-vue'
import { ref } from 'vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import { ProcessModal, ProcessType } from '~/components/commonProcess'
import LogModalByApi from '~/components/commonSystemLog/LogModalByApi.vue'
import HtButtonGroup from '~/components/htButtonGroup'
import { useTableHooks } from '~/hooks/useTableHooks'
import { IlisPrintUdr } from '~/utils/IlisPrintUdr'
import { AcceptRegisterEntity, AcceptRegisterQueryEntity } from './AcceptRegisterEntity'
import { getAcceptRegisterPage, revokeAcceptRegister, submitAcceptRegister } from './api'
import CreateForm from './components/CreateForm.vue'
import { EPurchaseApplyStatus, purchaseApplyStatusDict } from './types'

const queryForm = ref({
  q: '',
  registerTimeStart: '',
  registerTimeEnd: '',
  status: undefined as EPurchaseApplyStatus | undefined,
})

const CUSTOM_TYPE = 'chemical_purchase_verify'

const printUdr = new IlisPrintUdr()

const {
  loading,
  customColumns,
  dataSource,
  tableHeight,
  tableBoxRef,
  getPagination,
  handleReset,
  handleSearch,
  handleReloadTable,
  handleExport,
  handleSortChange,
} = useTableHooks<AcceptRegisterEntity>({
  api: getAcceptRegisterPage,
  customType: CUSTOM_TYPE,
  query: queryForm,
})

function onAdd() {
  AnyDialogHelper.showModel(CreateForm, {
    mode: 'create',
  }).then(() => handleReloadTable())
}

function onViewDetail(record: AcceptRegisterEntity) {
  AnyDialogHelper.showModel(CreateForm, {
    id: record.id,
    mode: 'detail',
  })
}

function onEdit(record: AcceptRegisterEntity) {
  AnyDialogHelper.showModel(CreateForm, {
    id: record.id,
    mode: 'edit',
  }).then(() => handleReloadTable())
}

function onVerify(record: AcceptRegisterEntity) {
  AnyDialogHelper.showModel(CreateForm, {
    id: record.id,
    mode: 'verify',
  }).then(() => handleReloadTable())
}

async function onSubmit(record: AcceptRegisterEntity) {
  await AnyDialogHelper.showModel(ProcessModal, {
    processType: ProcessType.CHEMICAL_ACCEPTANCE,
    processId: record.id!,
    submitAuditApi: submitAcceptRegister,
    submitDataTransfer: (data: any) => {
      return {
        ids: [record.id],
        presetAuditors: JSON.parse(data.presetAuditers),
        processForm: JSON.parse(data.formPropertyJson),
        remark: data.remark,
      }
    },
  } as IProcessForm)
  message.success('提交成功')
  handleReloadTable()
}

async function onRevoke(record: AcceptRegisterEntity) {
  const ok = await modalConfirm('确认撤回吗？')
  if (!ok)
    return
  try {
    await revokeAcceptRegister({ registerId: record.id! })
    message.success('撤回成功')
    handleReloadTable()
  }
  catch (error) {
    console.error('撤回失败:', error)
  }
}

function onPrint(record: AcceptRegisterEntity) {
  printUdr.commonPrint([record.id], 'ChemicalPurchaseVerify')
}

function onLog(record: AcceptRegisterEntity) {
  AnyDialogHelper.showModel(LogModalByApi, { id: record.id, logType: '0', relationQry: true })
}
</script>
