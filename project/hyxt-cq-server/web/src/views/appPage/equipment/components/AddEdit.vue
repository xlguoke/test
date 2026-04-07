<template>
  <a-modal
    v-model:visible="visible"
    :title="title"
    :mask-closable="false"
    :keyboard="false"
    :confirm-loading="loading"
    width="70%"
    @cancel="closeModal"
    @ok="handleSave"
  >
    <a-spin :spinning="spinning" tip="Loading...">
      <a-form
        ref="formRef"
        :model="form"
        v-bind="{ labelCol: { span: 7 }, wrapperCol: { span: 16 } }"
        :rules="rules"
      >
        <a-row :gutter="10">
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="所属机构" name="orgName">
              <div style="display: flex; align-items: center; column-gap: 4px">
                <a-input
                  v-model:value="form.orgName"
                  placeholder="请选择所属机构"
                  disabled
                  style="flex: 1"
                />
                <a-button v-if="userInfo.type != 'ORG'" type="primary" @click="openSelOrg">
                  选择
                </a-button>
              </div>
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="设备名称" name="name">
              <a-input v-model:value="form.name" placeholder="请输入设备名称" :maxlength="100" />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="设备编号" name="sn">
              <a-input v-model:value="form.sn" placeholder="请输入设备编号" :maxlength="100" />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="标准设备" name="standardEquipmentIds">
              <a-input-group compact>
                <a-select
                  v-model:value="form.standardEquipmentIds"
                  placeholder="请选择标准设备"
                  :options="standardEqOptions"
                  mode="multiple"
                  :max-tag-count="1"
                  style="width: calc(100% - 60px)"
                  @change="handleStandardEquipmentChange"
                />
                <a-button
                  type="primary"
                  style="float: right; margin-bottom: 4px"
                  @click="openStandardEquipmentModal"
                >
                  选择
                </a-button>
              </a-input-group>
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="生产厂家" name="manufacturer">
              <a-input
                v-model:value="form.manufacturer"
                placeholder="请输入生产厂家"
                :maxlength="100"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="规格型号" name="specification">
              <a-input
                v-model:value="form.specification"
                placeholder="请输入规格型号"
                :maxlength="100"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="检定校准周期(月)" name="calibrationCycle">
              <a-input-number
                v-model:value="form.calibrationCycle"
                placeholder="请输入检定校准周期(月)"
                :constrols="false"
                :min="1"
                :max="99999"
                :precision="0"
                class="w-full"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="检定校准单位" name="calibrationUnit">
              <a-input
                v-model:value="form.calibrationUnit"
                placeholder="请输入检定校准单位"
                :maxlength="100"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="检定校准日期" name="lastCalibrationDate">
              <a-date-picker
                v-model:value="form.lastCalibrationDate"
                placeholder="请选择检定校准日期"
                :value-format="formatDate"
                class="w-full"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="单价" name="price">
              <a-input-number
                v-model:value="form.price"
                placeholder="请输入单价"
                :controls="false"
                class="w-full"
                :max="999999999999999"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="量程或规格" name="measuringRange">
              <a-input
                v-model:value="form.measuringRange"
                placeholder="请输入量程或规格"
                :maxlength="100"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="精准度" name="accuracy">
              <a-input v-model:value="form.accuracy" placeholder="请输入精准度" :maxlength="100" />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="出厂编号" name="factorySn">
              <a-input
                v-model:value="form.factorySn"
                placeholder="请输入出厂编号"
                :maxlength="100"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="购置日期" name="buyDate">
              <a-date-picker
                v-model:value="form.buyDate"
                :value-format="formatDate"
                placeholder="请选择购置日期"
                class="w-full"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="到期日期" name="calibrationExpireDate">
              <a-date-picker
                v-model:value="form.calibrationExpireDate"
                :value-format="formatDate"
                placeholder="请选择到期日期"
                class="w-full"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="使用状态" name="useStatus">
              <a-input
                v-model:value="form.useStatus"
                placeholder="请输入使用状态"
                :maxlength="100"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="备注" name="remark">
              <a-input v-model:value="form.remark" placeholder="请输入备注" :maxlength="200" />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="附件" name="attachments">
              <UploadFile v-model:value="form.attachments" />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-spin>

    <sel-organization
      v-model:visible="selOrgVisible"
      v-model:selected="selOrgList"
      type="radio"
      @confirm="sleOrgOk"
    />

    <standard-equipment-modal ref="standardEquipmentModalRef" @on-selected="handleSelected" />
  </a-modal>
</template>

<script setup lang="ts">
import { SaveEquipmentDTO, dataItemType, getDetail, save } from "@/api/equipment.api"
import { message } from "ant-design-vue"
import { computed, ref } from "vue"
import StandardEquipmentModal from "@/components/standardEquipmentModal/index.vue"
import SelOrganization from "@/components/commonListModal/organization.vue"
import userStore from "@/stores/userInfo"
import { storeToRefs } from "pinia"
import UploadFile from "@/components/uploadFile/index.vue"
import dayjs from "dayjs"

const { userInfo } = storeToRefs(userStore())

interface SaveEquipmentVO extends SaveEquipmentDTO {
  standardEquipmentIds: string[] | undefined
}

const emit = defineEmits(["load"])
const formatDate = "YYYY-MM-DD"
const title = ref("新增设备")

