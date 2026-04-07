<script setup lang="ts">
import type { PropType } from 'vue'
import { computed, onMounted, ref } from 'vue'
import type { AppTask, TaskParam, TaskStandard } from 'custodian'
import { TestInfoStandard } from '../index'
import { SystemParamEnableType, SystemParamService, SystemParamType } from '@/providers/services/SystemParamService'
import type { TestTaskDTO } from '@/providers/services/TestTaskService'

const props = defineProps({
  detailData: {
    type: Object as PropType<AppTaskDetail>,
  },
  testTaskData: {
    type: Object as PropType<TestTaskDTO>,
  },
  taskParams: {
    type: Array as PropType<TaskParam[]>,
    default: () => [],
  },
  // 是否为离线数据
  isOfflineData: Boolean,
})

// 是否离线任务
const isOfflineData = computed(() => props.isOfflineData)

// 详情数据
const detailData = computed(() => props.detailData)

const taskParams = computed(() => props.taskParams)

// 试验任务数据
const testTaskData = computed(() => props.testTaskData)

// 样品数据
const sampleData = computed(() => {
  if (!testTaskData.value?.testObjects)
    return

  return testTaskData.value?.testObjects[0]
})

// 收样辅助信息
const testObjectOtherInfoData = computed(() => {
  const rows = sampleData.value?.testObjectOtherInfos || []

  return rows.filter(
    d => !['代表批量', '试样数量'].includes(d.systemFieldName) && !d.isJoinSpecification,
  )
})

type AppTaskDetail = Omit<AppTask, 'taskAppTemplates' | 'params'>

const systemParamService = new SystemParamService()

const activeParamKey = ref(0)

const expandMoreSampleInfo = ref(false)

const TEST_DETECTION_BUT_PARTANDUSE = ref(true)

onMounted(async () => {
  TEST_DETECTION_BUT_PARTANDUSE.value = await systemParamService.getBusinessParam(SystemParamType['工程部位/用途不盲样']) === SystemParamEnableType.开启
})

// 展示详细的样品信息
const showFullTaskSampleInfo = computed(() => {
  if (isOfflineData.value && detailData.value?.testTaskId)
    return true

  return !isOfflineData.value
})

// 样品留样期限
const sampleRetentionHowLong = computed(() => {
  if (!sampleData.value)
    return ''

  const retentionHowLong = sampleData.value.retentionHowLong || ''
  const retentionTimeUnit = sampleData.value.retentionTimeUnit || ''

  switch (retentionTimeUnit) {
    case 'D':
      return `${retentionHowLong}天`
    case 'M':
      return `${retentionHowLong}月`
    case 'Y':
      return `${retentionHowLong}年`
    default:
      return retentionHowLong
  }
})

function initStandards(list: TaskStandard[], type: string) {
  return list.filter(
    d => d.baseStandardUseType === type || d.baseStandardUseType === '3',
  )
}
</script>

