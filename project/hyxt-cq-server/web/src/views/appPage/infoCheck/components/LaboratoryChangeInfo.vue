<!-- 试验室信息变更详情 -->
<template>
  <div>
    <a-descriptions bordered size="small" :column="layout">
      <a-descriptions-item
        :label-style="{ display: 'none' }"
        :content-style="{ fontWeight: '900' }"
        :span="3"
      >
        基本信息：
      </a-descriptions-item>

      <a-descriptions-item label="试验室名称">{{ labInfo.name }}</a-descriptions-item>
      <a-descriptions-item label="工程项目">{{ labInfo.projectName }}</a-descriptions-item>
      <a-descriptions-item label="试验室类型">{{ labInfo.type }}</a-descriptions-item>
      <a-descriptions-item label="合同段编号">{{ labInfo.contractPart }}</a-descriptions-item>
      <a-descriptions-item label="设立日期">
        {{ labInfo.establishDate ? dayjs(labInfo.establishDate).format("YYYY-MM-DD") : "" }}
      </a-descriptions-item>
      <a-descriptions-item label="(拟)撤销日期">
        {{ labInfo.backoutDate ? dayjs(labInfo.backoutDate).format("YYYY-MM-DD") : "" }}
      </a-descriptions-item>
      <a-descriptions-item label="监管单位">{{ labInfo.management }}</a-descriptions-item>
      <a-descriptions-item label="试验工程师">{{ labInfo.testerCount }}</a-descriptions-item>
      <a-descriptions-item label="助理检测工程师">{{ labInfo.assistantCount }}</a-descriptions-item>
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

    <template v-if="changeData.type === 'person'">
      <a-tabs v-model:activeKey="activeKey">
        <a-tab-pane key="1" tab="新增人员">
          <a-table
            :data-source="changesAddSource"
            :columns="changesAddColumns"
            bordered
            size="small"
            :pagination="false"
            row-key="id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'handle'">
                <a-space>
                  <a-button
                    v-if="record.attachments && record.attachments.length"
                    size="small"
                    type="primary"
                    @click="openDownloadFiles(record)"
                  >
                    查看附件
                  </a-button>
                </a-space>
              </template>
              <template v-if="column.key === 'presetDate'">
                <span>{{ formatDate(record.presetDate) }}</span>
              </template>
            </template>
          </a-table>
        </a-tab-pane>

        <a-tab-pane key="2" tab="注销人员" force-render>
          <a-table
            :data-source="changesRemoveSource"
            :columns="changesRemoveColumns"
            bordered
            size="small"
            :pagination="false"
            row-key="id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.key === 'handle'">
                <a-space>
                  <a-button
                    v-if="record.attachments && record.attachments.length"
                    size="small"
                    type="primary"
                    @click="openDownloadFiles(record)"
                  >
                    查看附件
                  </a-button>
                </a-space>
              </template>
              <template v-if="column.key === 'presetDate'">
                <span>{{ formatDate(record.presetDate) }}</span>
              </template>
            </template>
          </a-table>
        </a-tab-pane>
      </a-tabs>
    </template>

    <template v-if="changeData.type === 'info'">
      <a-descriptions bordered size="small" :column="layout" style="margin-top: 10px">
        <a-descriptions-item
          :label-style="{ display: 'none' }"
          :content-style="{ fontWeight: '900' }"
          :span="3"
        >
          信息变更栏：
        </a-descriptions-item>
      </a-descriptions>
      <a-table
        :data-source="changesSourceRes"
        bordered
        :columns="changesColumns"
        :pagination="false"
        size="small"
      ></a-table>

      <a-descriptions bordered size="small" :column="layout" style="margin-top: 10px">
        <a-descriptions-item
          :label-style="{ display: 'none' }"
          :content-style="{ fontWeight: '900' }"
          :span="3"
        >
          变更原因：
        </a-descriptions-item>
        <a-descriptions-item :label-style="{ display: 'none' }" :span="3">
          {{ changeData.reason || "无" }}
        </a-descriptions-item>
      </a-descriptions>
      <a-descriptions bordered size="small" :column="layout" style="margin-top: 10px">
        <a-descriptions-item
          :label-style="{ display: 'none' }"
          :content-style="{ fontWeight: '900' }"
          :span="3"
        >
          附件：
        </a-descriptions-item>
        <a-descriptions-item :label-style="{ display: 'none' }" :span="3">
          <FileList :datas="changeData.attachments" list-type="text" />
          <!-- <ul>
                        <li v-for="item in changeData.attachments" :key="item.id">
                            <i style="color:#72b174" class="iconfont icon-a-wendang1"></i>
                            <span style="margin: 0 10px 0 5px;">{{ item.name }}</span>
                            <a style="font-size:12px" key="list-loadmore-edit" :href="item.url">下载</a>
                        </li>
                    </ul> -->
        </a-descriptions-item>
      </a-descriptions>
    </template>
    <!-- 附件下载 -->
    <a-modal v-model:visible="filesDetilesVisble" width="650px" title="附件下载">
      <a-list item-layout="horizontal" size="small" bordered :data-source="downloadFiles">
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
        <a-button type="primary" @click="filesDetilesVisble = false">确定</a-button>
      </template>
    </a-modal>
  </div>
