<template>
  <IlisContainer app-id="common_hum_task_ledger">
    <BaseSpinWrapper :spinning="loading">
      <IlisFormSearch
        :entity="BeingIssueEntity"
        :field-order="['signType', 'issueDateSearch', 'q']"
        @search="handleSearch"
        @reset="handleReset"
      />

      <div ref="tableBoxRef" class="flex-1 h-0">
        <IlisTable
          row-key="id"
          show-index
          :entity="BeingIssueEntity"
          :data-source="dataSource"
          :table-height="tableHeight"
          :table-width="1400"
          :pagination="getPagination()"
        >
          <template #bodyCell="{ record, column }: any">
            <template v-if="column.dataIndex === 'Action'">
              <a-button type="link" danger @click="onCancel(record)">
                撤销
              </a-button>
              <a-button type="link" @click="onCheckQrCode(record)">
                二维码
              </a-button>
            </template>
          </template>
        </IlisTable>
      </div>
    </BaseSpinWrapper>
  </IlisContainer>
</template>

<script setup lang='ts'>
import { message, Modal } from 'ant-design-vue'
import { AnyDialogHelper } from '~/anyThing/helper/AnyDialogHelper.ts'
import { BaseSpinWrapper } from '~/components/UI'
import { useTableHooks } from '~/hooks/useTableHooks'
import SignQrCodeModal from '~/views/report/issue/components/SignQrCodeModal.vue'
import { getBeingIssueList, issueCancel } from './api'
import { BeingIssueEntity } from './BeingIssueEntity'

const {
  loading,
  dataSource,
  tableBoxRef,
  tableHeight,
  handleSearch,
  handleReset,
  getPagination,
  handleReloadTable,
} = useTableHooks<BeingIssueEntity>({
  api: getBeingIssueList,
})

// 撤销
function onCancel(record: BeingIssueEntity) {
  Modal.confirm({
    title: '提示',
    content: '确认撤回吗？',
    onOk: async () => {
      await issueCancel(record.issueId)
      message.success('操作成功！')
      handleReloadTable()
    },
  })
}

// 查看二维码
function onCheckQrCode(record: BeingIssueEntity) {
  if (!record.signUserPhone) {
    Modal.info({
      title: '提示',
      content: '该数据无签字人员电话，无法查看二维码！',
    })
    return
  }

  AnyDialogHelper.showModel(SignQrCodeModal, {
    phone: record.signUserPhone,
    reportIds: [record.issueId],
  })
}
</script>
