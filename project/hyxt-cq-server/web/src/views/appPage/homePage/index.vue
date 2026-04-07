<template>
  <div class="home_page">
    <a-row :gutter="10">
      <a-col :span="16">
        <!-- userinfo 展示 -->
        <a-row class="userInfo_wrap">
          <a-col :span="18" class="lt">
            <div>
              <a-avatar :size="44" :src="avatarUrl" />
              <ul>
                <li>您好，{{ userInfo.name }}，祝你今天工作顺利！</li>
                <li>
                  <span>{{ userInfo.orgName }} - {{ userInfo.roleDesc }}</span>
                  <a @click="openEditPassword">修改密码</a>
                  <a @click="router.push('/userInfo?k=user')">账号详情</a>
                </li>
              </ul>
            </div>
          </a-col>
          <a-col :span="6" class="rt">
            <p>上次登录时间:</p>
            <p>{{ dayjs(userInfo.latestLoginAt).format("YYYY-MM-DD HH:mm:ss") }}</p>
          </a-col>
        </a-row>

        <div class="notification_warp bulk_Box">
          <a-row class="tle" justify="space-between">
            <a-col>
              <span class="tle_name">
                通知公告
                <a-badge :count="didNotRead" />
              </span>
            </a-col>
            <a-col>
              <span class="more_btn" @click="openMoreNews">查看更多>></span>
            </a-col>
          </a-row>
          <a-list item-layout="horizontal" :data-source="newsList" size="small">
            <template #renderItem="{ item }">
              <a-list-item style="cursor: pointer" @click="openNewsDetails(item)">
                <span :class="item.received ? 'icon_dot_end' : 'icon_dot'"></span>
                <a-list-item-meta :description="item.title"></a-list-item-meta>
                <span style="padding: 0 10px; color: #666666">
                  {{ dayjs(item.publishDate).format("YYYY-MM-DD") }}
                </span>
              </a-list-item>
            </template>
          </a-list>
        </div>

        <div class="bulk_Box">
          <a-row class="tle" justify="space-between">
            <a-col>
              <span class="tle_name">
                待办事项
                <a-badge :count="backlogTotal" />
              </span>
            </a-col>
            <a-col>
              <span class="more_btn" @click="openMoreBacklog">查看更多>></span>
            </a-col>
          </a-row>

          <a-list item-layout="horizontal" :data-source="backlogList" size="small">
            <template #renderItem="{ item }">
              <a-list-item>
                <template #actions>
                  <a
                    v-if="item.kind != 'Analysis.Scheme'"
                    key="list-loadmore-edit"
                    @click="openBacklogDetails(item)"
                  >
                    详情
                  </a>
                  <a v-else key="list-loadmore-edit1" disabled>详情</a>
                  <a key="list-loadmore-more" @click="disposeBacklog(item)">处理</a>
                </template>

                <a-list-item-meta :description="item.description">
                  <template #title>
                    <h4>{{ item.name }}</h4>
                  </template>
                  <template #avatar>
                    <i
                      v-if="item.category == 'audits'"
                      style="font-size: 30px; color: #4a8de5"
                      class="icon-leixinger iconfont"
                    ></i>
                    <i
                      v-else-if="item.category == 'todo'"
                      style="font-size: 30px; color: rgb(255 182 0)"
                      class="icon-yujingleixing iconfont"
                    ></i>
                  </template>
                </a-list-item-meta>
                <span style="padding: 0 10px; color: #666666">
                  {{ dayjs(item.assignedAt).format("YYYY-MM-DD HH:mm:ss") }}
                </span>
              </a-list-item>
            </template>
          </a-list>
        </div>
      </a-col>
      <a-col :span="8">
        <div class="bulk_Box">
          <a-row class="tle" justify="space-between">
            <a-col>
              <span class="tle_name">快捷功能</span>
            </a-col>
            <a-col>
              <!-- <a>添加</a> -->
            </a-col>
          </a-row>

          <ul class="Ouick_Access">
            <template v-for="it in quickFunArr" :key="it.url">
              <li v-if="it.auth">
                <i class="iconfont icon-a-12liebiao"></i>
                <a @click="router.push(it.url)">{{ it.name }}</a>
              </li>
            </template>

            <li>
              <i class="iconfont icon-a-12liebiao"></i>
              <a @click="goExternalPlatform">部级平台</a>
            </li>
          </ul>
        </div>

        <div class="bulk_Box">
          <a-row class="tle" justify="space-between">
            <a-col>
              <span class="tle_name">本月概览</span>
            </a-col>
            <a-col></a-col>
          </a-row>
          <div class="statistics_item">
            <p class>
              <i style="color: #2288ff" class="iconfont icon-a-Group3483"></i>
              报告登记情况（月增长率）
            </p>
            <p class="det" style="border-color: #2288ff">
              <span>统计数据</span>
              <span>{{ monthlyReport.thisMonthTotal }}份</span>
            </p>
            <div class="progress">
              <a-progress
                :percent="
                  monthlyReport.thisMonthTotal >= monthlyReport.lastMonthTotal
                    ? 100
                    : (monthlyReport.thisMonthTotal / monthlyReport.lastMonthTotal) * 100
                "
                :stroke-width="10"
                stroke-color="#2288FF"
                trail-color="#CEE5FF"
                :show-info="false"
              />
              <div style="text-align: right">
                {{
                  (
                    ((monthlyReport.thisMonthTotal || 1) / (monthlyReport.lastMonthTotal || 1)) *
                    100
                  ).toFixed(1)
                }}%
              </div>
            </div>
          </div>
          <!-- <div class="statistics_item">
            <p class>
              <i style="color: #24b276" class="iconfont icon-a-Group3483"></i>
              互联网采集情况
            </p>
            <p class="det" style="border-color: #24b276">
              <span>统计数据</span>
              <span>{{ monthlyCollect.cur_month }}份</span>
            </p>
            <div class="progress">
              <a-progress
                :show-info="false"
                :percent="
                  monthlyCollect.cur_month >= monthlyCollect.pre_month
                    ? 100
                    : (monthlyCollect.cur_month / monthlyCollect.pre_month) * 100
                "
                :stroke-width="10"
                stroke-color="#24B276"
                trail-color="#BDE8D6"
              />
              <div style="text-align: right">
                {{
                  (
                    ((monthlyCollect.cur_month || 1) / (monthlyCollect.pre_month || 1)) *
                    100
                  ).toFixed(1)
                }}%
              </div>
            </div>
          </div> -->
          <div class="statistics_item">
            <p class>
              <i style="color: #ffb600" class="iconfont icon-a-Group3483"></i>
              不合格报告（月增长率）
            </p>
            <p class="det" style="border-color: #ffb600">
              <span>统计数据</span>
              <span>{{ monthlyReport.thisMonthUnqualified }}份</span>
            </p>
            <div class="progress">
              <a-progress
                :show-info="false"
                :percent="
                  monthlyReport.thisMonthUnqualified >= monthlyReport.lastMonthUnqualified
                    ? 100
                    : (monthlyReport.thisMonthUnqualified / monthlyReport.lastMonthUnqualified) *
                      100
                "
                :stroke-width="10"
                stroke-color="#FFB600"
                trail-color="#FFE9B2"
              />

              <div style="text-align: right">
                {{
                  (
                    ((monthlyReport.thisMonthUnqualified || 1) /
                      (monthlyReport.lastMonthUnqualified || 1)) *
                    100
                  ).toFixed(1)
                }}%
              </div>
            </div>
          </div>
          <div class="statistics_item">
            <p class>
              <i style="color: #f46b79" class="iconfont icon-a-Group3483"></i>
              示警信息（月增长率）
            </p>
            <p class="det" style="border-color: #f46b79">
              <span>统计数据</span>
              <span>{{ monthlySummarize.thisMonth }}份</span>
            </p>
            <div class="progress">
              <a-progress
                :show-info="false"
                :percent="
                  monthlySummarize.thisMonth >= monthlySummarize.lastMonth
                    ? 100
                    : (monthlySummarize.thisMonth / monthlySummarize.lastMonth) * 100
                "
                :stroke-width="10"
                stroke-color="#F46B79"
                trail-color="#FFD2D7"
              />
              <div style="text-align: right">
                {{
                  (
                    ((monthlySummarize.thisMonth || 1) / (monthlySummarize.lastMonth || 1)) *
                    100
                  ).toFixed(1)
                }}%
              </div>
            </div>
          </div>
        </div>
      </a-col>
    </a-row>

    <EditPassword v-model:visible="visiblePassword" />

    <a-modal
      v-model:visible="newsMoreVisible"
      title="新闻列表"
      width="800px"
      :z-index="1003"
      @ok="newsMoreVisible = false"
    >
      <a-table
        :data-source="newsSource"
        :columns="newsColumns"
        bordered
        size="small"
        :pagination="newsPagination"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'handle'">
            <a-space>
              <a-button size="small" type="primary" @click="openNewsDetails(record)">查看</a-button>
            </a-space>
          </template>

          <template v-if="column.key === 'publishDate'">
            <span>{{ dayjs(record.publishDate).format("YYYY-MM-DD") }}</span>
          </template>
        </template>
      </a-table>
    </a-modal>

    <a-modal
      v-model:visible="backlogMoreVisible"
      title="待办事项"
      width="1000px"
      :z-index="999"
      @ok="newsMoreVisible = false"
    >
      <a-table
        :data-source="backlogSource"
        :columns="backlogColumns"
        bordered
        size="small"
        :pagination="backlogPagination"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'handle'">
            <a-space>
              <a
                v-if="record.kind != 'Analysis.Scheme'"
                key="list-loadmore-edit"
                @click="openBacklogDetails(record)"
              >
                详情
              </a>
              <a v-else key="list-loadmore-edit1" disabled>详情</a>
              <a key="list-loadmore-more" @click="disposeBacklog(record)">处理</a>
            </a-space>
          </template>

          <template v-if="column.key === 'assignedAt'">
            <span>{{ dayjs(record.assignedAt).format("YYYY-MM-DD HH:mm:ss") }}</span>
          </template>
        </template>
      </a-table>
    </a-modal>

    <a-modal
      v-model:visible="newsDetailsVisible"
      title="详情"
      width="1000px"
      :z-index="1003"
      :destroy-on-close="true"
      @ok="newModelOk"
      @cancel="getNewsList()"
    >
      <div>
        <h2 style="margin: 10px; text-align: center">{{ newsDetailsData.title }}</h2>
        <div v-html="newsDetailsData.content"></div>
      </div>
    </a-modal>

    <handleAudit ref="handleAuditRef" @audit-ok="auditOk" />
    <auditDetails :id="applyId" v-model:visible="visibleAuditDetails" :kind="auditKind" />

    <WarnDispose
      :id="disposeId"
      v-model:visible="visibleWarnDispose"
      :type="disposeType"
      @callBack="auditOk"
    />

    <HandleScheme ref="handleScheme" />

    <a-modal
      v-model:visible="warnDetailsVisible"
      title="示警详情"
      width="800px"
      :z-index="1003"
      :destroy-on-close="true"
      @ok="warnDetailsVisible = false"
    >
      <a-descriptions v-if="earlyWarnDetails.type == 'Analysis.Staff'" :column="2">
        <a-descriptions-item label="试验室">{{ earlyWarnDetails.lab.name }}</a-descriptions-item>
        <a-descriptions-item label="机构名称">{{ earlyWarnDetails.org.name }}</a-descriptions-item>
        <a-descriptions-item label="极限量能">{{ earlyWarnDetails.threshold }}</a-descriptions-item>
        <a-descriptions-item label="标准量能">{{ earlyWarnDetails.standard }}</a-descriptions-item>
        <a-descriptions-item label="示警等级">
          {{ earlyWarnDetails.rank == "WARN" ? "黄色示警" : "红色示警" }}
        </a-descriptions-item>
        <a-descriptions-item label="示警生成时间">
          {{ dayjs(earlyWarnDetails.createdAt).format("YYYY-MM-DD HH:mm:ss") }}
        </a-descriptions-item>
        <a-descriptions-item label="角色类型">{{ earlyWarnDetails.character }}</a-descriptions-item>
        <a-descriptions-item label="角色姓名">{{ earlyWarnDetails.name }}</a-descriptions-item>
      </a-descriptions>

      <a-descriptions v-if="earlyWarnDetails.type == 'Analysis.EQ'" :column="2">
        <a-descriptions-item label="试验室">{{ earlyWarnDetails.lab.name }}</a-descriptions-item>
        <a-descriptions-item label="机构名称">{{ earlyWarnDetails.org.name }}</a-descriptions-item>
        <a-descriptions-item label="极限量能">{{ earlyWarnDetails.threshold }}</a-descriptions-item>
        <a-descriptions-item label="标准量能">{{ earlyWarnDetails.standard }}</a-descriptions-item>
        <a-descriptions-item label="示警等级">
          {{ earlyWarnDetails.rank == "WARN" ? "黄色示警" : "红色示警" }}
        </a-descriptions-item>
        <a-descriptions-item label="示警生成时间">
          {{ dayjs(earlyWarnDetails.createdAt).format("YYYY-MM-DD HH:mm:ss") }}
        </a-descriptions-item>
        <a-descriptions-item label="标准设备">{{ earlyWarnDetails.std }}</a-descriptions-item>
        <a-descriptions-item label="设备名称">{{ earlyWarnDetails.name }}</a-descriptions-item>
        <a-descriptions-item label="设备编号">{{ earlyWarnDetails.sn }}</a-descriptions-item>
      </a-descriptions>

      <a-descriptions v-if="earlyWarnDetails.type == 'Analysis.Collect'" :column="2">
        <a-descriptions-item label="试验室">{{ earlyWarnDetails.lab.name }}</a-descriptions-item>
        <a-descriptions-item label="机构名称">{{ earlyWarnDetails.org.name }}</a-descriptions-item>
        <a-descriptions-item label="设备编码类型">
          {{ eqmTypeDict[earlyWarnDetails.categoryCode] }}
        </a-descriptions-item>
        <a-descriptions-item label="设备名称">{{ earlyWarnDetails.name }}</a-descriptions-item>
        <a-descriptions-item label="设备编码">{{ earlyWarnDetails.sn }}</a-descriptions-item>
        <a-descriptions-item label="示警等级">
          {{ earlyWarnDetails.rank == "WARN" ? "黄色示警" : "红色示警" }}
        </a-descriptions-item>
        <a-descriptions-item label="示警生成时间">
          {{ dayjs(earlyWarnDetails.createdAt).format("YYYY-MM-DD HH:mm:ss") }}
        </a-descriptions-item>
        <a-descriptions-item label="采集数量">
          {{ earlyWarnDetails.collectCount }}
        </a-descriptions-item>
        <a-descriptions-item label="报告数量">
          {{ earlyWarnDetails.reportCount }}
        </a-descriptions-item>
      </a-descriptions>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue"
