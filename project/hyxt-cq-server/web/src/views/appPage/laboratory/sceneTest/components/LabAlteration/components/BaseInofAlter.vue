<template>
  <div>
    <a-spin tip="加载中..." :spinning="spinning">
      <div class="steps-content">
        <a-form
          ref="beforeAlterFormRef"
          :model="alterForm"
          name="basic"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 15 }"
          autocomplete="off"
          class="baseForm"
          style="display: flex; flex-wrap: wrap"
        >
          <a-col v-if="alterType.includes('LAB_NAME')" :span="12">
            <a-form-item class="before_row" label="变更前-现场检测项目名称" name="name">
              <span>{{ beforeAlterForm.name }}</span>
            </a-form-item>
            <a-form-item
              label="变更后-现场检测项目名称"
              name="name"
              :rules="[{ required: true, message: '请输入变更后现场检测项目名称!' }]"
            >
              <a-input
                v-model:value="alterForm.name"
                :disabled="props.details"
                placeholder="请输入变更后现场检测项目名称"
              />
            </a-form-item>
          </a-col>
          <a-col v-if="alterType.includes('DELAY')" :span="12">
            <a-form-item class="before_row" label="变更前-备案起止时间" name="name">
              <span>{{ dateRangeValueFormat }}</span>
              <!-- <span>{{    dayjs(item.assignedAt).format("YYYY-MM-DD HH:mm:ss") }}  }}</span> -->
            </a-form-item>
            <a-form-item
              label="变更后-备案起止时间"
              name="keepDateStart"
              :rules="[{ required: true, message: '请选择备案起止时间' }]"
            >
              <a-range-picker
                v-model:value="dateRangeValue"
                style="width: 100%"
                :disabled="props.details"
                :placeholder="['开始日期', '到期日期']"
                @change="setDateRange"
              />
            </a-form-item>
          </a-col>

          <a-col v-if="alterType.includes('PEOPLE')" :span="12">
            <a-form-item class="before_row" label="变更前-试验检测工程师证人数" name="name">
              <span>{{ beforeAlterForm.testerCount }}</span>
            </a-form-item>
            <a-form-item
              label="变更后-试验检测工程师证人数"
              name="testerCount"
              :rules="[{ required: true, message: '请输入试验检测工程师人数!' }]"
            >
              <a-input-number
                v-model:value="alterForm.testerCount"
                style="width: 100%"
                :disabled="props.details"
                min="1"
                placeholder="请输入试验检测(人)"
              />
            </a-form-item>
          </a-col>

          <a-col v-if="alterType.includes('PEOPLE')" :span="12">
            <a-form-item class="before_row" label="变更前-持试验检测人员证书总人数" name="name">
              <span>{{ beforeAlterForm.assistantCount }}</span>
            </a-form-item>
            <a-form-item
              label="变更后-持试验检测人员证书总人数"
              name="assistantCount"
              :rules="[{ required: true, message: '请输入持试验检测人员证书总人数!' }]"
            >
              <a-input-number
                v-model:value="alterForm.assistantCount"
                style="width: 100%"
                :disabled="props.details"
                min="1"
                placeholder="请输入持试验检测人员证书总人数(人)"
              />
            </a-form-item>
          </a-col>

          <a-col v-if="alterType.includes('PEOPLE')" :span="12">
            <a-form-item class="before_row" label="变更前-相关专业高级职称人数" name="name">
              <span>{{ beforeAlterForm.seniorProfessionalCount }}</span>
            </a-form-item>
            <a-form-item
              label="变更后-相关专业高级职称人数"
              name="seniorProfessionalCount"
              :rules="[{ required: true, message: '请输入相关专业高级职称人数!' }]"
            >
              <a-input
                v-model:value="alterForm.seniorProfessionalCount"
                style="width: 100%"
                :disabled="props.details"
                placeholder="请输入相关专业高级职称人数(人)"
              />
            </a-form-item>
          </a-col>

          <a-col v-if="alterType.includes('PEOPLE')" :span="12">
            <a-form-item class="before_row" label="变更前-辅助人员人数" name="name">
              <span>{{ beforeAlterForm.auxiliaryCount }}</span>
            </a-form-item>
            <a-form-item
              label="变更后-辅助人员人数"
              name="auxiliaryCount"
              :rules="[{ required: true, message: '请输入辅助人员人数!' }]"
            >
              <a-input
                v-model:value="alterForm.auxiliaryCount"
                style="width: 100%"
                :disabled="props.details"
                placeholder="请输入辅助人员人数人数(人)"
              />
            </a-form-item>
          </a-col>

          <!-- <a-col :span="12" v-if="alterType.includes('TEST_ITEM')">
            <a-form-item class="before_row" label="变更前-占地总面积" name="name">
              <span>{{ beforeAlterForm.floorArea }}</span>
            </a-form-item>
            <a-form-item label="变更后-占地总面积" name="floorArea">
              <a-input
                v-model:value="alterForm.floorArea"
                :disabled="props.details"
                placeholder="请输入占地总面积 单位：“m2”"
              />
            </a-form-item>
          </a-col> -->
          <a-col v-if="alterType.includes('TEST_ITEM')" :span="12">
            <a-form-item class="before_row" label="变更前-联系地址" name="name">
              <span>{{ beforeAlterForm.address }}</span>
            </a-form-item>
            <a-form-item label="变更后-联系地址" name="address">
              <a-cascader
                v-model:value="cascaderValue"
                :options="cityJson"
                :disabled="props.details"
                placeholder="请选择联系地址"
                @change="selAddress"
              />
            </a-form-item>
          </a-col>

          <a-col v-if="alterType.includes('TEST_ITEM')" :span="12">
            <a-form-item class="before_row" label="变更前-详细地址" name="name">
              <span>{{ beforeAlterForm.addressDetail }}</span>
            </a-form-item>
            <a-form-item label="变更后-详细地址" name="addressDetail">
              <a-input
                v-model:value="alterForm.addressDetail"
                :disabled="props.details"
                placeholder="请输入详细地址"
              />
            </a-form-item>
          </a-col>

          <a-col v-if="alterType.includes('TEST_ITEM')" :span="12">
            <a-form-item class="before_row" label="变更前-联系电话" name="name">
              <span>{{ beforeAlterForm.tel }}</span>
            </a-form-item>
            <a-form-item label="变更后-联系电话" name="tel">
              <a-input
                v-model:value="alterForm.tel"
                :disabled="props.details"
                placeholder="请输入联系电话"
              />
            </a-form-item>
          </a-col>
          <a-col v-if="alterType.includes('TEST_ITEM')" :span="12">
            <a-form-item class="before_row" label="变更前-传真" name="name">
              <span>{{ beforeAlterForm.fax }}</span>
            </a-form-item>
            <a-form-item label="变更后-传真" name="fax">
              <a-input
                v-model:value="alterForm.fax"
                :disabled="props.details"
                placeholder="请输入传真"
              />
            </a-form-item>
          </a-col>
          <a-col v-if="alterType.includes('TEST_ITEM')" :span="12">
            <a-form-item class="before_row" label="变更前-邮编" name="name">
              <span>{{ beforeAlterForm.postalCode }}</span>
            </a-form-item>
            <a-form-item label="变更后-邮编" name="postalCode">
              <a-input
                v-model:value="alterForm.postalCode"
                :disabled="props.details"
                placeholder="请输入邮编"
              />
            </a-form-item>
          </a-col>

          <a-col v-if="alterType.includes('TEST_ITEM')" :span="12">
            <a-form-item class="before_row" label="变更前-E-mail" name="name">
              <span>{{ beforeAlterForm.email }}</span>
            </a-form-item>
            <a-form-item label="变更后-E-mail" name="email">
              <a-input
                v-model:value="alterForm.email"
                :disabled="props.details"
                placeholder="请输入E-mail"
              />
            </a-form-item>
          </a-col>
        </a-form>
      </div>
    </a-spin>
  </div>
