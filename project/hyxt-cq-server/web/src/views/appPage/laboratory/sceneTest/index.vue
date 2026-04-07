<template>
  <div>
    <a-spin tip="加载中..." :spinning="spinning">
      <a-row class="action_row">
        <div class="lt">
          <a-space>
            <a-select
              ref="select"
              v-model:value="queryFrom.status"
              style="width: 180px"
              placeholder="请选择试验室状态"
            >
              <a-select-option value="">全部状态</a-select-option>
              <a-select-option
                v-for="(item, index) in labStatusEnum"
                :key="index"
                :value="item.value"
              >
                {{ item.lable }}
              </a-select-option>
            </a-select>
            <!-- <a-select
              ref="select"
              v-model:value="queryFrom.type"
              style="width: 180px"
              placeholder="请输入试验室类型"
            >
              <a-select-option value="">全部类型</a-select-option>
              <a-select-option value="center">中心试验室</a-select-option>
              <a-select-option value="building">工地试验室</a-select-option>
              <a-select-option value="supervision">监理试验室</a-select-option>
              <a-select-option value="site">现场检测项目</a-select-option>
            </a-select> -->
            <a-input v-model:value="queryFrom.projectName" placeholder="请输入项目名称" />

            <a-input-search
              v-model:value="queryFrom.name"
              placeholder="请输入现场检测项目名称"
              enter-button
              @search="getLaboratoryList(true)"
            />
          </a-space>
        </div>
        <div class="rt">
          <a-space>
            <a-button v-auth="'item::export'" @click="exportExcel">导出</a-button>
            <a-button v-auth="'item::add'" type="primary" @click="openEditLaboratory('')">
              新增
            </a-button>
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
          <template v-if="column.key === 'name'">
            <a @click="openDetails(record)">{{ record.name }}</a>
          </template>

          <template v-if="column.key === 'status'">
            <a-popover v-if="record.personAmend" title="注意:">
              <template #content>
                <p>有备案人员已从母体机构撤销，请及时提交变更！</p>
              </template>
              <a-badge dot>
                <span>{{ record.status }}</span>
              </a-badge>
            </a-popover>
            <span v-else>
              {{ record.status }}
            </span>
          </template>

          <template v-if="column.key === 'handle'">
            <a-space>
              <a-button
                v-if="['创建中', '备案未通过'].includes(record.status)"
                v-auth="'item::update'"
                size="small"
                type="primary"
                @click="openEditLaboratory(record.id)"
              >
                编辑
              </a-button>

              <a-button
                v-if="['运行中', '已到期'].includes(record.status)"
                v-auth="'itemAmend::new'"
                size="small"
                type="primary"
                @click="labAlterationContent(record.id)"
              >
                变更
              </a-button>
              <a-button
                v-if="['变更未通过'].includes(record.status)"
                v-auth="'itemAmend::new'"
                size="small"
                type="primary"
                @click="labAlterationContent(record.id, true)"
              >
                编辑变更
              </a-button>

              <!-- <a-button
                v-if="['运行中'].includes(record.status)"
                v-auth="'labAmend::new'"
                size="small"
                type="primary"
                @click="labApply(record.id, 'AMEND')"
              >
                变更
              </a-button>

              <a-button
                v-if="['运行中', '已到期'].includes(record.status)"
                v-auth="'labAmend::adjourn'"
                size="small"
                type="primary"
                @click="labApply(record.id, 'DELAY')"
              >
                延期
              </a-button> -->

              <!-- <a-dropdown>
                <a-button
                  v-if="['运行中', '已到期'].includes(record.status)"
                  v-auth="'labAmend::new'"
                  size="small"
                  type="primary"
                >
                  变更
                </a-button>
                <template #overlay>
                  <a-menu>
                    <a-menu-item>
                      <a href="javascript:;" @click="openBasicInfoChanges(record)">基本信息变更</a>
                    </a-menu-item>
                    <a-menu-item>
                      <a href="javascript:;" @click="openPersonChanges(record)">人员信息变更</a>
                    </a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown> -->

              <a-button
                v-if="['创建中', '备案未通过'].includes(record.status)"
                v-auth="'item::submitAudit'"
                size="small"
                type="primary"
                @click="openAudit(record.id)"
              >
                审核提交
              </a-button>

              <a-button
                v-if="
                  [
                    '已到期',
                    '运行中',
                    '变更未通过',
                    '撤销未通过',
                    '(变更)建设单位审核中',
                    '(变更)监督机构审核中',
                    '(撤销)建设单位审核中',
                    '(撤销)监督机构审核中'
                  ].includes(record.status)
                "
                size="small"
                type="primary"
                @click="openEquipmentConfig(record.id)"
              >
                设备管理
              </a-button>

              <a-button
                v-if="['创建中', '备案未通过'].includes(record.status)"
                v-auth="'item::del'"
                size="small"
                type="primary"
                danger
                @click="deleteLaboratory(record)"
              >
                删除
              </a-button>

              <a-button
                v-if="['运行中', '已到期'].includes(record.status)"
                v-auth="'item::statusSwitchover'"
                size="small"
                type="primary"
                danger
                @click="revocation(record)"
              >
                撤销
              </a-button>
              <a-button
                v-if="['变更未通过'].includes(record.status)"
                v-auth="'item::revoke::cancel'"
                size="small"
                type="primary"
                danger
                @click="cancelLabHandle(record.id, 'AMEND')"
              >
                取消变更
              </a-button>
              <a-button
                v-if="['撤销未通过'].includes(record.status)"
                v-auth="'item::revoke::cancel'"
                size="small"
                type="primary"
                danger
                @click="cancelLabHandle(record.id, 'REVOKE')"
              >
                取消撤销
              </a-button>
              <a-button
                v-if="['延期未通过'].includes(record.status)"
                v-auth="'item::revoke::cancel'"
                size="small"
                type="primary"
                danger
                @click="cancelLabHandle(record.id, 'DELAY')"
              >
                取消延期
              </a-button>
              <a-button
                v-auth="'item::info'"
                size="small"
                type="primary"
                @click="openDetails(record)"
              >
                详情
              </a-button>
              <a-button type="primary" size="small" @click="showLog(record.id)">日志</a-button>
            </a-space>
          </template>
          <template v-if="column.key === 'createdAt'">
            <span>{{ formatDate(record.createdAt) }}</span>
          </template>
          <template v-if="column.key === 'keepDateStart'">
            <span>
              {{ formatDate(record.keepDateStart) }} 至 {{ formatDate(record.keepDateEnd) }}
            </span>
          </template>
        </template>
      </a-table>

      <a-modal
        v-model:visible="repealVisible"
        width="700px"
        title="撤销申请"
        :destroy-on-close="true"
        @ok="repealSubmit"
      >
        <a-form
          ref="repealFormRef"
          :model="repealForm"
          name="basic"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 18 }"
          autocomplete="off"
          class="baseForm"
        >
          <a-form-item
            label="撤销原因"
            name="remark"
            :rules="[{ required: true, message: '请输入撤销原因!' }]"
          >
            <a-input
              v-model:value="repealForm.remark"
              placeholder="请输入撤销原因"
              style="width: 300px"
            />
            <a-button
              type="link"
              :loading="downloadLoading"
              class="blue download-link"
              style="margin-left: 10px"
              @click="getModelFile('REVOKE_APPLY')"
            >
              下载申请模板
            </a-button>
          </a-form-item>

          <a-form-item
            label="撤销申请"
            name="attachments"
            :rules="[
              {
                required: true,
                validator: validatePass,
                trigger: 'change',
                type: 'array',
                message: '请上传!'
              }
            ]"
          >
            <uploadFile
              v-model:value="repealForm.attachments"
              accept="image/* , .pdf"
              @success="uploadSuccess"
            />
          </a-form-item>
          <!-- <a-form-item label="附件" name="name">
            <uploadFile v-model:value="uploadAccessory" />
          </a-form-item> -->
        </a-form>
      </a-modal>

      <EditFildLaboratory
        ref="addLabRef"
        v-model:editId="editLaboratoryId"
        v-model:visible="visibleFildLab"
        @add-ok="addOkCallBack"
      />

      <a-modal
        v-model:visible="equipmentConfigVisible"
        width="1200px"
        :centered="true"
        title="设备管理"
        :destroy-on-close="true"
        @ok="equipmentConfigVisible = false"
      >
        <EquipmentConfig :edit-id="editLaboratoryId" />
      </a-modal>

      <a-modal
        v-model:visible="LabDetailsVisible"
        width="1300px"
        :centered="true"
        title="详情"
        :destroy-on-close="true"
        @ok="LabDetailsVisible = false"
      >
        <LaboratoryDetails :lab-id="editLaboratoryId" />
      </a-modal>
    </a-spin>
    <Log ref="log" />
    <LabAlteration ref="labAlterationRef" @callBack="getLaboratoryList(false)" />
  </div>