</template>
<script setup lang="ts">
import { ref, toRefs, onMounted } from "vue"
import { getLabChangeInfoAPI } from "@/api/infoCheck.api"
import { getLaboratoryInfoAPI } from "@/api/laboratory.api"
import { formatDate } from "@/assets/js/common"
import { downloadByNameOrUrl } from "@/config/minio.config"
import FileList from "@/components/fileList/index.vue"
import dayjs, { Dayjs } from "dayjs"

let layout = ref({ xs: 1, sm: 2, md: 2 })

let changeData: any = ref({}) //变更数据

const props = defineProps({
  id: {
    type: String,
    default: ""
  }
})
let activeKey = ref("1")
const { id } = toRefs(props) //父组件参数

let filesDetilesVisble = ref(false)
let downloadFiles = ref([])

let labInfo: any = ref({
  //基本数据
})

let changesColumns = ref([
  {
    title: "变更项目",
    dataIndex: "fieldName",
    key: "fieldName"
  },
  {
    title: "变更前",
    dataIndex: "before",
    key: "before"
  },
  {
    title: "变更后",
    dataIndex: "after",
    key: "after"
  }
])
let changesSourceRes: any = ref([]) //确定变更的数据

onMounted(() => {
  getChangeIonfo()
})

const openDownloadFiles = (row) => {
  filesDetilesVisble.value = true
  downloadFiles.value = row.attachments
}

//获取变更信息
const getChangeIonfo = async () => {
  let res: any = await getLabChangeInfoAPI(id.value)
  await getLaboratoryInfo(res.laboratoryId)
  changeData.value = res

  if (res.type === "person") {
    res.persons.forEach((item) => {
      if (item.type === "add") {
        changesAddSource.value.push(item)
      } else {
        changesRemoveSource.value.push(item)
      }
      console.log(changesRemoveSource.value)
    })
  } else {
    changesSourceRes.value = res.details
  }
}

//获取是试验室基本基本信息
const getLaboratoryInfo = async (labId) => {
  if (id?.value) {
    let res = await getLaboratoryInfoAPI(labId)
    labInfo.value = res
    changesSourceRes.value.forEach((item) => {
      item.before = res[item.field]
    })
  }
}

let changesAddColumns = ref([
  {
    title: "姓名",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "证件号",
    dataIndex: "certsNo",
    key: "certsNo"
  },
  {
    title: "证书编号",
    dataIndex: "idNum",
    key: "idNum"
  },
  {
    title: "备案时间",
    dataIndex: "presetDate",
    key: "presetDate"
  },
  {
    title: "变更原因",
    dataIndex: "reason",
    key: "reason"
  },
  {
    title: "操作",
    dataIndex: "handle",
    key: "handle"
  }
])

let changesRemoveColumns = ref([
  {
    title: "姓名",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "证件号",
    dataIndex: "certsNo",
    key: "certsNo"
  },
  {
    title: "证书编号",
    dataIndex: "idNum",
    key: "idNum"
  },
  {
    title: "注销时间",
    dataIndex: "presetDate",
    key: "presetDate"
  },
  {
    title: "变更原因",
    dataIndex: "reason",
    key: "reason"
  },
  {
    title: "操作",
    dataIndex: "handle",
    key: "handle"
  }
])
let changesAddSource: any = ref([
  //新增人员数据
])
let changesRemoveSource: any = ref([
  //移除人员数据
])
</script>
