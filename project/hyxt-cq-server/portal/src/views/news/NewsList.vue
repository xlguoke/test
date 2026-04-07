<template>
  <div class="page-content card">
    <p class="card-title">
      <ht-icon v-if="pageTitleInfo.imgname" :name="pageTitleInfo.imgname" size="22" />
      <i v-else :class="`iconfont ${pageTitleInfo.iconfont}`"></i>
      {{ pageTitleInfo.title }}
    </p>
    <a-tabs
      v-if="pageTitleInfo.type == 'POLICY'"
      v-model:activeKey="activeKey"
      style="padding: 0px 10px"
      @change="tabNesType"
    >
      <a-tab-pane key="MINISTERIAL_REGULATION" tab="部委规章"></a-tab-pane>
      <a-tab-pane key="LOCAL_REGULATION" tab="地方规定"></a-tab-pane>
    </a-tabs>
    <div class="data-list-wrap">
      <ul class="data-list">
        <li
          v-for="d in dataList"
          :key="d.id"
          :class="`data-item ${d.isTop && validDate(d) ? 'top' : ''}`"
        >
          <span class="con font-1">{{ d.title }}</span>
          <!-- <span class="huifu" v-if="routeId == 'Technical'">[1条回复]</span> -->
          <span class="time">{{ formatDate(d.publishDate || d.createdAt) }}</span>

          <router-link v-if="routeId != 'Technical'" :to="`/newsDetail?id=${d.id}`" target="_blank">
            <a-button type="link">查看</a-button>
          </router-link>
          <router-link v-else :to="`/technical/detail?id=${d.id}`" target="_blank">
            <a-button type="link">查看</a-button>
          </router-link>
        </li>
        <li v-if="dataList.length === 0" class="no-data">暂无数据</li>
      </ul>
      <div style="padding-bottom: 20px">
        <a-pagination
          v-model:current="pagination.current"
          :total="pagination.total"
          :show-size-changer="false"
          @change="handleSizeChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch, ref, onMounted, reactive } from "vue"
import { useRoute } from "vue-router"
import { getNewsPageList, technicalPages } from "@/api/home.api"
import { formatDate } from "@/assets/js/utils"

let activeKey = ref("MINISTERIAL_REGULATION")
const route = useRoute()
const pageTitleInfo = ref({
  title: "",
  imgname: "",
  iconfont: "",
  type: ""
})

onMounted(() => {
  getRouteId()
})

// 路由集合
const routeObj = reactive({
  Notice: {
    title: "通知公告",
    imgname: "icon-tongzhi.png",
    type: "NOTICE"
  },
  Polic: {
    title: "政策文件",
    iconfont: "icon-a-zhengce1",
    type: "POLICY"
  },
  Technical: {
    title: "技术交流",
    iconfont: "icon-a-jishufuwu1",
    type: "TECHNICAL"
  },
  Question: {
    title: "常见问题",
    iconfont: "icon-a-kefu1",
    type: "PROBLEM"
  },
  Search: {
    title: "搜索",
    iconfont: "icon-sousuo-227",
    type: ""
  },
  UserManual: {
    title: "用户手册",
    iconfont: "icon-shiyongshouce",
    type: "MANUAL"
  },
  Briefing: {
    tilte: "要闻",
    iconfont: "",
    type: "BRIEFING"
  }
})

//  路由id
const routeId = ref<string>("")
const keyWord = ref<string>("")
watch(route, () => {
  getRouteId()
})
const getRouteId = () => {
  const id = route.params.id
  if (id) {
    route.meta.activekey = id
    routeId.value = id + ""
    keyWord.value = route.query?.keyword as string
    pageTitleInfo.value = routeObj[id + ""]
    getDataList()
  }
}

const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})
interface dataType {
  id: string
  title: string
  content: string
  publishDate: string
  createdAt: number
  isTop: boolean
  customCategory: string
}
const dataList = ref<dataType[]>([])
const getDataList = () => {
  const _type = routeObj[routeId.value].type
  if (_type === "TECHNICAL") {
    technicalPages({
      current: pagination.current,
      size: pagination.size
    }).then((res) => {
      dataList.value = res.records || []
      pagination.total = res.total
    })
  } else {
    let p = {
      current: pagination.current,
      size: pagination.size,
      title: keyWord.value || "",
      type: _type || "ALL"
    }
    if (_type == "POLICY") {
      p["customCategory"] = activeKey.value
    }
    getNewsPageList(p).then((res) => {
      dataList.value = res.records || []
      pagination.total = res.total
    })
  }
}

const tabNesType = (v) => {
  console.log(v)
  getDataList()
}

// 分页-页码
const handleSizeChange = (size: number) => {
  pagination.current = size
  getDataList()
}

// 置顶过期日期
const validDate = (d) => {
  return d.topExpirationDate && new Date().getTime() < d.topExpirationDate
}
</script>

<style scoped lang="less">
.card {
  margin-top: 12px;
  .card-title {
    padding: 0 15px;
    line-height: 48px;
    font-size: 18px;
    color: @theme_color;
    background-color: #edf4fc;
    .iconfont {
      font-size: 24px;
      vertical-align: middle;
    }
  }
}

.data-list-wrap {
  .el-pagination {
    justify-content: center;
  }
  .data-list {
    padding: 20px;
    min-height: 150px;
    .data-item {
      position: relative;
      display: flex;
      align-items: center;
      padding: 0 16px 0 20px;
      height: 48px;
      border-bottom: 1px solid #f0f0f0;

      &::before {
        content: "";
        position: absolute;
        left: 5px;
        top: 22px;
        width: 5px;
        height: 5px;
        border-radius: 10px;
        background-color: @theme_color;
      }

      &.top::before {
        content: "顶";
        display: inline-block;
        top: 15px;
        left: 0;
        width: 16px;
        height: 16px;
        text-align: center;
        line-height: 16px;
        border-radius: 2px;
        color: #fff;
        background-color: #fe6550;
        font-size: 12px;
        vertical-align: middle;
        border: 0;
      }

      .con {
        flex: 1;
      }
      .huifu {
        width: 120px;
        text-align: center;
      }
      .time {
        width: 200px;
        text-align: center;
      }
      .a-btn {
        margin: 0 20px;
      }
    }
  }
}

.no-data {
  text-align: center;
  line-height: 100px;
  color: #999;
}
</style>
