<template>
  <div class="sample-change-detail">
    <div v-if="isEdit" class="change-info">
      <p class="detail-title">样品更正信息</p>
      <template v-for="base in changeDetail" :key="base.field">
        <p class="field-descript">{{ base.fieldName }}</p>
        <a-descriptions bordered size="small" :column="1">
          <!-- 日期 -->
          <template v-if="datesFieldKey.includes(base.field)">
            <a-descriptions-item label="更正前">
              <span v-if="base.beforeChange">
                {{ dayjs(base.beforeChange).format("YYYY-MM-DD") }}
              </span>
            </a-descriptions-item>
            <a-descriptions-item label="更正后">
              <span v-if="base.afterChange">
                {{ dayjs(base.afterChange).format("YYYY-MM-DD") }}
              </span>
            </a-descriptions-item>
          </template>
          <template v-else>
            <a-descriptions-item label="更正前">{{ base.beforeChange }}</a-descriptions-item>
            <a-descriptions-item label="更正后">{{ base.afterChange }}</a-descriptions-item>
          </template>
        </a-descriptions>
      </template>
    </div>
    <template v-else>
      <p class="detail-title">样品信息</p>
      <a-descriptions bordered size="small" :column="1">
        <template v-for="(field, key) in sampleFieldsName" :key="key">
          <a-descriptions-item v-if="datesFieldKey.includes(key)" :label="field">
            <span v-if="changeDetail[key]">{{ dayjs(changeDetail[key]).format("YYYY-MM-DD") }}</span>
          </a-descriptions-item>
          <a-descriptions-item v-else :label="field">{{ changeDetail[key] }}</a-descriptions-item>
        </template>
      </a-descriptions>
    </template>
  </div>
</template>

<script setup lang="ts">
import { message } from "ant-design-vue"
import { onMounted, ref } from "vue"
import { sampleFieldsName } from "@/assets/js/reportFields"
import dayjs from "dayjs"

// 需要格式化日期的字段
const datesFieldKey = ["productionDate", "enterSiteDate", "samplingDate"]

const changeDetail = ref()
const isEdit = ref(true)
onMounted(() => {
  const sampleDetail = sessionStorage.getItem("sampleDetail")
  if (!sampleDetail) {
    message.error("样品信息不存在")
    return
  }
  const parseSample = JSON.parse(sampleDetail)
  isEdit.value = parseSample.type === "更正"
  console.log(parseSample)
  changeDetail.value = parseSample.details
})
</script>

<style lang="less" scoped>
.sample-change-detail {
  padding: 15px;
  .field-descript {
    margin: 0;
    padding: 8px;
    border: 1px solid #eee;
    border-bottom: none;
    background-color: #fafafa;
    &:not(:first-child) {
      border-top: none;
    }
  }
  :deep(.ant-descriptions-item-label) {
    padding: 8px;
    width: 110px;
    text-align: right;
  }
  :deep(.ant-descriptions-item-content) {
    padding: 8px;
  }
  .change-info {
    :deep(.ant-descriptions-item-label) {
      width: 80px;
      text-align: center;
    }
  }
}
</style>
