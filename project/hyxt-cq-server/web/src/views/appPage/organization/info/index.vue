<template>
  <a-spin :spinning="spinning" tip="Loding...">
    <div class="page-wrap">
      <div class="detail-box">
        <a-descriptions bordered size="small" :column="2">
          <a-descriptions-item
            :label-style="{ display: 'none' }"
            :content-style="{ fontWeight: '700' }"
            :span="2"
          >
            <p class="detail-title">机构基本信息</p>
          </a-descriptions-item>
          <a-descriptions-item label="机构名称">{{ orgInfo.name || "-" }}</a-descriptions-item>
          <a-descriptions-item label="机构性质">{{ orgInfo.orgNature || "-" }}</a-descriptions-item>
          <a-descriptions-item label="所在省（市）">
            {{ orgInfo.province || "-" }}
          </a-descriptions-item>
          <a-descriptions-item label="所在市（区）">{{ orgInfo.city || "-" }}</a-descriptions-item>
          <a-descriptions-item label="等级类型" :span="3">
            {{ orgInfo.levelType || "-" }}
          </a-descriptions-item>
          <a-descriptions-item label="机构地址" :span="3">
            <p v-for="(val, key) in orgInfo.otherAddress" :key="key">{{ key }}{{ val }}；</p>
          </a-descriptions-item>
          <a-descriptions-item label="法定代表人" :span="3">
            {{ orgInfo.legalPerson || "-" }}
          </a-descriptions-item>
          <a-descriptions-item label="持证总人数">{{ orgInfo.certHolder }}</a-descriptions-item>
          <a-descriptions-item label="持师总人数">{{ orgInfo.engineerHolder }}</a-descriptions-item>
          <a-descriptions-item
            :label-style="{ display: 'none' }"
            :content-style="{ fontWeight: '700' }"
            :span="3"
          >
            <p class="detail-title">证书人员</p>
          </a-descriptions-item>
          <a-descriptions-item
            class="certificate-con"
            :label-style="{ display: 'none', width: 0 }"
            :span="2"
          >
            <a-table
              :data-source="qualifyDatas"
              :columns="columns"
              bordered
              size="small"
              :pagination="false"
            />
          </a-descriptions-item>
          <!-- <a-descriptions-item
            :label-style="{ display: 'none' }"
            :content-style="{ fontWeight: '700' }"
            :span="3"
          >
            <p class="detail-title">机构详细信息</p>
          </a-descriptions-item>
          <a-descriptions-item label="联系人">{{ orgInfo.linkman || "-" }}</a-descriptions-item>
          <a-descriptions-item label="联系手机">{{ orgInfo.phone || "-" }}</a-descriptions-item>
          <a-descriptions-item label="联系电话">{{ orgInfo.tel || "-" }}</a-descriptions-item>
          <a-descriptions-item label="传真">{{ orgInfo.fax || "-" }}</a-descriptions-item>
          <a-descriptions-item label="邮编">{{ orgInfo.postalCode || "-" }}</a-descriptions-item>
          <a-descriptions-item label="邮箱">{{ orgInfo.email || "-" }}</a-descriptions-item>
          <a-descriptions-item label="网址" :span="3">
            {{ orgInfo.website || "-" }}
          </a-descriptions-item>
          <a-descriptions-item label="开户银行">{{ orgInfo.bank || "-" }}</a-descriptions-item>
          <a-descriptions-item label="开户银行账号">
            {{ orgInfo.bankAccount || "-" }}
          </a-descriptions-item>
          <a-descriptions-item label="机构成立时间">
            {{ formatBusinessDate(orgInfo.setUpTime) || "-" }}
          </a-descriptions-item>
          <a-descriptions-item label="注册资本金（万）">
            {{ orgInfo.registeredCapital || "-" }}
          </a-descriptions-item>
          <a-descriptions-item label="营业执照有效期至">
            {{ formatBusinessDate(orgInfo.businessLicenseExpirationDate) }}
          </a-descriptions-item>
          <a-descriptions-item label="统一社会信用代码（税号）">
            {{ orgInfo.businessLicenseRegistrationNumber || "-" }}
          </a-descriptions-item>
          <template v-if="!orgInfo.businessLicenseImages && orgId">
            <a-descriptions-item label="营业执照照片" :span="2">
              <a-button
                type="primary"
                @click="downloadByNameOrUrl(orgInfo.businessLicenseImages as string, true)"
              >
                下载
              </a-button>
            </a-descriptions-item>
            <a-descriptions-item label="营业执照照片显示" :span="2">
              <a-image :src="orgInfo.businessLicenseImages" width="50px" height="50px" />
            </a-descriptions-item>
          </template>
          <template v-else>
            <a-descriptions-item label="营业执照照片" :span="2">-</a-descriptions-item>
            <a-descriptions-item label="营业执照照片显示" :span="2">-</a-descriptions-item>
          </template>
          <a-descriptions-item label="简介">{{ orgInfo.introduction || "-" }}</a-descriptions-item> -->
        </a-descriptions>
      </div>
      <div class="btns">
        <!-- <a-button type="primary" @click="goDetailPart">部系统机构详情</a-button> -->
        <a-button type="primary" :loading="syncLoading" @click="unifyUpdate">同步更新</a-button>
        <!-- 行业账户 -->
        <a-button
          v-if="orgInfo.status == 'NORMAL' || orgInfo.status == 'UNREGISTERED'"
          v-auth="'org::org::logout-mandatory'"
          type="danger"
          @click="disabledOrg"
        >
          注销
        </a-button>
        <a-button
          v-if="orgInfo.status == 'LOGOUT'"
          v-auth="'org::org::restore'"
          type="primary"
          @click="useOrg"
        >
          启用
        </a-button>
        <!-- 机构账户 -->
        <a-button
          v-if="orgInfo.status == 'NORMAL' || orgInfo.status == 'UNREGISTERED'"
          v-auth="'org::org::logout'"
          type="danger"
          @click="
            () => {
              hintVisible = true
              auditForm.auditAdmId = null
            }
          "
        >
          申请注销
        </a-button>
        <a-button
          v-if="orgInfo.status == 'LOGOUT_APP'"
          v-auth="'org::org::logout'"
          type="primary"
          disabled
        >
          注销待审核
        </a-button>
      </div>
    </div>

    <a-modal
      v-model:visible="hintVisible"
      title="提示"
      :closable="false"
      :mask-closable="false"
      :keyboard="false"
      :confirm-loading="saveLoading"
      @ok="applyLogout"
    >
      <p style="padding: 10px; display: flex; align-items: center; margin-bottom: 10px">
        <exclamation-circle-outlined :style="{ 'font-size': '20px', color: '#ff9a2e' }" />
        <span style="margin-left: 5px; font-size: 16px">
          注销后机构所有账号均无法登录系统,您确定要提交注销申请？
        </span>
      </p>
      <a-form ref="formRef" :model="auditForm" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
        <a-form-item
          label="审核单位："
          name="auditAdmId"
          :rules="[{ required: true, message: '请选择审核单位' }]"
        >
          <a-select
            v-model:value="auditForm.auditAdmId"
            show-search
            :options="admOrgList"
            placeholder="请选择审核单位"
            :filter-option="filterOption"
          ></a-select>
        </a-form-item>
      </a-form>
    </a-modal>
  </a-spin>
