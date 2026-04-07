<template>
  <a-modal
    :key="Math.random()"
    v-model:visible="modelVisible"
    width="550px"
    :mask-closable="false"
    :keyboard="false"
    :centered="true"
    :title="auditTitle"
  >
    <a-form
      ref="approvalFormRef"
      :model="approvalForm"
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 17 }"
    >
      <a-form-item
        v-if="!isOrgAmend"
        label="审核结果"
        name="approved"
        :rules="[{ required: true, message: '请选择' }]"
      >
        <a-radio-group v-model:value="approvalForm.approved" @change="approvedChange">
          <a-radio :value="true">通过</a-radio>
          <a-radio :value="false">不通过</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item
        :label="`${auditTitle}意见`"
        name="text"
        :rules="[{ required: true, message: '请输入意见!' }]"
      >
        <a-textarea
          v-model:value="approvalForm.text"
          :rows="3"
          placeholder="请输入意见!"
          type="textarea"
          :maxlength="200"
        />
      </a-form-item>

      <template v-for="item in auditoAttachment" :key="item.customType">
        <a-form-item
          v-if="item.customType == 'KEEP_NOTICE'"
          label="备案通知书编号"
          name="additional1"
          :rules="[{ required: true, message: '请输入备案通知书编号!' }]"
        >
          <a-input v-model:value="approvalForm.additional1" placeholder="请输入备案通知书编号" />
        </a-form-item>

        <a-form-item
          :label="customTypeEnum[item.customType]"
          :name="item.customType"
          :rules="[{ required: true, validator: validatePass }]"
        >
          <UploadFile
            v-model:value="item.uploadFileList"
            :multiple="false"
            @success="uploadSuccess(item)"
          />
          <a-button
            v-if="item.needDownloadTemplate"
            type="link"
            :loading="downloadLoading"
            class="blue download-link"
            @click="downloadTemplate(item)"
          >
            点击下载模板
          </a-button>
        </a-form-item>
      </template>
    </a-form>
    <template #footer>
      <a-button key="submit" type="primary" :loading="loading" @click="handleApprovedOk">
        确定
      </a-button>
    </template>

    <uploadFileModel ref="uploadFileModelRef" :title="uploadTitle" :details="true" />
  </a-modal>
</template>
<script lang="ts" setup>
import { ref, onMounted, computed } from "vue"
import { message, Modal } from "ant-design-vue"
import UploadFile from "@/components/uploadFile/index.vue"
import uploadFileModel from "@/components/uploadFileModel/index.vue"
import {
  handleApprovalAPI,
  laboratoryAuditExtends,
  getModelFileBlobAPI,
  getAuditoAttachmentAPI,
  chackCodeAPI,
  getAlterAttachmentAPI,
  getModelFileAlterBlobAPI,
  getAuditoClassifyAPI
} from "@/api/infoCheck.api"
import { getRecordDetailsAlterAPI } from "@/api/laboratory.api"

import type { handleApprovalParams } from "@/type/api/infoCheck.api"
import { downloadFile } from "@/assets/js/common"
import { downMinioFile } from "@/components/uploadFile/uploadCommon"

import userStore from "@/stores/userInfo"
import { storeToRefs } from "pinia"
const { userInfo } = storeToRefs(userStore())

let uploadFileModelRef = ref()
let uploadTitle = ref("")

let approvalForm: any = ref<handleApprovalParams>({
  approved: true, //是否批准
  text: "", //意见
  id: "", // 业务id
  kind: "", // 审核类型（KEEP-备案，AMEND-变更，REVOKE-撤销）
  additional1: "",
  taskId: "", // 任务id
  attachments: [] //附件
})

const isOrgAmend = computed(() => {
  return ["ORG_AMEND_PROCESSING", "ORG_AMEND_REVIEW"].includes(approvalForm.value.kind)
})
const auditTitle = computed(() => {
  const kind = approvalForm.value.kind
  if (kind === "ORG_AMEND_PROCESSING") {
    return "阅处"
  } else if (kind === "ORG_AMEND_REVIEW") {
    return "阅示"
  }
  return "审核"
})

const openModel = (d: any) => {
  console.log("打开审核任务的数据:", d)
  resetForm()
  loading.value = false
  modelVisible.value = true
  approvalForm.value.id = d.id // 业务id
  approvalForm.value.taskId = d.taskId // 任务id
  approvalForm.value.kind = d.kind // 任务类型

  getAuditTypeLaodAttachment()
}

const emit = defineEmits(["auditOk"])

// //所有附件枚举
// enum customTypeEnum {
//   REGISTRATION = "备案登记表",
//   // FLOW_SHEET = "备案登记流转单",
//   REVIEW = "建设单位审查表",
//   APPROVAL = "建设单位审批表",
//   ITEM = "试验检测项目(参数)一览表",
//   KEEP_NOTICE = "备案通知书",
//   ORG_REVIEW = "质检机构审查表",
//   REVOKE_APPLY = "备案撤销申请表",
//   TESTER_CREDIT_EVALUATION = "检测人员信用评价表",
//   LAB_CREDIT_EVALUATION = "工地试验室信用评价表"
// }

