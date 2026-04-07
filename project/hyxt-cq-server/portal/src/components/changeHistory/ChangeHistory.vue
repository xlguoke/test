<template>
  <a-modal v-model:visible="visible" title="更正记录" width="800px">
    <template #footer>
      <a-button type="primary" @click="visible = false">关闭</a-button>
    </template>
    <a-spin :spinning="spinning">
      <div class="modal-content">
        <a-select v-model:value="historyCount" style="width: 100%" @change="selrecordFun">
            <a-select-option v-for="(item, index) in recordData" :key="item.id" :value="item.id">
              第{{ index + 1 }}次变更记录
            </a-select-option>
          </a-select>
        <!-- <p class="module-title">人员/时间</p>
        <a-row :gutter="50">
          <a-col :span="12">
            <div class="inline-form">
              <span class="label">更正人员：</span>
              <a-input v-model:value="changeInfo.person" disabled />
            </div>
          </a-col>
          <a-col :span="12">
            <div class="inline-form">
              <span class="label">更正时间：</span>
              <a-input v-model:value="changeInfo.date" disabled />
            </div>
          </a-col>
        </a-row> -->
        <p class="module-title">更正内容</p>
        <a-table
          :data-source="changeInfo.changeData.baseInfo"
          size="small"
          :columns="baseColumns"
          :pagination="false"
          bordered
        >
          <template #bodyCell="{ column, record }">
            <!-- 委托类型 -->
            <template v-if="record.field == 'checkType'">
              <span v-if="column.dataIndex === 'beforeChange'">
                {{ dictCheckType[record.beforeChange] }}
              </span>
              <span v-if="column.dataIndex === 'afterChange'">
                {{ dictCheckType[record.afterChange] }}
              </span>
            </template>
            <!-- 日期 -->
            <template v-else-if="datesFieldKey.includes(record.field)">
              <span v-if="column.dataIndex === 'beforeChange' && record.beforeChange">
                {{ dayjs(record.beforeChange).format("YYYY-MM-DD") }}
              </span>
              <span v-if="column.dataIndex === 'afterChange' && record.afterChange">
                {{ dayjs(record.afterChange).format("YYYY-MM-DD") }}
              </span>
            </template>
            <!-- 布尔值 -->
            <template v-else-if="record.field === 'isQualified'">
              <!-- 是否合格 -->
              <span v-if="column.dataIndex === 'beforeChange'">
                <span v-if="record.beforeChange">合格</span>
                <span v-else-if="record.beforeChange === false">不合格</span>
                <span v-else>不判定</span>
              </span>
              <span v-if="column.dataIndex === 'afterChange'">
                <span v-if="record.afterChange">合格</span>
                <span v-else-if="record.afterChange === false">不合格</span>
                <span v-else>不判定</span>
              </span>
            </template>
            <template v-else-if="record.field === 'isTemporary'">
              <!-- 是否临时报告 -->
              <span v-if="column.dataIndex === 'beforeChange'">
                {{ record.beforeChange ? "是" : "否" }}
              </span>
              <span v-if="column.dataIndex === 'afterChange'">
                {{ record.afterChange ? "是" : "否" }}
              </span>
            </template>
            <!-- 附件 -->
            <template v-else-if="record.field == 'attachments'">
              <FileList
                v-if="column.dataIndex === 'beforeChange' && record.beforeChange.length > 0"
                :datas="record.beforeChange"
                list-type="text"
              />
              <FileList
                v-if="column.dataIndex === 'afterChange' && record.afterChange.length > 0"
                :datas="record.afterChange"
                list-type="text"
              />
            </template>
          </template>
        </a-table>
        <br />
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
        <p class="module-title">更正理由</p>
        <a-card :rows="4" disabled>{{ changeInfo.reason }}</a-card>
      </div>
    </a-spin>
  </a-modal>

  <!-- 样品变更详情 -->
  <DetailSampleForm ref="detailSampleForm" :base-columns="baseColumns" :is-change="isChangeSample" />
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from "vue"
import dayjs from "dayjs"
import {getHistoryByVersion } from "@/api/home.api"
import DetailSampleForm from "./DetailSampleForm.vue"
import checkFieldChange, { CheckResultType } from "@/assets/js/checkFieldChange"
import FileList from "@/components/fileList/index.vue"

const spinning = ref(false)
const visible = ref(false)
const reportId = ref("")
const historyCount = ref(1)
const changeCount = ref(1)
const openModal = (id: string, version: number) => {
  reportId.value = id
  changeCount.value = version - 1
  historyCount.value = version - 1
  visible.value = true
  getChangeDatas()
}

defineExpose({
  openModal
})

// 需要格式化日期的字段
const datesFieldKey = ["consignDate", "auditTime", "testTimeBegin", "testTimeEnd", "signDate"]
// 委托类型数据字典
const dictCheckType = ref({
  consign: "委托检测",
  quality: "质量抽检",
  practiceTest: "模拟试验"
})

const baseColumns = reactive([
  {
    title: "信息更正",
    align: "left",
    children: [
      {
        title: "信息名称",
        dataIndex: "fieldName"
      },
      {
        title: "更正前",
        dataIndex: "beforeChange"
      },
      {
        title: "更正后",
        dataIndex: "afterChange"
      }
    ]
  }
])
const sampleColumns = reactive([
  {
    title: "样品更正",
    align: "left",
    children: [
      {
        title: "样品名称",
        dataIndex: "name"
      },
      {
        title: "更正类型",
        dataIndex: "type",
        key: "type"
      },
      {
        title: "操作",
        dataIndex: "handle",
        key: "handle",
        width: 100
      }
    ]
  }
])

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
let versionAll: any = ref([])
let recordData: any = ref([])
const getChangeDatas = async () => {
  spinning.value = true
  let res = await getHistoryByVersion(reportId.value)
  versionAll.value = res
  recordData.value = res.filter((it) => {
    return it.type == "AMEND"
  })
  selrecordFun(recordData.value[recordData.value.length - 1].id)
  historyCount.value = recordData.value[recordData.value.length - 1].id
  spinning.value = false
}

const selrecordFun = (id) => {
  versionAll.value.forEach((it, index) => {
    if (it.id == id) {
      const prevData = JSON.parse(versionAll.value[index - 1].data)
      const nowData = JSON.parse(it.data)
      const changeRes = checkFieldChange(prevData, nowData)
      changeInfo.reason = it.reason
      changeInfo.changeData = changeRes
    }
  })
}

// 样品变更明细
const detailSampleForm = ref()
const isChangeSample = ref(false)
const openSampleDetail = (rowData: any) => {
  isChangeSample.value = rowData.type === "更正"
  nextTick(() => {
    detailSampleForm.value.openModal(rowData.details, true)
  })
}
</script>

<style lang="less" scoped>
.modal-content {
  padding: 20px;
  :deep(.ant-table-thead tr:first-child th) {
    font-weight: bold;
  }
}
.module-title {
  padding-left: 8px;
  margin: 20px 0 10px 0;
  border-left: 4px solid @theme_color;
  line-height: 18px;
  font-weight: 600;
  font-size: 16px;
}
.inline-form {
  display: flex;
  align-items: center;
  .label {
    width: 100px;
    text-align: right;
  }
}

:deep(.ant-card) {
  min-height: 60px;
  .ant-card-body {
    padding: 15px;
  }
}
</style>