</template>
<script setup lang="ts">
import { onActivated, reactive, ref, createVNode } from "vue"
import { useRoute } from "vue-router"
import { ExclamationCircleOutlined } from "@ant-design/icons-vue"
import { Modal, message } from "ant-design-vue"
import { getDetail, logout, logoutMandatory, restore } from "@/api/organization.api"
import { orgInfoType, personType } from "@/type/api/organization.api"
import { formatDate } from "@/assets/js/common"
import { syncDatas, getPageListByType } from "@/api/organization.api"
import { downloadByNameOrUrl } from "@/config/minio.config"
import { storeToRefs } from "pinia"
import userStore from "@/stores/userInfo"
const { userInfo } = storeToRefs(userStore())

const route = useRoute()
const hintVisible = ref<boolean>(false)
const spinning = ref<boolean>(false)
const orgId = ref<string>("")

const orgInfo = ref<orgInfoType>({
  id: "",
  name: "", // 机构名称
  orgNature: "", // 机构性质
  address: "", // 机构地址
  otherAddress: {},
  legalPerson: "", //法定代表人
  certHolder: 0, // 持证总人数
  engineerHolder: 0, // 持师总人数
  qualify: [], // 证书人员列表
  province: "", // 省
  city: "", // 市
  levelType: "", //等级类型
  linkman: "", // 联系人
  phone: "", // 联系手机
  tel: "", // 联系电话
  fax: "", // 传真
  postalCode: "", // 邮政编码
  email: "", // 邮箱
  website: "", // 网址
  bank: "", // 开户银行
  bankAccount: "", //开户银行账号
  setUpTime: "", // 成立时间
  registeredCapital: "", // 注册资本
  businessLicenseExpirationDate: "", // 营业执照有效期至
  businessLicenseRegistrationNumber: "", // 营业执照注册号
  businessLicenseImages: "", // 营业执照图片
  introduction: "", // 简介
  status: "" // 状态 UNREGISTERED-未注册，NORMAL-正常，LOGOUT-注销，LOGOUT_APP-注销申请中
})

