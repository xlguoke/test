<template>
  <Container>
    <van-skeleton :row="10" class="line" :loading="loading">
      <CommonLine class="line" label="设备：" :value="eqNames || '-'"></CommonLine>
      <CommonLine
        class="line"
        label="外出申请单号："
        :value="detailData?.egressApplySn || '-'"
      ></CommonLine>
      <CommonLine class="line" label="工程项目：" :value="projectNames || '-'"></CommonLine>
      <CommonLine class="line" label="使用地点：" :value="detailData?.location || '-'"></CommonLine>
      <CommonLine
        class="line"
        label="任务编号："
        :value="detailData?.testTaskSn || '-'"
      ></CommonLine>
      <CommonLine class="line" label="借用人：" :value="detailData?.borrowUser || '-'"></CommonLine>
      <CommonLine class="line" label="申请时间：" :value="createDate || '-'"></CommonLine>
      <CommonLine
        class="line"
        label="外出时间："
        :value="detailData?.egressTime || '-'"
      ></CommonLine>
      <CommonLine class="line" label="需求日期：" :value="requiredDate || '-'"></CommonLine>
      <CommonLine
        class="line"
        label="预还日期："
        :value="detailData?.expectReturnTime || '-'"
      ></CommonLine>
      <CommonLine class="line" label="申请理由：" :value="detailData?.reason || '-'"></CommonLine>
      <CommonLine class="line" label="备注：" :value="detailData?.remark || '-'"></CommonLine>
    </van-skeleton>
  </Container>
</template>

<script setup lang="ts">
import { EqOutApplyDetailData, getEqOutApplyDetail } from "@/api/functionRoom2.api"
import CommonLine from "@/views/functionRoom2/components/CommonLine.vue"
import Container from "@/views/functionRoom2/components/Container.vue"
import { useDateFormat } from "@vueuse/core"
import { computed, ref } from "vue"
import { useRoute } from "vue-router"

const route = useRoute()
const loading = ref(false)
const detailData = ref<EqOutApplyDetailData>()

const eqNames = computed(() => {
  return detailData.value?.equipments.map((d) => d.name).join(",")
})
const projectNames = computed(() => {
  return detailData.value?.projectName
})

const createDate = computed(() => {
  return detailData.value?.createDate
    ? useDateFormat(detailData.value.createDate, "YYYY-MM-DD HH:mm:ss").value
    : "-"
})

const requiredDate = computed(() => {
  return detailData.value?.requiredDate
    ? useDateFormat(detailData.value.requiredDate, "YYYY-MM-DD").value
    : "-"
})

async function getData() {
  loading.value = true
  try {
    const id = route.params.id as string
    const { data } = await getEqOutApplyDetail(id)
    detailData.value = data
  } catch (err) {
    console.error(err)
  }
  loading.value = false
}

getData()
</script>

<style></style>
