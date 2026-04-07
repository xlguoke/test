<template>
  <div style="width: 92%; margin: 20px auto 0">
    <a-form
      ref="editProjectFormRef"
      :model="projectFrom"
      name="basic"
      :label-col="{ style: { width: '130px' } }"
      autocomplete="off"
    >
      <h4 style="font-weight: 600; font-size: 16px">基本信息</h4>
      <a-row :gutter="24">
        <a-col :span="24">
          <a-form-item
            label="工程类型"
            name="projectType"
            :rules="[{ required: true, message: '请选择工程类型' }]"
          >
            <a-radio-group v-model:value="projectFrom.projectType" :options="plainOptions" />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item
            label="项目名称"
            name="name"
            :rules="[{ required: true, message: '请输入项目名称' }]"
          >
            <a-input
              v-if="projectFrom.projectType === '2'"
              v-model:value="projectFrom.name"
              :disabled="isDetails"
              placeholder="请输入项目名称"
            />
            <a-select
              v-else
              v-model:value="projectFrom.name"
              show-search
              :default-active-first-option="false"
              :show-arrow="false"
              :filter-option="false"
              placeholder="请输入在重庆市公路建设信用系统已登记的公路项目名称"
              :disabled="isDetails"
              :options="projectDatas"
              @change="selProject"
              @search="searchProject"
            ></a-select>
          </a-form-item>
        </a-col>
        <template v-if="projectFrom.projectType === '2'">
          <a-col :span="12">
            <a-form-item
              label="项目所在区县"
              name="district"
              :rules="[{ required: true, message: '选择项目所在区县' }]"
            >
              <a-select
                v-model:value="projectFrom.district"
                :disabled="isDetails"
                placeholder="请选择项目所在区县"
              >
                <template v-for="item in cityJson[0].children" :key="item.value">
                  <a-select-option :value="item.value">
                    {{ item.value }}
                  </a-select-option>
                </template>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              label="技术等级"
              name="technicalRank"
              :rules="[{ required: true, message: '请选择技术等级' }]"
            >
              <DictCode
                v-model:value="projectFrom.technicalRank"
                code="waterway_skill_level"
                :disabled="isDetails"
                placeholder="选择技术等级"
              />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item
              label="建设性质"
              name="type"
              :rules="[{ required: true, message: '选择建设性质' }]"
            >
              <a-select
                v-model:value="projectFrom.type"
                :disabled="isDetails"
                placeholder="选择建设性质"
              >
                <a-select-option value="改建">改建</a-select-option>
                <a-select-option value="改造">改造</a-select-option>
                <a-select-option value="新建">新建</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item
              label="项目状态"
              name="state"
              :rules="[{ required: true, message: '请选择项目状态' }]"
            >
              <a-select
                v-model:value="projectFrom.state"
                :disabled="isDetails"
                placeholder="请选择项目状态"
              >
                <a-select-option value="前期">前期</a-select-option>
                <a-select-option value="在建">在建</a-select-option>
                <a-select-option value="交工">交工</a-select-option>
                <a-select-option value="竣工">竣工</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item
              label="批准开工日期"
              name="startedDate"
              :rules="[
                {
                  required: projectFrom.state && projectFrom.state !== '前期',
                  message: '请选择批准开工日期'
                }
              ]"
            >
              <a-date-picker
                v-model:value="projectFrom.startedDate"
                value-format="YYYY-MM-DD"
                style="width: 100%"
                :disabled="isDetails"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              label="批准工期(月)"
              name="approvedDuration"
              :rules="[
                {
                  required: projectFrom.state && projectFrom.state !== '前期',
                  message: '请选择批准工期'
                }
              ]"
            >
              <a-input-number
                v-model:value="projectFrom.approvedDuration"
                style="width: 100%"
                :disabled="isDetails"
                :min="1"
                placeholder="请输入批准工期"
              />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item
              label="交工时间"
              name="handedOverDate"
              :rules="[{ required: projectFrom.state === '交工', message: '请选择交工时间' }]"
            >
              <a-date-picker
                v-model:value="projectFrom.handedOverDate"
                style="width: 100%"
                :disabled="isDetails"
                value-format="YYYY-MM-DD"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item
              label="竣工时间"
              name="completedDate"
              :rules="[{ required: projectFrom.state === '竣工', message: '请选择竣工时间' }]"
            >
              <a-date-picker
                v-model:value="projectFrom.completedDate"
                style="width: 100%"
                :disabled="isDetails"
                value-format="YYYY-MM-DD"
              />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item
              label="项目长度(公里)"
              name="length"
              :rules="[{ required: true, message: '请输入项目长度' }]"
            >
              <a-input-number
                v-model:value="projectFrom.length"
                style="width: 100%"
                :disabled="isDetails"
                placeholder="请输入项目长度"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="项目概算(万元)" name="estimatedCost">
              <a-input-number
                v-model:value="projectFrom.estimatedCost"
                style="width: 100%"
                :disabled="isDetails"
                placeholder="请输入项目概算"
              />
            </a-form-item>
          </a-col>

          <a-col :span="12">
            <a-form-item label="项目预算(万元)" name="budget">
              <a-input-number
                v-model:value="projectFrom.budget"
                style="width: 100%"
                :disabled="isDetails"
                placeholder="请输入项目预算"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12">
            <a-form-item label="项目决算(万元)" name="finalCost">
              <a-input-number
                v-model:value="projectFrom.finalCost"
                style="width: 100%"
                :disabled="isDetails"
                placeholder="请输入项目决算"
              />
            </a-form-item>
          </a-col>

          <a-col :span="24">
            <a-form-item label="建设规模" name="scale">
              <a-textarea
                v-model:value="projectFrom.scale"
                :disabled="isDetails"
                placeholder="请输入建设规模"
              />
            </a-form-item>
          </a-col>
        </template>
      </a-row>
    </a-form>

    <template v-if="projectFrom.projectType === '2'">
      <h4 style="margin-bottom: 10px; font-weight: 600; font-size: 16px">
        <span style="color: red">*</span>
        检测机构信息
      </h4>
      <a-table
        :data-source="dataSource"
        :columns="columns"
        bordered
        size="small"
        :pagination="false"
        row-key="id"
        :locale="{
          emptyText: '未添加数据!'
        }"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'name'">
            <CommonSelect
              v-show="record.isEdit"
              v-model:value="record.name"
              url="/portal/org/remote"
              style="width: 200px"
              :config="{
                httpSearch: true,
                keyword: 'q',
                placeholder: '输入机构名称查询'
              }"
              @change="
                (obj) => {
                  record.name = obj.option.name
                  record.businessLicenseRegistrationNumber = obj.option.businessLicenseRegistrationNumber
                }
              "
            />
            <span v-show="!record.isEdit">{{ record.name }}</span>
          </template>

          <template v-if="column.key === 'contractSection'">
            <template v-if="record.isEdit">
              <a-input
                v-model:value="record.contractSection"
                style="width: 140px"
                placeholder="请输入"
              />
            </template>
            <template v-else>
              <span>{{ record.contractSection }}</span>
            </template>
          </template>

          <template v-if="column.key === 'segmentName'">
            <template v-if="record.isEdit">
              <a-input
                v-model:value="record.segmentName"
                style="width: 130px"
                placeholder="请输入"
              />
            </template>
            <template v-else>
              <span>{{ record.segmentName }}</span>
            </template>
          </template>

          <template v-if="column.key === 'contractValue'">
            <template v-if="record.isEdit">
              <a-input-number
                v-model:value="record.contractValue"
                style="width: 120px"
                placeholder="请输入"
              />
            </template>
            <template v-else>
              <span>{{ record.contractValue }}</span>
            </template>
          </template>

          <template v-if="column.key == 'handle'">
            <a-space v-if="!isDetails">
              <a-button v-show="!record.isEdit" type="link" size="small" @click="editRow(record)">
                编辑
              </a-button>
              <a-button v-show="record.isEdit" type="link" size="small" @click="saveRow(record)">
                保存
              </a-button>
              <a-button type="link" danger size="small" @click="delRow(index)">删除</a-button>
            </a-space>
          </template>
        </template>

        <template v-if="!isDetails" #footer>
          <div style="text-align: center">
            <a-button type="link" @click="addRow">+ 添加</a-button>
          </div>
        </template>
      </a-table>
    </template>

    <h4 style="margin: 20px 0 10px; font-weight: 600; font-size: 16px">
      <span style="color: red">*</span>
      工程项目监督机构
    </h4>
    <a-select
      v-model:value="projectFrom.supervisorId"
      style="width: 350px"
      show-search
      :default-active-first-option="false"
      :show-arrow="false"
      :filter-option="false"
      placeholder="请输入工程项目监督机构"
      :disabled="isDetails"
      :options="bureausOptions"
      @change="selSupervisor"
      @search="handleSearch"
    ></a-select>

    <div style="padding-top: 50px; text-align: center">
      <a-button style="margin-right: 30px" @click="prevStep">上一步</a-button>
      <a-button type="primary" style="width: 120px" :loading="loading" @click="projectFromSubmit">
        提交
      </a-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, watch } from "vue"
