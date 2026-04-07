<template>
  <div class="laboratory-info flex-column">
    <div class="indoor-temp-box">
      <div class="indoor-temp">
        <img class="icon" src="@/assets/images/t.png" alt="温度" />
        <ul class="temp-num">
          <li class="name">温度</li>
          <li class="count">
            <span v-if="labInfo.showReallyTH">
              {{ labInfo.temperature ? `${labInfo.temperature}℃` : "" }}
            </span>
            <span v-else-if="labInfo.maxTemperature && labInfo.minTemperature">
              {{ labInfo.minTemperature }}-{{ labInfo.maxTemperature }}℃
            </span>
          </li>
        </ul>
      </div>
      <div class="indoor-temp">
        <img class="icon" src="@/assets/images/humidity.png" alt="湿度" />
        <ul class="temp-num">
          <li class="name">湿度</li>
          <li class="count">
            <span v-if="labInfo.showReallyTH">
              {{ labInfo.humidity ? `${labInfo.humidity}%RH` : "" }}
            </span>
            <span v-else-if="labInfo.maxHumidity && labInfo.minHumidity">
              {{ labInfo.minHumidity }}-{{ labInfo.maxHumidity }}%RH
            </span>
          </li>
        </ul>
      </div>
    </div>
    <p v-if="showStatus" class="test-status font-ys">{{ labInfo.status }}...</p>
    <!-- 人员信息 -->
    <div :class="`test-person-photo ${size === 'small' ? 'small' : ''}`">
      <van-swipe
        class="my-swipe"
        :autoplay="screenConfig.frequencyCarousel * 1000 || 5000"
        indicator-color="white"
      >
        <van-swipe-item v-for="(d, i) in labInfo.iconUrl" :key="i">
          <img :src="d" alt="" />
        </van-swipe-item>
      </van-swipe>
    </div>

    <template v-if="!showStatus || labInfo.status == '空闲中'">
      <p class="test-person-name font-ys">负责人：{{ labInfo.labDutyPerson || "--" }}</p>
      <!-- 查看更多 -->
      <div v-if="showMore && persons.length > 0" class="show-more-box">
        <p class="show-more" @click="showMorePersonnel">
          <span class="text">查看更多</span>
          <van-icon name="arrow-double-right" />
        </p>
      </div>
      <!-- 功能室简介 -->
      <template v-if="showLabIntro">
        <p class="test-type-title">功能室简介</p>
        <ul v-if="labInfo.overview" class="test-types">
          <li v-for="(d, i) in overviews" :key="i">{{ d }}</li>
        </ul>
        <p v-else style="text-align: center; margin: 0.3rem 0; font-size: 0.4rem">暂无信息</p>
      </template>
    </template>
    <template v-else>
      <p class="test-person-name">试验室工程师：{{ labInfo.testUser || "--" }}</p>
      <div class="task-detail">
        <ul v-for="d in labInfo.testTaskRecord" :key="d.id">
          <li class="item">任务编号：{{ d.testTaskCode }}</li>
          <li class="item">试验内容：{{ d.testTaskParamName }}</li>
          <li class="item">开始时间：{{ d.createDate }}</li>
        </ul>
      </div>
    </template>

    <MorePersonnel ref="morePersonnel" :datas="persons" />
  </div>
</template>

<script setup lang="ts">
import { ref, toRefs, computed } from "vue"
import type { LabInfoDTO } from "@/types/functionRoom"
import MorePersonnel from "./MorePersonnel.vue"
import { useStore } from "@/store"
const { screenConfig } = useStore()

interface Props {
  labInfo: LabInfoDTO
  showStatus?: boolean
  showMore?: boolean
  showLabIntro?: boolean
  size?: "default" | "small"
}
const props = defineProps<Props>()
const { labInfo, showStatus, showMore, showLabIntro, size } = toRefs(props)

const overviews = computed(() => {
  const val = labInfo.value.overview
  return val ? val.split("\n") : []
})

const persons = computed(() => {
  const val = labInfo.value.otherLiabilityPersons || ""
  return val ? val.split("\n") : []
})

const morePersonnel = ref()
function showMorePersonnel() {
  morePersonnel.value.openModal()
}
</script>
<style scoped lang="less">
.laboratory-info {
  margin-top: 0.4rem;
  font-size: 0.24rem;
  overflow-y: auto;

  .indoor-temp-box + .test-person-photo {
    margin-top: 0.5rem;
  }

  .indoor-temp {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 50%;

    .icon {
      width: 0.6rem;
    }

    .temp-num {
      margin-left: 0.2rem;

      .name {
        width: 0.81rem;
        line-height: 0.42rem;
        text-align: center;
        background: linear-gradient(180deg, #18e8ff 0%, #1890ff 100%);
        border-radius: 0.35rem;
      }

      .count {
        margin-top: 0.1rem;
        font-size: 0.48rem;
      }
    }
  }

  .test-status {
    margin: 0.3rem 0;
    color: #ffac20;
    font-size: 0.36rem;
    text-align: center;
  }

  .test-person-photo {
    margin: 0 auto;
    padding: 0.2rem;
    width: 3.6rem;
    height: 3.6rem;
    min-height: 3.6rem;
    overflow: hidden;
    white-space: nowrap;
    background-image: url(@/assets/images/photo.png);
    background-size: 100% 100%;
    &.small {
      width: 2.9rem;
      height: 2.9rem;
      min-height: 2.9rem;
    }

    .my-swipe {
      height: 100%;
    }

    img {
      position: relative;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .show-more-box {
    margin-bottom: 0.3rem;
    text-align: center;
    .show-more {
      .text {
        background: linear-gradient(180deg, #5befff 0%, #319bff 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      font-weight: bold;
      color: #319bff;
    }
  }

  .test-type-title {
    font-size: 0.34rem;
  }

  .test-person-name {
    margin-top: 0.2rem;
    margin-bottom: 0.3rem;
    font-size: 0.36rem;
  }

  .test-person-name,
  .test-type-title {
    text-align: center;
  }

  .test-types {
    margin-top: 0.2rem;
    padding: 0 0.2rem;
    font-size: 0.24rem;
    line-height: 0.45rem;
  }

  .task-detail {
    padding-left: 25%;
    margin-right: 2%;
    margin-top: 0.3rem;
    line-height: 0.4rem;
    ul {
      margin-bottom: 0.2rem;
    }
  }
}
</style>