import EditPassword from "@/components/editPassword/index.vue"
import userInfoStore from "@/stores/userInfo"
import { storeToRefs } from "pinia"
import router from "@/router"
import dayjs, { Dayjs } from "dayjs"
import {
  getNewsListAPI,
  getMoreNewsListAPI,
  getNewsDetailsAPI,
  getCollectAlarmsAPI,
  getEqAlarmsAPI,
  getStaffAlarmsAPI,
  getSummarizeAPI,
  getReportAPI,
  getCollectAPI
} from "@/api/home.api"
import { getCheckPendingListAPI, handleApprovalAPI } from "@/api/infoCheck.api"
import { getDictDataAPI } from "@/api/common.api"

import handleAudit from "@/views/appPage/infoCheck/components/HandlAudit.vue"
import auditDetails from "@/views/appPage/infoCheck/components/AuditDetails.vue"
import WarnDispose from "@/views/appPage/earlyWarn/components/WarnDispose.vue"

import HandleScheme from "@/views/appPage/reportMgr/unqualified/components/HandleScheme.vue"
import { message } from "ant-design-vue"
import { getMinioFileUrl } from "@/config/minio.config"

import menuStore from "@/stores/menuTree"
const { menuTree } = storeToRefs(menuStore())

const { userInfo } = storeToRefs(userInfoStore())

