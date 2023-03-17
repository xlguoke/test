<template>
  <div id="tagsControl">
    <div class="tags-content">
      <span class="side_but" @click="setScrollNumber(1)">
        <i class="iconfont icon-xiangzuo1"></i>
      </span>
      <div id="tags-outer" class="tags_outer">
        <ul id="tags-list" class="tags_list" :style="scrollNumberComp">
          <li :class="$route.name == 'Home' ? 'active' : ''">
            <router-link to="/">首页</router-link>
          </li>
          <transition-group name="list" appear>
            <template v-for="(item, index) in visitedViews" :key="item.path">
              <li
                v-if="item.name !== 'Home'"
                :class="item.path == $route.path ? 'active' : ''"
                draggable="true"
                @dragstart="dragstart(index)"
                @dragenter="dragenter(index)"
                @dragend="dragend(item)"
              >
                <router-link :to="item.path">{{ item.meta.title }}</router-link>
                <i class="iconfont icon-guanbi" @click.stop="closeTags(item)"></i>
              </li>
            </template>
          </transition-group>
        </ul>
      </div>
      <span class="side_but" @click="setScrollNumber(2)">
        <i class="iconfont icon-xiangyou1"></i>
      </span>
    </div>
    <div class="tags-heandle">
      <a-dropdown :trigger="['click']">
        <template #overlay>
          <a-menu @click="handleTagsClick">
            <a-menu-item key="1">
              <redo-outlined />
              刷新页面
            </a-menu-item>
            <a-menu-item key="2">
              <close-outlined />
              关闭当前
            </a-menu-item>
            <a-menu-item key="3">
              <close-circle-outlined />
              关闭全部
            </a-menu-item>
            <a-menu-item key="4">
              <close-circle-outlined />
              关闭其他
            </a-menu-item>
          </a-menu>
        </template>
        <p class="tag-btn">
          关闭操作
          <DownOutlined />
        </p>
      </a-dropdown>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, computed, watch, onMounted } from "vue"
import type { Ref } from "vue"
import { useRouter, useRoute } from "vue-router"
import type { RouteLocationNormalizedLoaded } from "vue-router"
import { storeToRefs } from "pinia"
import {
  RedoOutlined,
  CloseOutlined,
  CloseCircleOutlined,
  DownOutlined
} from "@ant-design/icons-vue"
import useTagsViewStore from "@/stores/tagsView"

let route = useRoute()
let router = useRouter()

let { visitedViews } = storeToRefs(useTagsViewStore()) //菜单store

onMounted(() => {
  addTags()
})

watch(route, () => {
  addTags()
})

const handleTagsClick = (e: any) => {
  switch (e.key) {
    case "1":
      // 刷新
      useTagsViewStore()
        .delCachedView(route)
        .then(() => {
          router.replace({
            path: "/redirect" + route.path,
            query: route.query
          })
        })
      break
    case "2":
      // 关闭当前
      closeTags(route)
      break
    case "3":
      // 关闭所有
      useTagsViewStore()
        .delAllViews()
        .then(() => {
          router.push({ path: "/" })
        })
      break
    case "4":
      // 关闭其他
      useTagsViewStore().delOthersViews(route)
      break
    default:
      break
  }
}

function addTags() {
  const { name } = route
  if (name) {
    useTagsViewStore().addView(route)
  }
  return false
}

const closeTags = (view: any) => {
  const ind = visitedViews.value.findIndex(
    (d: RouteLocationNormalizedLoaded) => d.path === view.path
  )
  useTagsViewStore()
    .delView(view)
    .then((res: any) => {
      if (ind === 0 || res.visitedViews.length === 0) {
        router.push({ path: "/" })
      } else {
        router.push(res.visitedViews[ind - 1])
      }
    })
}

// 计算属性 设置滚动距离
let scrollNumber: Ref<number> = ref(0) //滚动距离
const scrollNumberComp = computed(() => {
  return `transform: translateX(${scrollNumber.value}px)`
})

