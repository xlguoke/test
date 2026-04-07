<template>
  <IlisContainer app-id="sample_send_manage">
    <div class=" h-full flex flex-col gap-3">
      <IlisFormSearch
        :entity="SampleSendEntity"
        :label-col="{
          style: { width: '120px' },
        }"
        @reset="handleReset"
        @search="handleSearch"
      >
        <template #requestDeliveryTimeSearch="{ data }">
          <IlisInput
            v-model="data.requestDeliveryTimeSearch"
            class="w-full"
            show-time
            field="requestDeliveryTimeSearch"
            :entity="SampleSendEntity"
          />
        </template>
      </IlisFormSearch>
      <a-space>
        <a-button :icon="h(PlusOutlined)" @click="handleAdd">
          智能送样
        </a-button>
        <a-button :icon="h(CheckCircleOutlined)" @click="handleConfirm(selectedRows)">
          送达确认
        </a-button>
        <a-button :icon="h(CloseCircleOutlined)" @click="handleCancel(selectedRows)">
          取消送样
        </a-button>
      </a-space>
      <div ref="tableBoxRef" class="flex-1 h-0">
        <IlisTable
          row-key="id"
          show-index
          :loading="loading"
          :data-source="dataSource"
          :entity="SampleSendEntity"
          :table-height="tableHeight"
          :custom-row="getCustomRow()"
          :pagination="getPagination()"
          :row-selection="getRowSelection()"
          :field-order="[
            'taskType',
            'samplingTaskCode',
            'taskCode',
            'objectName',
            'objectCode',
            'labName',
            'requestDeliveryTime',
            'samplingTaskStatus',
            'positionCode',
            'operator',
          ]"
          @change="handleSortChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'operation'">
              <a-button
                v-if="[
                  SampleSendStatusMine.CREATED,
                  SampleSendStatusMine.PENDING,
                ].includes(record.status)"
                type="link"
                @click="handleCancel([record as SampleSendEntity])"
              >
                取消送样
              </a-button>
              <a-button
                v-if="[
                  SampleSendStatusMine.PENDING,
                ].includes(record.status)"
                :loading="confirmLoading"
                type="link" @click="handleConfirm([record as SampleSendEntity])"
              >
                送达确认
              </a-button>
              <a-button
                type="link"
                @click="AnyDialogHelper.showModel(LogModalByApi, { id: record.id, logType: '43' })"
              >
                进度跟踪
              </a-button>
            </template>
          </template>
        </IlisTable>
      </div>
    </div>
  </IlisContainer>
</template>

<script setup lang='ts'>
import { CheckCircleOutlined, CloseCircleOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import IlisInput from '~/anyThing/components/input/Index.vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import LogModalByApi from '~/components/commonSystemLog/LogModalByApi.vue'
import { useTableHooks } from '~/hooks/useTableHooks'
// import DialogDemo from './DialogDemo.vue'
import { cancelSampleSendTask, confirmSampleSendTask, getSampleSendList } from './api'
// import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper'
import Add from './components/Add.vue'
import { SampleSendEntity, SampleSendStatusMine } from './SampleSendEntity'

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
  handleReloadTable,
  handleSortChange,
} = useTableHooks<SampleSendEntity>({
  api: getSampleSendList,
})

const confirmLoading = ref(false)

async function handleAdd() {
  await AnyDialogHelper.showModel(Add, { canChooseTask: true })
  handleReloadTable()
}

async function handleCancel(rows: SampleSendEntity[]) {
  if (!rows.length) {
    message.warning('请选择要取消的送样任务')
    return
  }
  Modal.confirm({
    title: '取消送样',
    centered: true,
    content: `确定要取消送样任务【${rows.map(item => item.samplingTaskCode).join('、')}】吗？`,
    onOk: async () => {
      try {
        await cancelSampleSendTask(rows)
        message.success('操作成功')
        handleReloadTable()
      }
      catch (error) {
        console.error(error)
      }
    },
  })
}

async function handleConfirm(rows: SampleSendEntity[]) {
  if (!rows.length) {
    message.warning('请选择要确认的送样任务')
    return
  }
  confirmLoading.value = true
  const { data } = await confirmSampleSendTask(rows).finally(() => {
    confirmLoading.value = false
  })
  message.success('操作成功')
  setTimeout(() => {
    if (data.data && data.data?.length === 1) {
      window.open(data.data[0] as unknown as string, '_blank')
    }
  }, 500)
  handleReloadTable()
}
</script>

<style>

</style>
