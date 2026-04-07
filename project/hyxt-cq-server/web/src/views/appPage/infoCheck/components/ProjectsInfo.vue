<template>
  <a-form
    ref="editProjectFormRef"
    :model="projectFrom"
    name="basic"
    :label-col="{ span: 9 }"
    :wrapper-col="{ span: 16 }"
    autocomplete="off"
  >
    <a-row :gutter="24">
      <a-col :span="12">
        <a-form-item
          label="项目名称"
          name="name"
          :rules="[{ required: true, message: '请输入项目名称!' }]"
        >
          <a-input
            v-model:value="projectFrom.name"
            :disabled="isDetails"
            placeholder="请输入项目名称"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item
          label="建设单位"
          name="constructorId"
          :rules="[{ required: true, message: '请输入建设单位!' }]"
        >
          <a-select
            v-model:value="projectFrom.constructor"
            show-search
            :disabled="isDetails"
            placeholder="请选择建设单位！"
            :options="constructorOptions"
            :filter-option="filterOption"
            @change="selConstructor"
          ></a-select>
        </a-form-item>
      </a-col>
    </a-row>

    <a-row v-if="dataInfo.kind == 'LANDWAY' && isDetails" :gutter="24">
      <a-col :span="12">
        <a-form-item label="行政等级" name="executiveRank">
          <a-input
            v-model:value="dataInfo.executiveRank"
            :disabled="isDetails"
            placeholder="请输入行政等级"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item label="公路编号" name="roadCode">
          <a-input
            v-model:value="dataInfo.roadCode"
            :disabled="isDetails"
            placeholder="请输入公路编号"
          />
        </a-form-item>
      </a-col>
    </a-row>

    <a-row :gutter="24">
      <a-col :span="12">
        <a-form-item
          label="项目所在区县"
          name="district"
          :rules="[{ required: true, message: '选择项目所在区县!' }]"
        >
          <a-select
            v-model:value="projectFrom.district"
            :disabled="isDetails"
            placeholder="请选择项目所在区县"
          >
            <template v-for="item in cityJson[0].children" :key="item.value">
              <a-select-option :value="item.value">{{ item.value }}</a-select-option>
            </template>
          </a-select>
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item
          label="技术等级"
          name="technicalRank"
          :rules="[{ required: true, message: '请选择技术等级!' }]"
        >
          <!-- <a-select
            v-model:value="projectFrom.technicalRank"
            :disabled="isDetails"
            placeholder="选择技术等级"
          >
            <a-select-option value="航道等级">航道等级</a-select-option>
            <a-select-option value="Ⅰ级">Ⅰ级</a-select-option>
            <a-select-option value="Ⅱ级">Ⅱ级</a-select-option>
            <a-select-option value="Ⅲ级">Ⅲ级</a-select-option>
            <a-select-option value="Ⅳ级">Ⅳ级</a-select-option>
            <a-select-option value="Ⅴ级">Ⅴ级</a-select-option>
            <a-select-option value="Ⅵ级">Ⅵ级</a-select-option>
          </a-select> -->

          <DictCode
            v-model:value="projectFrom.technicalRank"
            code="skill_level"
            placeholder="请选择技术等级"
            :disabled="isDetails"
          />
        </a-form-item>
      </a-col>
    </a-row>

    <a-row :gutter="24">
      <a-col :span="12">
        <a-form-item
          label="建设性质"
          name="type"
          :rules="[{ required: true, message: '选择建设性质!' }]"
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
          :rules="[{ required: true, message: '请选择项目状态!' }]"
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
    </a-row>

    <a-row :gutter="24">
      <a-col :span="12">
        <a-form-item
          label="批准开工日期"
          name="startedDate"
          :rules="
            projectFrom.state != '前期' ? [{ required: true, message: '请选择批准开工日期' }] : []
          "
        >
          <a-date-picker
            v-model:value="projectFrom.startedDate"
            style="width: 100%"
            :disabled="isDetails"
            value-format="YYYY-MM-DD"
          />
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item
          label="批准工期(月)"
          name="approvedDuration"
          :rules="
            projectFrom.state != '前期' ? [{ required: true, message: '请输入批准工期!' }] : []
          "
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
    </a-row>

    <a-row :gutter="24">
      <a-col :span="12">
        <a-form-item
          label="交工时间"
          name="handedOverDate"
          :rules="
            projectFrom.state == '交工' ? [{ required: true, message: '请选择交工时间!' }] : []
          "
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
          :rules="
            projectFrom.state == '竣工' ? [{ required: true, message: '请选择竣工时间!' }] : []
          "
        >
          <a-date-picker
            v-model:value="projectFrom.completedDate"
            style="width: 100%"
            :disabled="isDetails"
            value-format="YYYY-MM-DD"
          />
        </a-form-item>
      </a-col>
    </a-row>
    <a-row :gutter="24">
      <a-col :span="12">
        <a-form-item
          label="项目长度(公里)"
          name="length"
          :rules="[{ required: true, message: '请输入项目长度!' }]"
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
    </a-row>

    <a-row :gutter="24">
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
    </a-row>

    <a-row :gutter="24">
      <a-col v-if="dataInfo.kind == 'LANDWAY' && isDetails" :span="12">
        <a-form-item label="项目编号(代码)" name="scale">
          <a-input
            v-model:value="dataInfo.code"
            style="width: 100%"
            :disabled="isDetails"
            placeholder="请输入项目编号"
          />
        </a-form-item>
      </a-col>

      <a-col :span="12">
        <a-form-item label="建设规模" name="scale">
          <a-input
            v-model:value="projectFrom.scale"
            style="width: 100%"
            :disabled="isDetails"
            placeholder="请输入建设规模"
          />
        </a-form-item>
      </a-col>
    </a-row>
  </a-form>

  <h4 style="margin-bottom: 10px">
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
        <template v-if="record.isEdit">
          <!-- <a-input placeholder="请输入" v-model:value="record.name" style="width: 200px" /> -->
          <common-select
            v-model:value="record.name"
            :url="orgList()"
            placeholder="请选择机构"
            :config="{
              keyword: 'orgName',
              httpSearch: true
            }"
            @change="
              (v) => {
                record.name = v.option.name
              }
            "
          />
        </template>
        <template v-else>
          <span>{{ record.name }}</span>
        </template>
      </template>

      <template v-if="column.key === 'contractSection'">
        <template v-if="record.isEdit">
          <a-input
            v-model:value="record.contractSection"
            placeholder="请输入"
            style="width: 200px"
          />
        </template>
        <template v-else>
          <span>{{ record.contractSection }}</span>
        </template>
      </template>

      <template v-if="column.key === 'segmentName'">
        <template v-if="record.isEdit">
          <a-input v-model:value="record.segmentName" placeholder="请输入" style="width: 200px" />
        </template>
        <template v-else>
          <span>{{ record.segmentName }}</span>
        </template>
      </template>

      <template v-if="column.key === 'contractValue'">
        <template v-if="record.isEdit">
          <a-input v-model:value="record.contractValue" placeholder="请输入" style="width: 200px" />
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
      <div style="text-align: center; cursor: pointer" @click="addRow">
        <a>+ 添加</a>
      </div>
    </template>
  </a-table>

  <h4 style="margin: 10px 0">
    <span style="color: red">*</span>
    工程项目监督机构
  </h4>

  <a-select
    v-model:value="projectFrom.supervisor"
    style="width: 350px"
    show-search
    :default-active-first-option="false"
    :show-arrow="false"
    :filter-option="false"
    placeholder="请输入工程项目监督机构查询后选择"
    :disabled="isDetails"
    :options="bureausOptions"
    @change="selSupervisor"
    @search="handleSearch"
  ></a-select>
