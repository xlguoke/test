<!--检测业绩变更信息详情 -->
<template>
  <a-spin :spinning="spinning">
    <a-row justify="center " gutter="10">
      <a-col span="12">
        <a-descriptions bordered size="small" :column="layout">
          <a-descriptions-item
            :label-style="{ display: 'none' }"
            :content-style="{ fontWeight: '900' }"
            :span="3"
          >
            变更前：
          </a-descriptions-item>
          <a-descriptions-item label="项目名称">
            {{ infoData.before.projectName }}
          </a-descriptions-item>
          <a-descriptions-item label="项目建设管理单位">
            {{ infoData.before.projectConstructionManagementUnit }}
          </a-descriptions-item>
          <a-descriptions-item label="项目所在">
            {{ infoData.before.locatedProvince + "-" + infoData.before.locatedCity }}
          </a-descriptions-item>
          <a-descriptions-item label="标段号">
            {{ infoData.before.lotNo }}
          </a-descriptions-item>
          <a-descriptions-item label="委托类型">
            {{ infoData.before.testCategory }}
          </a-descriptions-item>
          <a-descriptions-item label="委托人名称">
            {{ infoData.before.consignUnit }}
          </a-descriptions-item>
          <a-descriptions-item label="合同名称">
            {{ infoData.before.contractName }}
          </a-descriptions-item>
          <a-descriptions-item label="合同价(万元)">
            {{ infoData.before.contractAmount }}
          </a-descriptions-item>
          <a-descriptions-item label="结算价(万元)">
            {{ infoData.before.settlementAmount }}
          </a-descriptions-item>
          <a-descriptions-item label="合同履行开始时间">
            {{ dayjs(infoData.before.startTimeOfContract).format("YYYY-MM-DD") }}
          </a-descriptions-item>
          <a-descriptions-item label="技术等级">
            {{ infoData.before.technicalGrade }}
          </a-descriptions-item>
          <a-descriptions-item label="合同履行结束时间">
            {{ dayjs(infoData.before.endTimeOfContract).format("YYYY-MM-DD") }}
          </a-descriptions-item>
          <a-descriptions-item label="联合体业绩">
            {{ infoData.before.jointAchievement }}
          </a-descriptions-item>
          <a-descriptions-item label="主要合同内容">
            {{ infoData.before.contractMainContent }}
          </a-descriptions-item>
          <a-descriptions-item label="检测报告台账" :span="3">
            <FileList :datas="infoData.before.attachments" list-type="text" />
          </a-descriptions-item>

          <a-descriptions-item label="检测主要人员" :span="3" :content-style="{ padding: '0px' }">
            <div style="height: 200px; overflow: auto">
              <a-table
                :data-source="infoData.before.persons"
                :columns="personColumns"
                :pagination="false"
                size="small"
              ></a-table>
            </div>
          </a-descriptions-item>
          <a-descriptions-item label="检测内容" :span="3" :content-style="{ padding: '0px' }">
            <div style="height: 200px; overflow: auto">
              <a-table
                :data-source="infoData.before.contents"
                :columns="testColumns"
                :pagination="false"
                size="small"
              ></a-table>
            </div>
          </a-descriptions-item>
        </a-descriptions>
      </a-col>
      <a-col span="12">
        <a-descriptions bordered size="small" :column="layout">
          <a-descriptions-item
            :label-style="{ display: 'none' }"
            :content-style="{ fontWeight: '900' }"
            :span="3"
          >
            变更后：
          </a-descriptions-item>
          <a-descriptions-item label="项目名称">
            {{ infoData.after.projectName }}
          </a-descriptions-item>
          <a-descriptions-item label="项目建设管理单位">
            {{ infoData.after.projectConstructionManagementUnit }}
          </a-descriptions-item>
          <a-descriptions-item label="项目所在">
            {{ infoData.after.locatedProvince + "-" + infoData.after.locatedCity }}
          </a-descriptions-item>
          <a-descriptions-item label="标段号">
            {{ infoData.after.lotNo }}
          </a-descriptions-item>
          <a-descriptions-item label="委托类型">
            {{ infoData.after.testCategory }}
          </a-descriptions-item>
          <a-descriptions-item label="委托人名称">
            {{ infoData.after.consignUnit }}
          </a-descriptions-item>
          <a-descriptions-item label="合同名称">
            {{ infoData.after.contractName }}
          </a-descriptions-item>
          <a-descriptions-item label="合同价(万元)">
            {{ infoData.after.contractAmount }}
          </a-descriptions-item>
          <a-descriptions-item label="结算价(万元)">
            {{ infoData.after.settlementAmount }}
          </a-descriptions-item>
          <a-descriptions-item label="合同履行开始时间">
            {{ dayjs(infoData.after.startTimeOfContract).format("YYYY-MM-DD") }}
          </a-descriptions-item>
          <a-descriptions-item label="技术等级">
            {{ infoData.after.technicalGrade }}
          </a-descriptions-item>
          <a-descriptions-item label="合同履行结束时间">
            {{ dayjs(infoData.after.endTimeOfContract).format("YYYY-MM-DD") }}
          </a-descriptions-item>
          <a-descriptions-item label="联合体业绩">
            {{ infoData.after.jointAchievement }}
          </a-descriptions-item>
          <a-descriptions-item label="主要合同内容">
            {{ infoData.after.contractMainContent }}
          </a-descriptions-item>
          <a-descriptions-item label="检测报告台账" :span="3">
            <FileList :datas="infoData.after.attachments" list-type="text" />
          </a-descriptions-item>
          <a-descriptions-item label="检测主要人员" :span="3" :content-style="{ padding: '0px' }">
            <div style="height: 200px; overflow: auto">
              <a-table
                :data-source="infoData.after.persons"
                :columns="personColumns"
                :pagination="false"
                size="small"
              ></a-table>
            </div>
          </a-descriptions-item>
          <a-descriptions-item label="检测内容" :span="3" :content-style="{ padding: '0px' }">
            <div style="height: 200px; overflow: auto">
              <a-table
                :data-source="infoData.after.contents"
                :columns="testColumns"
                :pagination="false"
                size="small"
              ></a-table>
            </div>
          </a-descriptions-item>
        </a-descriptions>
      </a-col>
    </a-row>
    <a-row style="margin-top: 10px">
      <a-col span="24">
        <a-descriptions bordered size="small" :column="layout">
          <a-descriptions-item
            :label-style="{ display: 'none' }"
            :content-style="{ fontWeight: '900' }"
            :span="3"
          >
            审核机构:
          </a-descriptions-item>
          <a-descriptions-item label="审核机构" :span="3">
            {{ infoData.auditUnit }}
          </a-descriptions-item>
          <a-descriptions-item
            :label-style="{ display: 'none' }"
            :content-style="{ fontWeight: '900' }"
            :span="3"
          >
            申请人信息：
          </a-descriptions-item>
          <a-descriptions-item label="姓名">{{ infoData.apply }}</a-descriptions-item>
          <a-descriptions-item label="手机号码">{{ infoData.applyPhone }}</a-descriptions-item>
          <a-descriptions-item label="角色名称">{{ infoData.applyRole }}</a-descriptions-item>
        </a-descriptions>
      </a-col>
    </a-row>
  </a-spin>
