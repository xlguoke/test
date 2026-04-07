<template>
  <div class="change-history">
    <a-spin :spinning="spinning">
      <div class="modal-content">
        <a-select v-model:value="historyCount" style="width: 100%" @change="getChangeHistory">
          <a-select-option v-for="k in changeCount" :key="k" :value="k">第{{ k }}次更正记录</a-select-option>
        </a-select>
        <p class="detail-title">更正内容</p>
        <template v-if="changeInfo.changeData.baseInfo.length > 0">
          <p class="detail-sub-title">信息更正</p>
          <div class="change-field-box">
            <template v-for="base in changeInfo.changeData.baseInfo" :key="base.field">
              <p class="field-descript">{{ base.fieldName }}</p>
              <a-descriptions bordered size="small" :column="1">
                <!-- 委托类型 -->
                <template v-if="base.field == 'checkType'">
                  <a-descriptions-item label="更正前">{{ dictCheckType[base.beforeChange] }}</a-descriptions-item>
                  <a-descriptions-item label="更正后">{{ dictCheckType[base.afterChange] }}</a-descriptions-item>
                </template>
                <!-- 日期 -->
                <template v-else-if="datesFieldKey.includes(base.field)">
                  <a-descriptions-item label="更正前">
                    <span v-if="base.beforeChange">
                      {{ dayjs(base.beforeChange).format("YYYY-MM-DD") }}
                    </span>
                  </a-descriptions-item>
                  <a-descriptions-item label="更正后">
                    <span v-if="base.afterChange">
                      {{ dayjs(base.afterChange).format("YYYY-MM-DD") }}
                    </span>
                  </a-descriptions-item>
                </template>
                <!-- 布尔值 -->
                <template v-else-if="base.field === 'isQualified'">
                  <!-- 是否合格 -->
                  <a-descriptions-item label="更正前">
                    <span v-if="base.beforeChange">合格</span>
                    <span v-else-if="base.beforeChange === false">不合格</span>
                    <span v-else>不判定</span>
                  </a-descriptions-item>
                  <a-descriptions-item label="更正后">
                    <span v-if="base.afterChange">合格</span>
                    <span v-else-if="base.afterChange === false">不合格</span>
                    <span v-else>不判定</span>
                  </a-descriptions-item>
                </template>
                <template v-else-if="base.field === 'isTemporary'">
                  <!-- 是否临时报告 -->
                  <a-descriptions-item label="更正前">{{ base.beforeChange ? "是" : "否" }}</a-descriptions-item>
                  <a-descriptions-item label="更正后">{{ base.afterChange ? "是" : "否" }}</a-descriptions-item>
                </template>
                <!-- 附件 -->
                <template v-else-if="base.field === 'attachments'">
                  <a-descriptions-item label="更正前">
                    <FileList v-if="base.beforeChange.length > 0" :datas="base.beforeChange" list-type="text" />
                  </a-descriptions-item>
                  <a-descriptions-item label="更正后">
                    <FileList v-if="base.afterChange.length > 0" :datas="base.afterChange" list-type="text" />
                  </a-descriptions-item>
                </template>
                <!-- 文本 -->
                <template v-else>
                  <a-descriptions-item label="更正前">{{ base.beforeChange }}</a-descriptions-item>
                  <a-descriptions-item label="更正后">{{ base.afterChange }}</a-descriptions-item>
                </template>

                <template #bodyCell="{ column, record }">
                  <template v-if="record.field == 'attachments'">
                    <FileList
                      v-if="column.dataIndex === 'afterChange' && record.afterChange.length > 0"
                      :datas="record.afterChange"
                      list-type="text"
                    />
                  </template>
                </template>
              </a-descriptions>
            </template>
          </div>
        </template>
        <template v-if="changeInfo.changeData.samples.length > 0">
          <p class="detail-sub-title">样品更正</p>
          <a-table
            :data-source="changeInfo.changeData.samples"
            size="small"
            :pagination="false"
            :columns="sampleColumns"
            bordered
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'type'">
                {{ record.type || "-" }}
              </template>
              <template v-if="column.key === 'handle'">
                <a-button v-if="record.type" type="link" primary @click="openSampleDetail(record)">查看详细</a-button>
                <span v-else>-</span>
              </template>
            </template>
          </a-table>
        </template>
        <p
          v-if="changeInfo.changeData.baseInfo.length === 0 && changeInfo.changeData.samples.length === 0"
          class="no-change"
        >
          无内容变更
        </p>
        <p class="detail-title">更正理由</p>
        <a-card>{{ changeInfo.reason }}</a-card>
      </div>
    </a-spin>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from "vue"