<template>
  <div class="test-task-content">
    <div class="content-item task-baseinfo">
      <h4 class="page-title-min">
        基本信息
      </h4>
      <div v-if="detailData" class="base-info-form">
        <van-row :gutter="[10, 5]" justify="start">
          <van-col :span="24">
            <p class="base-info-item">
              任务编号：{{ detailData.testTaskCode }}
            </p>
          </van-col>
          <van-col :span="24">
            <p class="base-info-item">
              资质类型：{{ detailData.qualification }}
            </p>
          </van-col>
          <van-col :span="24">
            <p class="base-info-item">
              要求报告时间：{{ detailData.reportDate }}
            </p>
          </van-col>
          <van-col :span="24">
            <p class="base-info-item">
              创建时间：{{
                detailData.taskCreateTime
                  ? detailData.taskCreateTime.substring(0, 10)
                  : ''
              }}
            </p>
          </van-col>
        </van-row>
      </div>
    </div>
    <div class="content-item task-baseinfo">
      <h4 class="page-title-min">
        样品信息
      </h4>
      <div v-if="detailData" class="base-info-form">
        <template v-if="showFullTaskSampleInfo">
          <van-row :gutter="[10, 5]" justify="start">
            <van-col :span="24">
              <p class="base-info-item">
                样品名称：{{ sampleData?.testSampleDisplayName }}
              </p>
            </van-col>
            <van-col :span="24">
              <p class="base-info-item">
                样品编号：{{ sampleData?.testObjectCode }}
              </p>
            </van-col>
            <van-col :span="24">
              <p class="base-info-item">
                规格型号：{{ sampleData?.standard }}
              </p>
            </van-col>
            <van-col :span="24">
              <p class="base-info-item">
                检测部位：{{ sampleData?.testPart }}
              </p>
            </van-col>
            <van-col :span="24">
              <p class="base-info-item">
                工程部位/用途：{{ TEST_DETECTION_BUT_PARTANDUSE ? sampleData?.projectPartAndUse : '***' }}
              </p>
            </van-col>
          </van-row>

          <van-row v-if="expandMoreSampleInfo" :gutter="[10, 5]" justify="start">
            <van-col :span="24">
              <p class="base-info-item">
                样品描述：{{ sampleData?.description }}
              </p>
            </van-col>
            <van-col :span="24">
              <p class="base-info-item">
                样品数量：{{ sampleData?.sampleNum }}
              </p>
            </van-col>
            <van-col :span="24">
              <p class="base-info-item">
                代表数量：{{ sampleData?.delegatesNum }}
              </p>
            </van-col>
            <van-col :span="24">
              <p class="base-info-item">
                测后样品处理：{{ sampleData?.sampleProcessMethod }}
              </p>
            </van-col>
            <van-col :span="24">
              <p class="base-info-item">
                留样期限：{{ sampleRetentionHowLong }}
              </p>
            </van-col>
            <van-col :span="24">
              <p class="base-info-item">
                样品存放位置：{{ sampleData?.repository }}
              </p>
            </van-col>
            <van-col :span="24">
              <p class="base-info-item">
                备注：{{ sampleData?.remark }}
              </p>
            </van-col>
            <van-col v-for="item in testObjectOtherInfoData" :key="item.id" :span="24">
              <p class="base-info-item">
                {{ item.displayName }}：{{ item.value || '' }}
              </p>
            </van-col>
          </van-row>

          <div class="test-task-collapse" @click="expandMoreSampleInfo = !expandMoreSampleInfo">
            <span>{{ expandMoreSampleInfo ? '收起' : '展开' }}更多</span>
            <van-icon :name="expandMoreSampleInfo ? 'arrow-up' : 'arrow-down'" size="18" />
          </div>
        </template>
        <template v-else>
          <van-col :span="24">
            <p class="base-info-item">
              样品名称：{{ detailData.sampleName }}
            </p>
          </van-col>
          <van-col :span="24">
            <p class="base-info-item">
              样品编号：{{ detailData.testObjectCode }}
            </p>
          </van-col>
        </template>
      </div>
    </div>
    <div class="content-item task-testinfo">
      <h4 class="page-title-min">
        试验内容
      </h4>

      <van-tabs v-model:active="activeParamKey" shrink>
        <van-tab v-for="(par, i) in taskParams" :key="i" :title="par.testParamDisplayName" :name="i" swipeable>
          <TestInfoStandard title="试验依据" use-type="1" :datas="initStandards(par.standards || [], '1')" />
          <TestInfoStandard title="评定标准" use-type="2" :datas="initStandards(par.standards || [], '2')" />
        </van-tab>
      </van-tabs>
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
  padding: 0 1.6rem 1.6rem 1.6rem;

  .content-item {
    padding: 1.5rem 2rem;
    margin-top: 1.5rem;
    background-color: #fff;
  }
}

.test-task-collapse {
  padding: 8px 0;
  color: #0284fe;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
}

.base-info-item {
  padding: 0.5rem 0;
  line-height: 18px;
}
</style>
