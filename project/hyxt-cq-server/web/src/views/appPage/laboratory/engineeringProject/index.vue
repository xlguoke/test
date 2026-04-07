<template>
  <div>
    <a-spin tip="加载中..." :spinning="spinning">
      <a-row class="action_row">
        <div class="lt">
          <a-space>
            <a-select
              ref="select"
              v-model:value="queryFrom.state"
              style="width: 180px"
              placeholder="请选择项目状态"
              @change="resetQueryList"
            >
              <a-select-option value="">全部状态</a-select-option>
              <a-select-option value="前期">前期</a-select-option>
              <a-select-option value="在建">在建</a-select-option>
              <a-select-option value="交工">交工</a-select-option>
              <a-select-option value="竣工">竣工</a-select-option>
            </a-select>

            <a-select
              ref="select"
              v-model:value="queryFrom.kind"
              style="width: 180px"
              placeholder="请选择类型"
              @change="resetQueryList"
            >
              <a-select-option value="">全部类型</a-select-option>
              <a-select-option value="WATERWAY">水运工程</a-select-option>
              <a-select-option value="LANDWAY">公路工程</a-select-option>
            </a-select>

            <a-input-search
              v-model:value="queryFrom.q"
              placeholder="请输入项目名称"
              enter-button
              @search="resetQueryList"
            />
          </a-space>
        </div>
        <div class="rt">
          <a-space>
            <a-button v-auth="'project::sync'" type="primary" @click="syncProject">
              同步公路工程项目
            </a-button>
            <a-button v-auth="'project::add'" type="primary" @click="openAddProject">
              新增水运工程项目
            </a-button>
            <!-- <a-button v-auth="'project::merge'" @click="mergeProject">项目合并</a-button> -->
          </a-space>
        </div>
      </a-row>
      <a-table
        :data-source="dataSource"
        :columns="columns"
        bordered
        size="small"
        :row-selection="rowSelection"
        :pagination="pagination"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'createdAt'">
            <span>{{ formatDate(record.createdAt) }}</span>
          </template>

          <template v-if="column.key === 'handle'">
            <a-space>
              <template v-if="record.ourUnit">
                <a-button
                  v-if="record.kind == 'WATERWAY' && record.auditStatus != 'PENDING'"
                  v-auth="'project::edit'"
                  size="small"
                  type="primary"
                  @click="openEditProject(record)"
                >
                  {{ record.auditStatus == "APPROVED" ? "更新信息" : "编辑" }}
                </a-button>

                <!-- <a-button
                v-if="!record.closed"
                v-auth="'project::update'"
                size="small"
                type="primary"
                @click="openEditProject(record, 2)"
              >
                更新信息
              </a-button> -->

                <a-popconfirm
                  v-if="record.kind == 'WATERWAY' && record.auditStatus == 'REJECTED'"
                  title="确认删除?"
                  ok-text="Yes"
                  cancel-text="No"
                  @confirm="deleteRow(record)"
                >
                  <a-button v-auth="'project::del'" size="small" type="primary" danger>
                    删除项目
                  </a-button>
                </a-popconfirm>
              </template>
              <a-button
                v-auth="'project::info'"
                size="small"
                type="primary"
                @click="openCheckDetails(record)"
              >
                查看详情
              </a-button>
              <!-- <template v-if="record.status == '已完工'">
                <a-button
                  v-if="record.closed"
                  v-auth="'project::startup'"
                  size="small"
                  type="primary"
                  @click="unlockProject(record)"
                >
                  开启项目
                </a-button>
                <a-button
                  v-else
                  v-auth="'project::shutdown'"
                  size="small"
                  type="primary"
                  @click="closeProject(record)"
                >
                  关闭项目
                </a-button>
              </template> -->
            </a-space>
          </template>
          <template v-if="column.key === 'createdAt'">
            <span>{{ formatDate(record.createdAt) }}</span>
          </template>
          <template v-if="column.key === 'closed'">
            <a-tag v-if="record.closed" color="#f50">已关闭</a-tag>
          </template>

          <template v-if="column.key === 'state'">
            <span style="margin-right: 20px">{{ record.state }}</span>
            <template v-if="record.kind == 'WATERWAY'">
              <a-badge
                v-if="'PENDING,INITIAL'.includes(record.auditStatus)"
                color="cyan"
                text="审核中"
              />
              <a-badge
                v-else-if="'APPROVED'.includes(record.auditStatus)"
                color="green"
                text="已审核"
              />
              <a-badge
                v-else-if="'REJECTED'.includes(record.auditStatus)"
                color="orange"
                text="不通过"
              />
            </template>
          </template>
        </template>
      </a-table>

      <!-- <a-modal
        v-if="visibleEditProject"
        v-model:visible="visibleEditProject"
        width="950px"
        :centered="true"
        :title="fromTitle"
        @ok="projectFromSubmit"
      >
        <a-form
          ref="editProjectFormRef"
          :model="projectFrom"
          name="basic"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 18 }"
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
                label="重点项目"
                name="priority"
                :rules="[{ required: true, message: '请选择是否重点项目!' }]"
              >
                <a-radio-group v-model:value="projectFrom.priority" :disabled="isDetails">
                  <a-radio :value="true">是</a-radio>
                  <a-radio :value="false">否</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item
                label="项目等级"
                name="projectLevel"
                :rules="[{ required: true, message: '选择项目等级!' }]"
              >
                <a-select
                  v-model:value="projectFrom.projectLevel"
                  :disabled="isDetails"
                  placeholder="选择项目等级"
                >
                  <a-select-option value="1">公路工程选项</a-select-option>
                  <a-select-option value="2">高速公路</a-select-option>
                  <a-select-option value="3">一级公路</a-select-option>
                  <a-select-option value="4">二级公路</a-select-option>
                  <a-select-option value="5">三级公路</a-select-option>
                  <a-select-option value="6">四级公路</a-select-option>
                  <a-select-option value="7">其他等级</a-select-option>
                  <a-select-option value="8">水运工程选项</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item
                label="建设单位"
                name="builder"
                :rules="[{ required: true, message: '请输入建设单位!' }]"
              >
                <a-input
                  v-model:value="projectFrom.builder"
                  :disabled="isDetails"
                  placeholder="请输入建设单位"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item
                label="项目状态"
                name="status"
                :rules="[{ required: true, message: '选择项目状态!' }]"
              >
                <a-select
                  ref="select"
                  v-model:value="projectFrom.status"
                  :disabled="statusP"
                  placeholder="选择项目状态"
                >
                  <a-select-option value="建设中">建设中</a-select-option>
                  <a-select-option value="已完工">已完工</a-select-option>
                  <a-select-option v-if="statusP" value="未审核">未审核</a-select-option>
                  <a-select-option v-if="statusP" value="审核中">审核中</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item label="建设周期" name="commenceDate">
                <a-range-picker
                  v-model:value="dateRangeValue"
                  :disabled="isDetails"
                  :placeholder="['开工日期', '(拟)完工日期']"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item
                label="工程投资"
                name="investment"
                :rules="[{ required: true, message: '请输入工程投资!' }]"
              >
                <a-input
                  v-model:value="projectFrom.investment"
                  :disabled="isDetails"
                  placeholder="请输入工程投资"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item
                label="监督机构"
                name="supervise"
                :rules="[{ required: true, message: '选择监督机构!' }]"
              >
                <a-select
                  v-model:value="projectFrom.superviseId"
                  :disabled="isDetails"
                  placeholder="请选择监督机构"
                  @change="selSupervise"
                >
                  <a-select-option v-for="item in supervisoryArray" :key="item.id" :value="item.id">
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
          </a-row>

          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item
                label="监督联系人"
                name="superviseLinkman"
                :rules="[{ required: true, message: '选择监督联系人!' }]"
              >
                <a-select
                  v-model:value="projectFrom.superviseLinkmanId"
                  :disabled="isDetails || !projectFrom.superviseId"
                  placeholder="选择监督联系人"
                  @change="selSupervisePerson"
                >
                  <a-select-option v-for="item in supervisoryPerson" :value="item.id">
                    {{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item
                label="项目所在地"
                name="address"
                :rules="[{ required: true, message: '请输入项目所在地!' }]"
              >
                <a-input
                  v-model:value="projectFrom.address"
                  :disabled="isDetails"
                  placeholder="请输入项目所在地"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row :gutter="24">
            <a-col :span="12">
              <a-form-item
                label="项目联系人"
                name="contact"
                :rules="[{ required: true, message: '请输入项目联系人!' }]"
              >
                <a-input
                  v-model:value="projectFrom.contact"
                  :disabled="isDetails"
                  placeholder="请输入项目联系人"
                />
              </a-form-item>
            </a-col>
            <a-col :span="12">
              <a-form-item
                label="联系电话"
                name="contactTel"
                :rules="[{ required: true, message: '请输入联系电话!' }]"
              >
                <a-input
                  v-model:value="projectFrom.contactTel"
                  :disabled="isDetails"
                  placeholder="请输入联系电话"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </a-modal>

      <a-modal
        v-model:visible="visibleMergeProject"
        width="550px"
        :centered="true"
        title="合并项目"
        @ok="mergeProjectOk"
        @cancel="mergeProjectCancel"
      >
        <a-row align="middle">
          <span>合并为：</span>
          <a-button v-if="projectFrom.name" type="link" @click="editMergeItem">
            {{ projectFrom.name }}
          </a-button>
          <span v-else style="color: #c1c1c1">请选择项目</span>
        </a-row>
        <a-divider orientation="left" dashed>已选择项目</a-divider>
        <a-row>
          <template v-for="item in selectedRows" :key="item.id">
            <a-tag color="#108ee9" style="cursor: pointer" @click="setMergeItem(item)">
              {{ (item as any).name }}
            </a-tag>
          </template>
        </a-row>
      </a-modal> -->

      <EditFrom ref="editFromRef" @callBack="getProjectList" />
    </a-spin>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted, toRaw, nextTick, computed } from "vue"
import EditFrom from "./components/editForm.vue"
import {
  // addProjectAPI,
  getProjectAPI,
  // updateProjectAPI,
  // closeProjectAPI,
  // unlockProjectAPI,
  // mergeProjectAPI,
  // getSupervisoryAuditAPI,
  deleteProjectAPI,
  syncProjectAPI
} from "@/api/laboratory.api"
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"
import { createVNode } from "vue"
import { Modal, message } from "ant-design-vue"
import { formatDate } from "@/assets/js/common"
// import dayjs, { Dayjs } from "dayjs"
import { storeToRefs } from "pinia"
import userStore from "@/stores/userInfo"
const { userInfo } = storeToRefs(userStore())
console.log(1111, userInfo.value.orgId)
onMounted(() => {
  getProjectList()
  // getSupervisoryAudit()
})

const resetQueryList = () => {
  pagination.value.current = 1
  pagination.value.pageSize = 10
  getProjectList()
}

let editFromRef = ref()

// const isDetails = ref(false)
// const visibleEditProject = ref<boolean>(false)
// const visibleMergeProject = ref<boolean>(false)
let spinning = ref(false)
// let dateRangeValue = ref<[Dayjs, Dayjs]>()
// let editProjectFormRef = ref()

// let formType = ref(1) //表单编辑类型 1：新增 2：编辑 3：编辑合并项
// const fromTitle = computed(() => {
//   if (isDetails.value) {
//     return "详情"
//   } else if (formType.value === 1) {
//     return "新增"
//   } else if (formType.value === 2) {
//     return "编辑"
//   } else {
//     return "编辑合并项"
//   }
// })

// let supervisoryArray = ref([]) //监督机构
// let supervisoryPerson = ref([]) //所选监督机构下的人员
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
    title: "项目名称",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "工程类型",
    dataIndex: "kind",
    key: "kind",
    customRender: ({ text }) => {
      return text == "LANDWAY" ? "公路工程" : "水运工程"
    }
  },
  {
    title: "建设单位",
    dataIndex: "constructor",
    key: "constructor",
    customRender: ({ text }) => {
      return text.name
    }
  },
  {
    title: "项目状态",
    dataIndex: "state",
    key: "state",
    width: 150
  },
  {
    title: "开工时间",
    dataIndex: "startedDate",
    key: "startedDate"
  },
  {
    title: "交工时间",
    dataIndex: "handedOverDate",
    key: "handedOverDate"
  },
  {
    title: "所在区县",
    dataIndex: "district",
    key: "district"
  },
  {
    title: "操作",
    key: "handle"
  }
]
let dataSource = ref([])