//所有附件枚举
let customTypeEnum = {
  REGISTRATION: "备案登记表",
  // FLOW_SHEET = "备案登记流转单",
  REVIEW: "建设单位审查表",
  APPROVAL: "建设单位审批表",
  ITEM: "试验检测项目(参数)一览表",
  KEEP_NOTICE: "备案通知书",
  ORG_REVIEW: "质检机构审查表",
  REVOKE_APPLY: "备案撤销申请表",
  TESTER_CREDIT_EVALUATION: "检测人员信用评价表",
  LAB_CREDIT_EVALUATION: "工地试验室信用评价表"
}

let modelVisible = ref(false)
let approvalFormRef = ref()

let resetForm = () => {
  clearFiles()
  approvalForm.value = {
    approved: true, //是否批准
    text: "", //意见
    id: "", // 业务id
    taskId: "", //任务id
    kind: "", // 审核类型（KEEP-备案，AMEND-变更，REVOKE-撤销）
    additional1: "",
    attachments: [] //附件
  }
}

//检查备案通知书编号
const checkCode = async (v) => {
  if (v.target.value == "") {
    return
  }
  let res = await chackCodeAPI(v.target.value)
  if (!res) {
    Modal.warning({
      title: "提示",
      content: "备案通知书编号重复,请检查!",
      onOk() {
        approvalForm.value.additional1 = ""
      }
    })
  }
}

//附件上传检查
let validatePass = async (rule, value: string) => {
  let flag = auditoAttachment.value.some((it) => {
    return rule.field == it.customType && it.uploadFileList.length
  })
  if (flag) {
    return Promise.resolve()
  } else {
    return Promise.reject(`请上传${customTypeEnum[rule.field]}`)
  }
}

//清空附件文件
const clearFiles = () => {
  approvalForm.value.attachments = []
  auditoAttachment.value.forEach((it) => {
    it.uploadFileList = []
  })
}
const approvedChange = () => {
  clearFiles()
  getAuditTypeLaodAttachment()
}

const openUplaodModel = async (d) => {
  if (d.templateFilesArr.length > 1) {
    uploadTitle.value = customTypeEnum[d.customType]
    uploadFileModelRef.value.dataList = []
    uploadFileModelRef.value.visible = true
    uploadFileModelRef.value.dataList = d.templateFilesArr
  } else {
    downMinioFile(d.templateFilesArr[0])
  }
}
let loading = ref(false)
// 附件
const uploadSuccess = (item) => {
  approvalFormRef.value.validateFields(item.customType)
}

//审核提交
const handleApprovedOk = async () => {
  await approvalFormRef.value.validateFields()
  let d: any = { ...approvalForm.value }
  auditoAttachment.value.forEach((it) => {
    if (it.uploadFileList.length) {
      d.attachments.push({
        ...it.uploadFileList[0],
        customType: it.customType
      })
    }
  })
  loading.value = true
  console.log("审核数据:", d)
  try {
    if ("KEEP,AMEND,REVOKE".includes(d.kind)) {
      //如果是试验室（KEEP-备案，AMEND-变更，REVOKE-撤销） 需要调用这个接口
      let p = { ...d }
      p.kind == "AMEND" ? (p.applyId = p.id) : (p.labId = p.id) //如果是变更 id修改为applyid，其他修改为labid
      delete p.id
      await laboratoryAuditExtends(p)
    }
    await handleApprovalAPI(d)
    message.success("审批成功")
    emit("auditOk")
    modelVisible.value = false
    loading.value = false
  } catch (error) {
    console.error(error)
    loading.value = false
  }
}

let auditType = ref("")

const downloadLoading = ref(false)

//下载撤销和备案模板文件
const getModelFile = async (type: string) => {
  try {
    downloadLoading.value = true
    let blob: any = null
    blob =
      approvalForm.value.kind == "AMEND" //如果是变更审核 下载模板文件，反之则下载 撤销和备案模板文件
        ? await getModelFileAlterBlobAPI(type, approvalForm.value.id || "")
        : await getModelFileBlobAPI(type, approvalForm.value.id || "")
    downloadFile(blob, customTypeEnum[type] + ".docx")
  } finally {
    downloadLoading.value = false
  }
}

//模板文件下载
const downloadTemplate = (item) => {
  item.templateFilesArr.length ? openUplaodModel(item) : getModelFile(item.customType)
}

let auditoAttachment: any = ref([]) //审批需要上传的附件类型

