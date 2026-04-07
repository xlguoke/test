<template>
  <div>
    <a-spin tip="加载中..." :spinning="spinning">
      <div class="steps-content">
        <a-form
          ref="baseLaboratoryFormRef"
          :model="baseLaboratoryForm"
          name="basic"
          :label-col="{ span: 8 }"
          :wrapper-col="{ span: 15 }"
          autocomplete="off"
          class="baseForm"
          style="display: flex; flex-wrap: wrap"
        >
          <a-col :span="12">
            <a-form-item
              label="现场检测项目名称"
              name="name"
              :rules="[{ required: true, message: '请输入现场检测项目名称!' }]"
            >
              <a-input
                v-model:value="baseLaboratoryForm.name"
                :disabled="props.details"
                placeholder="请输入现场检测项目名称"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              label="所属机构"
              name="orgId"
              :rules="[{ required: true, message: '请选择所属机构!' }]"
            >
              <div style="display: flex; justify-content: space-between">
                <a-input
                  :value="selOrgList.length ? (selOrgList[0] as any).name : ''"
                  :disabled="userInfo.type == 'ORG' || props.details"
                  style="width: calc(100% - 70px)"
                  readonly
                  placeholder="请选择所属机构"
                />
                <a-button
                  :disabled="userInfo.type == 'ORG' || props.details"
                  type="primary"
                  @click="openSelOrg"
                >
                  选择
                </a-button>
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              label="委托单位"
              name="consignUnit"
              :rules="[{ required: true, message: '请输入委托单位!' }]"
            >
              <a-input
                v-model:value="baseLaboratoryForm.consignUnit"
                :disabled="props.details"
                placeholder="请输入委托单位"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              label="工程项目"
              name="projectName"
              :rules="[{ required: true, message: '请选择工程项目' }]"
            >
              <div style="display: flex; justify-content: space-between">
                <a-input
                  :value="baseLaboratoryForm.projectName"
                  style="width: calc(100% - 70px)"
                  readonly
                  :disabled="true"
                  placeholder="请选择项目"
                />
                <a-button
                  type="primary"
                  :disabled="props.details || !baseLaboratoryForm.orgId"
                  @click="openSelPerPject"
                >
                  选择
                </a-button>
              </div>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              label="备案起止时间"
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

          <a-col :span="12">
            <a-form-item
              label="工程项目监督机构"
              name="superviseId"
              :rules="[{ required: true, message: '请选择工程项目监督机构' }]"
            >
              <div style="display: flex; justify-content: space-between">
                <!-- <a-select
                  style="width: 350px"
                  v-model:value="baseLaboratoryForm.superviseId"
                  show-search
                  placeholder="请选择工程项目监督机构"
                  :disabled="props.details"
                  :options="bureausOptions"
                  :filter-option="filterOption"
                  @change="selSupervisor"
                ></a-select> -->

                <a-select
                  v-model:value="baseLaboratoryForm.superviseId"
                  style="width: 350px"
                  show-search
                  :default-active-first-option="false"
                  :show-arrow="false"
                  :filter-option="false"
                  placeholder="请选择工程项目监督机构"
                  :disabled="props.details"
                  :options="bureausOptions"
                  @change="selSupervisor"
                  @search="handleSearch"
                ></a-select>

                <!-- <a-input
                  :value="baseLaboratoryForm.supervise"
                  placeholder="请选择工程项目监督机构"
                /> -->
                <!-- <a-form-item-rest>
                  <a-input
                    :value="baseLaboratoryForm.superviseLinkman"
                    style="width: 49%"
                    disabled
                    placeholder="请先选择项目"
                  />
                </a-form-item-rest> -->
              </div>
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item
              label="试验检测工程师证人数"
              name="testerCount"
              :rules="[{ required: true, message: '请输入试验检测工程师人数!' }]"
            >
              <a-input-number
                v-model:value="baseLaboratoryForm.testerCount"
                style="width: 100%"
                :disabled="props.details"
                min="1"
                placeholder="请输入试验检测(人)"
              />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item
              label="持试验检测人员证书总人数"
              name="assistantCount"
              :rules="[{ required: true, message: '请输入持试验检测人员证书总人数!' }]"
            >
              <a-input-number
                v-model:value="baseLaboratoryForm.assistantCount"
                style="width: 100%"
                :disabled="props.details"
                min="1"
                placeholder="请输入持试验检测人员证书总人数(人)"
              />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item
              label="相关专业高级职称人数"
              name="seniorProfessionalCount"
              :rules="[{ required: true, message: '请输入相关专业高级职称人数!' }]"
            >
              <a-input-number
                v-model:value="baseLaboratoryForm.seniorProfessionalCount"
                style="width: 100%"
                min="0"
                :precision="0"
                :disabled="props.details"
                placeholder="请输入相关专业高级职称人数(人)"
              />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item
              label="辅助人员人数"
              name="auxiliaryCount"
              :rules="[{ required: true, message: '请输入辅助人员人数!' }]"
            >
              <a-input-number
                v-model:value="baseLaboratoryForm.auxiliaryCount"
                style="width: 100%"
                min="0"
                :precision="0"
                :disabled="props.details"
                placeholder="请输入辅助人员人数(人)"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              label="联系地址"
              name="address"
              :rules="[{ required: true, message: '请输入联系地址!' }]"
            >
              <a-cascader
                v-model:value="cascaderValue"
                :options="cityJson"
                :disabled="props.details"
                placeholder="请选择联系地址"
                @change="selAddress"
              />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item
              label="详细地址"
              name="addressDetail"
              :rules="[{ required: true, message: '请输入详细地址!' }]"
            >
              <a-input
                v-model:value="baseLaboratoryForm.addressDetail"
                :disabled="props.details"
                placeholder="请输入详细地址"
              />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item
              label="联系电话"
              name="tel"
              :rules="[{ required: true, message: '请输入联系电话!' }]"
            >
              <a-input
                v-model:value="baseLaboratoryForm.tel"
                :disabled="props.details"
                placeholder="请输入联系电话"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="传真" name="fax">
              <a-input
                v-model:value="baseLaboratoryForm.fax"
                :disabled="props.details"
                placeholder="请输入传真"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="邮编" name="postalCode">
              <a-input
                v-model:value="baseLaboratoryForm.postalCode"
                :disabled="props.details"
                placeholder="请输入邮编"
              />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item label="E-mail" name="email">
              <a-input
                v-model:value="baseLaboratoryForm.email"
                :disabled="props.details"
                placeholder="请输入E-mail"
              />
            </a-form-item>
          </a-col>
        </a-form>
      </div>
    </a-spin>
    <!-- <sel-project
      v-model:visible="selProjectVisible"
      v-model:selected="selProjectList"
      :is-auth="false"
      type="radio"
      @confirm="sleProjectOk"
    /> -->
    <sel-organization
      v-model:visible="selOrgVisible"
      v-model:selected="selOrgList"
      type="radio"
      @confirm="sleOrgOk"
    />
  </div>

  <SelPorjectModal ref="selPorjectModalRef" @confirmOk="sleProjectOk" />
