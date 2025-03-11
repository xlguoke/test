<template>
  <AppProvider>
    <a-card style="width: 100%">
      <a-space direction="vertical" style="width: 100%;">
        <!-- 搜索栏 -  -->
        <div class="search">
          <a-form
            ref="formRef"
            :model="formState"
            layout="inline"
            @submit="handleSearch"
          >
            <a-form-item name="quickQryParam">
              <a-input
                v-model:value="formState.quickQryParam"
                style="width: 330px;"
                placeholder="请输入检校单位或者登记人员"
                allow-clear
              />
            </a-form-item>
            <a-form-item name="timeRange">
              <a-range-picker
                v-model:value="formState.timeRange"
                :placeholder="['送检日期开始', '送检日期结束']"
                value-format="YYYY-MM-DD"
              />
            </a-form-item>
            <a-form-item>
              <a-space>
                <a-button type="primary" html-type="submit">
                  查询
                </a-button>
                <a-button @click="handleReset">
                  重置
                </a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </div>
        <!-- 操作按钮 -->
        <a-space>
          <a-button type="primary" @click="handleEdit({} as CheckSendEntity)">
            新增登记
          </a-button>
          <a-button @click="handleProcess(selectedRows)">
            提交确认
          </a-button>
        </a-space>
        <a-table
          row-key="id"
          :data-source="dataSource"
          :columns="columns"
          :loading="loading"
          :pagination="getPagination()"
          :row-selection="getRowSelection()"
          :scroll="{
            x: '1400px',
          }"
        >
          <template #bodyCell="{ column, record, text }">
            <template v-if="column.dataIndex === 'status'">
              <span class=" inline-block w-2 h-2 rounded mr-1" :style="{ backgroundColor: CheckSendStatusDict.getColorByKey(text) }" />
              <span :style="{ color: CheckSendStatusDict.getColorByKey(text) }">{{ CheckSendStatusDict.getLabelByKey(text) }}</span>
            </template>
            <template v-if="column.dataIndex === 'operation'">
              <a-space size="small">
                <a-button
                  v-if="record.status === CheckSendStatus.WAIT_SEND || record.status === CheckSendStatus.SEND_FAIL"
                  type="link"
                  size="small"
                  @click="handleEdit(record as CheckSendEntity)"
                >
                  编辑
                </a-button>
                <a-button
                  v-else
                  type="link"
                  size="small"
                  @click="handleEdit(record as CheckSendEntity, true)"
                >
                  查看
                </a-button>
                <a-button
                  v-if="record.status === CheckSendStatus.WAIT_SEND || record.status === CheckSendStatus.SEND_FAIL"
                  type="link"
                  size="small"
                  @click="handleProcess([record] as CheckSendEntity[])"
                >
                  审批
                </a-button>
                <a-button
                  v-if="record.status === CheckSendStatus.WAIT_SEND || record.status === CheckSendStatus.SEND_FAIL"
                  type="link"
                  size="small"
                  @click="handleDelete([record] as CheckSendEntity[])"
                >
                  删除
                </a-button>
                <a-button
                  type="link"
                  size="small"
                  @click="handleLog(record as CheckSendEntity)"
                >
                  日志
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-space>
    </a-card>
    <!-- 提交审批弹窗 -->
    <a-modal
      v-model:open="showProcess"
      centered
      width="500px"
      title="提交审核"
      :body-style="{ height: '400px', overflowY: 'auto' }"
      :keyboard="false"
      :mask-closable="false"
      :confirm-loading="processLoading"
      @ok="handleSubmitProcess()"
    >
      <ProcessForm
        ref="processFormRef"
        :process-type="ProcessType.EQ_CHECK_SEND"
        :label-col="{ style: { width: '100px' } }"
      />
    </a-modal>
    <EditVue
      v-model:show="showEdit"
      :data="currentEdit"
      :is-detail="isDetail"
      @confirm="getList()"
    />
    <ImportVue v-model:show="showImport" @confirm="getList()" />
    <LogModal :id="logId" v-model:show="showLog" log-type="286" />
  </AppProvider>