</template>

<script lang="ts" setup>
import CommonSelect from "@/components/commonSelect/index.vue"
import DictCode from "@/components/dictCode/index.vue"
import { ref, onMounted, nextTick, toRefs } from "vue"
import { orgList } from "@/api/commonSelect.api"
import cityJson from "@/assets/js/cityChongqing.js"
import {
  addProjectAPI,
  updateProjectAPI,
  getProjectDetailsAPI,
  getSuperviseBureausAPI
} from "@/api/laboratory.api"
import { getConstructorsList } from "@/api/organization.api"
import { Modal, message } from "ant-design-vue"

interface SelOption {
  value: string
  label: string
}

const props = defineProps({
  id: {
    type: String,
    default: ""
  }
})
const { id } = toRefs(props) //父组件参数

const emit = defineEmits(["callBack"])

onMounted(async () => {
  await getConstructorsData()
  await getFormInfo(id.value, true)
})

//获取建设单位
const getConstructorsData = async () => {
  try {
    let res = await getConstructorsList({
      current: 1,
      size: 999999
    })
    constructorOptions.value = res.records.map((it) => {
      return {
        value: it.id,
        label: it.name
      }
    })
  } catch (error) {
    alert(error)
  }
}

let bureausOptions = ref<SelOption[]>([])
let bureausQ = ref("")
//获取监督机构
const getBureausList = async () => {
  if (!bureausQ.value) {
    return
  }
  try {
    let res: any = await getSuperviseBureausAPI({
      partialName: bureausQ.value
    })
    bureausOptions.value = []

    res.forEach((it) => {
      bureausOptions.value.push({
        value: it.id,
        label: it.name
      })
    })
    console.log(33333, bureausOptions.value)
  } catch (error) {
    alert(error)
  }
}

