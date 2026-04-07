<template>
  <div class="workingManual">
    <NavBar name="操作指南"></NavBar>
    <div class="content">
      <van-tabs shrink>
        <van-tab title="视频">
          <VideoList :data="videoList"></VideoList>
        </van-tab>
        <van-tab title="文件">
          <FIleList :data="fileList"></FIleList>
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue"
import NavBar from "../component/NavBar.vue"
import FIleList from "./component/FIleList.vue"
import VideoList from "./component/VideoList.vue"
import { getDeviceManual } from "@/api/deviceSmallScreen.api"
import { useRoute } from "vue-router"
import { ManualEntity } from "./ManualEntity"

const { id } = useRoute().query as { id: string }

const videoList = ref([] as ManualEntity[])
const fileList = ref([] as ManualEntity[])

async function getManual() {
  const { data, code } = (await getDeviceManual(id)) as { data: ManualEntity[]; code: number }
  if (code === 20000) {
    // 根据url字段以.mp4结尾 拆分为视频和文件
    data.forEach((item) => {
      if (item.url.endsWith(".mp4") || item.url.endsWith(".asf")) {
        videoList.value.push(item)
      } else {
        fileList.value.push(item)
      }
    })
  }
}

getManual()
</script>

<style lang="less" scoped>
.workingManual {
  height: 100%;
  overflow-y: auto;
  padding: 20px 40px;
  .content {
    padding: 0 10%;
    margin-top: 50px;
  }
}
:deep(.van-tabs) {
  height: 100%;
  display: flex;
  flex-direction: column;
  .van-tab--line {
    margin-right: 120px;
  }

  .van-tabs__content {
    flex: 1;
    .van-tab__panel,
    .container {
      height: 100%;
    }
  }
}
:deep(.van-tabs__line) {
  height: 4px !important;
}
</style>
