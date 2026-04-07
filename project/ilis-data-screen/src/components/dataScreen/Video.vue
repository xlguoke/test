<template>
  <div :class="`video-warp ${isBroadBeam ? 'video-warp-lone' : 'video-warp-normal'}`">
    <div class="show-video">
      <p class="border"></p>

      <div class="show-video-main">
        <WvpLiveVideo v-if="!companyVideoVisible" :data="mainVideoData" is-play />
        <video
          v-if="companyVideoVisible"
          id="companyVideoEle"
          :key="companyVideoUrl"
          loop
          :controls="true"
          style="width: 100%; height: 100%"
        >
          <source :src="companyVideoUrl" type="video/mp4" />
        </video>
      </div>

      <div id="video-scroll" class="videos">
        <a-popover
          v-if="companyVideoList.length > 1"
          placement="bottomLeft"
          overlay-class-name="video-list-popover"
        >
          <template #content>
            <ul class="video-list-popover-ul">
              <li
                v-for="(cItem, cIndex) in companyVideoList"
                :key="cIndex"
                @click="onCheckCompanyVideo(cItem)"
              >
                <span class="font-2">{{ `宣传视频${cIndex + 1}` }}</span>
              </li>
            </ul>
          </template>
          <div :class="`video-company video-lab-item ${companyVideoVisible ? 'active' : ''}`">
            <div class="icon-camera"></div>
            宣传视频
          </div>
        </a-popover>
        <div
          v-else
          :class="`video-company video-lab-item ${companyVideoVisible ? 'active' : ''}`"
          @click="onCheckCompanyVideo()"
        >
          <div class="icon-camera"></div>
          宣传视频
        </div>

        <ul :class="`video-list scroll-box ${moveVideo ? 'start-move' : ''}`">
          <template v-for="item in showLabs" :key="item.id">
            <a-popover
              v-if="item.labConfigs.length > 1"
              :key="item.id"
              placement="bottomLeft"
              overlay-class-name="video-list-popover"
            >
              <template #content>
                <ul class="video-list-popover-ul">
                  <li
                    v-for="item2 in item.labConfigs"
                    :key="item2.id"
                    @click="onSelectVideo(item, item2)"
                  >
                    <span class="font-2" :title="item2.equName">{{ item2.equName }}</span>
                  </li>
                </ul>
              </template>
              <li
                :key="item.id"
                class="item video-lab-item"
                :class="{
                  active: mainLabId == item.id
                }"
              >
                <span class="font-2" :title="item.name">{{ item.name }}</span>
              </li>
            </a-popover>

            <li
              v-else
              class="item video-lab-item"
              :class="{
                active: mainLabId == item.id
              }"
              @click="onSelectVideo(item)"
            >
              <span class="font-2" :title="item.name">{{ item.name }}</span>
            </li>
          </template>
          <div v-if="labs.length === 0" class="no-lab-data">暂无功能室信息</div>
        </ul>
        <div
          v-if="labs.length >= (companyVideoUrl ? 9 : 10)"
          class="video-more video-lab-item"
          :class="{ active: moreVisible }"
          @click="moreVisible = !moreVisible"
        >
          选择更多
          <div class="icon-more-svg"></div>
        </div>
      </div>

      <div v-if="moreVisible" :class="`all-more-layer ${labs.length > 7 ? 'multiple' : ''}`">
        <template v-for="item in labs" :key="item.id">
          <a-popover
            v-if="item.labConfigs.length > 1"
            :key="item.id"
            placement="bottomLeft"
            overlay-class-name="video-list-popover"
          >
            <template #content>
              <ul class="video-list-popover-ul">
                <li
                  v-for="item2 in item.labConfigs"
                  :key="item2.id"
                  @click="onSelectVideo(item, item2)"
                >
                  <span class="font-2" :title="item2.equName">{{ item2.equName }}</span>
                </li>
              </ul>
            </template>
            <div
              :key="item.id"
              class="all-more-layer-item"
              :class="{
                active: mainLabId == item.id
              }"
            >
              <span class="font-2" :title="item.name">{{ item.name }}</span>
            </div>
          </a-popover>

          <div
            v-else
            class="all-more-layer-item"
            :class="{
              active: mainLabId == item.id
            }"
            @click="onSelectVideo(item)"
          >
            <span class="font-2" :title="item.name">{{ item.name }}</span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { getCompanyVideo, getLabList } from "@/api/dataScreen.api"