import { useRoute, useRouter } from "vue-router"
import FileList from "@/components/fileList/index.vue"
import checkFieldChange, { CheckResultType } from "@/assets/js/checkFieldChange"
import { changeHistoryApi } from "@/api/home.api"
import { message } from "ant-design-vue"
import dayjs from "dayjs"
const router = useRouter()
const route = useRoute()
const historyCount = ref(1)
const changeCount = ref(1)
const reportId_ = ref("")
onMounted(() => {
  document.title = "更正记录"
  const { reportId, version } = route.query
  if (!version) {
    message.error("版本号不存在")
    return
  }
  reportId_.value = (reportId as any) || ""
  const count = sessionStorage.getItem("historyCount")
  historyCount.value = count ? parseInt(count) : parseInt(version as any) || 1
  changeCount.value = parseInt(version as any) || 1
  sessionStorage.removeItem("historyCount")
  getChangeHistory()
})
const spinning = ref(false)
const changeInfo = reactive<{
  reason: string
  changeData: CheckResultType
}>({
  reason: "",
  changeData: {
    isChange: false,
    baseInfo: [],
    samples: []
  }
})
// 需要格式化日期的字段
const datesFieldKey = ["consignDate", "auditTime", "testTimeBegin", "testTimeEnd", "signDate"]
// 委托类型数据字典
const dictCheckType = ref({
  consign: "委托检测",
  quality: "质量抽检",
  practiceTest: "模拟试验"
})

const sampleColumns = reactive([
  {
    title: "样品名称",
    dataIndex: "name"
  },
  {
    title: "更正类型",
    dataIndex: "type",
    key: "type",
    align: "center",
    width: 80
  },
  {
    title: "操作",
    dataIndex: "handle",
    key: "handle",
    align: "center",
    width: 80
  }
])

const getChangeHistory = () => {
  spinning.value = true
  changeHistoryApi(reportId_.value, historyCount.value).then((res: any) => {
    const prevData = JSON.parse(res[0].data)
    const nowData = JSON.parse(res[1].data)
    const changeRes = checkFieldChange(prevData, nowData)
    changeInfo.reason = res[1].reason
    changeInfo.changeData = changeRes
    spinning.value = false
  })
}

const openSampleDetail = (data) => {
  sessionStorage.setItem("sampleDetail", JSON.stringify(data))
  sessionStorage.setItem("historyCount", historyCount.value + "")
  router.push({
    path: "/phone/sampleChangeDetail"
  })
}
</script>
<style lang="less" scoped>
.no-change {
  text-align: center;
  line-height: 80px;
  color: #aaa;
}
.change-history {
  padding: 15px;
  .field-descript {
    margin: 0;
    padding: 8px;
    border: 1px solid #eee;
    border-bottom: none;
    background-color: #fafafa;
    &:not(:first-child) {
      border-top: none;
    }
  }
  :deep(.ant-descriptions-view) {
    border-radius: 0;
  }
  :deep(.ant-descriptions-item-label) {
    padding: 8px;
    width: 80px;
  }
  :deep(.ant-descriptions-item-content) {
    padding: 8px;
  }
  :deep(.ant-card) {
    min-height: 100px;
  }
  :deep(.ant-card-body) {
    padding: 10px;
  }

  .change-field-box {
    text-align: left;
    margin-bottom: 10px;
  }

  .detail-sub-title {
    margin-bottom: 5px;
    padding: 5px 10px;
    background-color: #eee;
    border-radius: 4px;
  }
}
</style>
