<template>
  <div class="h-full">
    <DataList
      :datas="dataSource"
      :total="total"
      :loading="loading"
      :selected-rows="selectedRows"
      @change="onChange"
      @load="onLoad"
      @refresh="onRefresh"
    >
      <template #dataItem="{ item }">
        <div class="text-xs">
          <div class="flex mb-1">
            <span class="mt-[2px]">委托单位：</span>
            <div class="flex-1 flex justify-between">
              <span class="flex-1 w-0 mt-[2px]">{{ item.consignUnitName }}</span>
              <van-tag type="warning" class="h-[18px] ml-1">
                {{ CONSIGN_SIGN_TYPE_DICT.getLabelByKey(item.identity) }}
              </van-tag>
            </div>
          </div>
          <div class="flex mb-1">
            <span>委托编号：</span>
            <div class="flex-1">
              {{ item.consignCode }}
            </div>
          </div>
          <div class="flex mb-1">
            <span>检测机构：</span>
            <div class="flex-1">
              {{ item.testUnitName }}
            </div>
          </div>
          <div class="flex">
            <span>项目名称：</span>
            <div class="flex-1">
              {{ item.projectName }}
            </div>
          </div>
        </div>
      </template>
      <template #right="{ item }">
        <van-button
          type="primary"
          style="height:100%"
          @click="showDetail(item as ConsignSignature)"
        >
          查看
        </van-button>
      </template>
    </DataList>

    <!-- 签名 -->
    <Signature
      v-model:show="showSignature"
      :is-attachments="isAttachments"
      :encode-phone="encodePhone"
      :sign-source="SIGNATURE_SOURCE.CONSIGN"
      @submit="submitSignature"
    />

    <!-- 短信验证 -->
    <van-dialog v-model:show="showDialog" title="短信验证" show-cancel-button :before-close="checkSmsCode">
      <div class="py-8 text-center">
        <p class="mb-2 text-xs text-gray-600">
          已向签字人员手机号发送短信验证码
        </p>
        <div class="flex items-center justify-center gap-2 text-xs">
          <input v-model="smsCode" type="text" class="p-[7px] border rounded w-26" placeholder="请输入短信验证码" />
          <van-button
            size="small"
            :disabled="countdown !== 60"
            :loading="btnLoading"
            loading-text="发送验证码"
            type="primary"
            @click="sendSms"
          >
            {{ countdown === 60 ? '发送验证码' : `${countdown}s后重新发送` }}
          </van-button>
        </div>
      </div>
    </van-dialog>

    <!-- 预览委托单 -->
    <!-- <PreviewPDF v-model:show="showConsignOrder" :file-url="consignOrderUrl" /> -->
  </div>
</template>

<script setup lang='ts'>
import { closeToast, showLoadingToast } from 'vant'
import { type ConsignSignature, checkSignCode, getConsignOrder, getConsignSignatureList, getConsignSignatureTobeList, saveConsignSignature, sendSignCode } from '../api'
import { useDatas } from '../hooks/useDatas'
import DataList from './DataList.vue'
import Signature from './Signature.vue'
// import PreviewPDF from './PreviewPDF.vue'
import type { EmitEvent, SignFiles } from './Signature.vue'
import { CONSIGN_SIGN_TYPE_DICT, SIGNATURE_SOURCE } from '~/components/onlineSignature'

interface PropData {
  status: string
  encodePhone: string
}

const props = defineProps<PropData>()
const { status, encodePhone } = toRefs(props)

const {
  showSignature,
  isAttachments,
  page,
  size,
  dataSource,
  total,
  loading,
  selectedRows,
  onLoad,
  onRefresh,
  onChange,
  openSignature,
} = useDatas<ConsignSignature>({
  status,
  dataApi: getDataApi,
  responseDataTransform: (data) => {
    data.rows.forEach((d, i) => {
      d.id = d.consignId + i
    })
    return data
  },
})

// 获取列表数据
async function getDataApi(): Promise<any> {
  if (status.value === '1') {
    const res = await getConsignSignatureTobeList(encodePhone.value)
    return {
      data: {
        rows: res.data,
        count: res.data.length,
      },
    }
  }
  return await getConsignSignatureList({
    encodePhone: encodePhone.value,
    page: page.value,
    size,
  })
}
/**
 * 查看委托单
 */
// const consignOrderUrl = ref('')
// const showConsignOrder = ref(false)
const origin = location.origin.includes('localhost') ? 'http://192.168.2.65:8080' : location.origin
const pdfjs = '/ilis2/plug-in/pdfjs/web/viewer.html'
async function showDetail(item: ConsignSignature) {
  showLoadingToast({
    forbidClick: true,
    duration: 0,
  })
  try {
    const { data } = await getConsignOrder(item.consignId)
    if (!data)
      return

    window.open(`${origin}${pdfjs}?file=${data}`)
    // consignOrderUrl.value = data
    // showConsignOrder.value = true
  }
  catch (err) {
    console.error(err)
  }
  closeToast()
}

const num = 60
const showDialog = ref(false)
const smsCode = ref('')
const countdown = ref(num)
const btnLoading = ref(false)
let timer: any = null
// 发送短信验证码
async function sendSms() {
  if (countdown.value !== num)
    return
  btnLoading.value = true
  try {
    await sendSignCode(encodePhone.value)
    countdown.value--
    btnLoading.value = false
    timer = setInterval(() => {
      countdown.value--
      if (countdown.value === 0) {
        clearInterval(timer)
        countdown.value = num
      }
    }, 1000)
  }
  catch (err) {
    console.error(err)
    btnLoading.value = false
  }
}

// 验证短信验证码
async function checkSmsCode(action: string) {
  if (action !== 'confirm') {
    return true
  }
  try {
    if (!smsCode.value) {
      showNotify({
        type: 'warning',
        message: '请输入短信验证码',
      })
      return false
    }
    await checkSignCode(encodePhone.value, smsCode.value)
    // 重置倒计时
    clearInterval(timer)
    countdown.value = num
    // 确认提交
    confirmSubmitSignature()
    return true
  }
  catch (err) {
    console.error(err)
    return false
  }
}

/**
 * ## 提交签名
 */
const signParam = ref<EmitEvent>({
  signUrl: '',
  attachments: [],
})
async function submitSignature(data: EmitEvent) {
  signParam.value = data
  smsCode.value = ''
  btnLoading.value = false
  showDialog.value = true
  nextTick(() => {
    sendSms()
  })
}

async function confirmSubmitSignature() {
  try {
    showLoadingToast({
      message: '提交中...',
      forbidClick: true,
      duration: 0,
    })
    const consignInfos = selectedRows.value.map(d => ({
      consignId: d.consignId,
      consignUnitId: d.consignUnitId,
      consignProjectId: d.projectId,
      identity: d.identity,
    }))
    await saveConsignSignature({
      consignInfos,
      signPhone: encodePhone.value,
      signUrl: signParam.value.signUrl,
      attachmentIds: isAttachments.value ? signParam.value.attachments.map((d: SignFiles) => d.id) : undefined,
    })
    showSignature.value = false
    onRefresh()
    showNotify({
      type: 'success',
      message: '签字成功',
    })
  }
  catch (err) {
    console.error(err)
  }
  closeToast()
}

defineExpose({
  openSignature,
})
</script>

<style scoped>
.van-col{
  padding: 2px 0;
}
</style>
