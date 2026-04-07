<!-- 新增试验室详情 -->
<template>
  <a-spin tip="加载中..." :spinning="spinning">
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="1" tab="基本信息">
        <a-descriptions size="small" :column="layout">
          <a-descriptions-item label="试验室名称">{{ labInfo.name }}</a-descriptions-item>
          <a-descriptions-item label="工程项目">{{ labInfo.projectName }}</a-descriptions-item>
          <a-descriptions-item label="试验室类型">{{ labInfo.type }}</a-descriptions-item>
          <a-descriptions-item label="合同段编号">{{ labInfo.contractPart }}</a-descriptions-item>
          <a-descriptions-item label="监管单位">{{ labInfo.management }}</a-descriptions-item>
          <a-descriptions-item label="设立日期">
            {{ labInfo.establishDate ? dayjs(labInfo.establishDate).format("YYYY-MM-DD") : "" }}
          </a-descriptions-item>
          <a-descriptions-item label="(拟)撤销日期">
            {{ labInfo.backoutDate ? dayjs(labInfo.backoutDate).format("YYYY-MM-DD") : "" }}
          </a-descriptions-item>
          <a-descriptions-item label="试验工程师">{{ labInfo.testerCount }}</a-descriptions-item>
          <a-descriptions-item label="助理检测工程师">
            {{ labInfo.assistantCount }}
          </a-descriptions-item>
          <a-descriptions-item label="授权负责人">{{ labInfo.principal }}</a-descriptions-item>
          <a-descriptions-item label="授权技术负责人">
            {{ labInfo.principalTechnical }}
          </a-descriptions-item>
          <a-descriptions-item label="授权质量负责人">
            {{ labInfo.principalQuality }}
          </a-descriptions-item>
          <a-descriptions-item label="联系地址">{{ labInfo.addressDetail }}</a-descriptions-item>
          <a-descriptions-item label="联系电话">{{ labInfo.tel }}</a-descriptions-item>
        </a-descriptions>
      </a-tab-pane>
      <a-tab-pane key="2" tab="注册人员">
        <a-table
          :data-source="personSource"
          :columns="personColumns"
          bordered
          size="small"
          :pagination="false"
          row-key="id"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'handle'">
              <a-button size="small" type="primary">详情</a-button>
            </template>
            <template v-if="column.key === 'entranceTime'">
              <span>{{ formatDate(record.entranceTime) }}</span>
            </template>
          </template>
        </a-table>
      </a-tab-pane>
      <a-tab-pane key="3" tab="检测设备">
        <a-table
          :data-source="equipmentSource"
          :columns="equipmentColumns"
          bordered
          size="small"
          row-key="id"
          :pagination="pagination"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'handle'">
              <a-space>
                <a-button size="small" type="primary" @click="openEquipmentCertificate(record.id)">
                  检校报告
                </a-button>
              </a-space>
            </template>
            <template v-if="column.key === 'lastCalibrationDate'">
              <span>{{ formatDate(record.lastCalibrationDate) }}</span>
            </template>
            <template v-if="column.key === 'calibrationExpireDate'">
              <span>{{ formatDate(record.calibrationExpireDate) }}</span>
            </template>
          </template>
        </a-table>

        <!-- 检校证书详情 -->
        <a-modal v-model:visible="certificateDetilesVisble" width="650px" title="检校证书">
          <a-list item-layout="horizontal" size="small" bordered :data-source="certificateDetiles">
            <template #renderItem="{ item }">
              <a-list-item>
                {{ item.name }}
                <template #actions>
                  <a key="list-loadmore-edit" @click="downloadByNameOrUrl(item.url, true)">下载</a>
                </template>
              </a-list-item>
            </template>
          </a-list>

          <template #footer>
            <a-button type="primary" @click="certificateDetilesVisble = false">确定</a-button>
          </template>
        </a-modal>
      </a-tab-pane>
    </a-tabs>
  </a-spin>
</template>
<script setup lang="ts">
import { ref, toRefs, onMounted } from "vue"
import {
  getLaboratoryInfoAPI,
  getLaboratoryPersonAPI,
  getLabEquipmentAPI,
  getLabEquipmentCertificateAPI
} from "@/api/laboratory.api"
import { formatDate } from "@/assets/js/common"
import { Modal, message } from "ant-design-vue"
import { downloadByNameOrUrl } from "@/config/minio.config"
import dayjs, { Dayjs } from "dayjs"

let layout = ref({ xs: 1, sm: 2, md: 2 })

let props = defineProps({
  id: String
})
const { id } = toRefs(props) //父组件参数

onMounted(() => {
  getLaboratoryInfo()
  getLaboratoryPerson()
  getLabEquipmentList()
})

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
const getLaboratoryInfo = async () => {
  if (id?.value) {
    let res = await getLaboratoryInfoAPI(id.value)
    labInfo.value = res
  }
}
let queryFrom = ref({
  current: 1,
  size: 10,
  labId: id?.value,
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
const openEquipmentCertificate = async (id) => {
  let res = await getLabEquipmentCertificateAPI(id)
  if (!res.length) {
    message.warning("此设备检校证书未上传")
    return
  }
  certificateDetiles.value = res
  certificateDetilesVisble.value = true
}

const getLabEquipmentList = async () => {
  spinning.value = true
  let res = await getLabEquipmentAPI(queryFrom.value)
  equipmentSource.value = res.records
  pagination.value.total = res.total
  spinning.value = false
}
const getLaboratoryPerson = () => {
  spinning.value = true
  getLaboratoryPersonAPI(id?.value as string).then((res) => {
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
</style>