</template>

<script lang="ts" setup>
import { Ref } from "vue"
import { ref, toRefs, inject, onMounted, computed } from "vue"
import { baseInfoAlterAPI, getAlterBaseInfo } from "@/api/laboratory.api"
import dayjs, { Dayjs } from "dayjs"
import cityJson from "@/assets/js/cityChongqing.js"

const props = defineProps({
  alterId: {
    type: String,
    required: true
  },
  alterType: {
    type: Array,
    required: true
  },
  details: {
    type: Boolean,
    default: false
  }
})
const alterId: Ref = toRefs(props).alterId //试验室编辑id
const alterType: Ref = toRefs(props).alterType //需要变更内容

//工地试验室基本数据
let beforeAlterForm = ref({
  auxiliaryCount: 0,
  keepDateStart: "", //备案开始日期
  keepDateEnd: "", //备案结束日期
  name: "",
  testerCount: 0,
  assistantCount: 0,
  email: "",
  address: "",
  tel: "",
  postalCode: "",
  fax: "",
  seniorProfessionalCount: 0,
  // floorArea: "",
  addressDetail: ""
})

let alterForm = ref({
  auxiliaryCount: 0, //辅助人员人数
  keepDateStart: "", //备案开始日期
  keepDateEnd: "", //备案结束日期
  name: "",
  testerCount: 0,
  assistantCount: 0,
  email: "",
  address: "",
  tel: "",
  postalCode: "",
  fax: "",
  seniorProfessionalCount: 0,
  // floorArea: "",
  addressDetail: ""
})