</template>
<script lang="ts" setup>
import { Ref } from "vue"
import { ref, onMounted, toRaw, provide, createVNode } from "vue"
import {
  getLaboratoryAPI,
  deleteLaboratoryAPI,
  submitLabAuditAPI,
  cancelLabAuditAPI,
  getModelFileBlob,
  labApplyAPI,
  downTemplateAPI,
  getLabStatusAPI,
  exportExcelAPI
} from "@/api/laboratory.api"
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"
import EditFildLaboratory from "./components/EditLaboratory/index.vue"
import EquipmentConfig from "./components/EditLaboratory/EquipmentConfig.vue"
// import BasicInforChanges from "./components/BasicInfoChanges/index.vue"
// import PersonChanges from "./components/PersonChanges/index.vue"
import LaboratoryDetails from "./components/LaboratoryDetails/index.vue"
import Log from "@/components/log/index.vue"
import uploadFile from "@/components/uploadFile/index.vue"
import { downloadFile } from "@/assets/js/common"

import { Modal, message } from "ant-design-vue"
import { formatDate } from "@/assets/js/common"
import LabAlteration from "./components/LabAlteration/index.vue"

onMounted(() => {
  getLabStatus()
  getLaboratoryList(false)
})

const uploadSuccess = async () => {
  await repealFormRef.value.validateFields("attachments")
}

