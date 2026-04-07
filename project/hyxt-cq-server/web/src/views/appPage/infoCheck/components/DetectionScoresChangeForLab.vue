<!-- 试验室业绩变更信息详情 -->
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
          <a-descriptions-item label="检测级别">
            {{ projectLeveDict[infoData.after.projectLevel] }}
          </a-descriptions-item>
          <a-descriptions-item label="试验室负责人">
            {{ infoData.before.laboratoryHead }}
          </a-descriptions-item>
          <a-descriptions-item label="试验室类型">
            {{ infoData.before.laboratoryCategory }}
          </a-descriptions-item>
          <a-descriptions-item label="是否重点项目">
            {{ infoData.before.important ? "是" : "否" }}
          </a-descriptions-item>
          <a-descriptions-item label="起止时间">
            {{
              dayjs(infoData.before.startTime).format("YYYY-MM-DD") +
              " 至 " +
              dayjs(infoData.before.endTime).format("YYYY-MM-DD")
            }}
          </a-descriptions-item>
          <a-descriptions-item label="试验室名称">
            {{ infoData.before.laboratoryName }}
          </a-descriptions-item>
          <a-descriptions-item label="项目所在" :span="2">
            {{ infoData.before.locatedProvince + "-" + infoData.before.locatedCity }}
          </a-descriptions-item>
          <a-descriptions-item label="检测报告台账" :span="3">
            <FileList :datas="infoData.before.attachments" list-type="text" />
            <!-- <ul style="height: 100px; overflow: auto;">
                            <li v-for="item in infoData.before.attachments" :key="item.id">
                                <i style="color:#72b174" class="iconfont icon-a-wendang1"></i>
                                <span style="margin: 0 10px 0 5px;">{{ item.name }}</span>
                                <a style="font-size:12px" key="list-loadmore-edit" :href="item.url">下载</a>
                            </li>
                        </ul> -->
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
          <a-descriptions-item label="检测级别">
            {{ projectLeveDict[infoData.after.projectLevel] }}
          </a-descriptions-item>
          <a-descriptions-item label="试验室负责人">
            {{ infoData.after.laboratoryHead }}
          </a-descriptions-item>
          <a-descriptions-item label="试验室类型">
            {{ infoData.after.laboratoryCategory }}
          </a-descriptions-item>
          <a-descriptions-item label="是否重点项目">
            {{ infoData.after.important ? "是" : "否" }}
          </a-descriptions-item>
          <a-descriptions-item label="起止时间">
            {{
              dayjs(infoData.after.startTime).format("YYYY-MM-DD") +
              " 至 " +
              dayjs(infoData.after.endTime).format("YYYY-MM-DD")
            }}
          </a-descriptions-item>
          <a-descriptions-item label="试验室名称">
            {{ infoData.after.laboratoryName }}
          </a-descriptions-item>
          <a-descriptions-item label="项目所在" :span="2">
            {{ infoData.after.locatedProvince + "-" + infoData.after.locatedCity }}
          </a-descriptions-item>
          <a-descriptions-item label="检测报告台账" :span="3">
            <FileList :datas="infoData.after.attachments" list-type="text" />
            <!-- <ul style="height: 100px; overflow: auto;">
                            <li v-for="item in infoData.after.attachments" :key="item.id">
                                <i style="color:#72b174" class="iconfont icon-a-wendang1"></i>
                                <span style="margin: 0 10px 0 5px;">{{ item.name }}</span>
                                <a style="font-size:12px" key="list-loadmore-edit" :href="item.url">下载</a>
                            </li>
                        </ul> -->
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
import { getLaboratoryAchievementInfoAPI } from "@/api/infoCheck.api"
import { getDictDataAPI } from "@/api/common.api"
import FileList from "@/components/fileList/index.vue"
import dayjs from "dayjs"
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
  getProjectLeveDict()
})
const getInfoData = async () => {
  const res = await getLaboratoryAchievementInfoAPI(id.value)
  infoData.value = res
}

let projectLeveDict: any = ref({})
const getProjectLeveDict = async () => {
  let res: any = await getDictDataAPI("project_level")
  res.dict.forEach((item) => {
    projectLeveDict.value[item.code] = item.name
  })
  return Promise.resolve()
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
  }
])
</script>