import WvpLiveVideo from "@/components/WvpLiveVideo.vue"
import { computed } from "vue"
import { ref } from "vue"
import { Popover as APopover } from "ant-design-vue"
import { onMounted } from "vue"
import { nextTick } from "vue"

const props = defineProps<{
  isBroadBeam: boolean
}>()

// 获取直播摄像头配置列表
const labs = ref<any>([])
const videoDatas = ref<any>([])
const mainVideoId = ref("")
const mainVideoData = ref({})
const mainLabId = ref("")
const moveVideo = ref(false)
const moreVisible = ref(false)
const companyVideoUrl = ref("")
const companyVideoList = ref<{ url: string }[]>([])
const companyVideoVisible = ref(false)
const showLabs = computed(() => {
  const n = companyVideoUrl.value ? 5 : 6
  return props.isBroadBeam ? labs.value : labs.value.slice(0, n)
})

const onSelectVideo = (labItem, videoItem?) => {
  const vItem = videoItem || labItem.labConfigs[0]
  mainLabId.value = labItem.id
  mainVideoId.value = vItem.id
  mainVideoData.value = vItem
  moreVisible.value = false
  companyVideoVisible.value = false
}

// 获取公司宣传视频
const getCompanyVideoUrl = async () => {
  const res: any = await getCompanyVideo()
  const _embedded = res._embedded
  const video = _embedded["publicity-video"]

  companyVideoList.value = video
  if (video && video.length > 0) {
    companyVideoUrl.value = video[0].url
  }
}

// 播放公司宣传视频
const onCheckCompanyVideo = (cItem?) => {
  if (cItem) {
    companyVideoUrl.value = cItem.url
  } else {
    companyVideoUrl.value = companyVideoList.value[0].url || ""
  }

  companyVideoVisible.value = true
  mainLabId.value = ""
  mainVideoId.value = ""
  mainVideoData.value = {}
  setTimeout(() => {
    const companyVideoEle = document.getElementById("companyVideoEle") as any
    companyVideoEle && companyVideoEle.play()
  }, 300)
}

const getLiveVideoDatas = () => {
  getLabList().then((res) => {
    if (res.code != 20000) return
    const list: any = res.data || []
    const videos: any = []
    for (let i = 0; i < list.length; i++) {
      videos.push(...list[i].labConfigs)
    }
    labs.value = list.filter((i) => i.labConfigs.length > 0)
    videoDatas.value = videos
    mainVideoId.value = videos[0]?.id
    mainVideoData.value = videos[0] || {}
    mainLabId.value = list[0]?.id
  })
}

onMounted(() => {
  nextTick(() => {
    getCompanyVideoUrl()
    getLiveVideoDatas()
  })
})

defineExpose({
  getData: getCompanyVideoUrl
})
</script>
<style>
.video-list-popover {
  width: 2.5rem;

  .ant-popover-arrow {
    background: url("../../assets/images/dataScreen/tip-s.png") no-repeat;
    background-position: 100% 100%;
    width: 12px;
    height: 8px;
    top: 1px;
  }

  .ant-popover-arrow::after,
  .ant-popover-arrow::before {
    display: none;
  }

  .ant-popover-inner {
    background: #031335;
    border-radius: 0;
    padding: 0;
    border: 1px solid rgba(0, 102, 236, 0.5);
  }

  .ant-popover-inner-content {
    color: #fff;
  }
}

