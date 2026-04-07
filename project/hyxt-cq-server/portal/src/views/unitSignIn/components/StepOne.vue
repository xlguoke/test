<template>
  <div class="step-one">
    <a-form :model="localForm" :label-col="{ style: { width: '125px' } }" @finish="nextStep">
      <a-form-item label="开展业务类别">
        <a-radio-group v-model:value="busType" name="radioGroup">
          <a-radio :value="1">公路工程</a-radio>
          <a-radio :value="2">水运工程</a-radio>
          <a-radio :value="3">公路&水运工程</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item
        label="机构名称"
        name="orgName"
        :rules="[{ required: true, message: '输入机构关键字查询' }]"
      >
        <a-select
          v-model:value="localForm.orgName"
          show-search
          label-in-value
          placeholder="输入机构关键字查询"
          :default-active-first-option="false"
          :filter-option="false"
          :not-found-content="fetching ? undefined : queryHint"
          :options="optionsData"
          @search="searchReport"
          @change="changeReport"
        >
          <template v-if="fetching" #notFoundContent>
            <a-spin size="small" />
          </template>
        </a-select>
      </a-form-item>
      <a-form-item label="机构所在省（市）">
        <a-input v-model:value="localForm.orgCity" disabled />
      </a-form-item>
      <a-form-item>
        <div class="handle-box">
          <a-button type="primary" html-type="submit" :loading="loading">
            下一步
            <i class="iconfont icon-arrowRight"></i>
          </a-button>
          <p v-if="oldOrg && oldOrg != localForm.orgName" class="hint-change">
            机构变更，资料信息将重置
          </p>
        </div>
      </a-form-item>
    </a-form>

    <a-modal v-model:visible="unitvisible" title="请确认从业单位名称" @cancel="cancelUnit">
      <p style="margin-bottom: 20px">
        为您在"{{ busTypeEnum[busType] }}"的从业单位中匹配到以下单位，请选择正确的单位名称
      </p>
      <a-radio-group v-model:value="selUnitNameVal" name="radioGroup">
        <p v-for="item in unitList" style="margin-bottom: 10px">
          <a-radio :value="item">{{ item }}</a-radio>
        </p>
      </a-radio-group>
      <template #footer>
        <a-button @click="cancelUnit">都不正确</a-button>
        <a-button type="primary" @click="selUnitHandleOk">确定</a-button>
      </template>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, createVNode, h, inject } from "vue"
import { getOrgByPart, getKeeperInfo, chackOrgExistAPI } from "@/api/home.api"
import { volidOrgnaization } from "@/api/home.api"
import { debounce } from "@/assets/js/utils"
import { message, Modal } from "ant-design-vue"
import { signinParTYpe } from "./types"

const form = ref<signinParTYpe>(inject("formObj") as signinParTYpe)
const stepActive = ref<number>(inject("stepActive") || 0)
const formKey = ref<number>(inject("formKey") || 0)
const openConfirm = inject("openConfirm") as Function
const loading = ref<boolean>(false)
let oldOrg = ref<string | null>("")

let selUnitNameVal = ref("")
let unitvisible = ref(false)
let unitList = ref([])

enum busTypeEnum {
  "公路工程" = "1",
  "水运工程" = "2",
  "公路&水运工程" = "3"
}
const selUnitHandleOk = () => {
  form.value.employedBy = selUnitNameVal.value
  unitvisible.value = false
  stepActive.value++
  loading.value = false
}
const cancelUnit=()=>{
  unitvisible.value = false;
  loading.value=false
}

const localForm = reactive<{
  orgName: string | null
  orgCity: string
  businessLicenseRegistrationNumber:string
}>({
  orgName: null,
  orgCity: "",
  businessLicenseRegistrationNumber:''
})
let busType = ref(1)
interface optType {
  label: string
  value: string
  city: string
  id: string
  name: string
  option?: optType
  businessLicenseRegistrationNumber:string
}
const optionsData = ref<optType[]>([])
const searchReport = (val: string) => {
  fetch(val, (d: any[]) => (optionsData.value = d))
}
const changeReport = (opt: any) => {
  localForm.businessLicenseRegistrationNumber=opt.option.businessLicenseRegistrationNumber
  localForm.orgName = opt.label || ""
  localForm.orgCity = opt.option ? opt.option.city : ""
  form.value.orgId = opt.option?.id || ""
  form.value.orgName = opt.option?.name || ""
  form.value.isExternal = opt.option ? opt.option.city.indexOf("重庆") === -1 : false
}

