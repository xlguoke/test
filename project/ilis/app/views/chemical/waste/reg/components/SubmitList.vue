<template>
  <div class="flex flex-col h-full">
    <a-space>
      <a-range-picker v-model:value="createDate" :value-format="EDateFormatType.YYYY_MM_DD" :placeholder="['开始提交日期', '结束提交日期']" />
      <a-select v-model:value="queryForm.type" allow-clear :options="wasteTypeList" class="w-[200px]" placeholder="废物类型"></a-select>
      <a-select v-model:value="queryForm.handleStatus" allow-clear :options="handleStatusDict" class="w-[200px]" placeholder="状态"></a-select>
      <a-input v-model:value.trim="queryForm.quickQry" class="w-[220px]" placeholder="请输入功能室名称查询" :maxlength="100" />

      <a-button type="primary" @click="handleSearch()">
        查询
      </a-button>
      <a-button @click="onReset()">
        重置
      </a-button>
    </a-space>

    <a-space class="my-4">
      <IlisCustomColumns type="chemical-reg-submit" @confirm="handleReloadTable()">
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
        :entity="ChemicalWasteRegSubmitEntity"
        :custom-columns="customColumns"
        :pagination="getPagination()"
        @change="handleSortChange"
      >
        <template #bodyCell="{ record, column }">
          <template v-if="column.dataIndex === 'type'">
            {{ getWasteTypeText(record.type) }}
          </template>
          <template v-if="column.dataIndex === 'Action'">
            <a-space>
              <a-button v-permission="'chemicalWasteReg:detail'" type="link" @click.stop="onCheckDetail(record)">
                详情
              </a-button>
              <a-button v-permission="'chemicalWasteReg:print'" type="link" @click.stop="onPrintReg(record)">
                打印
              </a-button>
              <a-button v-if="record.handleStatus === '待处理'" v-permission="'chemicalWasteReg:recall'" danger type="link" @click.stop="onRecall(record)">
                撤回
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
import { useDateRangePickerHooks } from '~/hooks/useDatePickerHooks.ts'
import { useTableHeight } from '~/hooks/useTableHeight'
import { useTableHooks } from '~/hooks/useTableHooks'
import { PrintUdrTempleteType } from '~/utils/IlisPrintUdr.ts'
import { handleStatusDict, PageStatusEnum } from '~/views/chemical/waste/reg'
import { ChemicalWasteRegSubmitEntity } from '~/views/chemical/waste/reg/ChemicalWasteRegSubmitEntity.ts'
import RegisterInfo from '~/views/chemical/waste/reg/components/RegisterInfo.vue'
import { useWasteRegHooks } from '~/views/chemical/waste/reg/useWasteRegHooks.ts'
import {
  chemicalWasteSubmit,
  exportChemicalWaste,
  getChemicalWastePage,
} from '../api'

const { tableHeight, tableBoxRef } = useTableHeight()

const exportLoading = ref(false)

const queryForm = ref<GetChemicalWastePageParams>({
  status: PageStatusEnum.已提交,
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
} = useTableHooks<ChemicalWasteRegSubmitEntity>({
  api: getChemicalWastePage,
  customType: 'chemical-reg-submit',
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

function onCheckDetail(record: ChemicalWasteDTO) {
  AnyDialogHelper.showModel(RegisterInfo, {
    id: record.id,
    isDetail: true,
  })
}

function onPrintReg(record: ChemicalWasteDTO) {
  const print = new IlisPrintUdr()
  print.commonPrint(record.registrationList.map(i => i.id), PrintUdrTempleteType.废物登记打印)
}

function onRecall(record: ChemicalWasteDTO) {
  Modal.confirm({
    title: '您正在撤回废物登记记录！',
    content: '您确定要撤回当前废物登记记录？',
    onOk: async () => {
      try {
        await chemicalWasteSubmit(record.id, PageStatusEnum.待提交)
        message.success('操作成功！')
        handleSearch()
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (e) {}
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