// let projectFrom = ref({
//   priority: true,
//   projectLevel: null,
//   name: "",
//   builder: "",
//   status: "未审核",
//   closed: false,
//   commenceDate: "",
//   completeDate: "",
//   address: "",
//   contact: "",
//   contactTel: "",
//   id: "",
//   investment: "",
//   supervise: "",
//   superviseId: null,
//   // superviseLinkman: "",
//   // superviseLinkmanId: null
// })
let queryFrom = ref({
  q: "",
  kind: "",
  state: ""
})

let pagination = ref({
  current: 1,
  pageSize: 10,
  size: "small",
  showTotal: (total) => `共 ${total} 条数据`,
  showQuickJumper: true,
  showSizeChanger: true,
  total: 0,
  pageSizeOptions: ["10", "20", "50", "100"],
  onChange: (page, pageSize) => {
    pagination.value.current = page
    pagination.value.pageSize = pageSize
    getProjectList()
  }
})
let selectedRowKeys = ref([])
let selectedRows = ref([])

let rowSelection = {
  selectedRowKeys: selectedRowKeys,
  onChange: (keys, rows) => {
    selectedRowKeys.value = keys
    selectedRows.value = rows
    console.log("selectedRowKeys: ", keys)
    console.log("selectedRows: ", rows)
  }
}