//时间范围绑定
let dateRangeValue = ref<[Dayjs | null, Dayjs | null]>()
const dateRangeValueFormat = computed(() => {
  if (beforeAlterForm.value.keepDateStart) {
    let st =
      dayjs(beforeAlterForm.value.keepDateStart).format("YYYY-MM-DD") +
      " ~ " +
      dayjs(beforeAlterForm.value.keepDateEnd).format("YYYY-MM-DD")
    return st
  }
  return ""
})

//区域数据绑定
let cascaderValue: Ref<Array<string>> = ref([])

let beforeAlterFormRef = ref()

let spinning = ref(false)

onMounted(() => {
  getLaboratoryInfo()
})

//获取试验室基本数据
const getLaboratoryInfo = async () => {
  if (!alterId.value) {
    return
  }
  let res: any = await getAlterBaseInfo(alterId.value)
  beforeAlterForm.value = res.preChangeData

  alterForm.value.keepDateStart = res.changedData.keepDateStart
  alterForm.value.keepDateEnd = res.changedData.keepDateEnd
  alterForm.value.name = res.changedData.name
  alterForm.value.testerCount = res.changedData.testerCount
  alterForm.value.assistantCount = res.changedData.assistantCount
  alterForm.value.email = res.changedData.email
  alterForm.value.address = res.changedData.address
  alterForm.value.tel = res.changedData.tel
  alterForm.value.postalCode = res.changedData.postalCode
  alterForm.value.fax = res.changedData.fax
  alterForm.value.seniorProfessionalCount = res.changedData.seniorProfessionalCount
  // alterForm.value.floorArea = res.changedData.floorArea
  alterForm.value.addressDetail = res.changedData.addressDetail
  alterForm.value.auxiliaryCount = res.changedData.auxiliaryCount

  if (alterForm.value.keepDateStart && alterForm.value.keepDateEnd) {
    dateRangeValue.value = [
      dayjs(alterForm.value.keepDateStart),
      dayjs(alterForm.value.keepDateEnd)
    ]
  }
  cascaderValue.value = alterForm.value.address.split("/")
}

//试验室基本数据变更提交
const addBaseLaboratory = async () => {
  try {
    await beforeAlterFormRef.value.validateFields() //验证
    spinning.value = true
    let res = await baseInfoAlterAPI(alterId.value, alterForm.value)
    spinning.value = false
    // res ? laboratoryId.value = res : ""
    return res
  } catch (error) {
    console.error(error)
    return Promise.reject(error)
  }
}
//选择地址回调
const selAddress = (v) => {
  alterForm.value.address = v.join("/")
}
//选择时间回调
const setDateRange = (v) => {
  if (v) {
    alterForm.value.keepDateStart = v[0].valueOf()
    alterForm.value.keepDateEnd = v[1].valueOf()
  } else {
    alterForm.value.keepDateStart = ""
    alterForm.value.keepDateEnd = ""
  }
}

defineExpose({
  addBaseLaboratory
})
// 选择项目数据源
let selProjectList: any = ref([])
// 选择机构数据源
let selOrgList: any = ref([])
</script>
<style lang="less" scoped>
.before_row {
  margin-bottom: 0px;
  color: #e58d4a;
}
</style>
