<template>
  <a-modal
    v-model:visible="visible"
    :title="mtitle"
    :mask-closable="false"
    :keyboard="false"
    :ok-text="`${isAudit() && !disabled ? '提交审核' : '确定'}`"
    :confirm-loading="saveLoading"
    width="75%"
    @ok="saveModal"
  >
    <a-spin :spinning="spinning" tip="Loading...">
      <a-form
        ref="formRef"
        :model="form"
        :label-col="{ style: { width: '140px' } }"
        style="padding-right: 20px"
      >
        <a-row :gutter="10">
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="项目名称"
              name="projectName"
              :rules="[{ required: true, message: '请输入项目名称' }]"
            >
              <a-input
                v-model:value="form.projectName"
                placeholder="请输入项目名称"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>

          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="工程类型"
              name="projectType"
              :rules="[{ required: true, message: '请选择工程类型' }]"
            >
              <a-select
                v-model:value="form.projectType"
                placeholder="请输入工程类型"
                :disabled="true"
              >
                <a-select-option value="WATERWAY">水运工程</a-select-option>
                <a-select-option value="LANDWAY">公路工程</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="项目建设管理单位">
              <a-input
                v-model:value="form.projectConstructionManagementUnit"
                placeholder="请输入项目建设管理单位"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="项目所在"
              name="provinceCity"
              :rules="[{ required: true, message: '请选择项目所在' }]"
            >
              <a-cascader
                v-model:value="form.provinceCity"
                :options="filterCityData"
                placeholder="请选择项目所在"
                :disabled="disabled"
                @change="changeProvince"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="标段号">
              <a-input v-model:value="form.lotNo" placeholder="请输入标段号" :disabled="disabled" />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="委托类型"
              name="testCategory"
              :rules="[{ required: true, message: '请输入委托类型' }]"
            >
              <a-input
                v-model:value="form.testCategory"
                placeholder="请输入委托类型"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="委托人名称"
              name="consignUnit"
              :rules="[{ required: true, message: '请输入委托人名称' }]"
            >
              <a-input
                v-model:value="form.consignUnit"
                placeholder="请输入委托人名称"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="合同名称"
              name="contractName"
              :rules="[{ required: true, message: '请输入合同名称' }]"
            >
              <a-input
                v-model:value="form.contractName"
                placeholder="请输入合同名称"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="合同价(万元)"
              name="contractAmount"
              :rules="[{ required: true, message: '请输入合同价' }]"
            >
              <a-input-number
                v-model:value="form.contractAmount"
                style="width: 100%"
                :controls="false"
                :min="0"
                :precision="2"
                placeholder="请输入合同价"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="合同履行开始时间"
              name="startTimeOfContract"
              :rules="[{ required: true, message: '请选择合同履行开始时间' }]"
            >
              <a-date-picker
                v-model:value="form.startTimeOfContract"
                :disabled="disabled"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="合同履行结束时间"
              name="endTimeOfContract"
              :rules="[{ required: true, message: '请选择合同履行结束时间' }]"
            >
              <a-date-picker
                v-model:value="form.endTimeOfContract"
                :disabled="disabled"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="技术等级">
              <a-input
                v-model:value="form.technicalGrade"
                placeholder="请输入技术等级"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item
              label="结算价(万元)"
              name="settlementAmount"
              :rules="[{ required: true, message: '请输入结算价' }]"
            >
              <a-input-number
                v-model:value="form.settlementAmount"
                style="width: 100%"
                :min="0"
                :precision="2"
                :controls="false"
                placeholder="请输入结算价"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="联合体业绩">
              <a-input
                v-model:value="form.jointAchievement"
                placeholder="请输入联合体业绩"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24" :lg="12" :xxl="8">
            <a-form-item label="主要合同内容">
              <a-input
                v-model:value="form.contractMainContent"
                placeholder="请输入主要合同内容"
                :disabled="disabled"
              />
            </a-form-item>
          </a-col>
          <a-col :sm="24">
            <a-form-item
              label="检测报告台账"
              name="attachments"
              :rules="[{ required: true, message: '请上传检测报告台账' }]"
            >
              <UploadFile v-if="!disabled" v-model:value="form.attachments" />
              <FileList v-else :datas="form.attachments" />
            </a-form-item>
          </a-col>
          <a-col :sm="24">
            <a-form-item
              label="检测主要人员"
              name="persons"
              :rules="[{ required: true, message: '请选择检测主要人员' }]"
            >
              <a-form-item-rest>
                <a-table
                  :data-source="form.persons"
                  :columns="columns"
                  :pagination="false"
                  size="small"
                  bordered
                >
                  <template #bodyCell="{ column, record, index }">
                    <template v-if="column.key == 'position'">
                      <a-input
                        v-model:value="record.position"
                        :disabled="disabled"
                        placeholder="请输入人员职务"
                      />
                    </template>
                    <template v-if="column.key == 'achievementDescription'">
                      <a-input
                        v-model:value="record.achievementDescription"
                        :disabled="disabled"
                        placeholder="请输入业绩描述"
                      />
                    </template>
                    <template v-if="column.key == 'date'">
                      <a-range-picker
                        v-model:value="record.date"
                        style="width: 220px"
                        :disabled="disabled"
                      />
                    </template>
                    <template v-if="column.key == 'handle'">
                      <a-button type="link" danger @click="removeRow(index)">移除</a-button>
                    </template>
                  </template>
                </a-table>
              </a-form-item-rest>
              <div
                v-if="!disabled"
                class="blue"
                style="padding: 10px 0; display: inline-block; cursor: pointer"
                @click="choosePersonnel"
              >
                <plus-outlined />
                添加检测主要人员
              </div>
            </a-form-item>
          </a-col>
          <a-col :sm="24">
            <a-form-item
              label="检测内容"
              name="contents"
              :rules="[{ required: true, message: '请选择检测内容' }]"
            >
              <a-table
                :data-source="form.contents"
                :columns="contentsColumns"
                :pagination="false"
                size="small"
                bordered
              />
              <div
                v-if="!disabled"
                class="blue"
                style="padding: 10px 0; display: inline-block; cursor: pointer"
                @click="chooseTestProject"
              >
                <plus-outlined />
                选择检测内容
              </div>
            </a-form-item>
            <a-col
              v-if="((!form.external && !_isForce) || isAudit()) && form.projectType == 'LANDWAY'"
              :sm="24"
              :lg="12"
              :xxl="8"
            >
              <a-form-item
                label="审核单位"
                name="auditUnitId"
                :rules="[{ required: true, message: '请选择审核单位' }]"
              >
                <common-select
                  v-model:value="form.auditUnitId"
                  :url="admList()"
                  placeholder="请选择审核单位"
                  :disabled="disabled"
                  :config="{
                    keyword: 'orgName'
                  }"
                />
              </a-form-item>
            </a-col>
          </a-col>
        </a-row>
      </a-form>
    </a-spin>

    <PersonnelModal
      v-model:visible="visiblePersons"
      :selected="form.persons"
      :org-id="form.orgId"
      @confirm="getPersonnel"
    />

    <TestProject
      ref="testProject"
      :key="refreshKey"
      :selected="form.contents"
      @confirm="getTestProject"
    />
  </a-modal>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch, nextTick } from "vue"
