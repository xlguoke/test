<template>
  <div class="sampleManageApp-detail">
    <div class="sampleManageApp-detail-header">
      样品信息（{{ testObjectSn }}）
      <span class="sampleManageApp-detail-status">检测中</span>
    </div>

    <div class="sampleManageApp-detail-content">
      <div class="sampleManageApp-detail-title">
        样品基本信息
      </div>
      <div class="sampleManageApp-detail-info">
        <div v-for="(info, index) in baseInfo" :key="index">
          {{ info.name }}：{{ info.value }}
        </div>
      </div>
    </div>

    <div class="sampleManageApp-receiveTest">
      <a-form :model="formState">
        <a-form-item
          label="处理人"
          :label-col="{ xs: 6 }"
          :wrapper-col="{ xs: 18 }"
        >
          <a-input v-model:value="formState.operator" placeholder="请输入" />
        </a-form-item>
        <a-form-item
          label="处理时间"
          :label-col="{ xs: 6 }"
          :wrapper-col="{ xs: 18 }"
        >
          <a-input v-model:value="formState.operationDate" :disabled="true" placeholder="请输入" />
        </a-form-item>
        <a-form-item
          label="测后数量"
          :label-col="{ xs: 6 }"
          :wrapper-col="{ xs: 18 }"
        >
          <a-input v-model:value="formState.amount" placeholder="请输入" />
        </a-form-item>
        <a-form-item
          label="测后处理"
          :label-col="{ xs: 6 }"
          :wrapper-col="{ xs: 18 }"
        >
          <select v-model="type" placeholder="请选择">
            <option value="0">
              废弃
            </option>
            <option value="1">
              留样
            </option>
          </select>
        </a-form-item>
        <div v-if="type === '0'">
          <a-form-item
            label="废弃原因"
            :label-col="{ xs: 6 }"
            :wrapper-col="{ xs: 18 }"
          >
            <a-input v-model:value="formState.reason" placeholder="请输入" />
          </a-form-item>
        </div>
        <div v-if="type === '1'">
          <a-form-item
            label="留样期限（天）"
            :label-col="{ xs: 6 }"
            :wrapper-col="{ xs: 18 }"
          >
            <a-input v-model:value="formState.saveDayLimit" placeholder="请输入" />
          </a-form-item>
          <a-form-item
            label="留样地点"
            :label-col="{ xs: 6 }"
            :wrapper-col="{ xs: 18 }"
          >
            <a-input v-model:value="formState.saveSite" placeholder="请输入" />
          </a-form-item>
          <a-form-item
            label="留样原因"
            :label-col="{ xs: 6 }"
            :wrapper-col="{ xs: 18 }"
          >
            <a-input v-model:value="formState.reason" placeholder="请输入" />
          </a-form-item>
        </div>
      </a-form>
      <a-button
        type="primary"
        class="sampleManageApp-detail-btn"
        :loading="submitLoading"
        @click="submit"
      >
        处理
      </a-button>
    </div>
  </div>
</template>

<script>
/* eslint-disable eqeqeq */
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import qs from 'qs'
import mAjax from '~/providers-moblie/common/ajax'
import mApi from '~/providers-moblie/common/api'

const dateType = {
  D: '天',
  M: '月',
  Y: '年',
}

const baseInfoFields = [
  { name: '样品名称', field: 'sampleName' },
  { name: '资质类型', field: 'qualification' },
  { name: '检测参数', field: 'paramName' },
  { name: '试验规程', field: 'stdGist' },
  { name: '评定标准', field: 'stdStandard' },
  { name: '规格型号', field: 'standard' },
  { name: '样品数量', field: 'sampleNum' },
  { name: '收样时间', field: 'receiveSampleDate' },
  { name: '收样人员', field: 'receiveSampleUser' },
  { name: '试验人员', field: 'testUser' },
  { name: '要求报告时间', field: 'requireReportDate' },
  { name: '约定测后样品处理', field: 'sampleProcessMethod' },
  { name: '是否需要留样', field: 'isRetentionSample' },
  { name: '约定留样期限', field: 'appiontSaveDays' },
]

export default {
  data() {
    return {
      type: '0',
      id: this.$route.params.id,
      objectProcessId: '',
      baseInfo: [],
      testObjectSn: '',
      formState: {
        operationDate: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      },
      submitLoading: false,
    }
  },
  created() {
    this.getBaseInfo()
  },
  methods: {
    getBaseInfo() {
      mAjax({
        method: 'GET',
        url: mApi.sampleManageApp.baseInfo,
        params: {
          id: this.id,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res.code && res.code !== 20010) {
          let baseInfo = []
          if (res.data && JSON.stringify(res.data) != '{}') {
            baseInfo = baseInfoFields.map((item) => {
              let value = res.data[item.field]
              if (item.field == 'isRetentionSample') {
                value = res.data[item.field] ? '是' : '否'
              }
              else if (item.field == 'appiontSaveDays') {
                if (res.data[item.field]) {
                  value
                    = res.data[item.field] + dateType[res.data.retentionTimeUnit]
                }
                else {
                  value = ''
                }
              }

              return {
                name: item.name,
                value,
              }
            })
          }
          this.baseInfo = baseInfo
          this.testObjectSn = res.data.testObjectSn
        }
      })
    },
    submit() {
      const data = { ...this.formState }
      data.objectProcessId = this.id
      data.operationType = this.type == '0' ? 3 : 2

      if (this.type === '0') {
        delete data.saveDayLimit
        delete data.saveSite
      }

      this.submitLoading = true
      mAjax({
        method: 'POST',
        url: mApi.sampleManageApp.dispose,
        data: qs.stringify({
          params: JSON.stringify([data]),
        }),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res.success) {
          message.success(res.msg)
          this.$router.push({ name: 'detail' })
        }
        else {
          message.error(res.msg)
        }
      }).finally(() => {
        this.submitLoading = false
      })
    },
  },
}
</script>

<style lang="less"></style>
