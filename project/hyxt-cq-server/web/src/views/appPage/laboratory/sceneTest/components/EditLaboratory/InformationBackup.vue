<template>
  <div>
    <a-spin tip="加载中..." :spinning="spinning">
      <a-row class="files_wrap">
        <a-col class="files_items">
          <p class="tle">
            <span>现场检测项目设立授权书</span>
            <a
              v-if="!props.details"
              style="margin-left: 10px"
              @click="downTemplate('AUTHORIZATION')"
            >
              下载模板
            </a>
          </p>
          <p class="bnt_wrap">
            <a-button type="primary" @click="openUplaodModel('AUTHORIZATION')">
              <template #icon>
                <i style="" class="iconfont icon-shangchuan" />
              </template>
              {{ props.details ? "点击查看" : "点击上传" }}
            </a-button>
            <span class="upload_tip">
              (已上传
              <span :class="archivalDataNumber.AUTHORIZATION ? 'num_green' : 'num_red'">
                {{ archivalDataNumber.AUTHORIZATION || 0 }}
              </span>
              个文件)
            </span>
          </p>
          <p v-if="!props.details" class="tip">注：请下载系统模板由母体机构签字盖章后，再上传</p>
        </a-col>

        <a-col class="files_items">
          <p class="tle">
            <span>检测人员学历、职称、检测证书</span>
          </p>
          <p class="bnt_wrap">
            <a-button type="primary" @click="openUplaodModel('TESTER_CERTIFICATE')">
              <template #icon>
                <i style="" class="iconfont icon-shangchuan" />
              </template>
              {{ props.details ? "点击查看" : "点击上传" }}
            </a-button>
            <span class="upload_tip">
              (已上传
              <span :class="archivalDataNumber.TESTER_CERTIFICATE ? 'num_green' : 'num_red'">
                {{ archivalDataNumber.TESTER_CERTIFICATE || 0 }}
              </span>
              个文件)
            </span>
          </p>
          <p v-if="!props.details" class="tip">注：请按人员将学历、职称、检测证书打包后上传</p>
        </a-col>

        <!-- <a-col class="files_items">
          <p class="tle">
            <span>本合同段工程概况</span>
          </p>
          <p class="bnt_wrap">
            <a-button type="primary" @click="openUplaodModel('CONTRACT')">
              <template #icon>
                <i style="" class="iconfont icon-shangchuan" />
              </template>
              {{ props.details ? "点击查看" : "点击上传" }}
            </a-button>
            <span class="upload_tip">
              (已上传
              <span :class="archivalDataNumber.CONTRACT ? 'num_green' : 'num_red'">
                {{ archivalDataNumber.CONTRACT || 0 }}
              </span>
              个文件)
            </span>
          </p>
        </a-col> -->

        <a-col class="files_items">
          <p class="tle">
            <span>委托合同</span>
          </p>
          <p class="bnt_wrap">
            <a-button type="primary" @click="openUplaodModel('CONSIGN')">
              <template #icon>
                <i style="" class="iconfont icon-shangchuan" />
              </template>
              {{ props.details ? "点击查看" : "点击上传" }}
            </a-button>
            <span class="upload_tip">
              (已上传
              <span :class="archivalDataNumber.CONSIGN ? 'num_green' : 'num_red'">
                {{ archivalDataNumber.CONSIGN || 0 }}
              </span>
              个文件)
            </span>
          </p>
        </a-col>
        <a-col class="files_items">
          <p class="tle">
            <span>母体检测机构等级证书</span>
          </p>
          <p class="bnt_wrap">
            <a-button type="primary" @click="openUplaodModel('ORG_LEVEL')">
              <template #icon>
                <i style="" class="iconfont icon-shangchuan" />
              </template>
              {{ props.details ? "点击查看" : "点击上传" }}
            </a-button>
            <span class="upload_tip">
              (已上传
              <span :class="archivalDataNumber.ORG_LEVEL ? 'num_green' : 'num_red'">
                {{ archivalDataNumber.ORG_LEVEL || 0 }}
              </span>
              个文件)
            </span>
          </p>
        </a-col>
        <a-col class="files_items">
          <p class="tle">
            <span>母体检测机构资质认定证书</span>
          </p>
          <p class="bnt_wrap">
            <a-button type="primary" @click="openUplaodModel('MEASUREMENT_CERTIFICATE')">
              <template #icon>
                <i style="" class="iconfont icon-shangchuan" />
              </template>
              {{ props.details ? "点击查看" : "点击上传" }}
            </a-button>
            <span class="upload_tip">
              (已上传
              <span :class="archivalDataNumber.MEASUREMENT_CERTIFICATE ? 'num_green' : 'num_red'">
                {{ archivalDataNumber.MEASUREMENT_CERTIFICATE || 0 }}
              </span>
              个文件)
            </span>
          </p>
        </a-col>
        <!-- <a-col class="files_items">
          <p class="tle">
            <span>工地试验室授权负责人聘用证明</span>
          </p>
          <p class="bnt_wrap">
            <a-button type="primary" @click="openUplaodModel('EMPLOYMENT_PROOF')">
              <template #icon>
                <i style="" class="iconfont icon-shangchuan" />
              </template>
              {{ props.details ? "点击查看" : "点击上传" }}
            </a-button>
            <span class="upload_tip">
              (已上传
              <span :class="archivalDataNumber.EMPLOYMENT_PROOF ? 'num_green' : 'num_red'">
                {{ archivalDataNumber.EMPLOYMENT_PROOF || 0 }}
              </span>
              个文件)
            </span>
          </p>
        </a-col> -->

        <!-- <a-col class="files_items">
          <p class="tle">
            <span>工地试验室检测人员学历证书</span>
          </p>
          <p class="bnt_wrap">
            <a-button type="primary" @click="openUplaodModel('DEGREE')">
              <template #icon>
                <i style="" class="iconfont icon-shangchuan" />
              </template>
              {{ props.details ? "点击查看" : "点击上传" }}
            </a-button>
            <span class="upload_tip">
              (已上传
              <span :class="archivalDataNumber.DEGREE ? 'num_green' : 'num_red'">
                {{ archivalDataNumber.DEGREE || 0 }}
              </span>
              个文件)
            </span>
          </p>
        </a-col>
        <a-col class="files_items">
          <p class="tle">
            <span>工地试验室检测人员职称证书</span>
          </p>
          <p class="bnt_wrap">
            <a-button type="primary" @click="openUplaodModel('JOB_TITLE')">
              <template #icon>
                <i style="" class="iconfont icon-shangchuan" />
              </template>
              {{ props.details ? "点击查看" : "点击上传" }}
            </a-button>
            <span class="upload_tip">
              (已上传
              <span :class="archivalDataNumber.JOB_TITLE ? 'num_green' : 'num_red'">
                {{ archivalDataNumber.JOB_TITLE || 0 }}
              </span>
              个文件)
            </span>
          </p>
        </a-col>
        <a-col class="files_items">
          <p class="tle">
            <span>工地试验室检测人员检测证书</span>
          </p>
          <p class="bnt_wrap">
            <a-button type="primary" @click="openUplaodModel('INSPECTION_CERTIFICATE')">
              <template #icon>
                <i style="" class="iconfont icon-shangchuan" />
              </template>
              {{ props.details ? "点击查看" : "点击上传" }}
            </a-button>
            <span class="upload_tip">
              (已上传
              <span :class="archivalDataNumber.INSPECTION_CERTIFICATE ? 'num_green' : 'num_red'">
                {{ archivalDataNumber.INSPECTION_CERTIFICATE || 0 }}
              </span>
              个文件)
            </span>
          </p>
        </a-col> -->
        <!-- <a-col class="files_items">
          <p class="tle">
            <span>母体检测机构人员一览表</span>
          </p>
          <p class="bnt_wrap">
            <a-button type="primary" @click="openUplaodModel('ORG_PERSON')">
              <template #icon>
                <i style="" class="iconfont icon-shangchuan" />
              </template>
              {{ props.details ? "点击查看" : "点击上传" }}
            </a-button>
            <span class="upload_tip">
              (已上传
              <span :class="archivalDataNumber.ORG_PERSON ? 'num_green' : 'num_red'">
                {{ archivalDataNumber.ORG_PERSON || 0 }}
              </span>
              个文件)
            </span>
          </p>
          <p class="tip" v-if="!props.details">注：需标注出本工地试验室试验人员</p>
        </a-col> -->
        <!-- <a-col class="files_items">
          <p class="tle">
            <span>工地试验室检测用房平面布置图</span>
          </p>
          <p class="bnt_wrap">
            <a-button type="primary" @click="openUplaodModel('DISTRIBUTION_MAP')">
              <template #icon>
                <i style="" class="iconfont icon-shangchuan" />
              </template>
              {{ props.details ? "点击查看" : "点击上传" }}
            </a-button>
            <span class="upload_tip">
              (已上传
              <span :class="archivalDataNumber.DISTRIBUTION_MAP ? 'num_green' : 'num_red'">
                {{ archivalDataNumber.DISTRIBUTION_MAP || 0 }}
              </span>
              个文件)
            </span>
          </p>
          <p class="tip" v-if="!props.details">注：标明尺寸及用途</p>
        </a-col> -->

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
            注：请下载打印系统模板由母体检测机构签字盖章后，再上传
          </p>
        </a-col>

        <!-- <a-col class="files_items">
          <p class="tle">
            <span>备案登记流转单</span>
            <a style="margin-left: 10px" v-if="!props.details" @click="downTemplate('FLOW_SHEET')">
              下载模板
            </a>
          </p>
          <p class="bnt_wrap">
            <a-button type="primary" @click="openUplaodModel('FLOW_SHEET')">
              <template #icon>
                <i style="" class="iconfont icon-shangchuan" />
              </template>
              {{ props.details ? "点击查看" : "点击上传" }}
            </a-button>
            <span class="upload_tip">
              (已上传
              <span :class="archivalDataNumber.FLOW_SHEET ? 'num_green' : 'num_red'">
                {{ archivalDataNumber.FLOW_SHEET || 0 }}
              </span>
              个文件)
            </span>
          </p>
        </a-col> -->
      </a-row>
      <p style="color: #b9b9b9; margin-top: 40px; margin-left: 45px">
        支持上传文件类型：png、jpg、jpeg、doc、docx、xls、xlsx、pdf、zip、rar
      </p>

      <uploadFileModel
        ref="uploadFileModelRef"
        :title="uploadTitle"
        :details="props.details"
        @callBack="saveFile"
      />
    </a-spin>
  </div>
