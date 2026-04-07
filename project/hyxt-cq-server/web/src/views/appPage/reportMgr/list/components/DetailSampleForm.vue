<template>
  <a-modal
    v-model:visible="visible"
    :title="`${disabled ? `样品${isChange ? '变更' : ''}信息` : '编辑样品信息'}`"
    :mask-closable="false"
    :keyboard="false"
    width="1000px"
  >
    <template #footer>
      <a-button v-if="!disabled" @click="visible = false">取消</a-button>
      <a-button type="primary" @click="handleOk">确定</a-button>
    </template>
    <!-- 样品更正记录 -->
    <a-table
      v-if="isChange"
      :data-source="chagneSampleDetail"
      :columns="baseColumns"
      size="small"
      bordered
      :pagination="false"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="datesFieldKey.includes(record.field)">
          <span v-if="column.dataIndex === 'beforeChange' && record.beforeChange">
            {{ dayjs(record.beforeChange).format("YYYY-MM-DD") }}
          </span>
          <span v-if="column.dataIndex === 'afterChange' && record.afterChange">
            {{ dayjs(record.afterChange).format("YYYY-MM-DD") }}
          </span>
        </template>
      </template>
    </a-table>
    <!-- 样品详情 -->
    <a-form
      v-else
      ref="formRef"
      :model="form"
      :label-col="{ style: { width: '120px' } }"
      style="padding-right: 20px"
    >
      <a-row :gutter="20">
        <a-col :span="12">
          <a-form-item
            label="样品名称"
            name="name"
            :rules="[{ required: true, message: '请输入样品名称' }]"
          >
            <a-input v-model:value="form.name" placeholder="请输入样品名称" :disabled="disabled" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item
            label="检测参数"
            name="testItems"
            :rules="[{ required: true, message: '请输入检测参数' }]"
          >
            <a-input
              v-model:value="form.testItems"
              placeholder="请输入检测参数，多个时使用“ , ”分开"
              :disabled="disabled"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item
            label="样品编号"
            name="sn"
            :rules="[{ required: true, message: '请输入样品名称' }]"
          >
            <a-input v-model:value="form.sn" placeholder="请输入样品编号" :disabled="disabled" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="规格型号" name="specification">
            <a-input
              v-model:value="form.specification"
              placeholder="请输入规格型号"
              :disabled="disabled"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="检测部位" name="testPart">
            <a-input
              v-model:value="form.testPart"
              placeholder="请输入检测部位"
              :disabled="disabled"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="工程部位/用途" name="projectPartOrUse">
            <a-input
              v-model:value="form.projectPartOrUse"
              placeholder="请输入工程部位/用途"
              :disabled="disabled"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="样品数量" name="amount">
            <a-input-number
              v-model:value="form.amount"
              :disabled="disabled"
              :controls="false"
              style="width: 100%"
              :min="1"
              :precision="0"
              placeholder="请输入样品数量"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="代表数量" name="behalfAmount">
            <a-input-number
              v-model:value="form.behalfAmount"
              :controls="false"
              :disabled="disabled"
              style="width: 100%"
              :min="0"
              :precision="0"
              placeholder="请输入代表数量"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="生产厂家" name="manufacturer">
            <a-input
              v-model:value="form.manufacturer"
              placeholder="请输入生产厂家"
              :disabled="disabled"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="生产批号" name="batchNumber">
            <a-input
              v-model:value="form.batchNumber"
              placeholder="请输入生产批号"
              :disabled="disabled"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="出厂日期" name="productionDate">
            <a-date-picker
              v-model:value="form.productionDate"
              value-format="yyyy-MM-DD"
              :disabled="disabled"
              style="width: 100%"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="出厂编号" name="productionSn">
            <a-input
              v-model:value="form.productionSn"
              placeholder="请输入出厂编号"
              :disabled="disabled"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="进场日期" name="enterSiteDate">
            <a-date-picker
              v-model:value="form.enterSiteDate"
              style="width: 100%"
              :disabled="disabled"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="养护条件" name="maintainCondition">
            <a-input
              v-model:value="form.maintainCondition"
              placeholder="请输入养护条件"
              :disabled="disabled"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="见证单位" name="witnessUnit">
            <a-input
              v-model:value="form.witnessUnit"
              placeholder="请输入见证单位"
              :disabled="disabled"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="见证人" name="witness">
            <a-input v-model:value="form.witness" placeholder="请输入见证人" :disabled="disabled" />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="见证人证书号" name="witnessCertNo">
            <a-input
              v-model:value="form.witnessCertNo"
              placeholder="请输入见证人证书号"
              :disabled="disabled"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="取样单位" name="samplingCompany">
            <a-input
              v-model:value="form.samplingCompany"
              placeholder="请输入取样单位"
              :disabled="disabled"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="取样地点" name="samplingPlace">
            <a-input
              v-model:value="form.samplingPlace"
              placeholder="请输入取样地点"
              :disabled="disabled"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="取样人" name="samplingPerson">
            <a-input
              v-model:value="form.samplingPerson"
              placeholder="请输入取样人"
              :disabled="disabled"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="取样日期" name="samplingDate">
            <a-date-picker
              v-model:value="form.samplingDate"
              style="width: 100%"
              :disabled="disabled"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item label="取样人证书号" name="samplingPersonNumber">
            <a-input
              v-model:value="form.samplingPersonNumber"
              placeholder="请输入取样人证书号"
              :disabled="disabled"
            />
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts">
import { ref } from "vue"
import { FormInstance } from "ant-design-vue"
import dayjs from "dayjs"
import type { samplesType, CheckSampleType } from "@/type/api/report.api"
import { deepCopy } from "@/assets/js/common"

