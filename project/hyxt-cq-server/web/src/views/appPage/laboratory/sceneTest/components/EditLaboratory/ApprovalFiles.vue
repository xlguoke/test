<template>
  <div>
    <a-spin tip="加载中..." :spinning="spinning">
      <a-row class="files_wrap">
        <a-col class="files_items">
          <p class="tle">
            <span>现场检测项目备案登记表</span>
            <a
              v-if="!props.details"
              style="margin-left: 10px"
              @click="downTemplate('REGISTRATION')"
            >
              下载模板
            </a>
          </p>
          <p class="bnt_wrap">
            <a-button type="primary" @click="openUplaodModel('REGISTRATION')">
              <template #icon>
                <i style="" class="iconfont icon-shangchuan" />
              </template>
              {{ props.details ? "点击查看" : "点击上传" }}
            </a-button>
            <span class="upload_tip">
              (已上传
              <span :class="archivalDataNumber.REGISTRATION ? 'num_green' : 'num_red'">
                {{ archivalDataNumber.REGISTRATION || 0 }}
              </span>
              个文件)
            </span>
          </p>
          <p v-if="!props.details" class="tip">
            注：请下载打印系统模板由建设单位签字盖章后，再上传
          </p>
        </a-col>

        <a-col class="files_items">
          <p class="tle">
            <span>工地试验室建设单位审查表</span>
            <a v-if="!props.details" style="margin-left: 10px" @click="downTemplate('REVIEW')">
              下载模板
            </a>
          </p>
          <p class="bnt_wrap">
            <a-button type="primary" @click="openUplaodModel('REVIEW')">
              <template #icon>
                <i style="" class="iconfont icon-shangchuan" />
              </template>
              {{ props.details ? "点击查看" : "点击上传" }}
            </a-button>
            <span class="upload_tip">
              (已上传
              <span :class="archivalDataNumber.REVIEW ? 'num_green' : 'num_red'">
                {{ archivalDataNumber.REVIEW || 0 }}
              </span>
              个文件)
            </span>
          </p>
          <p v-if="!props.details" class="tip">
            注：请下载打印系统模板由建设单位签字盖章后，再上传
          </p>
        </a-col>

        <a-col class="files_items">
          <p class="tle">
            <span>工地试验室建设单位审批表</span>
            <a v-if="!props.details" style="margin-left: 10px" @click="downTemplate('APPROVAL')">
              下载模板
            </a>
          </p>
          <p class="bnt_wrap">
            <a-button type="primary" @click="openUplaodModel('APPROVAL')">
              <template #icon>
                <i style="" class="iconfont icon-shangchuan" />
              </template>
              {{ props.details ? "点击查看" : "点击上传" }}
            </a-button>
            <span class="upload_tip">
              (已上传
              <span :class="archivalDataNumber.APPROVAL ? 'num_green' : 'num_red'">
                {{ archivalDataNumber.APPROVAL || 0 }}
              </span>
              个文件)
            </span>
          </p>
          <p v-if="!props.details" class="tip">
            注：请下载打印系统模板由建设单位签字盖章后，再上传
          </p>
        </a-col>

        <a-col class="files_items">
          <p class="tle">
            <span>建设单位审查确认试验检测项目（参数）一览表</span>
            <a v-if="!props.details" style="margin-left: 10px" @click="downTemplate('ITEM')">
              下载模板
            </a>
          </p>
          <p class="bnt_wrap">
            <a-button type="primary" @click="openUplaodModel('ITEM')">
              <template #icon>
                <i style="" class="iconfont icon-shangchuan" />
              </template>
              {{ props.details ? "点击查看" : "点击上传" }}
            </a-button>
            <span class="upload_tip">
              (已上传
              <span :class="archivalDataNumber.ITEM ? 'num_green' : 'num_red'">
                {{ archivalDataNumber.ITEM || 0 }}
              </span>
              个文件)
            </span>
          </p>
          <p v-if="!props.details" class="tip">
            注：请下载打印系统模板由建设单位签字盖章后，再上传
          </p>
        </a-col>
      </a-row>
      <p style="color: #b9b9b9; margin-top: 20px; margin-left: 45px">
        支持上传文件类型：png、jpg、jpeg、doc、docx、xls、xlsx、pdf、zip、rar
      </p>
      <uploadFileModel
        ref="uploadFileModelRef"
        :title="uploadTitle"
        :details="props.details"
        @call-back="saveFile"
      />
    </a-spin>
  </div>