const downloadLoading = ref(false)
const repealVisible = ref(false)

const visibleFildLab = ref<boolean>(false)
// const infoChangesVisible = ref<boolean>(false)
const equipmentConfigVisible = ref(false)
// let basicInforChangesRef = ref()

const personChangesVisible = ref(false)
let LabDetailsVisible = ref(false)

let personChangesRef = ref()

let addLabRef = ref()
let editLaboratoryId = ref("")

// let isApply = ref<Boolean>(false)
let applyCode = ref<string>("")

provide("applyCode", applyCode) //申请变更或者延期code

let spinning = ref(false)
let columns = [
  {
    title: "机构名称",
    dataIndex: "orgName",
    key: "orgName"
  },
  {
    title: "现场检测项目名称",
    dataIndex: "name",
    key: "name"
  },
  // {
  //   title: "试验室类型",
  //   dataIndex: "type",
  //   key: "type"
  // },
  {
    title: "项目名称",
    dataIndex: "projectName",
    key: "projectName"
  },
  {
    title: "监督机构",
    dataIndex: "supervise",
    key: "supervise"
  },
  {
    title: "现场检测项目状态",
    dataIndex: "status",
    key: "status"
  },
  {
    title: "备案起止时间",
    dataIndex: "keepDateStart",
    key: "keepDateStart"
  },
  // {
  //   title: "添加时间",
  //   dataIndex: "createdAt",
  //   key: "createdAt"
  // },
  {
    title: "操作",
    key: "handle"
  }
]
let repealForm = ref<any>({
  labId: "",
  applyType: "REVOKE",
  attachments: []
})

// 获取模板文件
const modelFileName = {
  KEEP_NOTICE: "备案通知书",
  ORG_REVIEW: "质监机构审查表",
  REVOKE_APPLY: "撤销申请表"
}
const getModelFile = async (type: string) => {
  try {
    downloadLoading.value = true
    let type = "REVOKE_APPLY"
    const blob: any = await downTemplateAPI(type, repealForm.value.labId)
    downloadFile(blob, modelFileName[type] + ".docx")
  } finally {
    downloadLoading.value = false
  }
}

let validatePass = async (_rule, value: string) => {
  if (repealForm.value.attachments.length) {
    return Promise.resolve()
  } else {
    return Promise.reject("请上传")
  }
}

const addOkCallBack = () => {
  getLaboratoryList(false)
  visibleFildLab.value = false
}
let dataSource = ref([])

let queryFrom = ref({
  current: 1,
  type: "",
  size: 10,
  name: "",
  status: "",
  projectId: "",
  projectName: "",
  classification: "ITEM"
})

let pagination = ref({
  size: "small",
  showTotal: (total: number) => `共 ${total} 条数据`,
  showQuickJumper: true,
  showSizeChanger: true,
  total: 0,
  pageSizeOptions: ["10", "20", "50", "100"],
  onChange: (page: number, pageSize: number) => {
    queryFrom.value.current = page
    queryFrom.value.size = pageSize
    getLaboratoryList(false)
  }
})
let selectedRowKeys = ref([])
let selectedRows = ref([])

let rowSelection = {
  selectedRowKeys: selectedRowKeys,
  onChange: (keys: any, rows: any) => {
    selectedRowKeys.value = keys
    selectedRows.value = rows
    console.log("selectedRowKeys: ", keys)
    console.log("selectedRows: ", rows)
  }
}
const openDetails = (row: any) => {
  editLaboratoryId.value = row.id
  LabDetailsVisible.value = true
}

//  日志
const log = ref()
const showLog = (id: string) => {
  log.value.openModal(id)
}

let labStatusEnum: any = ref([])

const getLabStatus = async () => {
  try {
    let res = await getLabStatusAPI()
    Object.keys(res).forEach((key) => {
      labStatusEnum.value.push({
        lable: res[key],
        value: key
      })
    })
  } catch (error) {
    console.error(error)
  }
}

//撤销
const revocation = async (row: any) => {
  repealVisible.value = true
  repealForm.value = {
    applyType: "REVOKE",
    attachments: [],
    labId: row.id
  }
}

