<template>
  <!-- 期间核查详情 -->
  <div>
    <van-skeleton :row="5" class="line" :loading="loading" style="padding-top: 0.24rem">
      <div v-if="detailData" class="device-certification">
        <CommonLine label="期间核查计划：" :value="detailData.inspectPlanName" />
        <CommonLine label="核查部门：" :value="detailData.departName" />
        <CommonLine label="核查人员：" :value="detailData.personName" />
        <CommonLine label="计划执行时间：" :value="detailData.planTimes" />
        <CommonLine label="核查时间：" :value="detailData.inspectTime" />
        <CommonLine label="核查内容：" :value="detailData.inspectContent" />
        <CommonLine label="核查结果及评价：" :value="detailData.inspectResult" />
        <CommonLine label="评价人：" :value="detailData.resultPersonName" />
        <CommonLine label="说明：" :value="detailData.inspectExplain" />
        <CommonLine label="附件：">
          <template #value>
            <p
              v-for="file in detailData?.files || []"
              :key="file.attachmentId"
              class="file-item"
              @click="previewFile(file)"
            >
              {{ file.name }}
            </p>
          </template>
        </CommonLine>

        <van-popup
          v-model:show="showCenter"
          round
          :style="{ width: '100%', height: '90%' }"
          closeable
        >
          <div class="title"></div>
          <PreView v-if="showCenter" :data="{ url: showFile?.url }"></PreView>
        </van-popup>
      </div>
      <van-empty v-else description="暂无数据" :image="emptyImage" />
    </van-skeleton>
  </div>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue"
import { showImagePreview } from "vant"
import { getPeriodCheckDetail } from "@/api/deviceSmallScreen.api"
import PreView from "./PreView.vue"
import emptyImage from "@/assets/images/functionRoom2/empty.svg"
import CommonLine from "@/views/functionRoom2/components/CommonLine.vue"

interface DetailData {
  id: string
  sysCompanyCode: string
  createName: string
  createBy: string
  createDate: string
  updateName: string
  updateBy: string
  updateDate: string
  inspectPlanId: string
  inspectPlanName: string //核查计划名称
  inspectPlanDetailId: string
  equipmentId: string
  equipmentName: string
  departId: string
  departName: string //核查部门
  personId: string
  personName: string //核查人员
  planTimes: string //计划时间
  inspectTime: number //核查时间
  inspectContent: string //核查内容
  inspectResult: string //核查结果
  resultPersonId: string
  resultPersonName: string //评价人
  inspectExplain: string //说明
  status: string
  files: File[]
}

interface File {
  id: string
  sysCompanyCode: string
  createName: string
  createBy: string
  createDate: number
  updateName: null
  updateBy: null
  updateDate: null
  folderId: string
  mainEntityId: string
  name: string
  attachmentId: string
  url: string
  isDelete: string
  relationFunction: string
  relationFunctionFileType: string
  sequence: number
}

const props = defineProps<{
  id: string
}>()

const detailData = ref<DetailData>()

const showFile = ref<File>()

const showCenter = ref(false)

const loading = ref(false)

watch(
  () => props.id,
  () => {
    getList()
  },
  {
    immediate: true
  }
)

async function getList() {
  if (!props.id) return
  loading.value = true
  const { data, code } = await getPeriodCheckDetail(props.id).finally(() => {
    loading.value = false
  })
  if (code === 20000) {
    detailData.value = data
  }
}

function showPreview(url: string) {
  const images = detailData.value?.files
    .filter((item) => isImage(item.url))
    ?.map((item) => item.url)
  const startPosition = images?.findIndex((img) => img === url)
  showImagePreview({
    images: images || [],
    startPosition,
    vertical: true
  })
}

function previewFile(file: File) {
  showFile.value = file
  if (file.url.endsWith(".pdf")) {
    showCenter.value = true
  } else if (isImage(file.url)) {
    showPreview(file.url)
  } else {
    window.open(file.url)
  }
}

function isImage(url: string) {
  return (
    url.endsWith(".png") || url.endsWith(".jpeg") || url.endsWith(".jpg") || url.endsWith(".svg")
  )
}
</script>

<style lang="less" scoped>
.device-certification {
  height: 100%;

  .common-line {
    margin-bottom: 0.1rem;
  }
}
.file-item {
  color: #0066ec;
  cursor: pointer;
  margin: 4px 0;
}
</style>
