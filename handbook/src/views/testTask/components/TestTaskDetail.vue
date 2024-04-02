<script setup lang="ts">
import { onMounted, provide, ref } from 'vue'
import { useRoute } from 'vue-router'
import { Col, Row, Spin, TabPane, Tabs, message } from 'ant-design-vue'
import type { AppTask, TaskParam } from 'custodian'
import { findTaskParams, getTask, task } from 'custodian'
import { z } from 'zod'
import { TestInfoStandard } from './index'
import { request } from '@/axios'
import { translateError } from '@/utils/translateError'

const appTaskDetail = task.Validator.task
  .omit({
    taskAppTemplates: true,
    taskRecordSets: true,
    testObjectId: true,
    hitekServer: true,
  })
  .extend({
    testTaskCode: z.string().optional(),
  })
  .transform(info => ({
    ...info,
    id: info.testTaskId,
    onsite: 0,
  }))

type AppTaskDetail = Omit<AppTask, 'taskAppTemplates' | 'params'>

const route = useRoute()

// 是否为离线数据
const isOfflineData = ref(true)
const activeParamKey = ref(0)

onMounted(() => {
  isOfflineData.value = route.query.isOffline === '1'
  if (isOfflineData.value)
    getOfflineDetailData()
  else getDetailData()
})

const detailData = ref<AppTaskDetail>()
const taskParams = ref<TaskParam[]>([])

provide('isConfirmEdit', true)
provide('formData', detailData)
provide('taskParams', taskParams)

const spinning = ref(false)
async function getDetailData() {
  spinning.value = true
  const testTaskId = route.query.id as string
  request({
    url: `/ilis2/rest/handbook/task/detail/${testTaskId}`,
    method: 'get',
    schema: appTaskDetail,
  })
    .then((res) => {
      spinning.value = false
      detailData.value = {
        ...res,
        status: 'edited',
      }
      taskParams.value = res.taskParams
    })
    .catch((err) => {
      spinning.value = false
      errMsg(err)
    })
}

async function getOfflineDetailData() {
  try {
    const task = await getTask(route.query.id as string)
    const params = await findTaskParams(task.id)
    detailData.value = task
    taskParams.value = params
  }
  catch (err) {
    errMsg(err)
  }
}

function errMsg(err: any) {
  const error = translateError(err)
  message.error(error.message)
}
</script>

<template>
  <div class="show-title-bar test-task-detail">
    <TitleBar />
    <div class="test-task-content pd-lr">
      <Spin :spinning="spinning">
        <div class="content-item task-baseinfo">
          <h4 class="page-title-min">
            基本信息
          </h4>
          <div v-if="detailData" class="base-info-form">
            <Row :gutter="10">
              <Col :xs="24" :sm="12">
                <p class="base-info-item">
                  任务编号：{{ detailData.testTaskCode }}
                </p>
              </Col>
              <Col :xs="24" :sm="12">
                <p class="base-info-item">
                  资质类型：{{ detailData.qualification }}
                </p>
              </Col>
              <Col :xs="24" :sm="12">
                <p class="base-info-item">
                  样品编号：{{ detailData.testObjectCode }}
                </p>
              </Col>
              <Col :xs="24" :sm="12">
                <p class="base-info-item">
                  样品名称：{{ detailData.sampleName }}
                </p>
              </Col>
              <Col :xs="24" :sm="12">
                <p class="base-info-item">
                  要求报告时间：{{ detailData.reportDate }}
                </p>
              </Col>
              <Col :xs="24" :sm="12">
                <p class="base-info-item">
                  创建时间：{{
                    detailData.taskCreateTime
                      ? detailData.taskCreateTime.substring(0, 10)
                      : ''
                  }}
                </p>
              </Col>
            </Row>
          </div>
        </div>
        <div class="content-item task-testinfo">
          <h4 class="page-title-min">
            试验内容
          </h4>
          <Tabs v-model:value="activeParamKey">
            <TabPane
              v-for="(par, i) in taskParams"
              :key="i"
              :tab="par.testParamDisplayName"
            >
              <TestInfoStandard
                title="试验依据"
                use-type="1"
                :datas="par.standards || []"
              />
              <TestInfoStandard
                title="评定标准"
                use-type="2"
                :datas="par.standards || []"
              />
            </TabPane>
          </Tabs>
        </div>
      </Spin>
    </div>
  </div>
</template>

<style lang="less" scoped>
.page-title-min {
  margin-bottom: 2rem;
  font-size: 16px;
  font-weight: 600;
  line-height: 16px;
  &::before {
    content: '';
    float: left;
    margin-top: 2px;
    margin-right: 10px;
    width: 4px;
    height: 14px;
    vertical-align: middle;
    background-color: #0284fe;
    border-radius: 0 3px 3px 0;
  }
}
.test-task-content {
  height: 100%;
  overflow: auto;
  font-size: 14px;
  .content-item {
    padding: 1.5rem 2rem;
    margin-top: 1.5rem;
    background-color: #fff;
  }
}

.base-info-item {
  padding: 0.5rem 0;
  line-height: 18px;
}
</style>