let repealFormRef = ref()
const repealSubmit = async () => {
  await repealFormRef.value.validateFields()
  try {
    await submitLabAuditAPI(repealForm.value)
    message.success("提交成功")
    repealVisible.value = false
    getLaboratoryList(false)
  } catch (error) {
    message.warning("提交失败")
  }
}

// 取消操作：取消变更、取消延期、取消撤销
const cancelLabHandle = (id: string, applyType: string) => {
  cancelLabAuditAPI(id, applyType).then(() => {
    message.success("取消成功")
    getLaboratoryList(false)
  })
}

// //基本信息变更数据提交
// const basicInforChangesFormSubmit = async () => {
//   await basicInforChangesRef.value.submitChangesInfo()
//   getLaboratoryList(false)
//   infoChangesVisible.value = false
// }
//人员变更数据提交
// const personChangeFormSubmit = async () => {
//   await personChangesRef.value.submitChangesPerson()
//   getLaboratoryList(false)
//   personChangesVisible.value = false
// }

// const openBasicInfoChanges = (row: any) => {
//   infoChangesVisible.value = true
//   editLaboratoryId.value = row.id
// }
const openAudit = async (id: string) => {
  Modal.confirm({
    title: "提示?",
    icon: createVNode(ExclamationCircleOutlined),
    content: "确认提交现场检测项目审核?",
    okText: "确定",
    cancelText: "取消",
    onOk: async function () {
      try {
        // await submitLabAuditAPI(id, "KEEP")
        await submitLabAuditAPI({
          labId: id,
          applyType: "KEEP"
        })
        message.success("提交成功")
        getLaboratoryList(false)
      } catch (error) {
        message.warning("提交失败")
      }
    },
    onCancel() {
      console.log("Cancel")
    }
  })
}
const openEditLaboratory = (id: string) => {
  editLaboratoryId.value = id
  visibleFildLab.value = true
  applyCode.value = ""
  // projectFrom.value = JSON.parse(JSON.stringify(toRaw(row)))
}
const openEquipmentConfig = (id: string) => {
  editLaboratoryId.value = id
  equipmentConfigVisible.value = true
}
// const openPersonChanges = (row: any) => {
//   editLaboratoryId.value = row.id
//   personChangesVisible.value = true
// }

const labAlterationRef = ref()
//变更内容选择
const labAlterationContent = (id: string, isEditAlter = false) => {
  //isEditAlter 是否是编辑变更
  labAlterationRef.value.showModal(id, isEditAlter)
}
// const labApply = async (id: string, t: string) => {
//   spinning.value = true
//   await labApplyAPI(id, t) //新建申请变更或延期
//   spinning.value = false

//   applyCode.value = t
//   editLaboratoryId.value = id //打开编辑弹窗
//   visibleFildLab.value = true
// }

const getLaboratoryList = (refresh: boolean) => {
  spinning.value = true
  let q = JSON.parse(JSON.stringify(toRaw(queryFrom.value)))

  if (refresh) q.current = 1

  if (q.status == "") {
    delete q.status
  }
  getLaboratoryAPI(q)
    .then((res) => {
      dataSource.value = res.records
      spinning.value = false
      pagination.value.total = res.total
    })
    .catch(() => {
      spinning.value = false
    })
}

const exportExcel = () => {
  let q = JSON.parse(JSON.stringify(toRaw(queryFrom.value)))
  if (q.status == "") {
    delete q.status
  }
  spinning.value = true
  exportExcelAPI(q)
    .then((data: any) => {
      const url = window.URL.createObjectURL(data)
      const elink = document.createElement("a")
      elink.href = url
      elink.target = "_self" // 当前也 target打开新页面
      elink.setAttribute("download", "现场检测项目Excel导出.xlsx")
      elink.style.display = "none"
      document.body.appendChild(elink)
      elink.click()
      document.body.removeChild(elink)
      spinning.value = false
    })
    .catch(() => {
      spinning.value = false
    })
}

//取消申请
// const cancelApply = (row: any) => {
//   console.log(33344, row)
//   let t = ""
//   switch (row.status) {
//     case "变更审核中":
//       t = "AMEND"
//       break
//     case "延期审核中":
//       t = "DELAY"
//       break
//     case "延期审核中":
//       t = "REVOKE"
//       break
//   }

//   cancelLabAuditAPI(row.id, t)
// }

const deleteLaboratory = (row: any) => {
  Modal.confirm({
    title: "确定要删除?",
    icon: createVNode(ExclamationCircleOutlined),
    content: "删除后,此现场检测项目无法找回",
    okText: "确定",
    okType: "danger",
    cancelText: "取消",
    onOk() {
      deleteLaboratoryAPI(row.id).then(() => {
        message.success("删除成功")
        getLaboratoryList(false)
      })
    },
    onCancel() {
      console.log("Cancel")
    }
  })
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