//根据审核类型获取需要上传的附件类型
const getAuditTypeLaodAttachment = async () => {
  let kind = approvalForm.value.kind
  let pass: any = [] //通过附件类型
  let reject: any = [] //不通过附件类型
  const isLabAudit = ["KEEP", "AMEND", "REVOKE"].includes(approvalForm.value.kind) //是否试验室相关审核
  let labClassify = isLabAudit ? await getAuditoClassifyAPI(kind, approvalForm.value.id) : "" //审核类型是_现场检测还是工地试验室
  labClassify == "ITEM"
    ? (customTypeEnum.LAB_CREDIT_EVALUATION = "现场检测项目信用评价表")
    : "工地试验室信用评价表"

  switch (userInfo.value.type) {
    case "PCM": //项目建设管理单位
      if (kind == "AMEND") {
        //变更
        try {
          let res = await getRecordDetailsAlterAPI(approvalForm.value.id || "") //获取变更类型
          if (labClassify == "LAB") {
            pass = res.contents.includes("TEST_ITEM") ? ["REVIEW", "APPROVAL"] : [] //如果包含有参数变更，则需要传入REVIEW,APPROVAL
            reject = []
          } else if (labClassify == "ITEM") {
            pass = res.contents.includes("TEST_ITEM") ? ["APPROVAL"] : [] //如果包含有参数变更，则需要传入APPROVAL
            reject = []
          }
        } catch (error) {
          console.error(error)
        }
      } else if (kind == "KEEP") {
        //备案
        if (labClassify == "LAB") {
          pass = ["REVIEW", "APPROVAL"]
          reject = ["REVIEW"]
        } else if (labClassify == "ITEM") {
          pass = ["APPROVAL"]
          reject = ["APPROVAL"]
        }
      } else if (kind == "REVOKE") {
        //撤销
        pass = ["REVOKE_APPLY", "LAB_CREDIT_EVALUATION", "TESTER_CREDIT_EVALUATION"]
        reject = ["REVOKE_APPLY"]
      }
      break
    case "PSA": //工程项目监督机构
      if (kind == "AMEND") {
        //变更
        pass = ["KEEP_NOTICE"]
        reject = []
      } else if (kind == "KEEP") {
        //备案
        if (labClassify == "LAB") {
          pass = ["KEEP_NOTICE", "ORG_REVIEW"]
          reject = ["ORG_REVIEW"]
        } else if (labClassify == "ITEM") {
          pass = ["KEEP_NOTICE"]
          reject = []
        }
      } else if (kind == "REVOKE") {
        //撤销
        pass = ["REVOKE_APPLY", "LAB_CREDIT_EVALUATION", "TESTER_CREDIT_EVALUATION"]
        reject = ["REVOKE_APPLY"]
      }
      break
    case "ORG": //检测机构
      break
    case "ADM": //行业主管部门
      break
  }

  let arr = (approvalForm.value.approved ? pass : reject).map((it) => {
    let d: any = {
      customType: it, //资料类型key
      templateFilesArr: [], //下载的模板文件
      uploadFileList: [], //上传文件
      needDownloadTemplate: true //是否需要下载模板
    }
    //如果当前是建设单位，且是撤销申请，且是 检测人员信用评价表 或者 工地试验室信用评价表 就不必下载模板
    if (
      userInfo.value.type == "PCM" &&
      kind == "REVOKE" &&
      "TESTER_CREDIT_EVALUATION,LAB_CREDIT_EVALUATION".includes(it)
    ) {
      d.needDownloadTemplate = false
    }
    return d
  })
  //只有试验室审核时需要下载附件模板
  if (isLabAudit) {
    getAuditoAttachment(arr)
  } else {
    auditoAttachment.value = arr
  }
}
//获取 备案、撤销 的申请附件(用于 需要下载上次审核上传的文件，非系统模板文件)
const getAuditoAttachment = async (arr) => {
  let res: any =
    approvalForm.value.kind == "AMEND" //如果是变更审核 下载模板文件，反之则下载 撤销和备案模板文件
      ? await getAlterAttachmentAPI(approvalForm.value.id || "")
      : await getAuditoAttachmentAPI(approvalForm.value.id || "")
  let data = res.equipments || {}
  let keyArr = Object.keys(data)
  //拿上面配置好的数据来对比后端返回的数据，获取下载模板文件，本下载文件非系统模板文件，下载方式不同
  keyArr.forEach((key) => {
    if (data[key].length) {
      arr.forEach((it) => {
        if (it.customType == key) {
          it.templateFilesArr = data[key]
        }
      })
    }
  })
  auditoAttachment.value = arr
}

defineExpose({
  openModel
})
</script>

<style lang="less" scoped>
.download-link {
  position: absolute;
  right: 0;
  top: 6px;
}

:deep(.ant-form-item-label > label) {
  word-wrap: break-word;
  white-space: pre-wrap;
  line-height: 17px;
}
</style>
