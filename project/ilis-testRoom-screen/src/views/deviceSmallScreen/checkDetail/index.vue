<template>
  <div class="checkDetail">
    <NavBar name="校检详情" />
    <div class="content">
      <van-tabs v-model:active="activeName" shrink swipeable>
        <van-tab
          v-for="item in certificationList"
          :key="item.id"
          :name="item.url"
          :title="item.name"
        >
          <!-- <div v-show="activeName === item.url" class="container"> -->
          <iframe
            v-if="item.url?.endsWith('.pdf')"
            width="100%"
            height="100%"
            :src="
              item.url?.endsWith('.pdf') ? `./pdfjs/web/viewer.html?file=${item.url}` : item.url
            "
            frameborder="0"
          />
          <img
            v-else
            ref="imageRef"
            class="image-iframe"
            :src="item.url"
            @click="showPreview(item.url)"
          />
          <!-- </div> -->
        </van-tab>
      </van-tabs>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from "vue-router"
import { ref } from "vue"
import { showImagePreview } from "vant"
import NavBar from "../component/NavBar.vue"
import type { CertificationEntity } from "./CertificationEntity"
import { getDeviceCertification } from "@/api/deviceSmallScreen.api"

const { id } = useRoute().query as { id: string }

const certificationList = ref([] as CertificationEntity[])

const isDev = process.env.NODE_ENV === "development"

const imageRef = ref()

const activeName = ref("")
async function getList() {
  const { data, code } = await getDeviceCertification(id)
  if (code === 20000) {
    certificationList.value = data as CertificationEntity[]
    activeName.value = data?.[0]?.url
  }
}

getList()

function showPreview(url: string) {
  const images = certificationList.value
    .filter((item) => !item.url?.endsWith(".pdf"))
    ?.map((item) => item.url)
  const startPosition = images.findIndex((img) => img === url)
  showImagePreview({
    images: images,
    startPosition,
    vertical: true
  })
}
</script>

<style lang="less" scoped>
.checkDetail {
  height: 100%;
  overflow-y: auto;
  padding: 20px 20px;
  display: flex;
  flex-direction: column;
  .content {
    flex: 1;
    height: calc(100% - 100px);
    padding: 0 20px;
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
    height: 100%;
    .van-tab__panel,
    .container {
      width: 100%;
      height: 100%;
      position: relative;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      overflow: hidden;
      img {
        width: 100%;
        height: 100%;
        object-fit: contain;
      }
    }
  }
}
</style>