//横向滚动函数
const setScrollNumber = (type: number): void => {
  //  1-向右滑  2-向左滑
  if (type == 1 && scrollNumber.value === 0) return
  let tagsOuter = document.querySelector("#tags-outer") //外壳宽度
  let tagsList = document.querySelector("#tags-list") //外壳宽度
  let listWidth = tagsList?.clientWidth || 0
  let outerWidth = tagsOuter?.clientWidth || 0
  if (listWidth <= outerWidth) {
    scrollNumber.value = 0
    return
  }
  if (type == 1) {
    if (scrollNumber.value >= 0) {
      return
    }
    scrollNumber.value += outerWidth
  } else {
    if (scrollNumber.value * -1 >= listWidth - outerWidth) return
    scrollNumber.value -= outerWidth
  }
}

/** tag 拖动排序函数 ----start  **/

let startIndex: number
let endIndex: number
//记录开始位置
const dragstart = (index: number): void => {
  startIndex = index
}
// 做最终操作
const dragend = (val: any): void => {
  if (startIndex != endIndex) {
    visitedViews.value.splice(startIndex, 1)
    visitedViews.value.splice(endIndex, 0, val)
  }
}
// 记录移动过程中信息
const dragenter = (index: number): void => {
  endIndex = index
}

/** tag 拖动排序函数 ----end  **/
</script>
<style lang="less" scoped>
#tagsControl {
  width: 100%;
  display: flex;
  justify-content: space-around;
  padding-top: 9px;
  border-bottom: solid 1px @border1_color;
  background: #fff;

  .tags-content {
    flex: 1;
    width: 0;
    display: flex;
    justify-content: space-around;
    height: 100%;
  }

  .tags-heandle {
    margin-left: 5px;
    margin-right: 10px;
    cursor: pointer;

    .tag-btn {
      padding: 0 12px;
      height: 30px;
      border-bottom: none;
      line-height: 30px;
      border-top-left-radius: 5px 5px;
      border-top-right-radius: 5px 5px;
      background: #f5f5f5;
      text-align: center;
    }
  }

  .side_but {
    height: 100%;
    background: #d5d5d5;
    height: 30px;
    border-top-left-radius: 5px 5px;
    border-top-right-radius: 5px 5px;
    line-height: 30px;
    padding: 0 5px;
    margin: 0 2px;
    background: #f5f5f5;
    border-bottom: none;
    cursor: pointer;
    color: #cccc;

    i {
      font-size: 12px;
    }

    &:hover {
      background-color: #e6f0fd;
    }
  }

  .tags_outer {
    flex: 1;
    width: 0;
    overflow: hidden;
  }

  .tags_list {
    float: left;
    height: 30px;
    transition: all 0.5s;
    white-space: nowrap;
  }

  .tags_list li {
    display: inline-flex;
    align-items: center;
    margin: 0 3px;
    padding: 0 10px;
    height: 30px;
    border-bottom: none;
    line-height: 30px;
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
    background: #f5f5f5;
    text-align: center;
    cursor: pointer;
    transition: 0.1s;

    &:not(.active):hover {
      background-color: #e6f0fd;
    }
  }

  .tags_list .active {
    background: @theme_color;

    a,
    i {
      color: #fff;
    }
  }

  .tags_list li a {
    font-size: 12px;
    padding: 0 5px;
    height: 100%;
    color: @text1_color;
    display: inline-block;
    white-space: nowrap; //让文本不换行，在同一行里面
    overflow: hidden; //让超出的范围进行隐藏
    text-overflow: ellipsis; //超出的部分用省略号表示
  }

  .tags_list li i {
    color: #a1a1a1;
    font-size: 12px;
    margin: 0 5px;
    cursor: pointer;
    width: 5px;
    transition: 0.1s;
  }

  .tags_list li i:hover {
    font-size: 14px;
  }

  .list-move {
    transition: transform 0.5s;
  }
}
</style>