import { message } from "ant-design-vue"
import CommonSelect from "@/components/commonSelect/index.vue"
import DictCode from "@/components/dictCode/index.vue"
import { debounce } from "@/assets/js/utils"
import cityJson from "@/assets/js/cityChongqing.js"
import {
  getBureaus,
  getProjectList,
  enrollmentConstructors,
  enrollmentWaterConstructors
} from "@/api/home.api"
import { EnrollmentConstructorType, ProjcetType } from "@/type/api/botSignIn"

const formObj = ref<EnrollmentConstructorType>(inject("formObj") as EnrollmentConstructorType)
const stepActive = ref<number>(inject("stepActive") || 0)
const projectFrom = ref<ProjcetType>({
  projectType: "1",
  name: undefined,
  id: undefined,
  district: undefined,
  type: undefined,
  state: undefined,
  startedDate: "",
  handedOverDate: "",
  completedDate: "",
  technicalRank: undefined,
  executiveRank: "",
  approvedDuration: "",
  length: "",
  scale: "",
  inspectionInstitutions: [],
  supervisorId: undefined,
  supervisor: "",
  budget: "",
  estimatedCost: "",
  finalCost: ""
})

const plainOptions = ref([
  { label: "公路工程", value: "1" },
  { label: "水运工程", value: "2" }
])