const visiblePassword = ref<boolean>(false)
const openEditPassword = () => {
  visiblePassword.value = true
}

const quickFunArr = ref([
  {
    name: "检测报告管理",
    url: "/testPerformanceList",
    auth: false
  },
  {
    name: "业绩管理",
    url: "/testPerformanceList",
    auth: false
  },
  {
    name: "工地试验室管理",
    url: "/laboratory/laboratoryList",
    auth: false
  },
  {
    name: "示警信息处理",
    url: "/equipmentEarlyWarn",
    auth: false
  }
])

onMounted(async () => {
  getNewsList()
  getCheckPendingList()
  getEqmTypeDict()
  getMonthly()
  loadQuickFunData()
})

const avatarUrl = ref()
watch(
  userInfo,
  async () => {
    avatarUrl.value = await getMinioFileUrl(userInfo.value.avatar)
  },
  {
    immediate: true
  }
)

let handleScheme = ref()

let newsList = ref([])
let didNotRead = ref(0)
const getNewsList = async () => {
  let res: any = await getNewsListAPI()
  newsList.value = res.news
  didNotRead.value = res.didNotRead
}
let backlogMoreVisible = ref(false)
let newsMoreVisible = ref(false)
let newsDetailsVisible = ref(false)
let warnDetailsVisible = ref(false)

