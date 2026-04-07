<template>
  <div>
    <a-modal
      v-model:visible="visible"
      :title="versionType == 'EDIT' ? '编辑记录' : '变更记录'"
      width="800px"
    >
      <template #footer>
        <a-button type="primary" @click="visible = false">关闭</a-button>
      </template>
      <a-spin :spinning="spinning">
        <div class="modal-content">
          <a-select v-model:value="historyCount" style="width: 100%" @change="selrecordFun">
            <a-select-option v-for="(item, index) in recordData" :key="item.id" :value="item.id">
              第{{ index + 1 }}次{{ versionType == "EDIT" ? "编辑" : "变更" }}记录
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
          <p class="module-title">{{ versionType == "EDIT" ? "编辑" : "变更" }}内容</p>
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
                  {{ DictCheckType[record.beforeChange] }}
                </span>
                <span v-if="column.dataIndex === 'afterChange'">
                  {{ DictCheckType[record.afterChange] }}
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
                <a-button v-if="record.type" type="link" primary @click="openSampleDetail(record)">
                  查看详细
                </a-button>
                <span v-else>-</span>
              </template>
            </template>
          </a-table>
          <template v-if="versionType == 'AMEND'">
            <p class="module-title">更正理由</p>
            <a-card>{{ changeInfo.reason }}</a-card>
          </template>
        </div>
      </a-spin>
    </a-modal>

    <!-- 样品变更详情 -->
    <DetailSampleForm
      ref="detailSampleForm"
      :base-columns="baseColumns"
      :is-change="isChangeSample"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, nextTick } from "vue"
import dayjs from "dayjs"
import { getHistoryByVersion } from "@/api/reportMgr.api"
import DetailSampleForm from "./DetailSampleForm.vue"
import checkFieldChange, { CheckResultType } from "@/assets/js/checkFieldChange"
import FileList from "@/components/fileList/index.vue"

const spinning = ref(true)
const visible = ref(false)
const reportId = ref("")
const historyCount = ref("")
const changeCount = ref(1)
let versionType = ref("")
const openModal = (id: string, version: number, type: string) => {
  reportId.value = id
  changeCount.value = version

  visible.value = true
  versionType.value = type
  getChangeDatas()
}

defineExpose({
  openModal
})
// 需要格式化日期的字段
const datesFieldKey = ["consignDate", "auditTime", "testTimeBegin", "testTimeEnd", "signDate"]
// 委托类型数据字典
enum DictCheckType {
  "consign" = "委托检测",
  "quality" = "质量抽检",
  "practiceTest" = "模拟试验",
  "委托检测" = "委托检测",
  "质量抽检" = "质量抽检",
  "模拟试验" = "模拟试验"
}
const baseColumns = reactive([
  {
    title: "基本信息",
    align: "left",
    children: [
      {
        title: "信息名称",
        dataIndex: "fieldName"
      },
      {
        title: "更改前",
        dataIndex: "beforeChange"
      },
      {
        title: "更改后",
        dataIndex: "afterChange"
      }
    ]
  }
])
const sampleColumns = reactive([
  {
    title: "样品信息",
    align: "left",
    children: [
      {
        title: "样品名称",
        dataIndex: "name"
      },
      {
        title: "类型",
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

let versionAll: any = ref([])
let recordData: any = ref([])
const getChangeDatas = async () => {
  spinning.value = true
  let res = await getHistoryByVersion(reportId.value)
  console.log(res)
  versionAll.value = res
  recordData.value = res.filter((it) => {
    return it.type == versionType.value
  })

  // versionType.value == "EDIT" ? recordData.value.shift() : "" //编辑记录需要减去初始编辑

  if (recordData.value.length) {
    console.log(3333, recordData.value[recordData.value.length - 1])
    selrecordFun(recordData.value[recordData.value.length - 1].id)
    historyCount.value = recordData.value[recordData.value.length - 1].id
  }

  // const prevData = JSON.parse(recordData.value[recordData.value.length - 2].data)
  // const nowData = JSON.parse(recordData.value[recordData.value.length - 1].data)
  // const changeRes = checkFieldChange(prevData, nowData)
  // changeInfo.reason = nowData.reason
  // changeInfo.changeData = changeRes
  spinning.value = false
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

.ant-card {
  min-height: 120px;
  max-height: 500px;
}
:deep(.ant-card-body) {
  padding: 15px;
}
</style>