import { PlusOutlined } from "@ant-design/icons-vue"
import { message } from "ant-design-vue"
import dayjs from "dayjs"
import UploadFile from "@/components/uploadFile/index.vue"
import PersonnelModal from "@/components/commonListModal/personnel.vue"
import CommonSelect from "@/components/commonSelect/index.vue"
import TestProject from "@/components/testProject/index.vue"
import FileList from "@/components/fileList/index.vue"
import { testSaveApi, testDetailApi, testForceEditApi } from "@/api/performance.api"
import { admList } from "@/api/commonSelect.api"
import type { testDataItemType } from "@/type/api/performance.api"
import type { TableColumnType } from "ant-design-vue"
import cityData from "@/assets/js/citydata.js"
import userStore from "@/stores/userInfo"
const { userInfo } = userStore()

const emit = defineEmits(["updateList"])

const visible = ref<boolean>(false)
const spinning = ref<boolean>(false)
const disabled = ref<boolean>(false)
const _isForce = ref<boolean>(false) // 是否强制变更
const mtitle = ref<string>("业绩编辑")
const dataId = ref<string>("")
const openModal = (title: string, id: string, isEdit: boolean, isForce?: boolean) => {
  mtitle.value = title
  dataId.value = id || ""
  disabled.value = !isEdit
  _isForce.value = isForce || false
  visible.value = true
  if (!isEdit) {
    columns.pop()
  }
  id && getDetailData()
}