let newsQueryFrom = ref({
  current: 1,
  size: 10,
  name: ""
})

let newsPagination = ref({
  size: "small",
  showTotal: (total) => `共 ${total} 条数据`,
  showQuickJumper: true,
  showSizeChanger: true,
  total: 0,
  pageSizeOptions: ["10", "20", "50", "100"],
  onChange: (page, pageSize) => {
    newsQueryFrom.value.current = page
    newsQueryFrom.value.size = pageSize
    openMoreNews()
  }
})
// 设置快捷功能链接
const loadQuickFunData = () => {
  let st = JSON.stringify(menuTree.value)
  quickFunArr.value.forEach((it) => {
    it.auth = st.includes(it.url)
  })
}

const openMoreNews = async () => {
  newsMoreVisible.value = true
  let res: any = await getMoreNewsListAPI(newsQueryFrom.value)
  newsPagination.value.total = res.total
  newsSource.value = res.records
}

let newsDetailsData: any = ref({})
const openNewsDetails = async (row) => {
  newsDetailsVisible.value = true
  newsDetailsData.value = await getNewsDetailsAPI(row.id)
}
const newModelOk = () => {
  newsDetailsVisible.value = false
  getNewsList()
}
let newsSource = ref([])
let newsColumns = ref([
  {
    title: "标题",
    dataIndex: "title",
    key: "title"
  },
  // {
  //   title: '类型',
  //   dataIndex: 'type',
  //   key: 'type',

  // },
  {
    title: "发布日期",
    dataIndex: "publishDate",
    key: "publishDate"
  },
  {
    title: "操作",
    dataIndex: "handle",
    key: "handle"
  }
])

