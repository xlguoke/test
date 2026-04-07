<template>
  <div class="flex flex-col h-full">
    <a-space>
      <a-select v-model:value="queryForm.type" allow-clear :options="wasteTypeList" class="w-[200px]" placeholder="废物类型"></a-select>
      <a-select v-model:value="queryForm.status" allow-clear :options="handleStatusDict" class="w-[200px]" placeholder="状态"></a-select>
      <a-range-picker v-model:value="createDate" :value-format="EDateFormatType.YYYY_MM_DD" :placeholder="['开始处理日期', '结束处理日期']" />
      <a-input v-model:value.trim="queryForm.quickQry" class="w-[220px]" placeholder="请输入废物名称、经办人查询" :maxlength="100" />

      <a-button type="primary" @click="handleSearch()">
        查询
      </a-button>
      <a-button @click="onReset()">
        重置
      </a-button>
    </a-space>

    <a-space class="my-4">
      <a-button v-permission="'chemicalWasteHandle:add'" type="primary" @click="onAdd">
        新增申请
      </a-button>
      <CustomAttribute v-permission="'chemicalWasteHandle:customField'" customize-type="chemicalWasteMaterialHandle" @save="handleReloadTable" />
      <IlisCustomColumns type="chemicalWasteMaterialHandle" @confirm="handleReloadTable()">
      </IlisCustomColumns>
      <a-button :loading="exportLoading" @click="onExport">
        导出
      </a-button>
    </a-space>

    <div ref="tableBoxRef" class="flex-1 h-0">
      <IlisTable
        row-key="id"
        :loading="loading"
        :table-height="tableHeight"
        :data-source="dataSource"
        :entity="ChemicalWasteHandleEntity"
        :custom-columns="customColumns"
        :pagination="getPagination()"
        @change="handleSortChange"
      >
        <template #bodyCell="{ record, column, text }">
          <template v-if="column.dataIndex === 'type'">
            {{ getWasteTypeText(record.type) }}
          </template>
          <template v-if="column.dataIndex === 'quantity'">
            {{ record.quantity }}{{ record.unit }}
          </template>
          <template v-if="column.dataIndex === 'status'">
            <a-tag v-if="text === '10'" color="#0066ec">
              填写中
            </a-tag>
            <a-tag v-if="text === '20'" color="#f59a23">
              审核中
            </a-tag>
            <a-tag v-if="['30', '50'].includes(text)" color="#d9001b">
              未通过
            </a-tag>
            <a-tag v-if="text === '40'" color="#4b7902">
              已通过
            </a-tag>
          </template>
          <template v-if="column.dataIndex === 'Action'">
            <a-space>
              <a-button type="link" @click.stop="onCheck(record)">
                详情
              </a-button>
              <a-button v-if="['10', '30', '50'].includes(record.status)" v-permission="'chemicalWasteHandle:edit'" type="link" @click.stop="onEdit(record)">
                编辑
              </a-button>
              <a-button v-if="['10', '30', '50'].includes(record.status)" v-permission="'chemicalWasteHandle:submit'" type="link" @click.stop="onSubmit(record)">
                提交
              </a-button>
              <a-button v-if="['20'].includes(record.status)" v-permission="'chemicalWasteHandle:recall'" type="link" @click.stop="onRecall(record)">
                撤回
              </a-button>
              <a-button type="link" @click.stop="onPrint(record)">
                打印
              </a-button>
              <a-button v-if="['10', '30', '50'].includes(record.status)" v-permission="'chemicalWasteHandle:del'" danger type="link" @click.stop="onDel(record)">
                删除
              </a-button>
            </a-space>
          </template>
        </template>
      </IlisTable>
    </div>
  </div>
</template>

