<template>
  <div>
    <a-spin tip="加载中..." :spinning="spinning">
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane :key="1" tab="此次变更提交资料">
          <a-row class="files_wrap">
            <a-col v-if="needDatum.includes('AUTHORIZATION')" class="files_items">
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
                <a-button
                  type="primary"
                  @click="openUplaodModel('AUTHORIZATION', archivalDataNumber.AUTHORIZATION)"
                >
                  <template #icon>
                    <i style="" class="iconfont icon-shangchuan" />
                  </template>
                  {{ props.details ? "点击查看" : "点击上传" }}
                </a-button>
                <span class="upload_tip">
                  (已上传
                  <span :class="archivalDataNumber.AUTHORIZATION.length ? 'num_green' : 'num_red'">
                    {{ archivalDataNumber.AUTHORIZATION.length || 0 }}
                  </span>
                  个文件)
                </span>
              </p>
              <p v-if="!props.details" class="tip">
                注：请下载系统模板由母体机构签字盖章后，再上传
              </p>
            </a-col>

            <!-- <a-col class="files_items" v-if="needDatum.includes('CONTRACT')">
              <p class="tle">
                <span>本合同段工程概况</span>
              </p>
              <p class="bnt_wrap">
                <a-button
                  type="primary"
                  @click="openUplaodModel('CONTRACT', archivalDataNumber.CONTRACT)"
                >
                  <template #icon>
                    <i style="" class="iconfont icon-shangchuan" />
                  </template>
                  {{ props.details ? "点击查看" : "点击上传" }}
                </a-button>
                <span class="upload_tip">
                  (已上传
                  <span :class="archivalDataNumber.CONTRACT.length ? 'num_green' : 'num_red'">
                    {{ archivalDataNumber.CONTRACT.length || 0 }}
                  </span>
                  个文件)
                </span>
              </p>
            </a-col> -->

            <a-col v-if="needDatum.includes('CONSIGN')" class="files_items">
              <p class="tle">
                <span>委托合同</span>
              </p>
              <p class="bnt_wrap">
                <a-button
                  type="primary"
                  @click="openUplaodModel('CONSIGN', archivalDataNumber.CONSIGN)"
                >
                  <template #icon>
                    <i style="" class="iconfont icon-shangchuan" />
                  </template>
                  {{ props.details ? "点击查看" : "点击上传" }}
                </a-button>
                <span class="upload_tip">
                  (已上传
                  <span :class="archivalDataNumber.CONSIGN.length ? 'num_green' : 'num_red'">
                    {{ archivalDataNumber.CONSIGN.length || 0 }}
                  </span>
                  个文件)
                </span>
              </p>
            </a-col>
            <a-col v-if="needDatum.includes('ORG_LEVEL')" class="files_items">
              <p class="tle">
                <span>母体检测机构等级证书</span>
              </p>
              <p class="bnt_wrap">
                <a-button
                  type="primary"
                  @click="openUplaodModel('ORG_LEVEL', archivalDataNumber.ORG_LEVEL)"
                >
                  <template #icon>
                    <i style="" class="iconfont icon-shangchuan" />
                  </template>
                  {{ props.details ? "点击查看" : "点击上传" }}
                </a-button>
                <span class="upload_tip">
                  (已上传
                  <span :class="archivalDataNumber.ORG_LEVEL.length ? 'num_green' : 'num_red'">
                    {{ archivalDataNumber.ORG_LEVEL.length || 0 }}
                  </span>
                  个文件)
                </span>
              </p>
            </a-col>
            <a-col v-if="needDatum.includes('MEASUREMENT_CERTIFICATE')" class="files_items">
              <p class="tle">
                <span>母体检测机构资质认定证书</span>
              </p>
              <p class="bnt_wrap">
                <a-button
                  type="primary"
                  @click="
                    openUplaodModel(
                      'MEASUREMENT_CERTIFICATE',
                      archivalDataNumber.MEASUREMENT_CERTIFICATE
                    )
                  "
                >
                  <template #icon>
                    <i style="" class="iconfont icon-shangchuan" />
                  </template>
                  {{ props.details ? "点击查看" : "点击上传" }}
                </a-button>
                <span class="upload_tip">
                  (已上传
                  <span
                    :class="
                      archivalDataNumber.MEASUREMENT_CERTIFICATE.length ? 'num_green' : 'num_red'
                    "
                  >
                    {{ archivalDataNumber.MEASUREMENT_CERTIFICATE.length || 0 }}
                  </span>
                  个文件)
                </span>
              </p>
            </a-col>
            <!-- <a-col class="files_items" v-if="needDatum.includes('EMPLOYMENT_PROOF')">
              <p class="tle">
                <span>工地试验室授权负责人聘用证明</span>
              </p>
              <p class="bnt_wrap">
                <a-button
                  type="primary"
                  @click="openUplaodModel('EMPLOYMENT_PROOF', archivalDataNumber.EMPLOYMENT_PROOF)"
                >
                  <template #icon>
                    <i style="" class="iconfont icon-shangchuan" />
                  </template>
                  {{ props.details ? "点击查看" : "点击上传" }}
                </a-button>
                <span class="upload_tip">
                  (已上传
                  <span
                    :class="archivalDataNumber.EMPLOYMENT_PROOF.length ? 'num_green' : 'num_red'"
                  >
                    {{ archivalDataNumber.EMPLOYMENT_PROOF.length || 0 }}
                  </span>
                  个文件)
                </span>
              </p>
            </a-col> -->
            <a-col v-if="needDatum.includes('TESTER_CERTIFICATE')" class="files_items">
              <p class="tle">
                <span>检测人员学历、职称、检测证书</span>
              </p>
              <p class="bnt_wrap">
                <a-button
                  type="primary"
                  @click="
                    openUplaodModel('TESTER_CERTIFICATE', archivalDataNumber.TESTER_CERTIFICATE)
                  "
                >
                  <template #icon>
                    <i style="" class="iconfont icon-shangchuan" />
                  </template>
                  {{ props.details ? "点击查看" : "点击上传" }}
                </a-button>
                <span class="upload_tip">
                  (已上传
                  <span
                    :class="archivalDataNumber.TESTER_CERTIFICATE.length ? 'num_green' : 'num_red'"
                  >
                    {{ archivalDataNumber.TESTER_CERTIFICATE.length || 0 }}
                  </span>
                  个文件)
                </span>
              </p>
              <p v-if="!props.details" class="tip">注：请按人员将学历、职称、检测证书打包后上传</p>
            </a-col>
            <a-col v-if="needDatum.includes('DISTRIBUTION_MAP')" class="files_items">
              <p class="tle">
                <span>工地试验室检测用房平面布置图</span>
              </p>
              <p class="bnt_wrap">
                <a-button
                  type="primary"
                  @click="openUplaodModel('DISTRIBUTION_MAP', archivalDataNumber.DISTRIBUTION_MAP)"
                >
                  <template #icon>
                    <i style="" class="iconfont icon-shangchuan" />
                  </template>
                  {{ props.details ? "点击查看" : "点击上传" }}
                </a-button>
                <span class="upload_tip">
                  (已上传
                  <span
                    :class="archivalDataNumber.DISTRIBUTION_MAP.length ? 'num_green' : 'num_red'"
                  >
                    {{ archivalDataNumber.DISTRIBUTION_MAP.length || 0 }}
                  </span>
                  个文件)
                </span>
              </p>
              <p v-if="!props.details" class="tip">注：标明尺寸及用途</p>
            </a-col>
            <a-col v-if="needDatum.includes('REGISTRATION')" class="files_items">
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
                <a-button
                  type="primary"
                  @click="openUplaodModel('REGISTRATION', archivalDataNumber.REGISTRATION)"
                >
                  <template #icon>
                    <i style="" class="iconfont icon-shangchuan" />
                  </template>
                  {{ props.details ? "点击查看" : "点击上传" }}
                </a-button>
                <span class="upload_tip">
                  (已上传
                  <span :class="archivalDataNumber.REGISTRATION.length ? 'num_green' : 'num_red'">
                    {{ archivalDataNumber.REGISTRATION.length || 0 }}
                  </span>
                  个文件)
                </span>
              </p>
              <p v-if="!props.details" class="tip">
                注：请下载打印系统模板由母体检测机构签字盖章后，再上传
              </p>
            </a-col>
            <a-col v-if="needDatum.includes('LAB_PEOPLE_AMEND_ITEM')" class="files_items">
              <p class="tle">
                <span>工地试验室人员变更审核一览表</span>
                <a
                  v-if="!props.details"
                  style="margin-left: 10px"
                  @click="downTemplate('LAB_PEOPLE_AMEND_ITEM')"
                >
                  下载模板
                </a>
              </p>
              <p class="bnt_wrap">
                <a-button
                  type="primary"
                  @click="
                    openUplaodModel(
                      'LAB_PEOPLE_AMEND_ITEM',
                      archivalDataNumber.LAB_PEOPLE_AMEND_ITEM
                    )
                  "
                >
                  <template #icon>
                    <i style="" class="iconfont icon-shangchuan" />
                  </template>
                  {{ props.details ? "点击查看" : "点击上传" }}
                </a-button>
                <span class="upload_tip">
                  (已上传
                  <span
                    :class="
                      archivalDataNumber.LAB_PEOPLE_AMEND_ITEM.length ? 'num_green' : 'num_red'
                    "
                  >
                    {{ archivalDataNumber.LAB_PEOPLE_AMEND_ITEM.length || 0 }}
                  </span>
                  个文件)
                </span>
              </p>
              <p v-if="!props.details" class="tip">
                注：请下载系统模板由母体机构签字盖章后，再上传
              </p>
            </a-col>

            <a-col v-if="needDatum.includes('OFFICIAL_DOCUMENT')" class="files_items">
              <p class="tle">
                <span>公文申请</span>
              </p>
              <p class="bnt_wrap">
                <a-button
                  type="primary"
                  @click="
                    openUplaodModel('OFFICIAL_DOCUMENT', archivalDataNumber.OFFICIAL_DOCUMENT)
                  "
                >
                  <template #icon>
                    <i style="" class="iconfont icon-shangchuan" />
                  </template>
                  {{ props.details ? "点击查看" : "点击上传" }}
                </a-button>
                <span class="upload_tip">
                  (已上传
                  <span
                    :class="archivalDataNumber.OFFICIAL_DOCUMENT.length ? 'num_green' : 'num_red'"
                  >
                    {{ archivalDataNumber.OFFICIAL_DOCUMENT.length || 0 }}
                  </span>
                  个文件)
                </span>
              </p>
              <p v-if="!props.details" class="tip">注：根据需要上传母体检测机构出具的公文申请</p>
            </a-col>
            <a-col v-if="needDatum.includes('BUSINESS_LICENSE')" class="files_items">
              <p class="tle">
                <span>母体检测机构营业执照或事业单位法人证书</span>
              </p>
              <p class="bnt_wrap">
                <a-button
                  type="primary"
                  @click="openUplaodModel('BUSINESS_LICENSE', archivalDataNumber.BUSINESS_LICENSE)"
                >
                  <template #icon>
                    <i style="" class="iconfont icon-shangchuan" />
                  </template>
                  {{ props.details ? "点击查看" : "点击上传" }}
                </a-button>
                <span class="upload_tip">
                  (已上传
                  <span
                    :class="archivalDataNumber.BUSINESS_LICENSE.length ? 'num_green' : 'num_red'"
                  >
                    {{ archivalDataNumber.BUSINESS_LICENSE.length || 0 }}
                  </span>
                  个文件)
                </span>
              </p>
              <p v-if="!props.details" class="tip">注：根据需要上传母体检测机构出具的公文申请</p>
            </a-col>
            <a-col v-if="needDatum.includes('RESUME')" class="files_items">
              <p class="tle">
                <span>工地试验室授权负责人简历</span>
              </p>
              <p class="bnt_wrap">
                <a-button
                  type="primary"
                  @click="openUplaodModel('RESUME', archivalDataNumber.RESUME)"
                >
                  <template #icon>
                    <i style="" class="iconfont icon-shangchuan" />
                  </template>
                  {{ props.details ? "点击查看" : "点击上传" }}
                </a-button>
                <span class="upload_tip">
                  (已上传
                  <span :class="archivalDataNumber.RESUME.length ? 'num_green' : 'num_red'">
                    {{ archivalDataNumber.RESUME.length || 0 }}
                  </span>
                  个文件)
                </span>
              </p>
            </a-col>
          </a-row>
        </a-tab-pane>
        <a-tab-pane :key="2" tab="变更前现场检测项目全部资料" force-render>
          <a-row class="files_wrap">
            <a-col v-for="item in preAttachments" :key="item.key" class="files_items">
              <p class="tle">
                <span>{{ enumT[item.key] }}</span>
                <a v-if="!props.details" style="margin-left: 10px" @click="downTemplate(item.key)">
                  下载模板
                </a>
              </p>
              <p class="bnt_wrap">
                <a-button type="primary" @click="openUplaodModel(item.key, item.filsArray)">
                  <template #icon>
                    <i style="" class="iconfont icon-shangchuan" />
                  </template>
                  {{ props.details ? "点击查看" : "点击上传" }}
                </a-button>
                <span class="upload_tip">
                  (已上传
                  <span :class="item.filsArray.length ? 'num_green' : 'num_red'">
                    {{ item.filsArray.length || 0 }}
                  </span>
                  个文件)
                </span>
              </p>
              <p v-if="!props.details" class="tip">
                注：请下载系统模板由母体机构签字盖章后，再上传
              </p>
            </a-col>

            <!-- <a-col class="files_items" v-if="needDatum.includes('AUTHORIZATION')">
              <p class="tle">
                <span>工地试验室设立授权书</span>
                <a
                  style="margin-left: 10px"
                  v-if="!props.details"
                  @click="downTemplate('AUTHORIZATION')"
                >
                  下载模板
                </a>
              </p>
              <p class="bnt_wrap">
                <a-button
                  type="primary"
                  @click="openUplaodModel('AUTHORIZATION', preAttachments.AUTHORIZATION)"
                >
                  <template #icon>
                    <i style="" class="iconfont icon-shangchuan" />
                  </template>
                  {{ props.details ? "点击查看" : "点击上传" }}
                </a-button>
                <span class="upload_tip">
                  (已上传
                  <span :class="preAttachments.AUTHORIZATION.length ? 'num_green' : 'num_red'">
                    {{ preAttachments.AUTHORIZATION.length || 0 }}
                  </span>
                  个文件)
                </span>
              </p>
              <p class="tip" v-if="!props.details">
                注：请下载系统模板由母体机构签字盖章后，再上传
              </p>
            </a-col>

            <a-col class="files_items" v-if="needDatum.includes('CONTRACT')">
              <p class="tle">
                <span>本合同段工程概况</span>
              </p>
              <p class="bnt_wrap">
                <a-button
                  type="primary"
                  @click="openUplaodModel('CONTRACT', preAttachments.CONTRACT)"
                >
                  <template #icon>
                    <i style="" class="iconfont icon-shangchuan" />
                  </template>
                  {{ props.details ? "点击查看" : "点击上传" }}
                </a-button>
                <span class="upload_tip">
                  (已上传
                  <span :class="preAttachments.CONTRACT.length ? 'num_green' : 'num_red'">
                    {{ preAttachments.CONTRACT.length || 0 }}
                  </span>
                  个文件)
                </span>
              </p>
            </a-col>

            <a-col class="files_items" v-if="needDatum.includes('CONSIGN')">
              <p class="tle">
                <span>委托合同</span>
              </p>
              <p class="bnt_wrap">
                <a-button
                  type="primary"
                  @click="openUplaodModel('CONSIGN', preAttachments.CONSIGN)"
                >
                  <template #icon>
                    <i style="" class="iconfont icon-shangchuan" />
                  </template>
                  {{ props.details ? "点击查看" : "点击上传" }}
                </a-button>
                <span class="upload_tip">
                  (已上传
                  <span :class="preAttachments.CONSIGN.length ? 'num_green' : 'num_red'">
                    {{ preAttachments.CONSIGN.length || 0 }}
                  </span>
                  个文件)
                </span>
              </p>
            </a-col>
            <a-col class="files_items" v-if="needDatum.includes('ORG_LEVEL')">
              <p class="tle">
                <span>母体检测机构等级证书</span>
              </p>
              <p class="bnt_wrap">
                <a-button
                  type="primary"
                  @click="openUplaodModel('ORG_LEVEL', preAttachments.ORG_LEVEL)"
                >
                  <template #icon>
                    <i style="" class="iconfont icon-shangchuan" />
                  </template>
                  {{ props.details ? "点击查看" : "点击上传" }}
                </a-button>
                <span class="upload_tip">
                  (已上传
                  <span :class="preAttachments.ORG_LEVEL.length ? 'num_green' : 'num_red'">
                    {{ preAttachments.ORG_LEVEL.length || 0 }}
                  </span>
                  个文件)
                </span>
              </p>
            </a-col>
            <a-col class="files_items" v-if="needDatum.includes('MEASUREMENT_CERTIFICATE')">
              <p class="tle">
                <span>母体检测机构资质认定证书</span>
              </p>
              <p class="bnt_wrap">
                <a-button
                  type="primary"
                  @click="
                    openUplaodModel(
                      'MEASUREMENT_CERTIFICATE',
                      preAttachments.MEASUREMENT_CERTIFICATE
                    )
                  "
                >
                  <template #icon>
                    <i style="" class="iconfont icon-shangchuan" />
                  </template>
                  {{ props.details ? "点击查看" : "点击上传" }}
                </a-button>
                <span class="upload_tip">
                  (已上传
                  <span
                    :class="preAttachments.MEASUREMENT_CERTIFICATE.length ? 'num_green' : 'num_red'"
                  >
                    {{ preAttachments.MEASUREMENT_CERTIFICATE.length || 0 }}
                  </span>
                  个文件)
                </span>
              </p>
            </a-col>
            <a-col class="files_items" v-if="needDatum.includes('EMPLOYMENT_PROOF')">
              <p class="tle">
                <span>工地试验室授权负责人聘用证明</span>
              </p>
              <p class="bnt_wrap">
                <a-button
                  type="primary"
                  @click="openUplaodModel('EMPLOYMENT_PROOF', preAttachments.EMPLOYMENT_PROOF)"
                >
                  <template #icon>
                    <i style="" class="iconfont icon-shangchuan" />
                  </template>
                  {{ props.details ? "点击查看" : "点击上传" }}
                </a-button>
                <span class="upload_tip">
                  (已上传
                  <span :class="preAttachments.EMPLOYMENT_PROOF.length ? 'num_green' : 'num_red'">
                    {{ preAttachments.EMPLOYMENT_PROOF.length || 0 }}
                  </span>
                  个文件)
                </span>
              </p>
            </a-col>
            <a-col class="files_items" v-if="needDatum.includes('TESTER_CERTIFICATE')">
              <p class="tle">
                <span>检测人员学历、职称、检测证书</span>
              </p>
              <p class="bnt_wrap">
                <a-button
                  type="primary"
                  @click="openUplaodModel('TESTER_CERTIFICATE', preAttachments.TESTER_CERTIFICATE)"
                >
                  <template #icon>
                    <i style="" class="iconfont icon-shangchuan" />
                  </template>
                  {{ props.details ? "点击查看" : "点击上传" }}
                </a-button>
                <span class="upload_tip">
                  (已上传
                  <span :class="preAttachments.TESTER_CERTIFICATE.length ? 'num_green' : 'num_red'">
                    {{ preAttachments.TESTER_CERTIFICATE.length || 0 }}
                  </span>
                  个文件)
                </span>
              </p>
              <p class="tip" v-if="!props.details">注：请按人员将学历、职称、检测证书打包后上传</p>
            </a-col>
            <a-col class="files_items" v-if="needDatum.includes('DISTRIBUTION_MAP')">
              <p class="tle">
                <span>工地试验室检测用房平面布置图</span>
              </p>
              <p class="bnt_wrap">
                <a-button
                  type="primary"
                  @click="openUplaodModel('DISTRIBUTION_MAP', preAttachments.DISTRIBUTION_MAP)"
                >
                  <template #icon>
                    <i style="" class="iconfont icon-shangchuan" />
                  </template>
                  {{ props.details ? "点击查看" : "点击上传" }}
                </a-button>
                <span class="upload_tip">
                  (已上传
                  <span :class="preAttachments.DISTRIBUTION_MAP.length ? 'num_green' : 'num_red'">
                    {{ preAttachments.DISTRIBUTION_MAP.length || 0 }}
                  </span>
                  个文件)
                </span>
              </p>
              <p class="tip" v-if="!props.details">注：标明尺寸及用途</p>
            </a-col>
            <a-col class="files_items" v-if="needDatum.includes('REGISTRATION')">
              <p class="tle">
                <span>工地试验室备案登记表</span>
                <a
                  style="margin-left: 10px"
                  v-if="!props.details"
                  @click="downTemplate('REGISTRATION')"
                >
                  下载模板
                </a>
              </p>
              <p class="bnt_wrap">
                <a-button
                  type="primary"
                  @click="openUplaodModel('REGISTRATION', preAttachments.REGISTRATION)"
                >
                  <template #icon>
                    <i style="" class="iconfont icon-shangchuan" />
                  </template>
                  {{ props.details ? "点击查看" : "点击上传" }}
                </a-button>
                <span class="upload_tip">
                  (已上传
                  <span :class="preAttachments.REGISTRATION.length ? 'num_green' : 'num_red'">
                    {{ preAttachments.REGISTRATION.length || 0 }}
                  </span>
                  个文件)
                </span>
              </p>
              <p class="tip" v-if="!props.details">
                注：请下载打印系统模板由母体检测机构签字盖章后，再上传
              </p>
            </a-col>
            <a-col class="files_items" v-if="needDatum.includes('LAB_PEOPLE_AMEND_ITEM')">
              <p class="tle">
                <span>工地试验室人员变更审核一览表</span>
                <a
                  style="margin-left: 10px"
                  v-if="!props.details"
                  @click="downTemplate('LAB_PEOPLE_AMEND_ITEM')"
                >
                  下载模板
                </a>
              </p>
              <p class="bnt_wrap">
                <a-button
                  type="primary"
                  @click="
                    openUplaodModel('LAB_PEOPLE_AMEND_ITEM', preAttachments.LAB_PEOPLE_AMEND_ITEM)
                  "
                >
                  <template #icon>
                    <i style="" class="iconfont icon-shangchuan" />
                  </template>
                  {{ props.details ? "点击查看" : "点击上传" }}
                </a-button>
                <span class="upload_tip">
                  (已上传
                  <span
                    :class="preAttachments.LAB_PEOPLE_AMEND_ITEM.length ? 'num_green' : 'num_red'"
                  >
                    {{ preAttachments.LAB_PEOPLE_AMEND_ITEM.length || 0 }}
                  </span>
                  个文件)
                </span>
              </p>
              <p class="tip" v-if="!props.details">
                注：请下载系统模板由母体机构签字盖章后，再上传
              </p>
            </a-col>

            <a-col class="files_items" v-if="needDatum.includes('OFFICIAL_DOCUMENT')">
              <p class="tle">
                <span>公文申请</span>
              </p>
              <p class="bnt_wrap">
                <a-button
                  type="primary"
                  @click="openUplaodModel('OFFICIAL_DOCUMENT', preAttachments.OFFICIAL_DOCUMENT)"
                >
                  <template #icon>
                    <i style="" class="iconfont icon-shangchuan" />
                  </template>
                  {{ props.details ? "点击查看" : "点击上传" }}
                </a-button>
                <span class="upload_tip">
                  (已上传
                  <span :class="preAttachments.OFFICIAL_DOCUMENT.length ? 'num_green' : 'num_red'">
                    {{ preAttachments.OFFICIAL_DOCUMENT.length || 0 }}
                  </span>
                  个文件)
                </span>
              </p>
              <p class="tip" v-if="!props.details">注：根据需要上传母体检测机构出具的公文申请</p>
            </a-col>
            <a-col class="files_items" v-if="needDatum.includes('BUSINESS_LICENSE')">
              <p class="tle">
                <span>母体检测机构营业执照或事业单位法人证书</span>
              </p>
              <p class="bnt_wrap">
                <a-button
                  type="primary"
                  @click="openUplaodModel('BUSINESS_LICENSE', preAttachments.BUSINESS_LICENSE)"
                >
                  <template #icon>
                    <i style="" class="iconfont icon-shangchuan" />
                  </template>
                  {{ props.details ? "点击查看" : "点击上传" }}
                </a-button>
                <span class="upload_tip">
                  (已上传
                  <span :class="preAttachments.BUSINESS_LICENSE.length ? 'num_green' : 'num_red'">
                    {{ preAttachments.BUSINESS_LICENSE.length || 0 }}
                  </span>
                  个文件)
                </span>
              </p>
              <p class="tip" v-if="!props.details">注：根据需要上传母体检测机构出具的公文申请</p>
            </a-col>
            <a-col class="files_items" v-if="needDatum.includes('RESUME')">
              <p class="tle">
                <span>工地试验室授权负责人简历</span>
              </p>
              <p class="bnt_wrap">
                <a-button type="primary" @click="openUplaodModel('RESUME', preAttachments.RESUME)">
                  <template #icon>
                    <i style="" class="iconfont icon-shangchuan" />
                  </template>
                  {{ props.details ? "点击查看" : "点击上传" }}
                </a-button>
                <span class="upload_tip">
                  (已上传
                  <span :class="preAttachments.RESUME.length ? 'num_green' : 'num_red'">
                    {{ preAttachments.RESUME.length || 0 }}
                  </span>
                  个文件)
                </span>
              </p>
            </a-col> -->
          </a-row>
        </a-tab-pane>
      </a-tabs>

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
  archivalDataUploadAlterAPI,
  getArchivalDataDetailsAlterAPI,
  getArchivalDataNumberAlterAPI,
  downTemplateAlterAPI,
  getAlterBaseInfo,
  getAlterPersonAPI,
  getAlterMaterialDetAPI
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
  TESTER_CERTIFICATE: "检测人员学历、职称、检测证书",
  RESUME: "工地试验室授权负责人简历",
  BUSINESS_LICENSE: "母体检测机构营业执照或事业单位法人证书",
  OFFICIAL_DOCUMENT: "公文申请",
  LAB_PEOPLE_AMEND_ITEM: "工地试验室人员变更审核一览表"
}