const visible = ref(false)
const loading = ref(false)
const spinning = ref(false)
const formRef = ref()
const standardEquipmentModalRef = ref()
const selOrgList = ref([])
const form = ref<SaveEquipmentVO>({
  orgId: "",
  sn: "",
  name: "",
  manufacturer: "",
  specification: "",
  calibrationCycle: null,
  calibrationUnit: "",
  lastCalibrationDate: "",
  attachments: [],
  standardEquipmentIds: [],
  standardEquipmentList: []
})

const standardEqOptions = computed(() => {
  return (
    form.value.standardEquipmentList?.map((item) => ({
      label: item.bzEquipmentName,
      value: item.bzEquipmentId
    })) || []
  )
})

const rules = {
  orgName: [{ required: true, message: "请选择所属机构" }],
  sn: [{ required: true, message: "请输入设备编号" }],
  name: [{ required: true, message: "请输入设备名称" }],
  standardEquipmentIds: [{ required: true, message: "请选择标准设备" }],
  manufacturer: [{ required: true, message: "请输入生产厂家" }],
  specification: [{ required: true, message: "请输入规格型号" }],
  calibrationCycle: [{ required: true, message: "请输入检定校准周期(月)" }],
  calibrationUnit: [{ required: true, message: "请输入检定校准单位" }],
  lastCalibrationDate: [{ required: true, message: "请选择检定校准日期" }]
}

function openModal(row?: dataItemType) {
  visible.value = true
  if (userInfo.value.orgId) {
    form.value.orgId = userInfo.value.orgId
    form.value.orgName = userInfo.value.orgName || ""
  }
  title.value = row?.id ? "编辑设备" : "新增设备"
  if (!row || !row.id) return
  initForm(row.id, row.orgName || "")
}

function closeModal() {
  visible.value = false
  form.value = {
    attachments: [],
    standardEquipmentIds: [],
    standardEquipmentList: []
  } as any
  formRef.value.resetFields()
}

function initForm(id: string, orgName: string) {
  spinning.value = true
  getDetail(id)
    .then((res) => {
      const row = res || {}
      const eqs = row.bzEquipments || []
      const data = {
        id: row.id || "",
        orgId: row.orgId || "",
        orgName: row.orgName || orgName || "",
        name: row.name || "",
        sn: row.sn || "",
        manufacturer: row.manufacturer || "",
        specification: row.specification || "",
        calibrationCycle: row.calibrationCycle || 0,
        calibrationUnit: row.calibrationUnit || "",
        lastCalibrationDate: row.lastCalibrationDate
          ? dayjs(row.lastCalibrationDate).format(formatDate)
          : "",
        price: row.price || "",
        measuringRange: row.measuringRange || "",
        accuracy: row.accuracy || "",
        factorySn: row.factorySn || "",
        buyDate: row.buyDate ? dayjs(row.buyDate).format(formatDate) : "",
        calibrationExpireDate: row.calibrationExpireDate
          ? dayjs(row.calibrationExpireDate).format(formatDate)
          : "",
        useStatus: row.useStatus || "",
        remark: row.remark || "",
        attachments: row.attachments || [],
        standardEquipmentList: eqs.map((item) => ({
          bzEquipmentName: item.bzEquipment,
          bzEquipmentId: item.bzEquipmentId,
          required: item.required
        })),
        standardEquipmentIds: eqs.map((item) => item.bzEquipmentId) || []
      }
      form.value = data
    })
    .finally(() => {
      spinning.value = false
    })
}

//打开选择机构
const selOrgVisible = ref(false)
const openSelOrg = () => {
  selOrgVisible.value = true
}
//选择机构回调
const sleOrgOk = (v) => {
  if (form.value.orgId != v[0].id) {
    //选择的机构改变重新赋值 清空其他关联数据
    form.value.orgId = v[0].id
    form.value.orgName = v[0].name
  }
  formRef.value.validateFields(["orgName"])
  selOrgVisible.value = false
}

// 打开标准设备选择弹窗
function openStandardEquipmentModal() {
  standardEquipmentModalRef.value.openModal()
}

// 处理选择标准设备
function handleSelected(selectedRows: { id: string; name: string }[]) {
  const selIds = form.value.standardEquipmentIds || []
  const addRow = selectedRows.filter((item) => !selIds.includes(item.id))
  form.value.standardEquipmentList.push(
    ...addRow.map((item) => ({
      bzEquipmentName: item.name,
      bzEquipmentId: item.id
    }))
  )
  form.value.standardEquipmentIds = selIds.concat(addRow.map((item) => item.id))
  formRef.value.validateFields(["standardEquipmentIds"])
}

// 处理标准设备选择变化
function handleStandardEquipmentChange(ids: string[]) {
  const list = form.value.standardEquipmentList
  form.value.standardEquipmentList = list.filter((d) => ids.includes(d.bzEquipmentId))
}

function handleSave() {
  formRef.value.validate().then(async () => {
    const param = { ...form.value }
    param.standardEquipmentList = form.value.standardEquipmentList
    param.standardEquipmentIds = undefined
    loading.value = true
    // 提交表单数据
    try {
      await save(param)
      message.success("保存成功")
      emit("load")
      closeModal()
    } finally {
      loading.value = false
    }
  })
}

defineExpose({
  openModal
})
</script>

<style scoped lang="less">
.w-full {
  width: 100%;
}

:deep(.ant-table-thead > tr > th.ant-table-cell) {
  &:not(:first-child) {
    display: none;
  }
}

:deep(.ant-table-thead > tr) {
  &:not(:first-child) {
    display: none;
  }
}
</style>
