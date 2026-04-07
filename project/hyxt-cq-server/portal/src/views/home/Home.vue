<template>
  <div class="home-wrap page-content">
    <ul class="page-wrap">
      <!-- 轮播图 -->
      <!-- <li class="banner">
        <a-carousel
          ref="myCarousel"
          effect="fade"
          autoplay
          :dots="false"
          :after-change="changeBanner"
        >
          <router-link
            v-for="item in pictureData"
            :key="item.id"
            target="_blank"
            :to="`/newsDetail?id=${item.id}`"
            class="banner-item"
          >
            <img :src="item.pictureUrl" object-fit="cover" />
          </router-link>
        </a-carousel>
        <div v-if="pictureData.length > 0" class="banner-indicator">
          <router-link
            target="_blank"
            :to="`newsDetail?id=${pictureData[bannerIndex].id}`"
            class="font-1"
          >
            {{ pictureData[bannerIndex].title }}
          </router-link>
          <ul class="indicator">
            <li
              v-for="(item, i) in pictureData"
              :key="item.id"
              :class="`item ${bannerIndex == i ? 'active' : ''}`"
              @click="clickInd(i)"
            >
              {{ i + 1 }}
            </li>
          </ul>
        </div>
      </li> -->

      <!-- 通知公告 -->
      <li class="notice-box card">
        <div class="top">
          <div class="title">
            <ht-icon name="icon-tongzhi.png" size="22" />
            <span class="ml">通知公告</span>
          </div>
          <router-link to="/news/Notice" class="more">
            更多
            <i class="iconfont icon--you"></i>
          </router-link>
        </div>
        <div class="notice-list">
          <router-link
            v-for="item in noticeData"
            :key="item.id"
            :to="`/newsDetail?id=${item.id}`"
            target="_blank"
            class="notice-item"
          >
            <span v-if="item.isTop" class="top-tip">顶</span>
            <i v-else class="top-dot"></i>
            <div class="content font-2">{{ item.title }}</div>
            <span class="time">{{ formatDate(item.publishDate) }}</span>
          </router-link>
          <p v-if="noticeData.length === 0" class="no-data">暂无数据</p>
        </div>
      </li>

      <!-- 政策文件 -->
      <li class="notice-box card" style="margin-left: 20px">
        <div class="top">
          <div class="title">
            <span
              style="
                width: 22px;
                height: 22px;
                display: inline-block;
                background: #4a8de5;
                border-radius: 30px;
                text-align: center;
                line-height: 20px;
              "
            >
              <i style="color: #fff; font-size: 12px" class="iconfont icon-a-zhengce1"></i>
            </span>
            <!-- <ht-icon name="icon-a-zhengce1" size="22" /> -->
            <span class="ml">政策文件</span>
          </div>
          <router-link to="/news/Polic" class="more">
            更多
            <i class="iconfont icon--you"></i>
          </router-link>
        </div>
        <div class="notice-list">
          <router-link
            v-for="item in policyData"
            :key="item.id"
            :to="`/newsDetail?id=${item.id}`"
            target="_blank"
            class="notice-item"
          >
            <!-- <span v-if="item.isTop" class="top-tip">顶</span> -->
            <i class="top-dot"></i>
            <div class="content font-2">{{ item.title }}</div>
            <span class="time">{{ formatDate(item.publishDate) }}</span>
          </router-link>
          <p v-if="noticeData.length === 0" class="no-data">暂无数据</p>
        </div>
      </li>
    </ul>

    <!-- 要闻 -->
    <!-- <div v-if="briefingData.length > 0" class="page-wrap important-info">
      <a-image
        :src="getAssetsFile('import-info.png')"
        height="28px"
        width="75px"
        :preview="false"
      />
      <p class="con">
        <template v-for="item in briefingData" :key="item.id">
          <router-link target="_blank" :to="`/newsDetail?id=${item.id}`" class="item-info font-1">
            {{ item.title }}
          </router-link>
        </template>
      </p>
    </div> -->

    <!-- 等级试验检测机构分布 -->
    <ul class="page-wrap test-unit-mode">
      <li class="test-unit card">
        <p class="title">
          <ht-icon name="icon-jigou.png" size="22"></ht-icon>
          <span class="ml">等级试验检测机构分布</span>
        </p>
        <div class="test-unit-con">
          <div class="unit-table">
            <a v-for="(item, i) in unitDatas" :key="i" href="#" class="row">
              <p class="col">{{ item.name }}</p>
              <p class="line"></p>
              <p class="num col">{{ item.num }}</p>
            </a>
          </div>
          <div class="map-box">
            <CqMap :datas="mapDatas" />
          </div>
        </div>
      </li>
      <!-- 行业服务 -->
      <li class="industry-serve card">
        <p class="title">
          <ht-icon name="icon-hangye.png" size="22"></ht-icon>
          <span class="ml">行业服务</span>
        </p>
        <QueryList />
      </li>
    </ul>
    <!-- <ul class="page-wrap" style="align-items: initial">
      <NewsList title="技术交流" icon="icon-a-jishufuwu1" code="Technical" :datas="technicalData" />
      <NewsList title="常见问题" icon="icon-a-kefu1" code="Question" :datas="questionData" />
      <NewsList title="政策文件" icon="icon-a-zhengce1" code="Polic" :datas="policyData" />
    </ul> -->
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue"
// import { getAssetsFile } from "@/assets/js/utils"
import { getHomeNoticeList, mapDistribution, technicalPages } from "@/api/home.api"
import CqMap from "./components/CqMap.vue"
// import NewsList from "./components/NewsList.vue"
import QueryList from "@/components/queryList/QueryList.vue"
import { formatDate } from "@/assets/js/utils"
import { getMinioFileUrl } from "@/config/minio.config.js"