<script setup lang='ts'>
import type {
  ChemicalWasteHandleDTO,
  GetChemicalWasteHandlePageParams,
} from '../api.ts'
import type { IProcessForm } from '~/components/commonProcess'
import { message, Modal } from 'ant-design-vue'
import { ref } from 'vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper.ts'
import { ProcessModal, ProcessType } from '~/components/commonProcess'
import { CustomAttribute } from '~/components/customAttribute'
import { useDateRangePickerHooks } from '~/hooks/useDatePickerHooks.ts'
import { useTableHeight } from '~/hooks/useTableHeight'
import { useTableHooks } from '~/hooks/useTableHooks'
import { PrintUdrTempleteType } from '~/utils/IlisPrintUdr.ts'
import { handleStatusDict } from '~/views/chemical/waste/handle'
import { ChemicalWasteHandleEntity } from '~/views/chemical/waste/handle/ChemicalWasteHandleEntity.ts'
import RecallModal from '~/views/chemical/waste/handle/components/RecallModal.vue'
import { useWasteRegHooks } from '~/views/chemical/waste/reg/useWasteRegHooks.ts'
import {
  chemicalWasteHandleSubmit,
  delDetail,
  exportChemicalWasteHandle,
  getChemicalWasteHandlePage,
} from '../api.ts'
import CreateForm from './CreateForm.vue'

const { tableHeight, tableBoxRef } = useTableHeight()

const exportLoading = ref(false)

const queryForm = ref<GetChemicalWasteHandlePageParams>({})

const { wasteTypeList, getWasteTypeText } = useWasteRegHooks()

const [createDate] = useDateRangePickerHooks((val) => {
  queryForm.value.startDate = val[0] || ''
  queryForm.value.endDate = val[1] || ''
})

const {
  loading,
  customColumns,
  dataSource,
  getPagination,
  handleSearch,
  handleReloadTable,
  handleSortChange,
} = useTableHooks<ChemicalWasteHandleEntity>({
  api: getChemicalWasteHandlePage,
  customType: 'chemicalWasteMaterialHandle',
  query: queryForm,
  responseDataTransform: (res) => {
    const rows = res.rows

    return {
      rows,
      total: res.count,
    }
  },
})

function onReset() {
  queryForm.value = {}
  createDate.value = []
  handleSearch()
}

function onAdd() {
  AnyDialogHelper.showModel(CreateForm, {}).then(() => handleReloadTable())
}

function onEdit(record: ChemicalWasteHandleDTO) {
  AnyDialogHelper.showModel(CreateForm, {
    id: record.id,
  }).then(() => handleReloadTable())
}

function onCheck(record: ChemicalWasteHandleDTO) {
  AnyDialogHelper.showModel(CreateForm, {
    id: record.id,
    isDetail: true,
  }).then(() => handleReloadTable())
}

async function onSubmit(record: ChemicalWasteHandleDTO) {
  const propParam: IProcessForm = {
    processType: ProcessType.CHEMICAL_WASTE_HANDLE,
    processId: record.id,
    hideRemark: true,
    submitAuditApi: (data) => {
      return chemicalWasteHandleSubmit(record.id, data)
    },
    submitDataTransfer: (data) => {
      const params = {
        formPropertyJson: data.formPropertyJson,
        presetAuditers: data.presetAuditers,
      }
      return params
    },
  }
  await AnyDialogHelper.showModel(ProcessModal, propParam)
  message.success('提交成功')
  handleSearch()
}

function onRecall(record: ChemicalWasteHandleDTO) {
  AnyDialogHelper.showModel(RecallModal, {
    record: {
      ...record,
      typeText: getWasteTypeText(record.type),
    },
  }).then(() => handleReloadTable())
}

function onPrint(record: ChemicalWasteHandleDTO) {
  const print = new IlisPrintUdr()
  print.commonPrint([record.id], PrintUdrTempleteType.废物处置打印)
}

function onDel(record: ChemicalWasteHandleDTO) {
  Modal.confirm({
    title: '您正在删除废物处置申请！',
    content: `删除后无法恢复，您确定要删除${record.name}（${getWasteTypeText(record.type)}）的处置申请吗？`,
    onOk: async () => {
      await delDetail(record.id)
      message.success('操作成功！')
      handleSearch()
    },
  })
}

async function onExport() {
  exportLoading.value = true
  const res = await exportChemicalWasteHandle(queryForm.value).finally(() => {
    exportLoading.value = false
  })

  if (res.code !== 20010) {
    await downloader.excute(res.data, '化学废物处置.xlsx')
    message.success('导出成功！')
  }
  else {
    Modal.warning({
      title: '提示',
      content: res.message,
    })
  }
}
</script>
