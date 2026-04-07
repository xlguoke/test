<template>
  <div>
    <a-timeline v-if="processArray.length">
      <a-timeline-item v-for="item in processArray" :key="item.id">
        <div class="node_wrap">
          <div>
            <h4>
              {{ item.auditType == "PCM" ? "建设单位" : "工程项目监督机构" }} -
              {{ enumerate[item.kind] }}
            </h4>
          </div>
          <p>
            <a-space>
              <span style="font-size: 13px; color: #707070">
                {{ item.auditUnit }} （ {{ item.auditor }} ）
                {{ dayjs(item.auditDate).format("YYYY-MM-DD HH:mm:ss") }}
              </span>
              <a-tag v-if="item.approved" color="success">通过</a-tag>
              <a-tag v-else color="error">不通过</a-tag>
            </a-space>
          </p>
          <a-row>
            <a-col v-for="cit in item.attachments" :key="cit.customType">
              <p class="title">{{ customTypeEnum[cit.customType] }}</p>
              <p class="but_wrap">
                <a-button type="primary" @click="download(cit.url)">点击查看</a-button>
              </p>
            </a-col>
          </a-row>
        </div>
      </a-timeline-item>
    </a-timeline>
    <a-empty v-else />
  </div>
</template>
<script setup lang="ts">
import { getLaboratoryExtendAPI } from "@/api/laboratory.api"
import dayjs, { Dayjs } from "dayjs"
import { ref, onMounted, Ref } from "vue"
import { downMinioFile } from "@/components/uploadFile/uploadCommon"

const props = defineProps({
  editId: {
    type: String,
    required: true
  },
  details: {
    type: Boolean,
    default: false
  }
})

let enumerate = {
  KEEP: "备案审核",
  AMEND: "变更审核",
  DELAY: "延期审核",
  REVOKE: "撤销审核"
}

interface ProcessT {
  kind: string
  attachments: any[]
  auditType: string
  auditUnit: string
  auditor: string
  auditDate: string
  id: string
  approved: string
}

enum customTypeEnum {
  REGISTRATION = "备案登记表",
  FLOW_SHEET = "备案登记流转单",
  REVIEW = "建设单位审查表",
  APPROVAL = "建设单位审批表",
  ITEM = "试验检测项目(参数)一览表",
  KEEP_NOTICE = "备案通知书",
  ORG_REVIEW = "质检机构审查表",
  REVOKE_APPLY = "备案撤销申请表",
  TESTER_CREDIT_EVALUATION = "检测人员信用评价表",
  LAB_CREDIT_EVALUATION = "现场检测项目信用评价表"
}

let processArray: Ref<Array<ProcessT>> = ref([])
const getLaboratoryExtend = async () => {
  let arr = await getLaboratoryExtendAPI(props.editId)
  // arr.forEach((it) => {
  //   if (it.attachmentUrl) {
  //     switch (it.kind) {
  //       case "KEEP":
  //         it.approved ? (it.title = "备案通知书") : (it.title = "质监机构审查表")
  //         break

  //       case "AMEND":
  //         it.approved ? (it.title = "备案通知书") : (it.title = "质监机构审查表")
  //         break

  //       case "DELAY":
  //         it.approved ? (it.title = "备案通知书") : (it.title = "质监机构审查表")
  //         break

  //       case "REVOKE":
  //         it.approved ? (it.title = "备案撤销审请") : ""
  //         break
  //     }
  //     processArray.value.push(it)
  //   }
  // })
  processArray.value = arr

  console.log(33333, processArray.value)
}
const uploadFileModelRef = ref()
let uploadTitle = ref("")
const openUplaodModel = (v: any) => {
  uploadTitle.value = v
  uploadFileModelRef.value.visible = true
}
const download = (v): void => {
  downMinioFile({ url: v } as any)
}
onMounted(() => {
  getLaboratoryExtend()
})
</script>

<style lang="less" scoped>
.node_wrap {
  .time {
  }
  .title {
    margin: 10px 20px;
  }
  .but_wrap {
    margin-left: 20px;
  }
}
.ant-timeline-item {
  padding-bottom: 30px;
}
</style>
