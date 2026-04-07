<template>
  <div class="consign_detail">
    <Container>
      <CommonLine class="line" label="资质类型：" :value="detail.qualificationTypeId"></CommonLine>
      <CommonLine
        class="line"
        label="检测形式："
        :value="getTypeText(detail.testType)"
      ></CommonLine>
      <CommonLine class="line" label="编号类别：" :value="detail.snTypeId"></CommonLine>
      <CommonLine class="line" label="委托编号：" :value="detail.consignCode"></CommonLine>
      <CommonLine class="line" label="检测类别：" :value="detail.checkTypeId"></CommonLine>
      <CommonLine class="line" label="样品来源：" :value="detail.sampleSource"></CommonLine>
      <CommonLine class="line" label="委托单位：" :value="detail.consignUnitName"></CommonLine>
      <CommonLine class="line" label="工程项目：" :value="detail.projectTenderName"></CommonLine>
      <CommonLine class="line" label="委托人：" :value="detail.sampleSenderName"></CommonLine>
      <CommonLine class="line" label="委托电话：" :value="detail.sampleSenderPhone"></CommonLine>
      <CommonLine class="line" label="工程划分：" :value="detail.unitProjectName"></CommonLine>
      <CommonLine class="line" label="约定检测日期：" :value="detail.appointmentDate"></CommonLine>
      <CommonLine class="line" label="委托日期：" :value="detail.consignDate"></CommonLine>
      <CommonLine class="line" label="送样日期：" :value="detail.sampleSendDate"></CommonLine>
      <CommonLine
        class="line"
        label="委托单位地址："
        :value="detail.consignUnitAddress"
      ></CommonLine>
      <CommonLine
        class="line"
        label="项目地址："
        :value="detail?.project?.projectAddress"
      ></CommonLine>
      <CommonLine
        class="line"
        label="要求报告日期："
        :value="detail.requireReportDate"
      ></CommonLine>
      <CommonLine
        class="line"
        label="样品接收日期："
        :value="detail.sampleReceivedDate"
      ></CommonLine>
      <CommonLine label="公路等级：" :value="detail.highwayLevel"></CommonLine>
    </Container>
  </div>
</template>
<script lang="ts" setup>
import { useRoute } from "vue-router"
import CommonLine from "../../components/CommonLine.vue"
import Container from "../../components/Container.vue"
import { getConsignInfo } from "@/api/functionRoom2.api"
import { ref } from "vue"
import { showFailToast } from "vant"

const route = useRoute()

const id = route.query.id as string

const detail = ref<any>({})

async function getData() {
  if (!id) {
    showFailToast("参数错误")
    return
  }
  const { code, data } = await getConsignInfo(id)
  if (code === 20000) {
    detail.value = data
  }
}
getData()

function getTypeText(type) {
  switch (type) {
    case "1":
      return "初检"
    case "2":
      return "复检"
    case "3":
      return "整改后检测"
    default:
      return "-"
  }
}
</script>
<style lang="less" scoped>
.line {
  margin-bottom: 24px;
}
</style>
