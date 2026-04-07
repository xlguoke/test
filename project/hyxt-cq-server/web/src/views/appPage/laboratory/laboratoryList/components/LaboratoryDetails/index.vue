<template>
  <a-spin tip="加载中..." :spinning="spinning">
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="1" tab="基本信息">
        <div class="tabsContent">
          <BaseLaboratoryForm :edit-id="labId" :details="true" />
        </div>
      </a-tab-pane>
      <a-tab-pane key="2" tab="授权业务范围">
        <div class="tabsContent">
          <AuthBusinessScope :edit-id="labId" :details="true" />
        </div>
      </a-tab-pane>
      <a-tab-pane key="3" tab="注册人员">
        <div class="tabsContent">
          <PersonConfig :edit-id="labId" :details="true" />
        </div>
      </a-tab-pane>
      <a-tab-pane key="4" tab="检测设备">
        <div class="tabsContent">
          <EquipmentConfig :edit-id="labId" :details="true" />
        </div>
      </a-tab-pane>
      <a-tab-pane key="5" tab="检测业务范围">
        <div class="tabsContent">
          <LineOfBusiness :edit-id="labId" :details="true" />
        </div>
      </a-tab-pane>
      <a-tab-pane key="6" tab="备案资料">
        <div class="tabsContent">
          <InformationBackup :edit-id="labId" :details="true" />
        </div>
      </a-tab-pane>
      <!-- <a-tab-pane key="7" tab="建设单位审批资料">
        <ApprovalFiles :editId="labId" :details="true" />
      </a-tab-pane> -->
      <a-tab-pane key="7" tab="撤销/备案/变更结果">
        <div class="tabsContent">
          <RecordResult :edit-id="labId" :details="true" />
        </div>
      </a-tab-pane>

      <a-tab-pane key="8" tab="变更记录">
        <div class="tabsContent">
          <AlterLogs :lab-id="labId" :details="true" />
        </div>
      </a-tab-pane>
    </a-tabs>
  </a-spin>
</template>
<script setup lang="ts">
import { ref, toRefs, onMounted, provide } from "vue"
import {
  getLaboratoryInfoAPI,
  getLaboratoryPersonAPI,
  getLabEquipmentAPI,
  getLabEquipmentCertificateAPI
} from "@/api/laboratory.api"

import { message } from "ant-design-vue"

import BaseLaboratoryForm from "../EditLaboratory/BaseLaboratoryForm.vue"
import PersonConfig from "../EditLaboratory/PersonConfig.vue"
import EquipmentConfig from "../EditLaboratory/EquipmentConfig.vue"
import LineOfBusiness from "../EditLaboratory/LineOfBusiness.vue"
import InformationBackup from "../EditLaboratory/InformationBackup.vue"
import ApprovalFiles from "../EditLaboratory/ApprovalFiles.vue"
import AuthBusinessScope from "../EditLaboratory/AuthBusinessScope.vue"
import RecordResult from "./components/RecordResult.vue"
import AlterLogs from "./components/AlterLogs.vue"

let props = defineProps({
  labId: {
    type: String,
    required: true
  },
  isApply: {
    //是否查询变更，默认false
    type: Boolean,
    required: false,
    default: false
  }
})
const { labId, isApply } = toRefs(props) //父组件参数

provide("isApply", isApply)

let activeKey = ref("1")

let labInfo = ref({
  //工地试验室基本数据
  name: "",
  projectName: "",
  type: "",
  contractPart: "",
  management: "",
  establishDate: "",
  backoutDate: "",
  testerCount: "",
  assistantCount: "",
  principal: "",
  principalTechnical: "",
  principalQuality: "",
  addressDetail: "",
  tel: "",
  projectId: ""
})
let spinning = ref(false)

let equipmentSource = ref([])
let equipmentColumns = [
  {
    title: "设备编号",
    dataIndex: "sn",
    key: "sn"
  },
  {
    title: "设备名称",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "规格型号",
    dataIndex: "specification",
    key: "specification"
  },
  {
    title: "校验日期",
    dataIndex: "lastCalibrationDate",
    key: "lastCalibrationDate"
  },
  {
    title: "到期日期",
    dataIndex: "calibrationExpireDate",
    key: "calibrationExpireDate"
  },
  {
    title: "操作",
    key: "handle"
  }
]
// 查看详情 - 跳转部平台
const goDetail = (row) => {
  window.open(
    `${import.meta.env.VITE_PART_API}/PCWeb/OrgQuery/PersonDetails?cardNo=${row.idNum}&personName=${
      row.name
    }`,
    "_blank"
  )
}
const getLaboratoryInfo = async () => {
  if (labId?.value) {
    let res = await getLaboratoryInfoAPI(labId.value)
    labInfo.value = res
  }
}
let queryFrom = ref({
  current: 1,
  size: 10,
  labId: labId?.value,
  keyword: ""
})
let pagination = ref({
  size: "small",
  showTotal: (total) => `共 ${total} 条数据`,
  showQuickJumper: true,
  showSizeChanger: true,
  total: 0,
  pageSizeOptions: ["10", "20", "50", "100"],
  onChange: (page, pageSize) => {
    queryFrom.value.current = page
    queryFrom.value.size = pageSize
    getLabEquipmentList()
  }
})

let certificateDetiles = ref([])
let certificateDetilesVisble = ref(false)
// const openEquipmentCertificate = async (id) => {
//   let res = await getLabEquipmentCertificateAPI(id)
//   if (!res.length) {
//     message.warning("此设备检校证书未上传")
//     return
//   }
//   certificateDetiles.value = res
//   certificateDetilesVisble.value = true
// }

const getLabEquipmentList = async () => {
  spinning.value = true
  let res = await getLabEquipmentAPI(queryFrom.value)
  equipmentSource.value = res.records
  pagination.value.total = res.total
  spinning.value = false
}
const getLaboratoryPerson = () => {
  spinning.value = true
  getLaboratoryPersonAPI(labId?.value).then((res) => {
    personSource.value = res.records
    // selPersonList.value=res.records
  })
  spinning.value = false
}
let personSource: any = ref([])
let personColumns = ref([
  {
    title: "姓名",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "证件号",
    dataIndex: "builder",
    key: "builder"
  },
  {
    title: "证书编号",
    dataIndex: "createdAt",
    key: "createdAt"
  },
  {
    title: "备案时间",
    dataIndex: "entranceTime",
    key: "entranceTime"
  },
  {
    title: "操作",
    key: "handle"
  }
])
</script>
<style lang="less">
.ant-tabs-tabpane {
  padding: 10px;
}
.tabsContent {
  height: 450px;
  overflow: auto;
  padding: 5px;
}
</style>
