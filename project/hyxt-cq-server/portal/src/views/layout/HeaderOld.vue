<template>
  <nav class="web-header">
    <div class="head-top">
      <div class="page-content clearfix">
        <span class="fl">访客您好，欢迎使用！</span>

        <div class="fr">
          <a-dropdown>
            <a class="link">账户注册</a>
            <template #overlay>
              <a-menu>
                <a-menu-item>
                  <router-link target="_blank" to="/unitSignIn">试验检测机构注册</router-link>
                </a-menu-item>
                <a-menu-item>
                  <router-link target="_blank" to="/botSignIn">建设管理单位注册</router-link>
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </div>
        <a target="_blank" class="fr link" :href="loginUrl">登录</a>
        <router-link class="fr link" to="/news/UserManual">用户手册下载</router-link>
      </div>
    </div>
    <div class="page-content">
      <h2 class="title">重庆市公路水运工程质量检测管理门户</h2>
      <div class="head-search">
        <a-input-search
          v-model:value="keyword"
          placeholder="请输入搜索关键字"
          style="width: 300px"
          enter-button
          @search="searchKeyWord"
        />
      </div>
      <p class="nav-list">
        <router-link
          v-for="nav in navDatas"
          :key="nav.path"
          :class="`nav-item ${activekey == nav.name ? 'active' : ''}`"
          :to="nav.path"
        >
          {{ nav.title }}
        </router-link>
      </p>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"

const route = useRoute()
const router = useRouter()
const isDev = import.meta.env.VITE_USER_NODE_ENV == "development"
const loginUrl = isDev ? "http://localhost:9000/web/homePage" : "/web/homePage"
const activekey = ref<string>("Home")
onMounted(() => {
  setActiveNav()
})

watch(route, () => {
  setActiveNav()
})
const setActiveNav = () => {
  if (route.params.id) {
    activekey.value = route.params.id + ""
  } else {
    activekey.value = route.meta?.activekey as string
  }
}

interface navType {
  title: string
  path: string
  name: string
}

const navDatas = reactive<navType[]>([
  { title: "首页", path: "/", name: "Home" },
  { title: "通知公告", path: "/news/Notice", name: "Notice" },
  { title: "信息查询", path: "/msgQuery", name: "MsgQuery" },
  { title: "政策文件", path: "/news/Polic", name: "Polic" },
  { title: "技术交流", path: "/news/Technical", name: "Technical" },
  { title: "常见问题", path: "/news/Question", name: "Question" },
  { title: "关于我们", path: "/aboutUs", name: "AboutUs" }
])

// 搜索
const keyword = ref("")
const searchKeyWord = () => {
  router.push({
    path: "/news/Search",
    query: {
      keyword: keyword.value,
      t: new Date().getTime()
    }
  })
}
</script>

<style scoped lang="less">
.web-header {
  width: 100%;

  .head-top {
    padding: 3px 0;
    height: 28px;
    line-height: 22px;
    background-color: @theme_color;
    color: #fff;
    box-sizing: border-box;

    .link {
      padding: 0 4px;
      margin-left: 20px;
      color: #fff;
      border-radius: 2px;
    }
    .link:hover {
      background-color: rgba(255, 255, 255, 0.16);
    }
  }

  .title {
    margin: 64px 0;
    font-size: 36px;
    font-weight: 700;
    color: #016cbc;
    text-align: center;
  }

  .head-search {
    width: 310px;
    margin: 0 auto;
  }

  .nav-list {
    margin-top: 32px;
    display: flex;
    width: 100%;
    background-color: @theme_color;
    color: #fff;
    border-radius: 4px;
    overflow: hidden;
    .nav-item {
      flex: 1;
      line-height: 32px;
      text-align: center;
      cursor: pointer;
      color: #fff;
      font-weight: 700;
      &:hover,
      &.active {
        background-color: #016cbc;
        color: #fff098;
      }
    }
  }
}
</style>
