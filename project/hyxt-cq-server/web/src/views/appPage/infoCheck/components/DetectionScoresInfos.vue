<!-- 检测业绩信息详情 -->
<template>
  <div>
    <a-descriptions bordered size="small" :column="layout">
      <a-descriptions-item
        :label-style="{ display: 'none' }"
        :content-style="{ fontWeight: '900' }"
        :span="3"
      >
        业绩信息：
      </a-descriptions-item>
      <a-descriptions-item label="项目名称">{{ infoData.before.projectName }}</a-descriptions-item>
      <a-descriptions-item label="检测类别">{{ infoData.before.testCategory }}</a-descriptions-item>
      <a-descriptions-item label="起止时间">
        {{
          dayjs(infoData.before.startTime).format("YYYY-MM-DD") +
          " 至 " +
          dayjs(infoData.before.endTime).format("YYYY-MM-DD")
        }}
      </a-descriptions-item>
      <a-descriptions-item label="委托单位">{{ infoData.before.consignUnit }}</a-descriptions-item>
      <a-descriptions-item label="项目所在" :span="2">
        {{ infoData.before.locatedProvince }}
      </a-descriptions-item>
      <a-descriptions-item label="检测报告台账" :span="3">
        <FileList :datas="infoData.before.attachments" list-type="text" />
        <!-- <ul>
                    <li v-for="item in infoData.before.attachments" :key="item.id">
                        <i style="color:#72b174" class="iconfont icon-a-wendang1"></i>
                        <span style="margin: 0 10px 0 5px;">{{ item.name }}</span>
                        <a style="font-size:12px" key="list-loadmore-edit" :href="item.url">下载</a>
                    </li>
                </ul> -->
      </a-descriptions-item>

      <a-descriptions-item label="检测主要人员" :span="3" :content-style="{ padding: '0px' }">
        <a-table
          :data-source="personSource"
          :columns="personColumns"
          :pagination="false"
          size="small"
        ></a-table>
      </a-descriptions-item>

      <a-descriptions-item label="检测内容" :span="3" :content-style="{ padding: '0px' }">
        <a-table
          :data-source="testSource"
          :columns="testColumns"
          :pagination="false"
          size="small"
        ></a-table>
      </a-descriptions-item>

      <a-descriptions-item label="审核机构" :span="3">{{ infoData.auditUnit }}</a-descriptions-item>

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
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, toRefs } from "vue"
import { getAchievementInfoAPI } from "@/api/infoCheck.api"
import FileList from "@/components/fileList/index.vue"
import dayjs, { Dayjs } from "dayjs"

const props = defineProps({
  id: {
    type: String,
    default: ""
  }
})
const { id } = toRefs(props) //父组件参数

let infoData: any = ref({
  before: {}
})

onMounted(() => {
  getInfoData()
})
const getInfoData = async () => {
  let res: any = await getAchievementInfoAPI(id.value)
  infoData.value = res
  personSource.value = res.before.persons
  testSource.value = res.before.contents
}

let layout = ref({ xs: 1, sm: 2, md: 3 })
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

let personSource = ref([])
let testSource = ref([])
</script>