const loading = ref(false)

interface SelOption {
  value: ""
  label: ""
}

// 工程项目
const projectDatas = ref([])
let searchVal = ref("")
const getProjecctDatas = () => {
  const unitName = formObj.value.name as ""
  if (!unitName) return
  getProjectList(unitName, searchVal.value)
    .then((res) => {
      res.forEach((d) => {
        d.label = d.name
        d.value = d.id
      })
      projectDatas.value = res
    })
    .catch((err) => {
      console.log(err)
      message.error((err && err.message) || "系统异常，请稍后重试！")
    })
}
const searchProject = (val) => {
  debounce(() => {
    searchVal.value = val.trim()
    getProjecctDatas()
  }, 300)
}
let projectInfo: any = {
  constructor: {}
}
const selProject = (val, row) => {
  projectInfo = row
}

watch(
  () => stepActive.value,
  (val) => {
    if (val === 1) {
      getProjecctDatas()
      getBureausList()
    }
  }
)

let bureausOptions = ref<SelOption[]>([])
let bureausQ = ref("")
//获取监督机构
const getBureausList = async () => {
  try {
    let res: any = await getBureaus(bureausQ.value)
    bureausOptions.value = []
    res.forEach((it) => {
      bureausOptions.value.push({
        value: it.id,
        label: it.name
      })
    })
  } catch (err: any) {
    message.error((err && err.message) || "系统异常，请稍后重试！")
  }
}

