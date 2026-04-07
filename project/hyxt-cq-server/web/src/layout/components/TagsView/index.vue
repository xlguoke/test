<template>
  <div id="tagsControl">
    <span class="side_but" @click="setScrollNumber(1)">
      <i class="iconfont icon-xiangzuo1"></i>
    </span>
    <div class="tags_outer">
      <ul class="tags_list" :style="scrollNumberComp">
        <transition-group name="list" appear>
          <template v-for="(item, index) in existTags" :key="item.path">
            <li
              :class="item.path == currentView.path ? 'active' : ''"
              draggable="true"
              @dragstart="dragstart(item, index)"
              @dragenter="dragenter(item, index)"
              @dragend="dragend(item, index)"
              @dragover.prevent="dragover(item, index)"
            >
              <a-dropdown trigger="['contextmenu']" placement="bottom">
                <div class="tag_item">
                  <span @click="openView(item)" @dblclick="refresh(item)">{{ item.title }}</span>
                  <i
                    v-if="item.disableClose"
                    class="iconfont icon-guanbi"
                    @click="closeTags(item)"
                  ></i>
                </div>
                <template #overlay>
                  <a-menu>
                    <a-menu-item key="1" @click="closeTags(item)">关闭当前</a-menu-item>
                    <a-menu-item key="2" @click="closeAll()">关闭全部</a-menu-item>
                    <a-menu-item key="3" @click="closeRight(index)">关闭右侧</a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </li>
          </template>
        </transition-group>
      </ul>
    </div>
    <span class="side_but" @click="setScrollNumber(2)">
      <i class="iconfont icon-xiangyou1"></i>
    </span>
  </div>
</template>
<script lang="ts" setup>
import { ref, computed, inject, nextTick, watch } from "vue"
import type { Ref } from "vue"
import { useRouter, useRoute } from "vue-router"
import { storeToRefs } from "pinia"
import existingTag from "@/stores/existingTag"
import { message } from "ant-design-vue"

let route = useRoute()
let router = useRouter()
let reload: any = inject("reload")

let { existTags, currentView, cacheViews } = storeToRefs(existingTag()) //菜单store

let scrollNumber: Ref<number> = ref(0) //滚动距离

//关闭所有
const closeAll = () => {
  for (let i = existTags.value.length - 1; i >= 0; i--) {
    //使用数组倒序删除，避免正序删除后下标异常
    let item = existTags.value[i]
    console.log(item.disableClose, i)
    if (item.disableClose) {
      //设置为允许关闭的tag才能关闭
      existTags.value.splice(i, 1)
    }
  }
}
//关闭右侧
const closeRight = (index: number): void => {
  for (let i = existTags.value.length - 1; i >= 0; i--) {
    //使用数组倒序删除，避免正序删除后下标异常
    let item = existTags.value[i]
    if (item.disableClose && i > index) {
      //设置为允许关闭的tag 且 下标大于当前选中下标 才能关闭
      existTags.value.splice(i, 1)
    }
  }
}
//关闭当前Tags
const closeTags = (op): void => {
  existTags.value.forEach((item, index: number): void => {
    if (op.path == item.path) {
      if (op.path === currentView.value.path) {
        //如关闭的是当前打开页则关闭当前页 打开前一个标签或者后一个标签
        let opIndex: number = index ? index - 1 : index + 1
        // currentView.value = existTags.value[opIndex]
        router.push(existTags.value[opIndex].path)
      }
      existTags.value.splice(index, 1)
    }
  })
}
//打开页面
const openView = (op): void => {
  existTags.value.forEach((item): void => {
    if (op.path == item.path) {
      router.push({
        path: item.path,
        query: route.query
      })
      // currentView.value = op
    }
  })
}
const refresh = (item): void => {
  reload()
  message.success("页面刷新!")
  // const ind = cacheViews.value.indexOf(item.name)
  // if (ind != -1) {
  //     cacheViews.value.push(item.name)
  //     route.meta.keepAlive = false;
  //     nextTick(() => {
  //         route.meta.keepAlive = true;
  //         cacheViews.value.splice(ind, 1)
  //     })
  // }
}

// 计算属性 设置滚动距离
const scrollNumberComp = computed(() => {
  return `transform: translateX(${scrollNumber.value}px)`
})

//横向滚动函数
const setScrollNumber = (type: number): void => {
  let tagsWidth = 0 //tags总宽度
  let outerWidth = document.getElementsByClassName("tags_list")[0].clientWidth //外壳宽度
  document.querySelectorAll(".tags_list li").forEach((item) => {
    tagsWidth = tagsWidth + item.clientWidth
  })
  if (tagsWidth <= outerWidth) {
    return
  }
  if (type == 1) {
    if (scrollNumber.value >= 0) {
      return
    } // 当前滚动距离>=0 说明左边无需滚动或者已经到顶了
    scrollNumber.value = scrollNumber.value + 128
  } else {
    if (Math.abs(scrollNumber.value) > tagsWidth + 500 - outerWidth) {
      return
    } //当前滚动距离 > (tags总宽度 + 500的留白宽度) - 外壳宽度 说明已经滑动到了尾部
    scrollNumber.value = scrollNumber.value - 128
  }
}

/** tag 拖动排序函数 ----start  **/

let startIndex: number
let endIndex: number
//记录开始位置
const dragstart = (val, index: number): void => {
  startIndex = index
}
// 做最终操作
const dragend = (val, index: number): void => {
  if (startIndex != endIndex) {
    existTags.value.splice(startIndex, 1)
    existTags.value.splice(endIndex, 0, val)
  }
}
// 记录移动过程中信息
const dragenter = (val, index: number): void => {
  endIndex = index
}
const dragover = (value, index: number): void => {
  // console.log(index)
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
  }

  .tags_outer {
    width: calc(100% - 60px);
    overflow: hidden;
  }

  .tags_list {
    display: flex;
    height: 30px;
    transition: all 0.5s;
  }

  .tags_list li {
    margin: 0 3px;
    padding: 0 2px;
    height: 30px;
    border-bottom: none;
    line-height: 30px;
    border-top-left-radius: 5px 5px;
    border-top-right-radius: 5px 5px;
    background: #f5f5f5;
    min-width: 60px;
    text-align: center;

    .tag_item {
      display: flex;
      padding: 0 10px;
      align-items: center;
    }
  }

  .tags_list .active {
    background: @theme_color;
    color: #fff;
  }

  .tags_list .active i {
    color: #fff;
  }

  .tags_list li span {
    font-size: 12px;
    padding: 0 5px;
    height: 100%;
    display: inline-block;
    cursor: pointer;
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
  }

  .tags_list li i:hover {
    font-size: 15px;
  }

  .list-move {
    transition: transform 0.5s;
  }
}
</style>