onMounted(() => {
  getHomeDatas()
  getMapDatas()
  getTechnical()
})

interface newsType {
  title: string
  id: string
  publishDate: string
  pictureUrl: string
  isTop: boolean
}
const pictureData = ref<newsType[]>([]) // 轮播
const noticeData = ref<newsType[]>([]) // 公告信息
const briefingData = ref<newsType[]>([]) // 要闻
const technicalData = ref<newsType[]>([]) // 技术交流
const questionData = ref<newsType[]>([]) // 常见问题
const policyData = ref<newsType[]>([]) // 政策文件

// 获取数据
const getHomeDatas = () => {
  getHomeNoticeList().then(async (res: any) => {
    if (!res) return
    let pictures = res.picture || []
    for (let i = 0; i < pictures.length; i++) {
      pictures[i].pictureUrl = await getMinioFileUrl(pictures[i].pictureUrl)
    }
    pictureData.value = pictures
    noticeData.value = res.notice || []
    briefingData.value = res.briefing || []
    questionData.value = res.problem || []
    policyData.value = res.policy || []
  })
}

// 技术交流列表
const getTechnical = () => {
  technicalPages({
    current: 1,
    size: 5
  }).then((res: any) => {
    technicalData.value = res.records || []
  })
}

// 轮播
// const bannerIndex = ref<number>(0)
// const changeBanner = (current: number) => {
//   bannerIndex.value = current
// }
// const myCarousel = ref()
// const clickInd = (ind: number) => {
//   bannerIndex.value = ind
//   myCarousel.value.goTo(ind)
// }

// 等级试验检测机构分布
const unitDatas = ref([
  { name: "公路工程-甲级", num: 0 },
  { name: "公路工程-桥梁隧道工程专项", num: 0 },
  { name: "公路工程-交通工程专项", num: 0 },
  { name: "公路工程-乙级", num: 0 },
  { name: "公路工程-丙级", num: 0 },
  { name: "水运工程-结构甲级", num: 0 },
  { name: "水运工程-结构乙级", num: 0 },
  { name: "水运工程-材料甲级", num: 0 },
  { name: "水运工程-材料乙级", num: 0 },
  { name: "水运工程-材料丙级", num: 0 },
  { name: "等级证书总数", num: 0 }
])
const mapDatas = ref([])
const getMapDatas = () => {
  const unitObj = {}
  mapDistribution().then((res: any) => {
    mapDatas.value = res || []
    if (res.length === 0) return
    for (let i = 0; i < res.length; i++) {
      const datas = res[i].qualifications
      if (!datas || datas.length === 0) continue
      for (let j = 0; j < datas.length; j++) {
        const d = datas[j]
        if (!unitObj[d.name]) {
          unitObj[d.name] = d.number
        } else {
          unitObj[d.name] += d.number
        }
      }
    }
    let total = 0
    for (let i = 0; i < unitDatas.value.length; i++) {
      const item = unitDatas.value[i]
      if (unitObj[item.name]) {
        item.num = unitObj[item.name]
        total += unitObj[item.name]
      }
    }
    unitDatas.value[unitDatas.value.length - 1].num = total
  })
}
</script>

