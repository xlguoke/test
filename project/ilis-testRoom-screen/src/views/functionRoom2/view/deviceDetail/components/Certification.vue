<template>
  <van-skeleton :row="5" class="line" :loading="loading" style="padding-top: 0.24rem">
    <div v-if="certificationList?.length" class="device-certification">
      <van-tabs v-model:active="activeName" shrink swipeable>
        <van-tab
          v-for="item in certificationList"
          :key="item.id"
          :name="item.url"
          :title="item.name"
        >
          <template #title>
            <CommonButton :type="activeName === item.url ? 'primary' : undefined">
              {{ item.name }}
            </CommonButton>
          </template>
          <div class="full">
            <img src="@/assets/images/functionRoom2/full.svg" @click="handleOpen()" />
          </div>
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
      <van-popup
        v-model:show="showCenter"
        round
        :style="{ width: '100%', height: '90%' }"
        closeable
      >
        <div class="title"></div>
        <PreView v-if="activeName && showCenter" :data="{ url: activeName }"></PreView>
      </van-popup>
    </div>
    <van-empty v-else description="暂无数据" :image="emptyImage" />
  </van-skeleton>
</template>

<script lang="ts" setup>
import { ref, watch } from "vue"
import { showImagePreview } from "vant"
import { getDeviceCertification } from "@/api/deviceSmallScreen.api"
import { CertificationEntity } from "@/views/deviceSmallScreen/checkDetail/CertificationEntity"
import CommonButton from "@/views/functionRoom2/components/CommonButton.vue"
import PreView from "./PreView.vue"
import emptyImage from "@/assets/images/functionRoom2/empty.svg"

const props = defineProps<{
  id: string
}>()

const certificationList = ref([] as CertificationEntity[])

const isDev = process.env.NODE_ENV === "development"

const imageRef = ref()

const activeName = ref("")

const showCenter = ref(false)

const loading = ref(false)

watch(
  () => props.id,
  () => {
    getList()
  }
)

async function getList() {
  if (!props.id) return
  loading.value = true
  const { data, code } = await getDeviceCertification(props.id).finally(() => {
    loading.value = false
  })
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

function handleOpen() {
  if (activeName.value.endsWith(".pdf")) {
    showCenter.value = true
  } else if (isImage(activeName.value)) {
    showPreview(activeName.value)
  } else {
    window.open(activeName.value)
  }
}

function isImage(url: string) {
  return (
    url.endsWith(".png") || url.endsWith(".jpeg") || url.endsWith(".jpg") || url.endsWith(".svg")
  )
}
</script>

<style lang="less" scoped>
@nav-height: 0.74rem;
:deep(.van-tab) {
  font-size: 0.28rem !important;
  line-height: 0.36rem !important;
  color: #224059;
}
:deep(.van-tabs--line .van-tabs__wrap) {
  height: @nav-height!important;
}
:deep(.van-tabs__nav) {
  background-color: transparent !important;
}
:deep(.van-tabs--line) {
  height: 100% !important;
}
:deep(.van-tabs__line) {
  // background: #0066ec !important;
  // min-width: 0.4rem !important;
  display: none;
}
:deep(.van-tab--shrink) {
  padding: unset !important;
  margin-right: 24px;
  // margin-right: 1rem !important;
}
:deep(.van-tabs__content) {
  height: calc(100% - @nav-height) !important;
}
:deep(.van-tab__panel) {
  height: 100% !important;
}
.device-certification {
  height: 100%;
}
.image-iframe {
  width: 100%;
  object-fit: contain;
}
.full {
  display: flex;
  justify-content: flex-end;
  padding: 24px 10px;
  img {
    width: 33px;
    height: 33px;
  }
}
</style>
