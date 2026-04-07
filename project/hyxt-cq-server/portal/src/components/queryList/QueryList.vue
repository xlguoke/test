<template>
  <ul class="serve-list">
    <li
      v-for="d in industryServe"
      :key="d.icon"
      :class="`item ${isTabs && activeKey == d.key ? 'active' : ''}`"
      @click="clickQuery(d)"
    >
      <i :class="`iconfont ${d.icon}`"></i>
      <span class="item-title">{{ d.title }}</span>
      <i class="iconfont icon-xiangyou1 fr"></i>
    </li>
  </ul>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()
const props = defineProps({
  isTabs: Boolean,
  change: {
    type: Function,
    default: () => undefined
  }
})
const emit = defineEmits(["change"])
const activeKey = ref("")

onMounted(() => {
  if (!props.isTabs) return
  const key = sessionStorage.getItem("queryListKey") || "report"
  activeKey.value = key
})

interface industryType {
  title: string
  icon: string
  url: string // 路由或外链链接
  type?: number // 跳转类型：默认路由内嵌打开、2-路由新窗口打开、3-外链新窗口打开
  key: string
}

const partBaseUrl = import.meta.env.VITE_PART_API
const industryServe = reactive<industryType[]>([
  {
    title: "试验检测报告查询",
    icon: "icon-a-wendang1",
    url: "/msgQuery",
    key: "Report"
  },
  {
    title: "试验检测业绩查询",
    icon: "icon-a-jiangbei1",
    url: "/msgQuery",
    key: "Performance"
  },
  {
    title: "试验检测机构注册",
    icon: "icon-a-gangbi1",
    url: "/msgQuery",
    key: "UnitSignin"
  },
  {
    title: "建设管理单位账号申请",
    icon: "icon-a-gangbi1",
    url: "/msgQuery",
    key: "BotSignIn"
  },
  {
    title: "试验检测机构查询",
    icon: "icon-a-qiye1",
    type: 3, // 跳转部平台
    url: partBaseUrl + "/PCWeb/OrgQuery/Index",
    key: "Index"
  },
  {
    title: "试验检测人员查询",
    icon: "icon-a-renyuanguanli1",
    type: 3,
    url: partBaseUrl + "/PCWeb/OrgQuery/PersonQuery",
    key: "PersonQuery"
  },
  {
    title: "继续教育学时查询",
    icon: "icon-jiaoyu1",
    // url: partBaseUrl + "/PCWeb/OrgQuery/AdultEducationQuery",
    url: "/msgQuery",
    key: "AdultEducationQuery"
  }
])

const clickQuery = (data) => {
  if (data.type == 3) {
    window.open(data.url, "_blank")
  } else {
    activeKey.value = data.key
    sessionStorage.setItem("queryListKey", data.key)
    emit("change", data.key)
    if (data.type == 2) {
      window.open(data.url, "_blank")
    } else {
      router.push({
        path: `${data.url}?id=${data.id}`
      })
    }
  }
}
</script>
<style scoped lang="less">
.serve-list {
  padding: 20px;
  .item {
    padding: 0 15px;
    line-height: 52px;
    background: #edf4fc;
    border-radius: 4px;
    color: #4a8de5;
    font-size: 16px;
    cursor: pointer;
    .item-title {
      margin-left: 5px;
      font-weight: 700;
    }
    &:hover,
    &.active {
      background: @theme_color;
      color: #fff;
    }
    &:not(:first-child) {
      margin-top: 21px;
    }
    .iconfont:first-child {
      font-size: 20px;
      vertical-align: middle;
    }
    .iconfont:last-child {
      font-size: 12px;
    }
  }
}
</style>