// 加载数据
onActivated(() => {
  document.getElementsByClassName("certificate-con")[1]?.setAttribute("colspan", "4")
  orgId.value = route.query?.id as string
  if (userInfo.value.type === "ORG") {
    orgId.value = userInfo.value.orgId
  }
  getDatas()
  getAdmByOrg()
})
const qualifyDatas = ref<personType[]>([])
const getDatas = () => {
  if (!orgId.value) return
  spinning.value = true
  getDetail(orgId.value).then((res: any) => {
    spinning.value = false
    if (res.qualify && res.qualify.length > 0) {
      res.levelType = res.qualify.map((d: any) => d.qualificationLevel).join(",")
      const list: any = []
      for (let i = 0; i < res.qualify.length; i++) {
        const d = res.qualify[i]
        const persons = d.persons
        let person1 = ""
        let person2 = ""
        let person3 = ""
        for (let j = 0; j < persons.length; j++) {
          const duties = persons[j].duties
          if (duties.indexOf("行政") !== -1) {
            person1 = persons[j].name
          } else if (duties.indexOf("技术") !== -1) {
            person2 = persons[j].name
          } else if (duties.indexOf("质量") !== -1) {
            person3 = persons[j].name
          }
        }
        list.push({
          certNum: d.certNum,
          person1,
          person2,
          person3
        })
      }
      qualifyDatas.value = list
    }
    orgInfo.value = res
  })
}
const filterOption = (v: string, option: any) => {
  return option.label.includes(v)
}

const formatBusinessDate = (t: number | string) => {
  return t ? formatDate(t) : "-"
}

const columns = reactive([
  {
    title: "证书编号",
    dataIndex: "certNum",
    key: "certNum"
  },
  {
    title: "行政负责人",
    dataIndex: "person1",
    key: "person1"
  },
  {
    title: "技术负责人",
    dataIndex: "person2",
    key: "person2"
  },
  {
    title: "质量负责人",
    dataIndex: "person3",
    key: "person3"
  }
])

//  确认弹窗
const openConfirm = (title: string, content: string) => {
  return new Promise((resolve) => {
    Modal.confirm({
      title,
      content,
      icon: createVNode(ExclamationCircleOutlined),
      onOk() {
        resolve("")
      },
      class: "test"
    })
  })
}

// 查看详情 - 跳转部平台
const goDetailPart = () => {
  const href = import.meta.env.VITE_PART_API
  window.open(`${href}/PCWeb/OrgQuery/OrgDetail?id=${orgId.value}`, "_blank")
}

// 同步更新
const syncLoading = ref(false)
const unifyUpdate = () => {
  Modal.confirm({
    title: "同步提示",
    content: "预计同步时间较长，同步将在后台进行，是否立即同步?",
    okText: "立即同步",
    onOk() {
      syncLoading.value = true
      syncDatas({
        orgId: orgId.value
      })
        .then(() => {
          message.success("数据同步中...")
          syncLoading.value = false
          getDatas()
        })
        .catch(() => {
          syncLoading.value = false
        })
    }
  })
}

// 强制注销
const disabledOrg = () => {
  openConfirm("提示", "您确定要强制注销该机构？注销后该机构所有账号均无法登录系统").then(() => {
    logoutMandatory(orgId.value).then(() => {
      message.success("已禁用")
      getDatas()
    })
  })
}

// 启用
const useOrg = () => {
  openConfirm("提示", "启用后该机构的所有账号将正常使用，您确定要恢复该机构的账号？").then(() => {
    restore(orgId.value).then(() => {
      message.success("已启用")
      getDatas()
    })
  })
}

// 获取机构关联的行业管理单位
const admOrgList = ref()
const getAdmByOrg = () => {
  if (!orgId.value) return
  getPageListByType("admin").then((res: any) => {
    admOrgList.value = res.map((it) => {
      return {
        value: it.id,
        label: it.name
      }
    })
  })
}

const saveLoading = ref(false)
const formRef = ref()
const auditForm = reactive<{
  auditAdmId: string | null
}>({
  auditAdmId: null
})
// 申请注销
const applyLogout = async () => {
  try {
    await formRef.value.validateFields()
    saveLoading.value = true
    logout({ orgId: orgId.value, auditAdmId: auditForm.auditAdmId as string })
      .then(() => {
        hintVisible.value = false
        message.success("已提交注销申请")
        getDatas()
      })
      .catch(() => {
        saveLoading.value = false
      })
  } catch (err) {
    saveLoading.value = false
    console.log(err)
  }
}
</script>
<style lang="less" scoped>
.page-wrap {
  display: flex;
  width: 1024px;
  margin: 0 auto;
  :deep(.ant-descriptions-item-label) {
    padding: 8px 10px;
    width: 140px;
    text-align: center;
  }
  .detail-box {
    flex: 1;
  }
  .btns {
    margin-left: 20px;
    button {
      display: block;
      margin-top: 10px;
    }
  }
  :deep(.certificate-con) {
    padding: 0;
  }
}
</style>