let activeKey = ref(1)

const props = defineProps({
  labId: {
    type: String
  },
  alterId: {
    type: String,
    required: true
  },
  details: {
    type: Boolean,
    default: false
  }
})

const laboratoryId: any = toRefs(props).labId //试验室编辑id
const alterId: any = toRefs(props).alterId //变更id
const alterType: any = [] //要变更的类型

const spinning = ref(false)
const uploadFileModelRef = ref()

let uploadTitle = ref("")
let selFileTypeKey = ref("")

const needDatum: Ref<Array<string>> = ref([]) //需要变更的资料类型
const datumControl = () => {
  //控制需要变更的资料类型
  alterType.value.forEach((it) => {
    switch (it) {
      case "LAB_NAME":
        needDatum.value.push("OFFICIAL_DOCUMENT")
        needDatum.value.push("AUTHORIZATION")
        needDatum.value.push("ORG_LEVEL")
        needDatum.value.push("MEASUREMENT_CERTIFICATE")
        needDatum.value.push("BUSINESS_LICENSE")
        break
      case "DELAY":
        needDatum.value.push("OFFICIAL_DOCUMENT")
        needDatum.value.push("AUTHORIZATION")
        needDatum.value.push("ORG_LEVEL")
        needDatum.value.push("MEASUREMENT_CERTIFICATE")
        break
      case "PEOPLE":
        needDatum.value.push("OFFICIAL_DOCUMENT")
        chargeChange.value ? needDatum.value.push("AUTHORIZATION") : "" //如果授权负责人发生改变
        needDatum.value.push("LAB_PEOPLE_AMEND_ITEM")
        chargeChange.value && !alterType.value.includes("TEST_ITEM") //(授权负责人发生变更时 且 参数不变更)，显示
          ? needDatum.value.push("RESUME")
          : ""
        chargeChange.value ? needDatum.value.push("EMPLOYMENT_PROOF") : "" //如果授权负责人发生改变
        needDatum.value.push("TESTER_CERTIFICATE")
        break
      case "TEST_ITEM":
        needDatum.value.push("OFFICIAL_DOCUMENT")
        needDatum.value.push("CONTRACT")
        needDatum.value.push("CONSIGN")
        needDatum.value.push("AUTHORIZATION")
        needDatum.value.push("ORG_LEVEL")
        needDatum.value.push("MEASUREMENT_CERTIFICATE")
        needDatum.value.push("REGISTRATION")
        areaChange.value ? needDatum.value.push("DISTRIBUTION_MAP") : "" //如果占地面积发生改变
        break
    }
  })
  needDatum.value = Array.from(new Set(needDatum.value))
}