// const mergeProjectOk = async () => {
//   if (!projectFrom.value.id) {
//     message.warning("请选择合并到哪个项目")
//     return
//   }
//   spinning.value = true
//   let ids: any = []
//   selectedRows.value.forEach((item: any) => {
//     if (item.id != projectFrom.value.id) {
//       ids.push(item.id)
//     }
//   })
//   await mergeProjectAPI({
//     project: projectFrom.value,
//     removedProjectId: ids
//   })
//   spinning.value = false
//   getProjectList()
//   visibleMergeProject.value = false
//   message.success("操作成功!")
// }
// const mergeProjectCancel = () => {
//   // mergeFormRef.value.resetFields()  //重置
// }

// const selSupervise = (v) => {
//   let r = supervisoryArray.value.filter((it) => {
//     return it.id == v
//   })
//   supervisoryPerson.value = r[0].auditors
//   projectFrom.value.supervise = r[0].name
//   projectFrom.value.superviseId = r[0].id
// }
// const selSupervisePerson = (v) => {
//   let r = supervisoryPerson.value.filter((it) => {
//     return it.id == v
//   })

//   projectFrom.value.superviseLinkman = r[0].name
//   projectFrom.value.superviseLinkmanId = r[0].id
// }

// const setMergeItem = async (row) => {
//   await editProjectReset()
//   projectFrom.value = JSON.parse(JSON.stringify(toRaw(row)))
//   if (row.commenceDate && row.completeDate) {
//     dateRangeValue.value = [dayjs(row.commenceDate), dayjs(row.completeDate)]
//   }
// }
// const editMergeItem = () => {
//   formType.value = 3
//   visibleEditProject.value = true
//   isDetails.value = false
// }

