<!-- 账户注册信息详情 -->
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

      <a-descriptions-item label="机构名称">{{ accountInfo.orgName }}</a-descriptions-item>
      <a-descriptions-item label="机构性质">{{ accountInfo.orgNature }}</a-descriptions-item>
      <a-descriptions-item label="等级类型">{{ accountInfo.certLevel }}</a-descriptions-item>
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
        基本信息：
      </a-descriptions-item>

      <a-descriptions-item label="项目名称" :span="3">
        {{ accountInfo.projectName }}
      </a-descriptions-item>
      <a-descriptions-item label="试验室类型">{{ accountInfo.laboratoryType }}</a-descriptions-item>
      <a-descriptions-item label="试验室名称">{{ accountInfo.laboratoryName }}</a-descriptions-item>
      <a-descriptions-item label="申请人">{{ accountInfo.applicant }}</a-descriptions-item>
      <a-descriptions-item label="手机号码" :span="3">
        {{ accountInfo.applicantPhone }}
      </a-descriptions-item>
      <a-descriptions-item
        :label-style="{ display: 'none' }"
        :content-style="{ fontWeight: '900' }"
        :span="3"
      >
        授权承诺书：
      </a-descriptions-item>
      <a-descriptions-item :label-style="{ display: 'none' }" :span="3">
        <FileList :datas="accountInfo.attachments" list-type="text" />
        <!-- <ul>
                    <li v-for="item in accountInfo.attachments" :key="item.id">
                        <i style="color:#72b174" class="iconfont icon-a-wendang1"></i>
                        <span style="margin: 0 10px 0 5px;">{{ item.name }}</span>
                        <a style="font-size:12px" key="list-loadmore-edit" :href="item.url">下载</a>
                    </li>
                </ul> -->
      </a-descriptions-item>
    </a-descriptions>
  </div>
</template>
<script setup lang="ts">
import { ref, toRefs, onMounted } from "vue"
import { getAccountRegInfoAPI } from "@/api/infoCheck.api"
import FileList from "@/components/fileList/index.vue"

interface DataItem {
  title: string
}
let layout = ref({ xs: 1, sm: 2, md: 2 })

const props = defineProps({
  id: {
    type: String,
    default: ""
  }
})
const { id } = toRefs(props) //父组件参数

let accountInfo: any = ref({
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
  const res = await getAccountRegInfoAPI(id.value)
  accountInfo.value = res
}
</script>
