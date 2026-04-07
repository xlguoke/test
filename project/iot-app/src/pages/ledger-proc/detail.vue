<template>
  <div py12 px16>
    <div mb-12 flex-x>
      <i stripe></i>详情
    </div>
    <template v-if="dataSource">
      <div mb16 card>
        <div mb12>
          功能室：{{ dataSource.laboratoryName }}
        </div>
        <div>
          巡查时间：{{ dayjs(dataSource.recordDate).format("YYYY-MM-DD HH:mm:ss") }}
        </div>
      </div>
      <div class="flex gap-16">
        <div class="mb16 flex-1 card">
          <div font-bold>
            温度
          </div>
          <div class="mt-8">
            标准温度(℃)：{{ dataSource.minTem }} ~ {{ dataSource.maxTem }}
          </div>
          <div class="mt-8">
            巡查温度(℃)：{{ dataSource.tem }}
          </div>
          <div class="mt-8">
            温度状态：
            <span
              :class="{
                'text-danger': dataSource.temStatus !== MStatus.正常,
              }"
            >{{ dataSource.temStatus !== MStatus.正常 ? '超标' : '正常' }}</span>
          </div>
        </div>
        <div class="mb16 flex-1 card">
          <div font-bold>
            湿度
          </div>
          <div class="mt-8">
            标准湿度(%RH)：{{ dataSource.minHum }} ~ {{ dataSource.minHum }}
          </div>
          <div class="mt-8">
            巡查湿度(%RH)：{{ dataSource.hum }}
          </div>
          <div class="mt-8">
            湿度状态：
            <span
              :class="{
                'text-danger': dataSource.humStatus !== MStatus.正常,
              }"
            >{{ dataSource.humStatus !== MStatus.正常 ? '超标' : '正常' }}</span>
          </div>
        </div>
      </div>
    </template>

    <div mb-12 mt-8 flex-x>
      <i stripe></i>处理记录
    </div>
    <van-cell-group inset>
      <template v-if="dataSource">
        <van-field
          v-model="dataSource.handleUser"
          readonly
          label="处理人"
        />
        <van-field
          v-model="handleDate"
          readonly
          label="处理时间"
        />
        <van-field
          v-model="dataSource.handleContent"
          readonly
          label="处理内容"
        />
      </template>
      <van-field name="uploader" label="附件">
        <template #input>
          <CustomBusinessUploader :readonly="true" :business-id="id"></CustomBusinessUploader>
        </template>
      </van-field>
    </van-cell-group>
  </div>
</template>

<script lang="ts" setup>
import { getHumitureRecordDetail, type ILedger, MStatus } from '.'
import CustomBusinessUploader from '@/components/UI/CustomBusinessUploader.vue'
import dayjs from 'dayjs'

const route = useRoute()

const id = route.query.id as string

const dataSource = ref<ILedger>()

const handleDate = computed(() => {
  if (dataSource.value && dataSource.value.handleDate) {
    return dayjs(dataSource.value.handleDate).format('YYYY-MM-DD HH:mm:ss')
  }
  return ''
})

showLoadingToast({
  duration: 0,
  forbidClick: true,
})
getHumitureRecordDetail(id).then((res) => {
  dataSource.value = res.data
}).finally(closeToast)
</script>

<route lang="json">
  {
    "name": "abnormal-detail",
    "meta": {
      "title": "异常记录"
    }
  }
</route>