let backlogSource = ref([])
let backlogColumns = ref([
  {
    title: "标题",
    dataIndex: "name",
    key: "name"
  },
  {
    title: "内容",
    dataIndex: "description",
    key: "description"
  },
  {
    title: "创建时间",
    dataIndex: "assignedAt",
    key: "assignedAt"
  },
  {
    title: "操作",
    dataIndex: "handle",
    key: "handle"
  }
])

let backlogQueryFrom = ref({
  current: 1,
  size: 10,
  name: ""
})

let backlogPagination = ref({
  size: "small",
  showTotal: (total) => `共 ${total} 条数据`,
  showQuickJumper: true,
  showSizeChanger: true,
  total: 0,
  pageSizeOptions: ["10", "20", "50", "100"],
  onChange: (page, pageSize) => {
    backlogQueryFrom.value.current = page
    backlogQueryFrom.value.size = pageSize
    getCheckPendingListForMore()
  }
})

// 获取待办事项数据
let backlogList = ref([])
let backlogTotal = ref(0)
const getCheckPendingList = async () => {
  let res: any = await getCheckPendingListAPI({
    current: 1,
    size: 5,
    category: "",
    name: "",
    value: ""
  })
  backlogList.value = res.records
  backlogTotal.value = res.total
}

// 获取待办事项数据分页
const getCheckPendingListForMore = async () => {
  let res: any = await getCheckPendingListAPI(backlogQueryFrom.value)
  backlogSource.value = res.records
  backlogPagination.value.total = res.total
}

// let visibleHandleAudit = ref(false) //审核弹框显示
let visibleWarnDispose = ref(false) //示警处理弹框显示
// let applyType = ref("") //审核类型
// let auditId = ref("") //审核id
let disposeId = ref("") //处理id
let disposeType = ref("") //处理类型

const auditOk = () => {
  // console.log("审批成功")
  getCheckPendingList()
  backlogMoreVisible.value = false
}

// 处理待办
let handleAuditRef = ref()
const dataItem = ref()
const disposeBacklog = (row) => {
  dataItem.value = row
  console.log(row)
  if (row.category == "audits") {
    //审批
    // auditId.value = row.taskId
    // visibleHandleAudit.value = true

    handleAuditRef.value.openModel(row)
  } else if (row.category == "todo") {
    if (row.kind == "UNQUALIFIED_REPORT_DISPOSE") {
      dataProcessing(row)
    } else {
      disposeId.value = row.id
      disposeType.value = row.kind
      visibleWarnDispose.value = true
    }
  }
}