</template>
<script setup lang="ts">
import { Ref } from "vue"
import uploadFileModel from "@/components/uploadFileModel/index.vue"
import { ref, toRefs, onMounted, inject } from "vue"
import { downloadFile } from "@/assets/js/common"
import {
  archivalDataUploadAPI,
  getArchivalDataDetailsAPI,
  getArchivalDataNumberAPI,
  downTemplateAPI
} from "@/api/laboratory.api"
import { message } from "ant-design-vue"

const enumT = {
  AUTHORIZATION: "现场检测项目设立授权书",
  CONTRACT: "本合同段工程概况",
  CONSIGN: "委托合同",
  ORG_LEVEL: "母体检测机构等级证书",
  MEASUREMENT_CERTIFICATE: "母体检测机构资质认定证书",
  EMPLOYMENT_PROOF: "工地试验室授权负责人聘用证明",
  DEGREE: "工地试验室检测人员学历证书",
  JOB_TITLE: "工地试验室检测人员职称证书",
  INSPECTION_CERTIFICATE: "工地试验室检测人员检测证书",
  ORG_PERSON: "母体检测机构人员一览表",
  DISTRIBUTION_MAP: "工地试验室检测用房平面布置图",
  FLOW_SHEET: "备案登记流转单",
  REGISTRATION: "现场检测项目备案登记表",
  TESTER_CERTIFICATE: "检测人员学历、职称、检测证书"
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
    type: "keep"
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
    type: selFileTypeKey.value,
    isApply: isApply.value
  })
    .then((r) => {
      message.success("上传成功")
      getArchivalDataNumber()
      uploadFileModelRef.value.visible = false
    })
    .catch((err) => {
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
    margin-bottom: 20px;
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
    .bnt_wrap {
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