</template>

<script lang="ts" setup>
import { Ref } from "vue"
import { getBureausListAPI } from "@/api/organization.api"
import { ref, toRefs, inject, onMounted } from "vue"
import type { LaboratoryEditBaseParams } from "@/type/api/fieldLaboratory.api"
import SelProject from "@/components/commonListModal/projectList.vue"
import SelOrganization from "@/components/commonListModal/organization.vue"
import {
  addLaboratoryAPI,
  editLaboratoryAPI,
  getLaboratoryInfoAPI,
  getSupervisoryAuditAPI
} from "@/api/laboratory.api"
import dayjs, { Dayjs } from "dayjs"
import cityJson from "@/assets/js/cityChongqing.js"
import userStore from "@/stores/userInfo"
import { storeToRefs } from "pinia"
import SelPorjectModal from "../../../components/SelProjectModal/index.vue"
const { userInfo } = storeToRefs(userStore())

let isApply = inject<unknown>("isApply", false) as Ref //  是否申请变更或延期

let selPorjectModalRef = ref()

const props = defineProps({
  editId: {
    type: String,
    required: true
  }, //编辑id,
  details: {
    type: Boolean,
    default: false
  }
})
const laboratoryId: Ref = toRefs(props).editId //试验室编辑id

//工地试验室基本数据
let baseLaboratoryForm = ref<LaboratoryEditBaseParams>({
  classification: "ITEM",
  name: "", // 试验室名称
  projectId: "", // 选择的工程项目ID
  projectName: "", //选择的工程项目名称
  consignUnit: "", //委托单位
  auxiliaryCount: 0, // 辅助人员数量
  keepDateStart: "", //备案开始日期
  keepDateEnd: "", //备案结束日期
  seniorProfessionalCount: "",
  floorArea: "",
  fax: "",
  postalCode: "",
  email: "",
  address: "", //区域地址, 省市区三级
  addressDetail: "", //详细地址
  testerCount: 1, //检测工程师人数
  assistantCount: 1, //助理工程师人数
  tel: "", //联系电话
  orgId: "", //机构id
  supervise: null, //监督机构
  superviseId: null //监督机构id

  // superviseLinkmanId: "", //监督联系人ID
  // superviseLinkman: "" //监督联系人

  // management: "", //监管单位
  // managementId: "", //监管单位ID
})

const selSupervisor = (v, row) => {
  baseLaboratoryForm.value.superviseId = row.value
  baseLaboratoryForm.value.supervise = row.label
}

interface SelOption {
  value: string
  label: string
}

