<template>
  <nav class="web-header">
    <div class="btn_group">
      <a class="btn" href="web/">
        <img src="@/assets/images/login.svg" alt="" />
        系统登录
      </a>
      <a-tooltip placement="left" :arrow="false" color="#fff" overlay-class-name="custom-tooltip">
        <template #title>
          <div class="register-box">
            <router-link
              style="height: 50%; display: flex; align-items: center; justify-content: center"
              target="_blank"
              to="/unitSignIn"
            >
              试验检测机构注册
            </router-link>
            <router-link
              style="height: 50%; display: flex; align-items: center; justify-content: center"
              target="_blank"
              to="/botSignIn"
            >
              建设管理单位注册
            </router-link>
          </div>
        </template>
        <div class="btn">
          <img src="@/assets/images/register.svg" alt="" />
          用户注册
        </div>
      </a-tooltip>
    </div>
    <div class="banner-warp-holder"></div>
    <div class="banner-warp">
      <!-- <a-carousel autoplay :dots="false" style="width: 100vw !important">
        <div class="headerbg"><img src="@/assets/images/headerbg1.png" /></div>
        <div class="headerbg"><img src="@/assets/images/headerbg2.png" /></div>
        <div class="headerbg"><img src="@/assets/images/headerbg3.png" /></div>
        <div class="headerbg"><img src="@/assets/images/headerbg4.png" /></div>
      </a-carousel> -->
      <div class="nav-warp">
        <div class="nav-top">
          <div class="head-top">
            <div class="page-content clearfix">
              <div class="xhy-htl fl">
                <a href="http://www.gov.cn" target="_blank">中国政府网</a>
                <span>|</span>
                <a href="http://www.cq.gov.cn" target="_blank">重庆市人民政府网</a>
                <span>|</span>
                <a target="_blank" href="http://www.mot.gov.cn/">交通运输部</a>
              </div>

              <div class="fr">
                <a onclick="aria.start()" href="javascript:void(0)" class="link wza-btn" for="wza">
                  无障碍
                </a>
                <span v-if="!userInfo?.lcUser">
                  <router-link class="link" to="/news/UserManual">用户手册下载</router-link>
                  &nbsp;&nbsp;
                  <a class="link" href="//jtj.cq.gov.cn/ghwd/znwd/index.html">智能问答</a>
                  &nbsp;&nbsp;您好,请
                  <a class="cq-login">登录</a>
                  或
                  <a id="topRegister" class="cq-register cq-register-gr">注册</a>
                </span>
                <span v-else>
                  （&nbsp;{{ userInfo?.lcUser?.userName }}欢迎您&nbsp;）
                  <a id="topLogout" style="display: none" class="cq-logout">注销</a>
                </span>
              </div>
            </div>
          </div>
          <div class="head-bootom page-content">
            <a href="https://jtj.cq.gov.cn/" class="logo" target="_blank">
              <img class="gv-logo" src="@/assets/images/2024logo.png" alt="logo" />
            </a>
            <div class="head-search">
              <input
                v-model="keyword"
                class="input"
                type="text"
                placeholder="请输入您想要搜索的内容"
                @keypress.enter="searchKeyWord"
              />
              <div class="header-search-btn" @click="searchKeyWord">搜索</div>
            </div>
          </div>
        </div>
        <div class="jt-nav-box">
          <ul class="page-content jt-nav-list">
            <li class="nav-item active">
              <a href="https://jtj.cq.gov.cn/" class="cur" target="_blank">首页</a>
            </li>
            <li class="nav-item">
              <a href="https://jtj.cq.gov.cn/zwgk_240/" target="_blank">政务公开</a>
            </li>
            <li class="nav-item">
              <a href="//jtj.cq.gov.cn/zwfw/" target="_blank">政务服务</a>
            </li>
            <li class="nav-item">
              <a href="https://jtj.cq.gov.cn/wzzx/" target="_blank">互动交流</a>
            </li>
            <li class="nav-item">
              <a href="https://jtj.cq.gov.cn/ztzl/" target="_blank">专题专栏</a>
            </li>
            <li class="nav-item">
              <a href="//jtj.cq.gov.cn/jtsj/" target="_blank">交通数据</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="logo-image">
      <img
        src="@/assets/images/title.png"
        class="sys-log"
        style="height: 50px"
        alt="重庆市公路水运工程质量检测管理信息系统"
      />
    </div>
    <div class="nav-box">
      <p class="page-content nav-list">
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
import { getUserInfo, logoutAll, userLogout } from "@/api/cq.api"
import { delCookie, setCookie } from "@/utils/cookie"
import { decrypt } from "@/utils/crypto"
import { onMounted, reactive, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"

const route = useRoute()
const router = useRouter()

//let baseURL=window.location.pathname.indexOf("sygcjc")>-1?'/sygcjc/web/homePage':'/web/homePage';
let baseURL = import.meta.env.VITE_BASE_PATH + "web/"

const isDev = import.meta.env.VITE_USER_NODE_ENV == "development"

const loginUrl = isDev ? "http://localhost:9000/web/homePage" : baseURL

const curURL = encodeURIComponent(window.location.href)
// const curURL = encodeURIComponent("https://jtj.cq.gov.cn/sygcjc/#/")

const thridLoginUrl = `https://authcq.cqdcg.com:1443/sp/login/redirect?&client_id=pb0wc%2Fvbt8VQrnqsL8TmFDJyo8SWcgSnDIEih%2BzOTnk%3D&service=${encodeURIComponent(
  "https://zwykb.cq.gov.cn/pc/user/oauth"
)}&userType=1&gotoUrl=${curURL}`

const logoutUrl = `https://authcq.cqdcg.com:1443/sp/logout/redirect?client_id=pb0wc%2Fvbt8VQrnqsL8TmFDJyo8SWcgSnDIEih%2BzOTnk%3D&service=${curURL}`

// const thridRegisterUrl = `https://authcq.cqdcg.com:1443/sp/register/redirect?&client_id=pb0wc%2Fvbt8VQrnqsL8TmFDJyo8SWcgSnDIEih%2BzOTnk%3D&service=${encodeURIComponent(
//   "https://zwykb.cq.gov.cn/pc/user/oauth"
// )}&userType=3&gotoUrl=${curURL}`

const activekey = ref<string>("Home")

const userInfo = ref<any>({})

async function getUser() {
  const { code, data } = await getUserInfo()
  if (code !== 200) {
    return
  }
  userInfo.value = JSON.parse(decrypt(data))
  console.log(userInfo.value)
}

async function logout() {
  await logoutAll()
  await userLogout()
  delCookie("Authorization")
  setCookie("userInfo", "")
  window.location.href = logoutUrl
}

onMounted(() => {
  ;(window as any).baseUrlUser = "https://cqykb.cq.gov.cn/pc/user"
  // 页面创建完成后，将以上脚本添加到页面中
  document.head.appendChild(document.createElement("script")).src =
    "//cq.gov.cn/images/crypto-js.min.js"
  document.head.appendChild(document.createElement("script")).src = "//cq.gov.cn/images/DECRYPT.js"
  document.head.appendChild(document.createElement("script")).src =
    "//cq.gov.cn/images/ykb-request.js"
  document.head.appendChild(document.createElement("script")).src = "//cq.gov.cn/images/ykb-api.js"
  document.head.appendChild(document.createElement("script")).src =
    "//cq.gov.cn/images/ykb-base.js?v=1.2"

  setActiveNav()
  getUser()
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
  // { title: "技术交流", path: "/news/Technical", name: "Technical" },
  // { title: "常见问题", path: "/news/Question", name: "Question" },
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
<style lang="less">
.custom-tooltip {
  .ant-tooltip-inner {
    border-radius: 4px;
    box-shadow: 0px 0px 4px 0px #daecff;
  }
  .ant-tooltip-arrow-content {
    display: none;
  }
  .register-box {
    color: #151515;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 76px;
    box-sizing: border-box;
    padding: 0 8px;
  }
}
</style>

<style scoped lang="less">
.web-header {
  width: 100%;
  position: relative;
  .btn_group {
    position: fixed;
    right: 68px;
    top: 60%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 99999;
    .btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      width: 84px;
      height: 88px;
      border-radius: 4px;
      color: #fff;
      background-color: #2478cf;
      font-size: 14px;
      user-select: none;
      cursor: pointer;
      img {
        width: 36px;
        height: 36px;
        margin-bottom: 3px;
      }
    }
  }
  .head-top {
    padding: 16px 0;
    // height: 51px;
    line-height: 19px;
    background-color: transparent;
    color: #000;
    box-sizing: border-box;

    .xhy-htl {
      span {
        margin: 0 17px;
      }
      a:hover {
        color: #666;
      }
    }

    .link {
      padding: 0 4px;
      border-radius: 2px;
      color: #000;
    }
    .link:hover {
      text-decoration: underline;
    }
  }
  .head-bootom {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .banner-warp-holder {
    height: 242px;
    width: 100%;
  }
  .banner-warp {
    // position: relative;
    height: 242px;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;

    .headerbg {
      height: 242px;
      // &:nth-child(1) {
      //   background: url("../../assets/images/headerbg1.png") no-repeat bottom center;
      // }
      // &:nth-child(2) {
      //   background: url("../../assets/images/headerbg2.png") no-repeat bottom center;
      // }
      // &:nth-child(3) {
      //   background: url("../../assets/images/headerbg3.png") no-repeat bottom center;
      // }
      // &:nth-child(4) {
      //   background: url("../../assets/images/headerbg4.png") no-repeat bottom center;
      // }
    }

    .title {
      margin: 90px 0 30px;
      font-weight: 600;
      color: #df4418;
      font-size: 42px;
      text-align: center;
    }

    .head-search {
      float: right;
      width: 700px;
      margin-top: 12px;
      height: 53px;
      background-color: #ffffff;
      border-radius: 10px;
      border: solid 1px rgba(70, 122, 192, 0.98);
      display: flex;
      .input {
        height: 51px;
        width: 580px;
        font-size: 18px;
        padding: 0 20px 0 0;
        margin-left: 20px;
        vertical-align: top;
        outline: none;
        border: none;
        color: #333333;
        background: 0 0;
      }
      .header-search-btn {
        width: 120px;
        height: 53px;
        line-height: 53px;
        background-color: #cb0000;
        border-radius: 0 10px 10px 0;
        position: relative;
        margin-top: -1px;
        margin-right: -1px;
        font-size: 24px;
        margin-bottom: -1px;
        color: #ffffff;
        text-align: center;
        cursor: pointer;
      }
    }

    .nav-warp {
      .nav-top {
        height: 170px;
        background: url("@/assets/images/2024topbg.png") bottom center no-repeat;
      }
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: 10;

      .logo {
        .gv-logo {
          padding-top: 12px;
          width: 527px;
        }
      }
      .jt-nav-box {
        position: absolute;
        bottom: 0;
        width: 100%;
        height: 72px;
        line-height: 72px;
        background-color: #2478cf;
        color: #fff;
        a:hover {
          color: #fff;
        }
        .jt-nav-list {
          display: flex;
          overflow: hidden;
          .nav-item {
            flex: 1;
            text-align: center;
            cursor: pointer;
            color: #fff;
            font-size: 24px;
            border-radius: 10px 10px 0 0;
            overflow: hidden;
            &:hover,
            &.active {
              font-size: 26px;
              font-weight: bold;
              position: relative;
              background: #2f4c87;
              &::after {
                content: "";
                width: 100%;
                height: 7px;
                background-color: #cb0000;
                position: absolute;
                left: 0;
                bottom: 0;
              }
            }
            a {
              display: block;
              height: 100%;
              img {
                margin-right: 8px;
              }
            }
          }
        }
      }
    }
  }

  .nav-box {
    width: 100%;
    height: 48px;
    line-height: 48px;
    background: url("../../assets/images/titlebg.png") no-repeat;
    background-size: 100% 100%;
    .nav-list {
      text-align: center;
      .nav-item {
        display: inline-block;
        margin: 0 1px;
        width: 106px;
        height: 100%;
        font-size: 16px;
        &:hover,
        &.active {
          background-color: #ff9f41;
          color: #333;
        }
      }
    }
  }
}

.ariabodytopfiexed .wza-btn {
  display: none;
}

.logo-image {
  height: 80px;
  line-height: 80px;
  text-align: center;
  color: rgba(42, 74, 133);
  background: url("@/assets/images/title_background1.png") no-repeat center center / cover;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