</template>

<script lang="ts" setup>
import { Modal, message } from 'ant-design-vue'
import { createVNode } from 'vue'
import { ExclamationCircleOutlined } from '@ant-design/icons-vue'
import { deleteCheckSend, getCheckSendPage, submitPlanAudit } from './api'
import EditVue from './component/Edit.vue'
import { type CheckSendEntity, CheckSendStatus, CheckSendStatusDict, columns } from './index'
import { useTableHooks } from '~/hooks/useTableHooks'
import ProcessForm from '~/components/commonProcess/ProcessForm.vue'
import { preSubmitProcess } from '~/components/commonProcess/api'
import { ProcessType } from '~/components/commonProcess'
import LogModal from '~/components/commonSystemLog/LogModal.vue'

const formRef = ref()

const formState = ref({
  quickQryParam: '',
  timeRange: undefined,
})

const {
  loading,
  dataSource,
  selectedRows,
  getList,
  getPagination,
  getRowSelection,
  handleSearch,
  handleReset,
} = useTableHooks<CheckSendEntity>({
  api: getCheckSendPage,
  formRef,
  query: formState,
  sizeKey: 'rows',
})

const showEdit = ref(false)

const showImport = ref(false)

const showProcess = ref(false)

const showLog = ref(false)

const currentEdit = ref<CheckSendEntity>()

const currentProcess = ref<CheckSendEntity[]>([])

const isDetail = ref(false)

const processFormRef = ref()

const logId = ref('')

const processLoading = ref(false)

/**
 * 编辑
 */
function handleEdit(row: CheckSendEntity, detail?: boolean) {
  currentEdit.value = row
  showEdit.value = true
  isDetail.value = !!detail
}

/**
 * 打开审批弹窗
 */
async function handleProcess(rows: CheckSendEntity[]) {
  if (!rows.length) {
    return message.warning('请选择要操作的数据')
  }
  if (rows.some(item => (item.status !== CheckSendStatus.WAIT_SEND && item.status !== CheckSendStatus.SEND_FAIL))) {
    return message.error('只能选择未送检或送检失败的进行提交确认')
  }
  currentProcess.value = rows
  const { data } = await preSubmitProcess(ProcessType.EQ_CHECK_SEND, rows.map(item => item.id).join(','))
  if (data.haveProcess) {
    showProcess.value = true
    return
  }
  message.success('提交成功')
  getList()
}

/**
 * 提交审批
 */
async function handleSubmitProcess() {
  processLoading.value = true
  try {
    const data = await processFormRef.value.getProcessFormData()
    data.id = currentProcess.value.map(item => item.id).join(',')
    data.presetAuditers = JSON.stringify(data.presetAuditers)
    data.formPropertyJson = JSON.stringify(data.formPropertyJson)
    await submitPlanAudit(data)
    message.success('提交成功')
    getList()
    processLoading.value = false
    showProcess.value = false
  }
  catch (error) {
    processLoading.value = false
    throw error
  }
}

/**
 * 查看日志
 */
function handleLog(row: CheckSendEntity) {
  logId.value = row.id
  showLog.value = true
}

/**
 * 删除
 */
function handleDelete(rows: CheckSendEntity[]) {
  if (rows.length === 0) {
    return message.warning('请选择要操作的数据')
  }
  Modal.confirm({
    title: rows.length > 1 ? '确认要删除该数据吗?' : '确认要将选中的数据删除吗?',
    icon: createVNode(ExclamationCircleOutlined),
    content: '删除后数据无法恢复',
    okText: '确认',
    okType: 'danger',
    cancelText: '取消',
    async onOk() {
      await deleteCheckSend(rows)
      message.success('删除成功')
      getList()
    },
  })
}
</script>