</template>
<script setup lang="ts">
import uploadFileModel from "@/components/uploadFileModel/index.vue"
import { ref, toRefs, onMounted, inject, Ref } from "vue"
import { downloadFile } from "@/assets/js/common"
import {
  archivalDataUploadAPI,
  getArchivalDataDetailsAPI,
  getArchivalDataNumberAPI,
  downTemplateAPI
} from "@/api/laboratory.api"
import { message } from "ant-design-vue"

const enumT = {
  REGISTRATION: "现场检测项目备案登记表",
  REVIEW: "工地试验室建设单位审查表",
  APPROVAL: "工地试验室建设单位审批表",
  ITEM: "建设单位审查确认试验检测项目一览表"
}
let isApply = inject<unknown>("isApply", false) as Ref //  是否申请变更或延期
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

const laboratoryId: any = toRefs(props).editId //试验室编辑id

const spinning = ref(false)
const uploadFileModelRef = ref()

let uploadTitle = ref("")
let selFileTypeKey = ref("")

const openUplaodModel = async (v: any) => {
  uploadTitle.value = enumT[v]
  selFileTypeKey.value = v
  uploadFileModelRef.value.dataList = []
  uploadFileModelRef.value.visible = true

  let r = await getArchivalDataDetailsAPI({
    type: v,
    labId: laboratoryId.value
  })
  r.forEach((it) => {
    it.type = it.suffix
  })
  uploadFileModelRef.value.dataList = r
}
let archivalDataNumber = ref<any>({})

const getArchivalDataNumber = async () => {
  spinning.value = true
  let r = await getArchivalDataNumberAPI({
    labId: laboratoryId.value,
    type: "builder"
  })
  spinning.value = false
  archivalDataNumber.value = r.attachmentType
}
const saveFile = async (v) => {
  let attachments = v.map((it) => {
    return {
      name: it.name,
      url: it.url,
      id: it.id,
      size: it.size,
      suffix: it.type,
      uploadTime: it.uploadTime
    }
  })
  archivalDataUploadAPI({
    labId: laboratoryId.value,
    attachments: attachments,
    type: selFileTypeKey.value
  })
    .then(() => {
      message.success("上传成功")
      getArchivalDataNumber()
      uploadFileModelRef.value.visible = false
    })
    .catch(() => {
      uploadFileModelRef.value.visible = false
    })
}

const downTemplate = (t) => {
  downTemplateAPI(t, laboratoryId.value).then((res) => {
    if (!res) return
    downloadFile(res as any, enumT[t] + ".docx")
  })
}
onMounted(async () => {
  getArchivalDataNumber()
})
</script>

<style lang="less" scoped>
.files_wrap {
  .files_items {
    width: 260px;
    margin-left: 45px;
    margin-bottom: 65px;
    margin-top: 25px;
    .tle {
      margin: 10px 0;
      span:before {
        content: "*";
        color: red;
      }
    }
    .tip {
      color: #c3c3c3;
      position: absolute;
      font-size: 13px;
      margin-top: 5px;
    }
  }
}
.icon-shangchuan {
  font-size: 12px;
  margin-right: 5px;
}
.upload_tip {
  color: #767676cc;
  margin-left: 10px;
  .num_red {
    color: red;
  }
  .num_green {
    color: green;
  }
}
</style>