//获取占地面积是否发生变更
let areaChange: Ref<Boolean> = ref(false)
const changeInArea = async () => {
  if (!alterType.value.includes("TEST_ITEM")) {
    return
  }
  try {
    let res: any = await getAlterBaseInfo(alterId.value)
    areaChange.value = res.distributionMapChanged
  } catch (error) {
    console.error(error)
  }
}

//获取授权负责人是否发生变更

let chargeChange: Ref<Boolean> = ref(false)
const changeInCharge = async () => {
  if (!alterType.value.includes("PEOPLE")) {
    return
  }
  try {
    let res: any = await getAlterPersonAPI(alterId.value)
    chargeChange.value = res.principalChanged
  } catch (error) {
    console.error(error)
  }
}

const openUplaodModel = async (v: any, files) => {
  uploadTitle.value = enumT[v]
  selFileTypeKey.value = v
  uploadFileModelRef.value.dataList = files
  uploadFileModelRef.value.visible = true

  // let r = await getArchivalDataDetailsAlterAPI(v, alterId.value)
  // r.forEach((it) => {
  //   it.type = it.suffix
  // })
  // uploadFileModelRef.value.dataList = r
}
// let archivalDataNumber = ref<any>({})

// const getArchivalDataNumber = async () => {
//   spinning.value = true
//   let r = await getArchivalDataNumberAlterAPI(alterId.value)
//   spinning.value = false
//   archivalDataNumber.value = r.attachmentType
// }
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
  archivalDataUploadAlterAPI(alterId.value, {
    labId: laboratoryId.value,
    attachments: attachments,
    type: selFileTypeKey.value
  })
    .then((r) => {
      message.success("上传成功")
      // getArchivalDataNumber()
      uploadFileModelRef.value.visible = false
    })
    .catch((err) => {
      uploadFileModelRef.value.visible = false
    })
}
const downTemplate = (t) => {
  downTemplateAlterAPI(t, alterId.value).then((res) => {
    if (!res) return
    downloadFile(res as any, enumT[t] + ".docx")
  })
}

let archivalDataNumber: any = ref({}) //变更前
let preAttachments: any = ref([]) //变更后文件
const getMaterialDet = async () => {
  let res = await getAlterMaterialDetAPI(alterId.value)
  archivalDataNumber.value = res.attachments

  preAttachments.value = Object.keys(res.preAttachments).map((key) => {
    return {
      key,
      filsArray: res.preAttachments[key]
    }
  })

  alterType.value = res.contents
  return res
}

onMounted(async () => {
  await getMaterialDet()
  // getArchivalDataNumber()
  await changeInCharge()
  await changeInArea()
  await datumControl()
})
</script>

<style lang="less" scoped>
.files_wrap {
  .files_items {
    width: 280px;
    margin-left: 45px;
    margin-bottom: 20px;
    margin-top: 25px;
    .tle {
      margin: 10px 0;
      span:before {
        // content: "*";
        // color: red;
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
