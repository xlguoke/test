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
          <div class="flex">
            <span>委托单位：</span>
            <div class="flex-1 w-0">
              {{ item.consignUnitName }}
            </div>
          </div>
          <div class="flex">
            <span>委托编号：</span>
            <div class="flex-1 w-0">
              {{ item.consignCode }}
            </div>
          </div>
          <div class="flex">
            <span>报告编号：</span>
            <div class="flex-1 w-0">
              {{ item.reportCode }}
            </div>
          </div>
          <div class="flex">
            <span>样品编号：</span>
            <div class="flex-1 w-0">
              {{ item.sampleCode }}
            </div>
          </div>
          <div class="flex">
            <span>检测机构：</span>
            <div class="flex-1 w-0">
              {{ item.testUnitName }}
            </div>
          </div>
          <div class="flex">
            <span>项目名称：</span>
            <div class="flex-1 w-0">
              {{ item.projectName }}
            </div>
          </div>
        </div>
      </template>
      <template #right="{ item }">
        <van-button
          type="primary"
          style="height:100%"
          @click="showDetail(item as ReportSignature)"
        >
          查看
        </van-button>
      </template>
    </DataList>

    <!-- 报告详情 -->
    <ReportDetail v-model:show="showReportDetail" :report-id="reportId" />

    <!-- 签名 -->
    <Signature
      v-model:show="showSignature"
      :is-attachments="false"
      :encode-phone="encodePhone"
      :sign-source="SIGNATURE_SOURCE.REPORT"
      @submit="submitSignature"
    />
  </div>
</template>

<script setup lang='ts'>
import { closeToast, showLoadingToast } from 'vant'
import { type ReportSignature, getReportSignatureList, getReportSignatureTobeList, saveReportSignature } from '../api'
import { useDatas } from '../hooks/useDatas'
import DataList from './DataList.vue'
import Signature from './Signature.vue'
import ReportDetail from './ReportDetail.vue'
import type { EmitEvent } from './Signature.vue'
import { SIGNATURE_SOURCE } from '~/components/onlineSignature'

interface PropData {
  status: string
  encodePhone: string
}

const props = defineProps<PropData>()
const { status, encodePhone } = toRefs(props)

const {
  showSignature,
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
} = useDatas<ReportSignature>({
  status,
  dataApi: getDataApi,
  responseDataTransform: (data) => {
    data.rows.forEach((d, i) => {
      d.id = d.reportId + i
    })
    return data
  },
})

async function getDataApi(): Promise<any> {
  if (status.value === '1') {
    const res = await getReportSignatureTobeList(encodePhone.value)
    return {
      data: {
        rows: res.data,
        count: res.data.length,
      },
    }
  }
  return await getReportSignatureList({
    encodePhone: encodePhone.value,
    page: page.value,
    size,
  })
}

/**
 * 查看报告信息
 */
const reportId = ref('')
const showReportDetail = ref(false)
async function showDetail(item: ReportSignature) {
  reportId.value = item.reportId
  showReportDetail.value = true
}

/**
 * ## 提交签名
 */
async function submitSignature(data: EmitEvent) {
  try {
    showLoadingToast({
      message: '提交中...',
      forbidClick: true,
      duration: 0,
    })
    await saveReportSignature({
      reportIds: selectedRows.value.map(d => d.reportId),
      signPhone: props.encodePhone,
      signUrl: data.signUrl,
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