const selSupervisor = (v, row) => {
  projectFrom.value.supervisorId = row.value
  projectFrom.value.supervisor = row.label
}
const handleSearch = (v) => {
  debounce(() => {
    bureausQ.value = v.trim()
    getBureausList()
  }, 300)
}

const isDetails = ref(false)
const visibleEditProject = ref<boolean>(false)

let editProjectFormRef = ref()

const addRow = () => {
  let falg = dataSource.value.some((it) => {
    return it.isEdit == true
  })
  if (!falg) {
    dataSource.value.push({
      name: "",
      contractSection: "",
      segmentName: "",
      contractValue: "",
      isEdit: true
    })
  } else {
    message.warning("存在正在编辑的行，请保存后再进行添加")
  }
}
const editRow = (row) => {
  let falg = dataSource.value.some((it) => {
    return it.isEdit == true
  })
  if (!falg) {
    row.isEdit = true
  } else {
    message.warning("存在正在编辑的行，请保存后再进行编辑")
  }
}
const saveRow = (row) => {
  if (row.name && row.contractSection && row.segmentName && row.contractValue) {
    row.isEdit = false
  } else {
    message.warning("请填写完整，再进行保存")
  }
}

const delRow = (index) => {
  dataSource.value.splice(index, 1)
}
let columns = [
  {
    title: "序号",
    dataIndex: "index",
    key: "",
    width: 50,
    customRender: function ({ index }) {
      return index + 1
    }
  },
  {
    title: "单位名称",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "合同名称",
    dataIndex: "contractSection",
    key: "contractSection"
  },
  {
    title: "标段号",
    dataIndex: "segmentName",
    key: "segmentName"
  },
  {
    title: "合同价（万元）",
    dataIndex: "contractValue",
    key: "contractValue"
  },
  {
    title: "操作",
    key: "handle",
    width: 120
  }
]
let dataSource: any = ref([])

//项目数据提交
const projectFromSubmit = async () => {
  const projectType = projectFrom.value.projectType
  console.log(projectInfo)
  try {
    await editProjectFormRef.value.validateFields() //验证
    let falg = dataSource.value.some((it) => {
      return it.isEdit == true
    })
    if (projectType == "2") {
      if (falg) {
        message.warning("存在正在编辑的检测机构信息，请保存后再进行保存")
        return
      } else if (dataSource.value.length == 0) {
        message.warning("至少添加一条检测机构数据")
        return
      }
    }
    if (!projectFrom.value.supervisorId) {
      message.warning("请选择工程项目监督机构")
      return
    }
  } catch (error) {
    console.error("表单验证失败")
    return
  }
  const list = JSON.parse(JSON.stringify(dataSource.value))
  list.forEach((d) => {
    delete d.isEdit
  })
  projectFrom.value.inspectionInstitutions = list
  loading.value = true
  try {
    visibleEditProject.value = false
    const params = { ...formObj.value }
    delete params.unitAddress
    if (projectType == "2") {
      params.project = projectFrom.value
      await enrollmentConstructors(params)
    } else {
      params.project = {
        name: projectInfo.name,
        id: projectInfo.id,
        constructorId: projectInfo.constructor.id,
        constructor: projectInfo.constructor.name,
        supervisorId: projectFrom.value.supervisorId,
        supervisor: projectFrom.value.supervisor
      }
      await enrollmentWaterConstructors(params)
    }
    stepActive.value++
    message.success("操作成功!")
    loading.value = false
  } catch (error) {
    loading.value = false
    console.error(error)
  }
}

const prevStep = () => {
  stepActive.value--
}
</script>

<style lang="less" scoped></style>
