<template>
  <HtModal
    v-model:open="internalOpen"
    title="邀请详情"
    width="80vw"
    :confirm-loading="loading"
    :after-close="onClosed"
  >
    <template #footer>
      <a-button @click="internalOpen = false">
        关闭
      </a-button>
    </template>
    <a-spin :spinning="loading">
      <BaseTitle>基础设置</BaseTitle>
      <a-row class=" p-3 bg-[#e5f3ff] rounded  gap-y-3 mb-3">
        <a-col :span="12">
          问卷名称：<BaseText>{{ initData.name }}</BaseText>
        </a-col>
        <a-col :span="12">
          邀请方式：<BaseText>{{ EvaluateInvTypeDict.getLabelByKey(initData.type) }}</BaseText>
        </a-col>
        <a-col :span="12">
          结束日期：<BaseText>{{ AnyDateTimeHelper.format(initData.dueTime || '', EDateFormatType.YYYY_MM_DD) }}</BaseText>
        </a-col>
        <a-col :span="12">
          邀请状态：<BaseText>{{ EvaluateInvStatusDict.getLabelByKey(initData.status) }}</BaseText>
        </a-col>
      </a-row>
      <BaseTitle>人员列表</BaseTitle>
      <a-space direction="vertical" style="width: 100%;">
        <IlisFormSearch
          :entity="EvaluateInvUserEntity"
          :field-order="['status', 'quickQry']"
          @reset="handleReset"
          @search="handleSearch"
        />
        <a-space>
          <a-button @click="handleDownload">
            下载链接
          </a-button>
          <a-button
            v-if="initData.type === EvaluateInvType.SMS"
            :loading="sendSMSLoading"
            @click="handleReSendAll"
          >
            {{ '重发短信' }}
          </a-button>
        </a-space>
        <IlisTable
          show-index
          row-key="id"
          :entity="EvaluateInvUserEntity"
          :data-source="dataSource"
          :pagination="getPagination()"
          :row-selection="getRowSelection()"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'operation'">
              <a-button
                type="link"
                size="small"
                @click="handleCopyLink(record as EvaluateInvUserEntity)"
              >
                复制链接
              </a-button>
              <a-button
                v-if="initData.type === EvaluateInvType.SMS "
                type="link"
                size="small"
                :disabled="!!countDownMap[record.id]"
                @click="handleReSend(record as EvaluateInvUserEntity)"
              >
                {{ !countDownMap[record.id] ? '重发短信' : `重发短信 ${countDownMap[record.id]}s` }}
              </a-button>
            </template>
          </template>
        </IlisTable>
      </a-space>
    </a-spin>
  </HtModal>
</template>

<script lang="ts" setup>
import { message } from 'ant-design-vue'
import { type EvaluateInvEntity, EvaluateInvStatusDict, EvaluateInvType, EvaluateInvTypeDict } from '../EvaluateInvEntity'
import { EvaluateInvUserEntity } from '../EvaluateInvUserEntity'
import { getEvaluateInvDetail, getLink, sendEvaluateSMS, sendSMS } from '../api'
import { useLocalTableHooks } from '~/hooks/useLocalTableHooks'
import { IlisFormSearch, IlisTable } from '~/components/ilisComponent'
import { BaseText, BaseTitle } from '~/components/UI'
import type { IDialogPropsParam } from '~/anyThing/interface/IDialogProps'
import { useCountDownStore } from '~/store/countDownStore'

const props = defineProps<IDialogPropsParam<null, EvaluateInvEntity>>()

const loading = ref(false)

const internalOpen = ref(false)

const initData = ref(props.param)

const selUser = ref<EvaluateInvUserEntity[]>([])

const copyLoading = ref(false)

const sendSMSLoading = ref(false)

const { copy } = useClipboard()

const countStore = useCountDownStore()

const { countDownMap } = storeToRefs(countStore)

const {
  dataSource,
  getList,
  selectedRowKeys,
  getPagination,
  getRowSelection,
  handleSearch,
  handleReset,
} = useLocalTableHooks<EvaluateInvUserEntity>({
  dataSource: selUser,
  immediate: false,
  quickQueryMap: ['quickQry', ['consignUnitName', 'sampleSenderName', 'contactPhone']],
})

async function handleReSend(row: EvaluateInvUserEntity) {
  countStore.startCountDown(row.id.toString(), 60)
  await sendSMS(row)
  message.success('发送成功')
}

async function handleReSendAll() {
  sendSMSLoading.value = true
  const sendKey = Object.keys(countDownMap.value)
  if (selectedRowKeys.value?.length) {
    if (selectedRowKeys.value.some((d: any) => sendKey.includes(d))) {
      sendSMSLoading.value = false
      return message.warning('选中项有已发送短信人员，请重新选择')
    }
    await Promise.all(
      selectedRowKeys.value.map(async (id) => {
        countStore.startCountDown(id.toString(), 60)
        await sendSMS(EvaluateInvUserEntity.fromJSON({ id }))
      }),
    ).finally(() => {
      sendSMSLoading.value = false
    })
    message.success('发送成功')
    selectedRowKeys.value = []
  }
  else {
    await sendEvaluateSMS(initData.value).finally(() => {
      sendSMSLoading.value = false
    })
    message.success('发送成功')
  }
}

async function handleCopyLink(record: EvaluateInvUserEntity) {
  copyLoading.value = true
  const { data } = await getLink(record).finally(() => {
    copyLoading.value = false
  })
  copy(data)
  message.success('复制成功')
}

function handleDownload() {
  if (selectedRowKeys.value?.length) {
    window.open(`${import.meta.env.VITE_ILIS_BASE}/rest/evaluate/inv/link?ids=${selectedRowKeys.value?.join(',')}`)
  }
  else {
    window.open(`${import.meta.env.VITE_ILIS_BASE}/rest/evaluate/inv/${initData.value.id}/export/link`)
  }
}

async function init() {
  loading.value = true
  const { data } = await getEvaluateInvDetail(props.param)
    .finally(() => { loading.value = false })
  selUser.value = data.userList
  initData.value = data
  getList()
}

init()

onMounted(() => {
  internalOpen.value = true
})
</script>
