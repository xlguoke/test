<!-- 账户注销信息详情 -->
<template>
  <div>
    <a-descriptions bordered size="small" :column="layout">
      <a-descriptions-item
        :label-style="{ display: 'none' }"
        :content-style="{ fontWeight: '900' }"
        :span="3"
      >
        机构信息：
      </a-descriptions-item>

      <a-descriptions-item label="机构名称">{{ accountInfo.name }}</a-descriptions-item>
      <a-descriptions-item label="机构性质">{{ accountInfo.orgNature }}</a-descriptions-item>
      <a-descriptions-item label="等级类型">
        {{ accountInfo.qualificationLevel }}
      </a-descriptions-item>
      <a-descriptions-item label="所在省">{{ accountInfo.province }}</a-descriptions-item>
      <a-descriptions-item label="所在市">{{ accountInfo.city }}</a-descriptions-item>
      <a-descriptions-item label="法定代表人">{{ accountInfo.legalPerson }}</a-descriptions-item>
      <a-descriptions-item label="行政负责人">{{ accountInfo.administrator }}</a-descriptions-item>
      <a-descriptions-item label="联系手机">{{ accountInfo.phone }}</a-descriptions-item>
      <a-descriptions-item label="联系电话">{{ accountInfo.tel }}</a-descriptions-item>
      <a-descriptions-item label="传真">{{ accountInfo.fax }}</a-descriptions-item>
      <a-descriptions-item label="邮箱">{{ accountInfo.email }}</a-descriptions-item>
      <a-descriptions-item label="邮编">{{ accountInfo.postalCode }}</a-descriptions-item>
      <a-descriptions-item label="网址">{{ accountInfo.website }}</a-descriptions-item>
      <a-descriptions-item label="通讯地址" :span="2">
        {{ accountInfo.address }}
      </a-descriptions-item>

      <a-descriptions-item
        :label-style="{ display: 'none' }"
        :content-style="{ fontWeight: '900' }"
        :span="3"
      >
        申请人信息：
      </a-descriptions-item>
      <a-descriptions-item label="申请人">{{ accountInfo.apply }}</a-descriptions-item>
      <a-descriptions-item label="角色">{{ accountInfo.applyRole }}</a-descriptions-item>
      <a-descriptions-item label="手机号码" :span="3">
        {{ accountInfo.applyPhone }}
      </a-descriptions-item>
    </a-descriptions>
  </div>
</template>
<script setup lang="ts">
import { ref, toRefs, onMounted } from "vue"
import { getAccountLogoutInfoAPI } from "@/api/infoCheck.api"
let layout = ref({ xs: 1, sm: 2, md: 2 })

const props = defineProps({
  id: {
    type: String,
    default: ""
  }
})
const { id } = toRefs(props) //父组件参数

let accountInfo = ref<any>({
  name: "",
  orgNature: "",
  qualificationLevel: "",
  province: "",
  city: "",
  legalPerson: "",
  administrator: "",
  phone: "",
  tel: "",
  fax: "",
  email: "",
  postalCode: "",
  website: "",
  address: "",
  apply: "",
  applyRole: "",
  applyPhone: ""
})

onMounted(() => {
  getInfoData()
})

const getInfoData = async () => {
  accountInfo.value = await getAccountLogoutInfoAPI(id.value)
}
</script>
