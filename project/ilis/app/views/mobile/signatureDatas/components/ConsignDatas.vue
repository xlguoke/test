<template>
  <div class="h-full">
    <van-notice-bar mode="closeable" color="#1989fa" background="#ecf9ff" style="margin-bottom: 8px;">
      左滑查看委托单
    </van-notice-bar>
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
          <div class="flex">
            <span>样品名称：</span>
            <div class="flex-1">
              {{ item.sample }}
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
    <van-dialog v-model:show="dialogShow" title="短信验证" show-cancel-button :before-close="checkSmsCode">
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
    <PreviewPDF v-model:show="pdfVisible" :file-url="consignOrderUrl">
      <template #footer>
        <van-button v-if="status === '2'" size="small" @click="handleConsignOrderDownload">
          下载委托单
        </van-button>
        <van-button size="small" class="min-w-16" type="primary" @click="openSignature">
          {{ status === '1' ? '签字' : '重新签字' }}
        </van-button>
      </template>
    </PreviewPDF>
  </div>
</template>

<script setup lang='ts'>
import type { ConsignSignature } from '../api'
import type { EmitEvent, SignFiles } from './Signature.vue'
import { showDialog } from 'vant'
import { CONSIGN_SIGN_TYPE_DICT, SIGNATURE_SOURCE } from '~/components/onlineSignature'
import { getBusinessParamNotAuth } from '~/utils/getBusinessParam.ts'
import { checkSignCode, getConsignOrder, getConsignSignatureList, getConsignSignatureTobeList, saveConsignSignature, sendSignCode } from '../api'
import { useDatas } from '../hooks/useDatas'
import DataList from './DataList.vue'
import PreviewPDF from './PreviewPDF.vue'
import Signature from './Signature.vue'

interface PropData {
  status: string
  encodePhone: string
}

const props = defineProps<PropData>()
const urlParam = new URLSearchParams(location.search)
const unitCode = ref(urlParam.get('u') || '')

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

// 开启提交签字进行短信验证
const enableSignSysVerification = ref(false)
getBusinessParamNotAuth('SIGN_SMS_VERIFICATION', unitCode.value).then((val) => {
  enableSignSysVerification.value = val
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
const consignOrderUrl = ref('')
const pdfVisible = ref(false)
async function showDetail(item: ConsignSignature) {
  showLoadingToast({
    forbidClick: true,
    duration: 0,
  })
  try {
    const { data } = await getConsignOrder(item.consignId)
    if (!data)
      return

    selectedRows.value = [item]
    consignOrderUrl.value = data
    pdfVisible.value = true
  }
  catch (err) {
    console.error(err)
  }
  closeToast()
}

async function downloadConsignOrder() {
  if (!selectedRows.value.length)
    return

  showLoadingToast({
    forbidClick: true,
    duration: 0,
  })

  try {
    const consignCode = selectedRows.value[0].consignCode

    // 通过接口获取文件流
    const response = await fetch(consignOrderUrl.value)
    const blob = await response.blob()

    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url

    // 设置下载属性，指定文件名
    const fileName = `${consignCode}.pdf`
    link.download = fileName

    // 触发点击事件开始下载
    document.body.appendChild(link)
    link.click()

    // 清理资源
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }
  catch (error) {
    console.error('下载失败:', error)
    showNotify({ type: 'danger', message: '下载失败' })
  }
  finally {
    closeToast()
  }
}

// 检测当前环境是否为微信浏览器
function isWechatBrowser(): boolean {
  const userAgent = navigator.userAgent.toLowerCase()
  return userAgent.includes('micromessenger')
}

// 展示微信浏览器下载引导弹窗
function showWechatDownloadGuide() {
  showDialog({
    title: '下载引导',
    message: `<div class="text-left leading-5"><div>1. 点击右上角“...”菜单</div><div>2. 选择“在浏览器中打开”</div><div>3. 在浏览器中再次点击下载按钮</div></div>`,
    allowHtml: true,
  })
}

// 主入口方法，整合环境检测和下载逻辑
function handleConsignOrderDownload() {
  if (isWechatBrowser()) {
  // 微信浏览器环境，展示下载引导
    showWechatDownloadGuide()
  }
  else {
  // 非微信浏览器环境，直接执行下载
    downloadConsignOrder()
  }
}

function openSignature() {
  const len = selectedRows.value.length
  if (len === 0) {
    showNotify({ type: 'warning', message: '请选择需要签字的数据' })
    return ''
  }
  else if (len === 1 && !pdfVisible.value) {
    showDetail(selectedRows.value[0])
  }
  else {
    showSignature.value = true
  }
}

const num = 60
const dialogShow = ref(false)
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

  if (enableSignSysVerification.value) {
    dialogShow.value = true
    nextTick(() => {
      sendSms()
    })
  }
  else {
    confirmSubmitSignature()
  }
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
      sourceFrom: 'online',
      attachmentIds: isAttachments.value ? signParam.value.attachments.map((d: SignFiles) => d.id) : undefined,
    })
    showSignature.value = false
    pdfVisible.value = false
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
