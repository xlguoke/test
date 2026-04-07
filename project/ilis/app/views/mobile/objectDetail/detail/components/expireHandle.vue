<!-- eslint-disable vue/eqeqeq -->
<template>
  <div class="sampleManageApp-detail">
    <div class="sampleManageApp-detail-header">
      样品信息（{{ testObjectSn }}）
      <span class="sampleManageApp-detail-status">测后留样</span>
      <span
        class="sampleManageApp-detail-status"
        style="border-color: red; color: red"
      >留样已到期</span>
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
          label="处理方式"
          :label-col="{ xs: 6 }"
          :wrapper-col="{ xs: 18 }"
        >
          <select v-if="early" v-model="operationType" placeholder="请输入">
            <option value="6">
              废弃1
            </option>
            <option value="7">
              返还
            </option>
            <option value="8">
              利用
            </option>
          </select>
          <select v-if="!early" v-model="operationType" placeholder="请输入">
            <option value="4">
              废弃2
            </option>
            <option value="5">
              返还
            </option>
            <option value="8">
              利用
            </option>
          </select>
        </a-form-item>
        <a-form-item
          v-show="operationType == '4' || operationType == '6'"
          label="样品废弃日期"
          :label-col="{ xs: 6 }"
          :wrapper-col="{ xs: 18 }"
        >
          <a-input
            v-model:value="operationDate1"
            placeholder="选择"
            readonly
            @click="operationDate1Open = true"
          />
        </a-form-item>
        <a-form-item
          v-show="operationType == '5' || operationType == '7'"
          label="样品返还日期"
          :label-col="{ xs: 6 }"
          :wrapper-col="{ xs: 18 }"
        >
          <a-input
            v-model:value="operationDate2"
            placeholder="选择"
            readonly
            @click="operationDate2Open = true"
          />
        </a-form-item>
        <div v-if="operationType == '4' || operationType == '6'">
          <a-form-item
            label="经办人"
            :label-col="{ xs: 6 }"
            :wrapper-col="{ xs: 18 }"
          >
            <a-input v-model:value="formState.operator" placeholder="请输入" />
          </a-form-item>
          <a-form-item
            label="废弃数量"
            :label-col="{ xs: 6 }"
            :wrapper-col="{ xs: 18 }"
          >
            <a-input v-model:value="formState.amount" placeholder="请输入" />
          </a-form-item>
          <a-form-item
            label="废弃原因"
            :label-col="{ xs: 6 }"
            :wrapper-col="{ xs: 18 }"
          >
            <a-input v-model:value="formState.reason" placeholder="请输入" />
          </a-form-item>
        </div>
        <div v-if="operationType == '5' || operationType == '7'">
          <a-form-item
            label="接受人"
            :label-col="{ xs: 6 }"
            :wrapper-col="{ xs: 18 }"
          >
            <a-input v-model:value="formState.receiver" placeholder="请输入" />
          </a-form-item>
          <a-form-item
            label="经办人"
            :label-col="{ xs: 6 }"
            :wrapper-col="{ xs: 18 }"
          >
            <a-input v-model:value="formState.operator" placeholder="请输入" />
          </a-form-item>
          <a-form-item
            label="返还数量"
            :label-col="{ xs: 6 }"
            :wrapper-col="{ xs: 18 }"
          >
            <a-input v-model:value="formState.amount" placeholder="请输入" />
          </a-form-item>
          <a-form-item
            label="备注"
            :label-col="{ xs: 6 }"
            :wrapper-col="{ xs: 18 }"
          >
            <a-input v-model:value="formState.mark" placeholder="请输入" />
          </a-form-item>
        </div>
        <div v-if="operationType == '8'">
          <a-form-item
            label="利用数量"
            :label-col="{ xs: 6 }"
            :wrapper-col="{ xs: 18 }"
          >
            <a-input v-model:value="formState.amount" placeholder="请输入" />
          </a-form-item>
          <a-form-item
            label="申请利用原因"
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
        确定
      </a-button>
    </div>

    <DateSelector v-model:open="operationDate1Open" enable-time @select="(val) => { operationDate1 = val }" />

    <DateSelector v-model:open="operationDate2Open" enable-time @select="(val) => { operationDate2 = val }" />
  </div>
</template>

<script>
/* eslint-disable eqeqeq */
import { message } from 'ant-design-vue'
import qs from 'qs'
import mAjax from '~/providers-moblie/common/ajax'
import mApi from '~/providers-moblie/common/api'
import DateSelector from '~/providers-moblie/components/DateSelector.vue'

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
  components: {
    DateSelector,
  },
  data() {
    return {
      id: this.$route.params.id,
      early: this.$route.params.early,
      baseInfo: [],
      operationType: '4',
      operationDate1: '',
      operationDate2: '',
      operationDate1Open: false,
      operationDate2Open: false,
      testObjectSn: '',
      formState: {},
      submitLoading: false,
    }
  },
  mounted() {
    this.initialPicker('#time1', 'operationDate1')
    this.initialPicker('#time2', 'operationDate2')
  },
  created() {
    if (this.early) {
      this.operationType = '6'
    }
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
      data.operationType = this.operationType
      data.objectProcessId = this.id

      if (this.operationType == '4') {
        data.operationDate = this.operationDate1
      }
      else if (this.operationType == '5') {
        data.operationDate = this.operationDate2
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