defineExpose({
  openModal
})

const filterCityData = ref([])
onMounted(() => {
  filterCityData.value = cityData
  // filterCityData.value = cityData.filter((d: any) => d.label.indexOf("重庆") === -1)
})

const getDetailData = () => {
  spinning.value = true
  testDetailApi(dataId.value).then((res: any) => {
    spinning.value = false
    if (res.startTimeOfContract) {
      res.startTimeOfContract = dayjs(res.startTimeOfContract)
    }
    if (res.endTimeOfContract) {
      res.endTimeOfContract = dayjs(res.endTimeOfContract)
    }
    res.provinceCity = [res.locatedProvince, res.locatedCity]
    res.contents = setRowSpan(res.contents)
    res.persons.forEach((d: any) => {
      d.id = d.personId
      d.date = d.entranceTime && d.leaveTime ? [dayjs(d.entranceTime), dayjs(d.leaveTime)] : []
    })
    form.value = res
    if (res.projectType == "WATERWAY") {
      //如果是水运工程 直接把审核单位固定为规发中心id 审核
      form.value.auditUnitId = "1660538900868845569"
    }
    // 编辑时默认校验不生效，手动延迟触发校验
    if (!disabled.value) {
      setTimeout(() => {
        formRef.value.validateFields(["contents"])
      }, 0)
    }
  })
}

const form = ref<testDataItemType>({
  orgId: userInfo.type == "ORG" ? userInfo.orgId : "",
  orgName: userInfo.type == "ORG" ? userInfo.orgName : "",
  projectName: "",
  projectType: "WATERWAY",
  projectConstructionManagementUnit: "",
  locatedProvince: "",
  locatedCity: "",
  external: true,
  lotNo: "",
  testCategory: "",
  consignUnit: "",
  contractName: "",
  contractAmount: 0,
  startTimeOfContract: "",
  endTimeOfContract: "",
  technicalGrade: "",
  settlementAmount: 0,
  jointAchievement: "",
  contractMainContent: "",
  persons: [],
  contents: [],
  attachments: [],
  auditUnitId: "",
  status: "",
  provinceCity: []
})

const columns = reactive<TableColumnType[]>([
  {
    dataIndex: "index",
    key: "index",
    width: 50,
    align: "center",
    customRender: ({ index }) => {
      return index + 1
    }
  },
  {
    title: "姓名",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "身份证号",
    dataIndex: "idCard",
    key: "idCard"
  },
  {
    title: "职务",
    dataIndex: "position",
    key: "position"
  },
  {
    title: "业绩描述",
    dataIndex: "achievementDescription",
    key: "achievementDescription"
  },
  {
    title: "任职时间",
    dataIndex: "date",
    key: "date",
    width: 220
  },
  {
    title: "操作",
    dataIndex: "handle",
    key: "handle",
    width: 60
  }
])

// 是否需要审核
const isAudit = () => {
  const _form = form.value
  return Boolean(
    !_isForce.value && // 非强制编辑
      _form.status && // 存在状态(非新增)
      _form.status != "WAIT_PUBLISH" && // 待发布
      (!disabled.value || (disabled.value && _form.auditUnitId)) // 编辑状态 或 存在审核机构的详情状态
  )
}

// 项目所在
const changeProvince = (e: string[]) => {
  if (!e) return
  form.value.external = e[0].indexOf("重庆") === -1
}