.video-list-popover-ul {
  padding: 8px 0;
  margin-bottom: 0;

  li {
    min-height: 0.32rem;
    padding: 0.08rem 0.12rem;
    font-size: 0.14rem;
    display: flex;
    align-items: center;

    &:hover {
      background: linear-gradient(270deg, rgba(28, 170, 255, 0) 0%, #0055c5 100%);
    }
  }
}
</style>
<style lang="less" scoped>
ul,
p {
  margin-bottom: 0;
}

.top-border(@color) {
  position: relative;
  &::before {
    content: "";
    position: absolute;
    left: -1px;
    top: -1px;
    width: 0.12rem;
    height: 0.12rem;
    border-top: 2px solid @color;
    border-left: 2px solid @color;
  }
  &::after {
    content: "";
    position: absolute;
    right: -1px;
    top: -1px;
    width: 0.12rem;
    height: 0.12rem;
    border-top: 2px solid @color;
    border-right: 2px solid @color;
  }
}
.bottom-border(@color) {
  position: relative;
  &::before {
    content: "";
    position: absolute;
    left: -1px;
    bottom: -1px;
    width: 0.12rem;
    height: 0.12rem;
    border-bottom: 2px solid @color;
    border-left: 2px solid @color;
  }
  &::after {
    content: "";
    position: absolute;
    right: -1px;
    bottom: -1px;
    width: 0.12rem;
    height: 0.12rem;
    border-bottom: 2px solid @color;
    border-right: 2px solid @color;
  }
}

.all-more-layer {
  position: absolute;
  top: 0.8rem;
  right: 2.8rem;
  bottom: 0.16rem;
  left: 4.4rem;
  background: rgba(3, 19, 53, 0.8);
  z-index: 99;
  border: 1px solid rgba(0, 102, 236, 0.5);
  padding: 0.18rem;
  overflow-y: auto;
  &.multiple {
    left: 2.4rem;
  }

  .all-more-layer-item {
    width: 1.6rem;
    height: 0.48rem;
    display: flex;
    align-items: center;
    font-size: 0.14rem;
    padding: 0 0.12rem;
    margin-right: 0.08rem;
    margin-bottom: 0.16rem;
    float: left;
    border: solid 1px transparent;

    &:hover,
    &.active {
      background: linear-gradient(180deg, rgba(28, 170, 255, 0.4) 0%, rgba(0, 85, 197, 0.4) 100%);
      border: 1px solid #0d98fd;
    }
  }
}

.video-warp {
  flex: 1;
  height: 0;
  display: flex;
  .show-video {
    flex: 1;
    height: 100%;
    position: relative;
    border: 1px solid #05234a;
    display: flex;
    align-items: center;
    padding: 0.16rem;
    box-sizing: border-box;

    .top-border(#128cff);
    .border {
      margin-bottom: 0;
      .bottom-border(#128cff);
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      border: 0;
    }

    .show-video-main {
      flex: 1;
      overflow: hidden;
      height: 100%;
    }
  }

  .video-company {
    &:hover,
    &.active {
      background: linear-gradient(270deg, rgba(28, 170, 255, 0) 0%, #0055c5 100%) !important;
      border-image: linear-gradient(270deg, rgba(1, 159, 254, 0) 0%, #019ffe 100%) 1 !important;
      color: #fff !important;
      .icon-camera {
        background: url("@/assets/images/dataScreen/camera-g.svg") center/100% 100%;
      }
    }

    .icon-camera {
      margin-right: 0.04rem;
      background: url("@/assets/images/dataScreen/camera.svg") center/100% 100%;
    }
  }

  // 长屏
  &.video-warp-lone {
    .no-lab-data {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(0, 102, 236, 0.1);
      font-size: 0.14rem;
      color: #0055c5;
    }
    .videos {
      margin-left: 0.1rem;
      width: 2.5rem;
      height: 100%;
      overflow: hidden;
      display: flex;
      flex-direction: column;

      .start-move {
        transition: 0.5s ease-in;
        transform: translateY(-1.99rem);
      }
      .video-company {
        height: 0.62rem;
        display: flex;
        align-items: center;
        font-size: 0.14rem;
        color: #0d98fd;
        margin-bottom: 2px;
        background: rgba(0, 102, 236, 0.1);
        border: 1px solid transparent;
        border-right: 0;
        box-sizing: border-box;
        position: relative;
        &::before {
          content: "";
          position: absolute;
          background: linear-gradient(
            270deg,
            rgba(0, 102, 236, 0) 0%,
            #0066ec 52%,
            rgba(0, 102, 236, 0) 100%
          );
          top: 0;
          left: 0;
          width: 100%;
          height: 2px;
        }
        .icon-camera {
          margin-left: 0.14rem;
          width: 0.26rem;
          height: 0.26rem;
        }
      }
      .video-more {
        height: 0.52rem;
        padding: 0 0.14rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border: 1px solid transparent;
        font-size: 0.14rem;
        background: rgba(0, 102, 236, 0.1);
        color: #0d98fd;
        margin-top: 2px;

        &:hover,
        &.active {
          background: linear-gradient(270deg, rgba(28, 170, 255, 0) 0%, #0055c5 100%);
          border: 1px solid;
          border-image: linear-gradient(270deg, rgba(1, 159, 254, 0) 0%, #019ffe 100%) 1;
          color: #fff;
          .icon-more-svg {
            background: url("@/assets/images/dataScreen/more-g.svg") center/100% 100%;
          }
        }
        .icon-more-svg {
          width: 0.24rem;
          height: 0.24rem;
          background: url("@/assets/images/dataScreen/more.svg") center/100% 100%;
        }
      }
      .video-list {
        flex: 1;
        overflow-y: auto;

        .item {
          height: 0.52rem;
          padding: 0 0.14rem;
          display: flex;
          align-items: center;
          border: 1px solid transparent;
          font-size: 0.14rem;
          background: rgba(0, 102, 236, 0.1);
          color: #0d98fd;

          &:hover,
          &.active {
            background: linear-gradient(270deg, rgba(28, 170, 255, 0) 0%, #0055c5 100%);
            border: 1px solid;
            border-image: linear-gradient(270deg, rgba(1, 159, 254, 0) 0%, #019ffe 100%) 1;
            border-right: 0;
            color: #fff;
          }
        }
      }
    }
  }

  // 短屏
  &.video-warp-normal {
    .no-lab-data {
      width: 100%;
      text-align: center;
      line-height: 0.44rem;
      background: rgba(0, 102, 236, 0.1);
      color: #0055c5;
    }
    .show-video {
      display: block;
    }
    .show-video-main {
      margin-top: 0.52rem;
      height: calc(100% - 0.52rem);
    }
    .videos {
      position: absolute;
      left: 0.16rem;
      top: 0.16rem;
      right: 0.16rem;
      display: flex;
      height: 0.44rem;
      line-height: 0.44rem;
      font-size: 0.14rem;
      white-space: nowrap;
      .video-list {
        flex: 1;
        width: 0;
        overflow: hidden;
        display: flex;
        margin-bottom: 0;

        .video-lab-item {
          flex: 1;
          width: 0;
          &:last-child {
            margin-right: 0;
          }
          span {
            display: block;
          }
        }
      }
      .video-lab-item {
        padding: 0 0.12rem;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        margin-right: 0.08rem;
        text-align: center;
        background: rgba(0, 102, 236, 0.1);
        user-select: none;
        cursor: pointer;
        color: #0d98fd;
        border: 1px solid transparent;
        border-right: 0;

        &:hover,
        &.active {
          border-image: linear-gradient(270deg, rgba(1, 159, 254, 0) 0%, #019ffe 100%) 1;
          background: linear-gradient(
            to right,
            rgba(18, 141, 255, 0.7) 0,
            rgba(0, 102, 236, 0.1) 100%
          );
          color: #fff;
        }
      }
      .video-company {
        .icon-camera {
          width: 0.24rem;
          height: 0.24rem;
        }
      }
      .video-more {
        margin-left: 0.08rem;
        margin-right: 0;
        .icon-more-svg {
          width: 0.2rem;
          height: 0.2rem;
          margin-right: 0;
          margin-left: 0.06rem;
          background: url("@/assets/images/dataScreen/more.svg") center/100% 100%;
        }
        &:hover,
        &.active {
          .icon-more-svg {
            background: url("@/assets/images/dataScreen/more-g.svg") center/100% 100%;
          }
        }
      }
    }
    .all-more-layer {
      top: 0.7rem;
      right: 0.08rem;
      bottom: 0.44rem;
      width: 2rem;
      left: initial;
      &.multiple {
        width: 4rem;
      }
    }
  }
}
</style>