// const mergeProject = () => {
//   if (selectedRows.value.length < 2) {
//     message.warning("请至少选择两个项目进行名称合并")
//     return
//   }
//   visibleMergeProject.value = true
//   editProjectReset()
// }

// const editProjectReset = async () => {
//   //重置表单
//   await nextTick()
//   projectFrom.value = {
//     priority: true,
//     projectLevel: null,
//     name: "",
//     builder: "",
//     status: "未审核",
//     closed: false,
//     commenceDate: "",
//     completeDate: "",
//     address: "",
//     contact: "",
//     contactTel: "",
//     id: "",
//     investment: "",
//     supervise: "",
//     superviseId: null,
//     superviseLinkman: "",
//     superviseLinkmanId: null
//   }
//   editProjectFormRef.value && editProjectFormRef.value.resetFields() //重置表单
// }

// //项目数据提交
// const projectFromSubmit = async () => {
//   if (isDetails.value) {
//     //如果是详情模式直接关闭
//     visibleEditProject.value = false
//     return
//   }
//   try {
//     await editProjectFormRef.value.validateFields() //验证
//   } catch (error) {
//     console.error("表单验证失败")
//     return
//   }
//   if (dateRangeValue.value?.length) {
//     //day.js 时间格式化
//     projectFrom.value.commenceDate = dateRangeValue.value[0].valueOf()
//     projectFrom.value.completeDate = dateRangeValue.value[1].valueOf()
//   }
//   if (formType.value === 3) {
//     //如果是编辑合并项 直接关闭弹窗
//     visibleEditProject.value = false
//   } else {
//     try {
//       projectFrom.value.id
//         ? await updateProjectAPI(projectFrom.value)
//         : await addProjectAPI(projectFrom.value) //判断是用新增还是修改
//       getProjectList()
//       editProjectReset()
//       visibleEditProject.value = false
//       message.success("操作成功!")
//     } catch (error) {
//       console.error("操作失败")
//     }
//   }
// }