const props = defineProps({
  isChange: Boolean,
  baseColumns: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(["save"])
const visible = ref<boolean>(false)
const disabled = ref<boolean>(false)
const chagneSampleDetail = ref<CheckSampleType[]>([])
const openModal = (rowData: samplesType | CheckSampleType[], isDisabled = false) => {
  const row = deepCopy(rowData)
  if (row && !props.isChange) {
    if (row.productionDate) {
      row.productionDate = dayjs(row.productionDate)
    }
    if (row.enterSiteDate) {
      row.enterSiteDate = dayjs(row.enterSiteDate)
    }
    if (row.samplingDate) {
      row.samplingDate = dayjs(row.samplingDate)
    }
    form.value = row
  } else {
    chagneSampleDetail.value = row as CheckSampleType[]
  }
  disabled.value = isDisabled
  visible.value = true
}

defineExpose({
  openModal
})

// 需要格式化日期的字段
const datesFieldKey = ["productionDate", "enterSiteDate", "samplingDate"]

const formRef = ref<FormInstance>()
const form = ref<samplesType>({
  id: "",
  name: "", //样品名称
  sn: "", //样品编号
  specification: "", //规格型号
  testPart: "", //检测部位
  projectPartOrUse: "", //工程部位/用途
  amount: 1, //样品数量
  behalfAmount: 0, //代表数量
  manufacturer: "", //生产厂家
  batchNumber: "", //产品批号
  productionDate: "", //出厂日期
  productionSn: "", //出厂编号
  enterSiteDate: "", //进场日期
  maintainCondition: "", //养护条件
  testItems: "", //检测参数
  witnessUnit: "", //见证单位
  witness: "", //见证人
  witnessCertNo: "", //见证人证书号
  samplingCompany: "", //取样单位
  samplingPlace: "", //取样地点
  samplingPerson: "", //取样人
  samplingDate: "", //取样日期
  samplingPersonNumber: "" //取样人证件号
})

// 保存
const handleOk = async () => {
  if (disabled.value) {
    visible.value = false
    return
  }
  await (formRef.value as FormInstance).validateFields()
  const formObj = { ...form.value }
  if (formObj.productionDate) {
    formObj.productionDate = dayjs(formObj.productionDate).valueOf()
  }
  if (formObj.enterSiteDate) {
    formObj.enterSiteDate = dayjs(formObj.enterSiteDate).valueOf()
  }
  if (formObj.samplingDate) {
    formObj.samplingDate = dayjs(formObj.samplingDate).valueOf()
  }
  emit("save", formObj)
  visible.value = false
}
</script>

<style></style>
