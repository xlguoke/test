<template>
  <div>
    <van-overlay :show="loading" />

    <HomeMedicineRoom hidden-title />

    <CommonSearch placeholder="请输入药品名称、药品编号查询" @search="onSearch" />

    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="getList"
    >
      <Container v-for="d in dataList" :key="d.id" class="detail-data-list">
        <div class="sample-name w-full mb-[0.12rem]">
          <span>{{ d.name }}</span>
          <span v-if="d.sn" class="break-words">（{{ d.sn }}）</span>
        </div>
        <CommonLine label="用途：" :value="d.effect" align="left" label-width="1.2rem" />
        <CommonLine label="纯度：" :value="d.purity" align="left" label-width="1.5rem" />
        <CommonLine label="规格型号：" :value="d.specification" align="left" label-width="1.2rem" />
        <CommonLine label="计量单位：" :value="d.unit" align="left" label-width="1.5rem" />
        <CommonLine label="管理级别：" :value="d.manageLevel" align="left" label-width="1.2rem" />
        <CommonLine label="所属类别：" :value="d.chemicalType" align="left" label-width="1.5rem" />
        <CommonLine label="预警数量：" :value="d.warningAmount" align="left" label-width="1.2rem" />
        <CommonLine label="可支配库存：" :value="d.amount" align="left" label-width="1.5rem" />
      </Container>
    </van-list>
  </div>
</template>
<script lang="ts" setup>
import { ref } from "vue"
import HomeMedicineRoom from "../home/components/HomeMedicineRoom.vue"
import CommonSearch from "../../components/CommonSearch.vue"
import CommonLine from "../../components/CommonLine.vue"
import Container from "../../components/Container.vue"
import { ChemicalRoomData } from "@/types/functionRoome2"
import { chemicalRoomDetailApi } from "@/api/functionRoom2.api"
import { usePageList } from "../../composables/usePageList"

const query = ref({
  queryType: "ALL"
})

const { loading, finished, dataList, onSearch, getList } = usePageList<ChemicalRoomData>({
  api: chemicalRoomDetailApi,
  query
})
</script>

<style scoped lang="less">
@import "../commonRoomeDetail.less";
</style>