// let statusP = ref(true)
// let statusText = ref("")

const syncProject = async () => {
  spinning.value = true
  try {
    await syncProjectAPI()
    message.success("同步成功!")
  } catch (error) {
    alert(error)
  }
  spinning.value = false
  getProjectList()
}

const openAddProject = () => {
  // statusP.value = true
  // statusText.value = ""

  // formType.value = 1
  // visibleEditProject.value = true
  // isDetails.value = false
  // editProjectReset()

  editFromRef.value.openModel()
}

const openEditProject = async (row) => {
  // if (t == 1) {
  //   statusP.value = true
  // } else {
  //   row.status == "建设中" || row.status == "已完工"
  //     ? (statusP.value = false)
  //     : (statusP.value = true)
  //   statusText.value = row.status
  // }

  // formType.value = 2
  // visibleEditProject.value = true
  // isDetails.value = false
  // await editProjectReset()
  // projectFrom.value = JSON.parse(JSON.stringify(toRaw(row)))
  // selSupervise(projectFrom.value.superviseId) //设置监督联系人下拉数据，用于回显
  // if (row.commenceDate && row.completeDate) {
  //   dateRangeValue.value = [dayjs(row.commenceDate), dayjs(row.completeDate)]
  // }

  editFromRef.value.openModel(row.id)
}
const getProjectList = () => {
  spinning.value = true
  console.log(3333, queryFrom.value)
  let p = {
    ...queryFrom.value,
    size: pagination.value.pageSize,
    current: pagination.value.current
  }
  getProjectAPI(p)
    .then((res) => {
      dataSource.value = res.records.map((it) => {
        it.constructor.id == userInfo.value.orgId ? (it.ourUnit = true) : (it.ourUnit = false)
        return it
      })
      spinning.value = false
      pagination.value.total = res.total
    })
    .catch(() => {
      spinning.value = false
    })
}
// const closeProject = (row) => {
//   Modal.confirm({
//     title: "确定要关闭此项目吗?",
//     icon: createVNode(ExclamationCircleOutlined),
//     content: "关闭后,创建试验室无法关联该项目",
//     okText: "确定",
//     okType: "danger",
//     cancelText: "取消",
//     onOk() {
//       closeProjectAPI(row.id).then((res) => {
//         message.success("关闭成功")
//         getProjectList()
//       })
//     },
//     onCancel() {
//       console.log("Cancel")
//     }
//   })
// }
// const unlockProject = (row) => {
//   unlockProjectAPI(row.id).then((res) => {
//     message.success("开启成功")
//     getProjectList()
//   })
// }
// //获取拥有审核权限的监督机构
// const getSupervisoryAudit = async () => {
//   supervisoryArray.value = await getSupervisoryAuditAPI()
// }
const deleteRow = async (row) => {
  spinning.value = true
  try {
    await deleteProjectAPI(row.id)
    message.success("删除成功")
  } catch (error) {
    spinning.value = false
  }
  spinning.value = false
  getProjectList()
}

const openCheckDetails = async (row) => {
  editFromRef.value.openModel(row.id, true)
  // visibleEditProject.value = true
  // isDetails.value = true
  // await editProjectReset()
  // projectFrom.value = JSON.parse(JSON.stringify(toRaw(row)))
  // if (row.commenceDate && row.completeDate) {
  //   dateRangeValue.value = [dayjs(row.commenceDate), dayjs(row.completeDate)]
  // }
}
</script>
<style lang="less" scoped>
.action_row {
  row-gap: 0px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
}
</style>