// 选择业绩关联人员
const visiblePersons = ref<boolean>(false)
const choosePersonnel = () => {
  visiblePersons.value = true
}

const getPersonnel = (list: any) => {
  if (list.length == 0) return
  form.value.persons = list.map((d: any) => {
    const item = form.value.persons.find((p) => p.personId == d.id)
    return {
      personId: d.id,
      name: d.name,
      idCard: d.idNum,
      position: d.duties,
      achievementDescription: item ? item.achievementDescription : ""
    }
  })
  formRef.value.validateFields(["persons"])
  visiblePersons.value = false
}

// 检测内容
const contentsColumns = reactive<TableColumnType[]>([
  {
    title: "专业类型",
    dataIndex: "majors",
    key: "majors",
    customCell: (record) => {
      return { rowSpan: record.rowSpan1 }
    }
  },
  {
    title: "类别",
    dataIndex: "classification",
    key: "classification",
    customCell: (record) => {
      return { rowSpan: record.rowSpan2 }
    }
  },
  {
    title: "试验项目",
    dataIndex: "content",
    key: "content"
  }
])
const testProject = ref()
const refreshKey = ref()
const chooseTestProject = () => {
  refreshKey.value = new Date().getTime()
  nextTick(() => {
    testProject.value.openModal()
  })
}
const getTestProject = (data: any) => {
  form.value.contents = setRowSpan(data)
}

watch(
  () => form.value.contents,
  () => {
    if (disabled.value) return
    formRef.value.validateFields(["contents"])
  }
)
watch(
  () => form.value.attachments,
  () => {
    if (disabled.value) return
    nextTick(() => {
      formRef.value.validateFields(["attachments"])
    })
  }
)

// 处理合并行
const setRowSpan = (list: any[]) => {
  if (!list || list.length == 0) return []
  let item: any = {}
  let item2: any = {}
  for (let i = 0; i < list.length; i++) {
    let d = list[i]
    d.rowSpan1 = 1
    d.rowSpan2 = 1
    if (d.majors !== item.majors) {
      item = d
    } else {
      d.rowSpan1 = 0
      item.rowSpan1 && item.rowSpan1++
    }
    if (d.classification !== item2.classification) {
      item2 = d
    } else {
      d.rowSpan2 = 0
      item2.rowSpan2 && item2.rowSpan2++
    }
  }
  return list
}

// 移除
const removeRow = (ind: number) => {
  form.value.persons.splice(ind, 1)
}

// 保存
const formRef = ref()
const saveLoading = ref(false)
const saveModal = async () => {
  if (disabled.value) {
    visible.value = false
    return
  }
  await formRef.value?.validateFields()
  const params = { ...form.value }
  // 合同履行时间
  if (params.startTimeOfContract) {
    params.startTimeOfContract = dayjs(params.startTimeOfContract).valueOf()
  }
  if (params.endTimeOfContract) {
    params.endTimeOfContract = dayjs(params.endTimeOfContract).valueOf()
  }
  // 项目所在
  if (params.provinceCity && params.provinceCity.length) {
    params.locatedCity = params.provinceCity[1] || ""
    params.locatedProvince = params.provinceCity[0] || ""
    delete params.provinceCity
  }
  if (!params.status) delete params.status
  params.contents.forEach((d) => {
    delete d.id
  })
  // 人员任职时间
  params.persons.forEach((d) => {
    if (d.date && d.date.length > 0) {
      d.entranceTime = dayjs(d.date[0]).valueOf()
      d.leaveTime = dayjs(d.date[1]).valueOf()
    }
    delete d.id
    delete d.date
  })
  params.attachments.forEach((d) => {
    delete d.id
  })
  saveLoading.value = true
  try {
    if (_isForce.value) {
      await testForceEditApi(params)
    } else {
      await testSaveApi(params)
    }
    message.success("保存成功")
    emit("updateList")
    visible.value = false
  } catch (err) {
    saveLoading.value = false
  }
}
</script>

<style lang="less" scoped></style>