// 机构列表查询
const fetching = ref(false)
const queryHint = ref("暂无数据")
const fetch = (val: string, callback: any) => {
  if (!val) return
  debounce(() => {
    fetching.value = true
    getOrgByPart(val).then((res) => {
      let list: optType[] = []
      if (!res) {
        message.error(res.message || "请求异常")
      }
      if (res && res.length) {
        for (let i = 0; i < res.length; i++) {
          const item = res[i]
          list.push({
            label: item.name,
            value: item.name,
            city: item.province,
            id: item.id,
            name: item.name,
            businessLicenseRegistrationNumber:item.businessLicenseRegistrationNumber
          })
        }
      }
      if (list.length === 0) {
        queryHint.value = `检测到机构【${val}】未在部平台注册，不能在本平台注册账号`
      } else {
        queryHint.value = "暂无数据"
      }
      callback && callback(list)
      fetching.value = false
    })
  }, 500)
}

const chackOrgExist = async () => {
  chackOrgExistAPI({
    type: busType.value,
    name: localForm.orgName,
    creditCode:localForm.businessLicenseRegistrationNumber,
  })
    .then((res) => {
      if (res.vague) {
        unitList.value = res.agencies
        selUnitNameVal.value = res.agencies[0]
        unitvisible.value = true
      } else {
        stepActive.value++
        loading.value = false
      }
    })
    .catch((err) => {
      loading.value = false
      let stArr = err.message.split("<br>").map((it) => {
        return h("p", it || "服务异常，请稍后重试！")
      })
      Modal.info({
        title: "提示!",
        content: h("div", {}, [h("p", stArr)])
      })
    })
}

// 机构注册验证
const nextStep = () => {
  loading.value = true
  volidOrgnaization({
    name: localForm.orgName || ""
  }).then(async (res) => {
    if (res.errNo == 1000) {
      if (oldOrg.value != localForm.orgName) {
        oldOrg.value = localForm.orgName
        resetFormTwo()
      }
      chackOrgExist()
      return
    } else if (res.errNo == 1001) {
      const users = await getKeeperByOrgName(localForm.orgName || "")
      if (users) {
        const con = createVNode("p", {}, [
          h("p", `机构名称：${localForm.orgName}`),
          h("p", `联系人：${users.custodian}`)
        ])
        openConfirm("账号已注册，请联系单位人员索要登录账号", con)
      } else {
        chackOrgExist()
      }
    } else if (res.errNo == 1002) {
      openConfirm("提示!","该机构的账号注册申请正在审核中，请勿重复提交")
    }
    loading.value = false
  })
}

// 根据机构名称查询保管人信息
const getKeeperByOrgName = async (orgName: string) => {
  try {
    const res = await getKeeperInfo(orgName)
    return res
  } catch (err) {
    console.log(err)
    return {}
  }
}

const resetFormTwo = () => {
  formKey.value = new Date().getTime()
  form.value.projectName = ""
  form.value.laboratoryType = null
  form.value.laboratoryName = ""
  form.value.applicant = ""
  form.value.applicantPhone = ""
  form.value.captcha = ""
  form.value.attachments = []
}
</script>

<style lang="less" scoped>
.step-one {
  padding-top: 80px;
  margin: 0 auto;
  width: 55%;
  :deep(.ant-input[disabled]) {
    background-color: #f5f5f5;
    color: #666;
  }
}

.handle-box {
  margin-top: 50px;
  text-align: center;
}

.hint-change {
  padding-top: 10px;
  color: #999;
  font-size: 12px;
}
</style>
