<template>
  <Container title="功能室简介" @click="router.push({ path: '/functionRoom2/detail' })">
    <div class="intro">
      {{ overviews }}
    </div>
    <div style="text-align: right">查看详情></div>
  </Container>
</template>
<script lang="ts" setup>
import { useRouter } from "vue-router"
import Container from "../../../components/Container.vue"
import { computed } from "vue"
import { functionRoom2Store } from "@/store/functionRoom2"
import { storeToRefs } from "pinia"

const router = useRouter()

const { labData } = storeToRefs(functionRoom2Store())

const overviews = computed(() => {
  const val = labData.value?.info.overview
  return val?.split("\n")?.join("。")
})
</script>

<style lang="less" scoped>
.intro {
  line-height: 0.45rem;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-colamp: 2;
  overflow: hidden;
  word-wrap: break-word;
}
</style>