</template>
<script setup lang="ts">
import { ref, onMounted, toRefs } from "vue"
import { getAchievementInfoAPI } from "@/api/infoCheck.api"
import dayjs from "dayjs"
import FileList from "@/components/fileList/index.vue"
const props = defineProps({
  id: {
    type: String,
    default: ""
  }
})
const { id } = toRefs(props) //父组件参数

let infoData: any = ref({
  before: {},
  after: {}
})

let spinning = ref(false)

onMounted(() => {
  getInfoData()
})
const getInfoData = async () => {
  const res = await getAchievementInfoAPI(id.value)
  infoData.value = res
}

let layout = ref({ xs: 1, sm: 2, md: 2 })
let personColumns = ref([
  {
    title: "姓名",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "身份证号码",
    dataIndex: "idCard",
    key: "idCard"
  },
  {
    title: "职务",
    dataIndex: "position",
    key: "position"
  },
  {
    title: "业绩描述",
    dataIndex: "achievementDescription",
    key: "achievementDescription"
  },
  {
    title: "任职时间",
    dataIndex: "entranceTime",
    key: "entranceTime",
    customRender: ({ record }: any) => {
      const t1 = record.entranceTime
      const t2 = record.leaveTime
      if (!t1 || !t2) return ""
      return dayjs(t1).format("YYYY-MM-DD") + " ~ " + dayjs(t2).format("YYYY-MM-DD")
    }
  }
])
let testColumns = ref([
  {
    title: "专业类别",
    dataIndex: "majors",
    key: "majors"
  },
  {
    title: "类别",
    dataIndex: "classification",
    key: "classification"
  },
  {
    title: "试验项目",
    dataIndex: "content",
    key: "content"
  }
])
</script>
