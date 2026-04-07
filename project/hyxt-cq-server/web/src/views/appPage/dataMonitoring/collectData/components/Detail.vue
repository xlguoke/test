<template>
  <a-modal
    v-model:visible="visible"
    :title="`采集数据详情：${dataId}`"
    :mask-closable="false"
    :keyboard="false"
    cancel-text="关闭"
    width="900px"
    @ok="visible = false"
  >
    <a-spin :spinning="spinning">
      <div style="min-height: 350px">
        <a-descriptions bordered size="small" :column="2">
          <template v-for="(field, i) in fields" :key="i">
            <a-descriptions-item v-if="field.fieldType == 'string'" :label="field.fieldName">
              {{ form[field.fieldCode] }}
            </a-descriptions-item>
            <a-descriptions-item v-else-if="field.fieldType == 'bool'" :label="field.fieldName">
              {{ form[field.fieldCode] ? "是" : "否" }}
            </a-descriptions-item>
            <a-descriptions-item
              v-else-if="field.fieldType == 'date_time'"
              :label="field.fieldName"
            >
              {{ formatDate(form[field.fieldCode]) }}
            </a-descriptions-item>
            <a-descriptions-item v-else-if="field.fieldType == 'array'" :label="field.fieldName">
              {{ form[field.fieldCode] && form[field.fieldCode].join("，") }}
            </a-descriptions-item>
            <a-descriptions-item v-else :label="field.fieldName">
              {{ form[field.fieldCode] }}
            </a-descriptions-item>
          </template>
        </a-descriptions>

        <a class="blue" style="margin-top: 20px; display: inline-block" @click="openEchartLine">
          查看力学曲线
        </a>
      </div>
    </a-spin>
    <LineEchart ref="lineEchart" :key="updateKey" />
  </a-modal>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue"
import LineEchart from "./LineEchart.vue"
import { testDetail, autoFieldsAPI } from "@/api/dataMonitoring.api"
import { formatDate } from "@/assets/js/common"

const spinning = ref<boolean>(true)
const visible = ref<boolean>(false)
const dataId = ref<string>("")
const openModal = async (id: string, collectItemId: string) => {
  dataId.value = id
  visible.value = true
  await getAutoFields(collectItemId)
  getDatas(id)
}

defineExpose({
  openModal
})

// 获取详情数据
const form = ref<any>({
  dots: []
})
const getDatas = (id: string) => {
  testDetail(id).then((res) => {
    form.value = res
    spinning.value = false
  })
}

// 获取动态字段
const fields = ref<
  {
    chartsField: boolean
    fieldCode: string
    fieldName: string
    fieldType: string
  }[]
>([])
const getAutoFields = (collectItemId) => {
  autoFieldsAPI(collectItemId).then((res: any) => {
    res = res.filter((d) => !d.chartsField)
    fields.value = res
  })
}

const lineEchart = ref()
const updateKey = ref()
const openEchartLine = () => {
  updateKey.value = new Date().getTime()
  nextTick(() => {
    lineEchart.value.openModal(form.value.dots)
  })
}
</script>

<style lang="less" scoped>
:deep(.ant-descriptions-item-label) {
  width: 120px;
}
</style>