let auditKind = ref("") // 类型
let applyId = ref("") //申请id
let visibleAuditDetails = ref(false) //审核详情弹框显示
let earlyWarnDetails: any = ref({
  //示警详情
  lab: {},
  org: {}
})
let eqmTypeDict: any = ref({})
const getEqmTypeDict = async () => {
  let res: any = await getDictDataAPI("collectEqClasses")
  res.dict.forEach((item) => {
    eqmTypeDict.value[item.code] = item.name
  })
  return Promise.resolve()
}

//查看详情
const openBacklogDetails = async (row) => {
  if (row.category == "audits") {
    //审批
    applyId.value = row.id
    auditKind.value = row.kind
    visibleAuditDetails.value = true
  } else if (row.category == "todo") {
    if (row.kind == "Analysis.Staff") {
      earlyWarnDetails.value = await getStaffAlarmsAPI(row.id)
      earlyWarnDetails.value.type = row.kind
      warnDetailsVisible.value = true
    } else if (row.kind == "Analysis.Collect") {
      earlyWarnDetails.value = await getCollectAlarmsAPI(row.id)
      earlyWarnDetails.value.type = row.kind
      warnDetailsVisible.value = true
    } else if (row.kind == "Analysis.EQ") {
      earlyWarnDetails.value = await getEqAlarmsAPI(row.id)
      earlyWarnDetails.value.type = row.kind
      warnDetailsVisible.value = true
    } else if (row.kind == "UNQUALIFIED_REPORT_DISPOSE") {
      handleScheme.value.openModal(row.id, false)
    }
  }
}

let monthlySummarize: any = ref({})
let monthlyReport: any = ref({})
let monthlyCollect: any = ref({})
const getMonthly = async () => {
  monthlySummarize.value = await getSummarizeAPI()
  monthlyReport.value = await getReportAPI()
  monthlyCollect.value.pre_month = await getCollectAPI("pre_month")
  monthlyCollect.value.cur_month = await getCollectAPI("cur_month")
}

const openMoreBacklog = () => {
  getCheckPendingListForMore()
  backlogMoreVisible.value = true
}

const dataProcessing = async (row) => {
  await handleApprovalAPI({
    approved: true, //是否批准
    text: "xxx", //意见
    id: row.taskId //任务id
  })
  message.success("处理成功！")
  getCheckPendingList()
  backlogMoreVisible.value = false
}

const goExternalPlatform = () => {
  window.open(`${import.meta.env.VITE_PART_API}`, "_blank")
}
</script>

<style lang="less" scoped>
.userInfo_wrap {
  height: 80px;
  align-items: center;
  padding: 15px;
  margin-bottom: 15px;
  background: url("@/assets/images/userinfo_bg.png") no-repeat;
  background-size: 100% 100%;

  .lt {
    div {
      display: flex;
      align-items: center;

      ul {
        margin-left: 5px;

        li:first-child {
          font-weight: 900;
        }

        li:last-child {
          color: #747474;
        }

        li {
          padding: 7px;

          a {
            margin-left: 10px;
          }
        }
      }
    }
  }

  .rt {
    p {
      text-align: right;
      padding: 7px;
      color: #747474;
    }
  }
}

.bulk_Box {
  margin-bottom: 15px;
  border: 1px solid @border1_color;

  .tle {
    background: #fafafa;
    padding: 15px;

    .tle_name {
      border-left: 3px solid #4a8de5;
      padding-left: 10px;
      font-weight: 900;
    }

    .more_btn {
      color: #838383;
      cursor: pointer;
    }
  }
}

.icon_dot {
  padding: 4px;
  background: #4a8de5;
  border-radius: 10px;
  margin: 0 10px;
}

.icon_dot_end {
  padding: 4px;
  background: #ccc;
  border-radius: 10px;
  margin: 0 10px;
}

.notification_warp {
}

.Ouick_Access {
  display: flex;
  flex-wrap: wrap;

  li {
    width: 200px;
    padding: 10px;
    margin: 0 10px;

    i {
      color: #4a8de5;
    }

    a {
      margin-left: 5px;
    }
  }
}

.statistics_item {
  padding: 10px;
  margin: 10px;
  border: 1px solid #cee5ff;
  background: #f8fbff;

  p:first-child {
    font-weight: 900;
    margin-bottom: 15px;
  }

  .det {
    display: flex;
    justify-content: space-between;
    padding: 0px 6px;
    border-left: 1px solid #1890ff;
    margin: 5px 0;
  }

  .progress {
  }
}
</style>
