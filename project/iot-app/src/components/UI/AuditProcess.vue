<template>
  <van-field
    center
    label="审核人员"
    placeholder="请选择"
  >
    <template #input>
      <template v-for="(item, index) in processUserTaskList" :key="item.activitiNodeId">
        <van-tag size="medium" text-color="#244F9B" color="#c7e1ed" @click="onSelectUser(item)">
          {{ item.presetUserRealName || item.processTaskName }}
        </van-tag>
        <van-icon v-if="index < processUserTaskList.length - 1" :key="item.activitiNodeId" color="#999" name="arrow" />
      </template>
    </template>
  </van-field>

  <template v-for="item in formList">
    <van-field
      v-if="item.type && item.type.name === 'long'"
      :key="`long-${item.id}`"
      v-model="formPropertyJson[item.id]"
      :label="item.name"
      placeholder="请输入"
      type="number"
    />

    <van-field
      v-else-if="item.type && item.type.name === 'date'"
      :key="`date-${item.id}`"
      v-model="formPropertyJson[item.id]"
      :label="item.name"
      readonly
      placeholder="请选择"
      @click="onSelectDate(item.id)"
    />

    <van-field
      v-else-if="item.type && item.type.name === 'boolean'"
      :key="`boolean-${item.id}`"
      :label="item.name"
    >
      <template #input>
        <van-radio-group v-model="formPropertyJson[item.id]" direction="horizontal" shape="dot">
          <van-radio name="1">
            是
          </van-radio>
          <van-radio name="0">
            否
          </van-radio>
        </van-radio-group>
      </template>
    </van-field>

    <van-field
      v-else
      :key="item.id"
      v-model="formPropertyJson[item.id]"
      :label="item.name"
      placeholder="请输入"
    />
  </template>

  <!-- 时间选择器 -->
  <van-calendar
    v-model:show="selectDateVisible"
    title="选择时间"
    :show-mark="false"
    :min-date="new Date('1998-01-01')"
    :default-date="currentDate"
    @confirm="getSelectDate"
  />

  <!-- 人员选择器 -->
  <PersonSelector
    v-model:show="selectPersonVisible"
    @confirm="getPerson"
  ></PersonSelector>
</template>

<script lang="ts" setup>
import type { AuditTypeEnum } from '@/api/common'
import { getProcessUserTaskList, getStartFormData } from '@/api/common'
import dayjs from 'dayjs'
import type { PropType } from 'vue'
import PersonSelector from '../Common/PersonSelector.vue'

const props = defineProps({
  auditTypeId: {
    type: Number as PropType<AuditTypeEnum>,
  },
})

const selectDateVisible = ref(false)

const currentDate = ref()

const selectDateId = ref('')

const selectPersonVisible = ref(false)

const selectPersonId = ref('')

const auditTypeId = computed(() => props.auditTypeId)

const formPropertyJson = ref({})

const processUserTaskList = ref([])

const formList = ref([])

init()

async function init() {
  getProcessUserTaskList(auditTypeId.value).then((res) => {
    processUserTaskList.value = res.data
  })

  getStartFormData(auditTypeId.value).then((res) => {
    const obj = {}

    res.data.forEach((item) => {
      formPropertyJson[item.id] = ''
    })

    formList.value = res.data
    formPropertyJson.value = obj
  })
}

function onSelectDate(id: string) {
  selectDateId.value = id
  if (formPropertyJson.value[id]) {
    currentDate.value = new Date(formPropertyJson.value[id])
  }
  else {
    currentDate.value = new Date()
  }

  selectDateVisible.value = true
}

function getSelectDate(value) {
  formPropertyJson.value[selectDateId.value] = dayjs(value).format('YYYY-MM-DD')
  selectDateVisible.value = false
}

function onSelectUser(item) {
  selectPersonId.value = item.activitiNodeId
  selectPersonVisible.value = true
}

function getPerson(rows) {
  const [row] = rows
  const index = processUserTaskList.value.findIndex(i => i.activitiNodeId === selectPersonId.value)
  const item = processUserTaskList.value[index]

  item.presetUserId = row.id
  item.presetUsername = row.account
  item.presetUserRealName = row.name
  selectPersonVisible.value = false

  processUserTaskList.value[index] = item
}

function getSubmitData() {
  return {
    processUserTaskList: unref(processUserTaskList.value),
    formPropertyJson: unref(formPropertyJson.value),
  }
}

defineExpose({
  getSubmitData,
})
</script>
