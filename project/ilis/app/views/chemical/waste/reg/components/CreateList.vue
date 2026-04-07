<template>
  <div class="flex flex-col h-full">
    <a-space>
      <a-range-picker v-model:value="createDate" :value-format="EDateFormatType.YYYY_MM_DD" :placeholder="['开始创建日期', '结束创建日期']" />
      <a-select v-model:value="queryForm.type" allow-clear :options="wasteTypeList" class="w-[200px]" placeholder="废物类型"></a-select>
      <a-input v-model:value.trim="queryForm.quickQry" class="w-[220px]" placeholder="请输入功能室名称查询" :maxlength="100" />

      <a-button type="primary" @click="handleSearch()">
        查询
      </a-button>
      <a-button @click="onReset()">
        重置
      </a-button>
    </a-space>

    <a-space class="my-4">
      <a-button v-permission="'chemicalWasteReg:add'" type="primary" @click="onAdd">
        新增记录
      </a-button>
      <a-button v-permission="'chemicalWasteReg:scan'" @click="onScanReg">
        扫码登记
      </a-button>
      <a-button v-permission="'chemicalWasteReg:batchDel'" @click="onBatchDel">
        删除
      </a-button>
      <CustomAttribute v-permission="'chemicalWasteReg:customField'" customize-type="chemicalWasteMaterial" @save="handleReloadTable" />
      <IlisCustomColumns type="chemical-reg-create" @confirm="handleReloadTable()">
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
        :entity="ChemicalWasteRegCreateEntity"
        :custom-columns="customColumns"
        :pagination="getPagination()"
        :row-selection="getRowSelection()"
        @change="handleSortChange"
      >
        <template #bodyCell="{ record, column }">
          <template v-if="column.dataIndex === 'type'">
            {{ getWasteTypeText(record.type) }}
          </template>
          <template v-if="column.dataIndex === 'fluid'">
            {{ record.fluid ? '是' : '否' }}
          </template>
          <template v-if="column.dataIndex === 'phValue'">
            {{ record.phValue }}
          </template>
          <template v-if="column.dataIndex === 'Action'">
            <a-space>
              <a-button v-permission="'chemicalWasteReg:edit'" type="link" @click.stop="onEdit(record)">
                编辑
              </a-button>
              <a-button v-permission="'chemicalWasteReg:register'" type="link" @click.stop="onRegister(record)">
                登记
              </a-button>
              <a-button v-permission="'chemicalWasteReg:submit'" type="link" @click.stop="onSubmit(record)">
                提交
              </a-button>
              <a-button v-permission="'chemicalWasteReg:del'" danger type="link" @click.stop="onDel(record)">
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
  ChemicalWasteDTO,
  GetChemicalWastePageParams,
} from '../api'
import { message, Modal } from 'ant-design-vue'
import { ref } from 'vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper.ts'
import { CustomAttribute } from '~/components/customAttribute'
import { useDateRangePickerHooks } from '~/hooks/useDatePickerHooks.ts'
import { useTableHeight } from '~/hooks/useTableHeight'
import { useTableHooks } from '~/hooks/useTableHooks'
import { PrintUdrTempleteType } from '~/utils/IlisPrintUdr.ts'
import { PageStatusEnum } from '~/views/chemical/waste/reg'
import { ChemicalWasteRegCreateEntity } from '~/views/chemical/waste/reg/ChemicalWasteRegCreateEntity.ts'
import RegisterInfo from '~/views/chemical/waste/reg/components/RegisterInfo.vue'
import ScanRegister from '~/views/chemical/waste/reg/components/ScanRegister.vue'
import { useWasteRegHooks } from '~/views/chemical/waste/reg/useWasteRegHooks.ts'
import {
  batchDelDetail,
  chemicalWasteSubmit,
  delDetail,
  exportChemicalWaste,
  getChemicalWastePage,
} from '../api'
import CreateForm from './CreateForm.vue'

const { tableHeight, tableBoxRef } = useTableHeight()

const exportLoading = ref(false)

const queryForm = ref<GetChemicalWastePageParams>({
  status: PageStatusEnum.待提交,
})

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
  selectedRowKeys,
  getRowSelection,
} = useTableHooks<ChemicalWasteRegCreateEntity>({
  api: getChemicalWastePage,
  customType: 'chemical-reg-create',
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
  queryForm.value = {
    status: queryForm.value.status,
  }
  createDate.value = []
  handleSearch()
}

function onAdd() {
  AnyDialogHelper.showModel(CreateForm, {
    status: queryForm.value.status,
  }).then(() => handleReloadTable())
}

function onScanReg() {
  AnyDialogHelper.showModel(ScanRegister, {}).then(() => handleReloadTable())
}

function onEdit(record: ChemicalWasteDTO) {
  AnyDialogHelper.showModel(CreateForm, {
    id: record.id,
  }).then(() => handleReloadTable())
}

function onRegister(record: ChemicalWasteDTO) {
  AnyDialogHelper.showModel(RegisterInfo, {
    id: record.id,
  }).then(() => handleReloadTable())
}

function onSubmit(record: ChemicalWasteDTO) {
  const { laboratoryName, phValue } = record
  const typeText = getWasteTypeText(record.type)

  if (record.fluid && !isDefined(record.phValue)) {
    Modal.error({
      title: '请填写PH值！',
      content: `当前${laboratoryName}的${typeText}登记记录，PH值为空，无法提交！`,
    })
    return
  }

  Modal.confirm({
    title: record.fluid ? '请确认废液PH值！' : '您正在提交废物登记记录',
    content: record.fluid ? `您确定要提交${laboratoryName}的${typeText}，PH值为${phValue}的登记记录？` : `您确定要提交${laboratoryName}的${typeText}登记记录？`,
    onOk: async () => {
      try {
        await chemicalWasteSubmit(record.id, PageStatusEnum.已提交)
        message.success('提交成功!')
        handleSearch()

        Modal.confirm({
          title: '提示',
          content: '是否立即打印登记表？',
          onOk: async () => {
            new IlisPrintUdr().commonPrint(
              record.registrationList.map(i => i.id),
              PrintUdrTempleteType.废物登记打印,
            )
          },
        })
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (e) {}
    },
  })
}

function onDel(record: ChemicalWasteDTO) {
  Modal.confirm({
    title: '您正在删除废物登记记录！',
    content: '删除后将无法恢复，您确定要删除当前或已选择的废物登记记录？',
    onOk: async () => {
      await delDetail(record.id)
      message.success('操作成功！')
      handleSearch()
    },
  })
}

function onBatchDel() {
  if (!selectedRowKeys.value.length) {
    Modal.warning({
      title: '提示',
      content: '请选择至少一条记录！',
    })
    return
  }

  Modal.confirm({
    title: '您正在删除废物登记记录！',
    content: '删除后将无法恢复，您确定要删除当前或已选择的废物登记记录？',
    onOk: async () => {
      await batchDelDetail(selectedRowKeys.value as string[])
      message.success('操作成功！')
      handleSearch()
    },
  })
}

async function onExport() {
  exportLoading.value = true
  const res = await exportChemicalWaste(queryForm.value).finally(() => {
    exportLoading.value = false
  })

  if (res.code !== 20010) {
    await downloader.excute(res.data, '化学废物登记.xlsx')
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
