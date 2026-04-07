import { unref } from "vue"
import { createRouter, createWebHashHistory } from "vue-router"
import { storeToRefs } from "pinia"
import menuStore from "@/stores/menuTree"
import existingTag from "@/stores/existingTag"
import userInfoStores from "@/stores/userInfo"
import { userLocalStorage } from "@/assets/js/common"
import WebLayout from "@/layout/index.vue"
import Login from "@/views/login/index.vue"
import { Empty } from "ant-design-vue"

const modules = import.meta.glob("../views/**/*.vue")
const loadView = (view: string) => {
  let res
  for (const path in modules) {
    const dir = path.split("views")[1]
    const viewDir = view.split("views")[1]
    if (dir === viewDir) {
      res = () => modules[path]()
    }
  }
  return res
}

const routeList = [
  {
    path: "/",
    name: "webLayout",
    component: WebLayout,
    redirect: "/homePage",
    children: []
  },
  {
    path: "/userOrgInfo",
    name: "userOrgInfo",
    component: () => import("@/views/appPage/system/userManage/userOrgInfo.vue")
  },
  {
    path: "/login",
    name: "login",
    component: Login //登录
  },
  // {
  //   path: "/external/reportQuery",
  //   name: "reportQuery",
  //   component: () => import("@/views/external/reportQuery/index.vue")
  // },
  {
    path: "/404",
    name: "404",
    component: () => import("@/views/appPage/error/404.vue")
  },
  {
    path: "/error",
    name: "error",
    component: () => import("@/views/appPage/error/error.vue")
  },
  {
    path: "/noAuth",
    name: "noAuth",
    component: () => import("@/views/appPage/error/noAuth.vue")
  },
  {
    path: "/static/:pathMatch(.*)",
    component: Empty
  }
]

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: routeList
})

let registration = true
// router全局拦截器
router.beforeEach(async (to, from, next) => {
  const userStores = userInfoStores()
  const { isJt, jtLoginUrl } = storeToRefs(userStores)
  const idToken = to.query.id_token as string
  // 交通综合业务管理门户系统跳转拦截
  if (idToken) {
    isJt.value = true
    to.query = {}
    userLocalStorage.remove("userToken")
  }
  let token = userLocalStorage.get("userToken")
  let { menuTree } = storeToRefs(menuStore())
  if (
    to.name !== "login" &&
    to.name !== "reportQuery" &&
    (!token || !menuTree.value.length) &&
    !idToken
  ) {
    // 如果当前跳转地址不是登录页或者公众页面 ，需要验证tokn和菜单数据是否存在，不存在则跳转登录
    if (isJt.value) {
      if (to.name === "noAuth") {
        next()
      } else {
        window.location.href = unref(jtLoginUrl)
      }
      return
    }
    next({ path: "/login" })
  } else if (to.name === "login" || !registration) {
    //无需注册路由
    next()
    setExisTags(to.meta)
    console.log("直接跳转")
  } else if (registration) {
    //需要注册路由
    if (isJt.value) {
      try {
        if (!token) {
          const res = await userStores.getMenuTree(idToken)
          // 单点登录成功，用户信息中不存在机构id，前往选择机构
          if (res == 1) {
            next("/userOrgInfo")
            return
          }
        }
      } catch (err: any) {
        if (err === 401) {
          window.location.href = unref(jtLoginUrl)
          return
        } else if (err === 500) {
          return next("/error")
        }
        return next("/noAuth")
      }
    }
    registerRouter()
    LocalRouteRegister()
    next({ ...to, replace: true }) //重定向
    registration = false
    console.log("重新注册")
  }
})

//设置tags标签数据
const setExisTags = (r: any) => {
  if (!r || !r.title) {
    return
  }
  let { existTags, currentView } = storeToRefs(existingTag())
  let e = existTags.value.filter((item: any) => {
    if (item.path == r.path) {
      return { item }
    }
  })
  if (!e.length) {
    existTags.value.push(r)
  }
  currentView.value = r
}

//注册动态路由
const registerRouter = () => {
  let { menuTree } = storeToRefs(menuStore())
  let routeArr = getComponentRoute(menuTree.value)
  routeArr.forEach(async (item: any) => {
    item.component = loadView(item.component)
    router.addRoute("webLayout", {
      path: item.path,
      component: item.component,
      meta: {
        auths: item.auths,
        title: item.title,
        disableClose: item.disableClose,
        path: item.path,
        name: item.path,
        pid: item.pid
      }
    })
  })
}

//本地路由注册
const LocalRouteRegister = () => {
  router.addRoute("webLayout", {
    path: "/userInfo",
    component: () => import("@/views/appPage/system/userInfo/index.vue"),
    meta: {
      auths: [],
      title: "用户信息",
      disableClose: true,
      path: "/userInfo",
      name: "/userInfo",
      pid: "",
      type: 3
    }
  })

  router.addRoute({
    path: "/:pathMatch(.*)",
    redirect: "/404"
  })
}

//获取动态路由
let routeArr: any = []
const getComponentRoute = (arr: any) => {
  arr.forEach((item: any) => {
    if (item.children && item.children.length) {
      getComponentRoute(item.children)
    } else {
      routeArr.push({
        path: item.path,
        title: item.name,
        disableClose: item.disableClose,
        auths: item.auths,
        component: item.component || "",
        pid: item.pid
      })
    }
  })
  return routeArr
}

export default router