let bureausQ = ref("")
let timeout: any
const handleSearch = (v) => {
  if (timeout) {
    clearTimeout(timeout)
    timeout = null
  }
  bureausQ.value = v
  timeout = setTimeout(getBureausList, 300)
}

let bureausOptions = ref<SelOption[]>([])
//获取拥有审核权限的监督机构
const getBureausList = async () => {
  try {
    let res: any = await getSupervisoryAuditAPI({
      partialName: bureausQ.value
    })
    bureausOptions.value = []

    res.forEach((it) => {
      bureausOptions.value.push({
        value: it.id,
        label: it.name
      })
    })
  } catch (error) {
    alert(error)
  }
}

const filterOption = (input: string, option: any) => {
  return option.value.toLowerCase().indexOf(input.toLowerCase()) >= 0
}
//时间范围绑定
let dateRangeValue = ref<[Dayjs | null, Dayjs | null]>()
//区域数据绑定
let cascaderValue = ref([])

let selProjectVisible = ref(false)
let selOrgVisible = ref(false)

let baseLaboratoryFormRef = ref()

let spinning = ref(false)

onMounted(() => {
  getBureausList()
  if (laboratoryId.value) {
    getLaboratoryInfo()
  } else {
    if (userInfo.value.type == "ORG") {
      selOrgList.value = [
        {
          id: userInfo.value.orgId,
          name: userInfo.value.orgName
        }
      ]
      baseLaboratoryForm.value.orgId = userInfo.value.orgId
    }
  }
})

const selMonitoringUnit = (v) => {
  // baseLaboratoryForm.value.management = v.option.name
  // baseLaboratoryForm.value.managementId = v.value
}

//获取试验室基本数据
const getLaboratoryInfo = async () => {
  let res = await getLaboratoryInfoAPI(laboratoryId.value)
  baseLaboratoryForm.value = res
  dateRangeValue.value = [dayjs(res.keepDateStart), dayjs(res.keepDateEnd)]
  // selProjectList.value = [
  //   {
  //     name: res.projectName,
  //     id: res.projectId
  //   }
  // ]
  selOrgList.value = [
    {
      id: res.orgId,
      name: res.orgName
    }
  ]
  cascaderValue.value = res.address.split("/")
}

//试验室基本数据提交
const addBaseLaboratory = async () => {
  try {
    await baseLaboratoryFormRef.value.validateFields() //验证
    spinning.value = true
    let res = null
    baseLaboratoryForm.value.id
      ? (res = await editLaboratoryAPI(baseLaboratoryForm.value))
      : (res = await addLaboratoryAPI(baseLaboratoryForm.value))
    spinning.value = false
    // res ? laboratoryId.value = res : ""
    return res
  } catch (error) {
    console.error(error)
    return Promise.reject(error)
  }
}

//选择机构回调
const sleOrgOk = (v) => {
  if (baseLaboratoryForm.value.orgId != v[0].id) {
    //选择的机构改变重新赋值 清空其他关联数据
    baseLaboratoryForm.value.orgId = v[0].id

    baseLaboratoryForm.value.projectId = ""
    baseLaboratoryForm.value.projectName = ""
  }

  selOrgVisible.value = false
}
//选择工程项目回调
const sleProjectOk = (v) => {
  baseLaboratoryForm.value.projectId = v[0].id
  baseLaboratoryForm.value.projectName = v[0].name

  //如果是水运工程 则使用水运工程配置的监督机构 如果是公路工程则清空监督单位
  if (v[0].kind == "WATERWAY") {
    baseLaboratoryForm.value.supervise = v[0].bureau.name
    baseLaboratoryForm.value.superviseId = v[0].bureau.id
  } else {
    baseLaboratoryForm.value.supervise = ""
    baseLaboratoryForm.value.superviseId = ""
  }
  // selProjectVisible.value = false
}
//选择地址回调
const selAddress = (v) => {
  baseLaboratoryForm.value.address = v.join("/")
}
//选择时间回调
const setDateRange = (v) => {
  if (v) {
    baseLaboratoryForm.value.keepDateStart = v[0].valueOf()
    baseLaboratoryForm.value.keepDateEnd = v[1].valueOf()
  } else {
    baseLaboratoryForm.value.keepDateStart = ""
    baseLaboratoryForm.value.keepDateEnd = ""
  }
}

//打开选择项目
const openSelPerPject = () => {
  // selProjectVisible.value = true
  let echo = baseLaboratoryForm.value.projectId
    ? [
        {
          id: baseLaboratoryForm.value.projectId,
          name: baseLaboratoryForm.value.projectName
        }
      ]
    : []
  selPorjectModalRef.value.openModal(echo, selOrgList.value[0].id)
}
//打开选择机构
const openSelOrg = () => {
  selOrgVisible.value = true
}

defineExpose({
  addBaseLaboratory
})
// 选择项目数据源
let selProjectList: any = ref([])
// 选择机构数据源
let selOrgList: any = ref([])
</script>
<style lang="less" scoped></style>