<style scoped lang="less">
.page-wrap {
  margin-top: 12px;
  display: flex;
  justify-content: space-between;

  .no-data {
    display: block;
    color: #999;
    text-align: center;
    line-height: 100px;
  }

  .banner {
    width: 680px;
    border: 1px solid #eee;
    position: relative;
    border-radius: 4px;
    overflow: hidden;
    background: #fff;

    .ant-carousel,
    .ant-image {
      height: 330px;
    }

    .banner-item {
      img {
        width: 100%;
        height: 100%;
      }
    }

    .banner-indicator {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      display: flex;
      padding: 0 10px;
      align-items: center;
      height: 48px;
      background: linear-gradient(#0000003f 10%, #000000cc 80%);

      .font-1 {
        flex: 1;
        margin-right: 10px;
        color: #fff;
      }

      .indicator {
        display: flex;

        .item {
          margin-left: 3px;
          width: 16px;
          height: 16px;
          line-height: 16px;
          background: rgba(0, 0, 0, 0.5);
          color: #fff;
          border-radius: 2px;
          font-size: 12px;
          text-align: center;
          cursor: pointer;
        }

        .item.active {
          background: #ff9a2e;
        }
      }
    }
  }
}

.notice-box {
  flex: 1;
  width: 0;
  height: 330px;

  .top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 15px;
    height: 48px;
    font-weight: 700;
    background-color: #edf4fc;
    color: @theme_color;
  }

  .title {
    font-size: 18px;
  }

  .more:hover {
    color: @theme_color_hover;
  }

  .notice-list {
    padding: 15px;
    background-color: #fff;

    .notice-item {
      display: flex;

      &:not(:first-child) {
        margin-top: 15px;
      }

      &:hover {
        color: @theme_color_hover;
      }

      .top-tip {
        display: inline-block;
        margin-top: 3px;
        width: 16px;
        height: 16px;
        text-align: center;
        line-height: 16px;
        border-radius: 2px;
        color: #fff;
        background-color: @error_color;
        font-size: 12px;
        vertical-align: middle;
      }

      .top-dot {
        display: inline-block;
        width: 16px;
        height: 16px;
        text-align: center;
        vertical-align: middle;
      }

      .top-dot::before {
        margin-left: 8px;
        margin-top: 8px;
        width: 4px;
        height: 4px;
        border-radius: 4px;
        background-color: @theme_color;
        content: "";
        display: block;
      }

      .content {
        flex: 1;
        margin: 0 6px;
      }

      .time {
        font-size: 12px;
        color: @text3_color;
        line-height: 20px;
      }
    }
  }
}

.important-info {
  padding: 5px 17px;
  font-size: 16px;
  background: #edf4fc;
  border-radius: 4px;
  align-items: center;

  .title {
    width: 100px;
    text-align: center;
    background-color: @theme_color;
  }

  .con {
    flex: 1;
    padding-left: 20px;
    width: 0;

    .item-info {
      display: block;
      line-height: 28px;

      &:hover {
        color: @theme_color_hover;
      }

      &::before {
        content: "";
        display: inline-block;
        margin-right: 8px;
        width: 3px;
        height: 3px;
        background: #333;
        border-radius: 5px;
        vertical-align: middle;
      }
    }
  }
}

.test-unit-mode {
  align-items: initial;

  .test-unit {
    flex: 1;
    margin-right: 10px;

    .test-unit-con {
      display: flex;
      height: calc(100% - 48px);
      color: @theme_color;
      overflow: hidden;

      .unit-table {
        margin: 20px 16px;
        width: 260px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .row {
          display: flex;
          height: 34px;
          align-items: center;
        }

        .row:hover {
          background-color: @theme_color;
          color: #fff;
          border-radius: 4px;

          .line {
            background: #fff;
          }
        }

        .col {
          flex: 1;
          padding: 0 8px 0 12px;
        }

        .line {
          height: 10px;
          width: 1px;
          background: @theme_color;
        }

        .num {
          flex: initial;
          width: 40px;
        }
      }

      .map-box {
        flex: 1;
        height: 100%;
      }
    }
  }

  .industry-serve {
    width: 300px;
  }

  .title {
    padding-left: 15px;
    background-color: #edf4fc;
    line-height: 48px;
    color: @theme_color;
    font-size: 18px;
    font-weight: 700;
  }
}

.ml {
  margin-left: 5px;
}
</style>
