<template>
  <div class="main">
    <Container>
      <div class="title">功能室简介</div>
      <div class="info">
        <div v-for="(item, index) in overviews" :key="index" class="info-item break-words">
          {{ item }}
        </div>
      </div>
    </Container>
    <UserCard
      v-for="item in labInfo.biddingPersons"
      :key="item.biddingPersonId"
      :data="item"
    ></UserCard>
  </div>
</template>
<script lang="ts" setup>
import Container from "../../components/Container.vue"
import UserCard from "./components/UserCard.vue"
import { computed } from "vue"
import { functionRoom2Store } from "@/store/functionRoom2"
import { storeToRefs } from "pinia"

const { labData } = storeToRefs(functionRoom2Store())
const labInfo = computed(() => labData.value?.info || {})

const overviews = computed(() => {
  const val = labInfo.value?.overview
  return val?.split("\n") || []
})
</script>
<style lang="less" scoped>
.title {
  font-size: 0.36rem;
  font-weight: 700;
  margin-bottom: 0.4rem;
  text-align: center;
}
.info {
  line-height: 0.45rem;
  .info-item {
    text-indent: 40px;
  }
}
</style>