let fromTitle = ref("")

const selConstructor = (v, row) => {
  projectFrom.value.constructorId = row.value
  projectFrom.value.constructor = row.label
}
const selSupervisor = (v, row) => {
  projectFrom.value.supervisorId = row.value
  projectFrom.value.supervisor = row.label
}
let timeout: any
const handleSearch = (v) => {
  if (timeout) {
    clearTimeout(timeout)
    timeout = null
  }
  bureausQ.value = v
  timeout = setTimeout(getBureausList, 300)
}

let constructorOptions = ref<SelOption[]>([])

const filterOption = (v: string, option: any) => {
  return option.label.includes(v)
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
    key: "handle"
  }
]
let dataSource: any = ref([])

let projectFrom: any = ref({
  district: null,
  name: "",
  constructorId: null,
  constructor: "",
  technicalRank: null,
  type: null,
  state: null,
  startedDate: "",
  approvedDuration: "",
  handedOverDate: "",
  completedDate: "",
  length: "",
  estimatedCost: "",
  budget: "",
  finalCost: "",
  superviseLinkman: "",
  supervisorId: null,
  supervisor: "",
  inspectionInstitutions: []
})

const formReset = async () => {
  //重置表单
  await nextTick()
  dataSource.value = []
  projectFrom.value = {
    district: null,
    supervisorId: null,
    supervisor: "",
    name: "",
    constructorId: null,
    constructor: "",
    technicalRank: null,
    type: null,
    state: null,
    startedDate: "",
    approvedDuration: "",
    handedOverDate: "",
    completedDate: "",
    length: "",
    estimatedCost: "",
    budget: "",
    finalCost: "",
    superviseLinkman: "",
    inspectionInstitutions: []
  }
  editProjectFormRef.value && editProjectFormRef.value.resetFields() //重置表单
}

const getFormInfo = (id, isDet = false) => {
  isDetails.value = false
  formReset()
  if (id) {
    isDetails.value = isDet
    getFormDetails(id)
    isDet ? (fromTitle.value = "详情") : (fromTitle.value = "修改")
  } else {
    fromTitle.value = "新增"
  }
  visibleEditProject.value = true
}
let dataInfo: any = ref({})
const getFormDetails = async (id: string) => {
  let res = await getProjectDetailsAPI(id)
  dataInfo.value = res
  projectFrom.value = {
    id: res.id,
    supervisorId: res.bureau ? res.bureau.id : "",
    supervisor: res.bureau ? res.bureau.name : "",
    name: res.name,
    constructorId: res.constructor.id,
    constructor: res.constructor.name,
    technicalRank: res.technicalRank,
    type: res.type,
    district: res.district,
    state: res.state,
    startedDate: res.startedDate,
    approvedDuration: res.approvedDuration,
    handedOverDate: res.handedOverDate,
    completedDate: res.completedDate,
    length: res.length,
    estimatedCost: res.estimatedCost,
    budget: res.budget,
    finalCost: res.finalCost,
    superviseLinkman: res.finalCost
  }
  console.log("回显数据：", projectFrom.value)
  dataSource.value = res.inspectionInstitutions
}

//项目数据提交
const projectFromSubmit = async () => {
  console.log(3333, projectFrom.value)
  if (isDetails.value) {
    //如果是详情模式直接关闭
    visibleEditProject.value = false
    return
  }
  try {
    await editProjectFormRef.value.validateFields() //验证
    let falg = dataSource.value.some((it) => {
      return it.isEdit == true
    })
    if (falg) {
      message.warning("存在正在编辑的检测机构信息，请保存后再进行保存")
      return
    } else if (dataSource.value.length == 0) {
      message.warning("至少添加一条检测机构数据")
      return
    }
    if (!projectFrom.value.supervisorId) {
      message.warning("请选择工程项目监督机构")
      return
    }
  } catch (error) {
    console.error("表单验证失败")
    return
  }
  projectFrom.value.inspectionInstitutions = dataSource.value
  try {
    projectFrom.value.id
      ? await updateProjectAPI(projectFrom.value)
      : await addProjectAPI(projectFrom.value) //判断是用新增还是修改
    emit("callBack")
    formReset()
    visibleEditProject.value = false
    message.success("操作成功!")
  } catch (error) {
    console.error("操作失败")
  }
}
defineExpose({})
</script>
<style lang="less" scoped>
.action_row {
  row-gap: 0px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
}
</style>
