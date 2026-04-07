<template>
  <div class="sampleManageApp-detail">
    <div class="sampleManageApp-detail-header">
      样品信息（{{ testObjectSn }}）
      <span class="sampleManageApp-detail-status">待检测</span>
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
      <a-form ref="formRef" :model="formState">
        <a-form-item
          label="领样人"
          :label-col="{ xs: 6 }"
          :wrapper-col="{ xs: 18 }"
        >
          <a-input v-model:value="formState.receiver" placeholder="请输入" />
        </a-form-item>
        <a-form-item
          label="领样时间"
          :label-col="{ xs: 6 }"
          :wrapper-col="{ xs: 18 }"
        >
          <a-input
            v-model:value="formState.operationDate"
            placeholder="请选择领样时间"
            readonly
            @click="operationDateOpen = true"
          />
        </a-form-item>
        <a-form-item
          label="领样数量"
          :label-col="{ xs: 6 }"
          :wrapper-col="{ xs: 18 }"
          name="amount"
          :rules="[{ required: true, message: '请输入领样数量！' }]"
        >
          <a-input
            v-model:value="formState.amount"
            placeholder="请输入"
            @change="changeAmount"
          />
        </a-form-item>
        <div v-if="showOther">
          <a-form-item
            label="余样数量"
            :label-col="{ xs: 6 }"
            :wrapper-col="{ xs: 18 }"
          >
            <a-input v-model:value="formState.amount2" placeholder="请输入" />
          </a-form-item>
          <a-form-item
            label="余样处理"
            :label-col="{ xs: 6 }"
            :wrapper-col="{ xs: 18 }"
          >
            <select
              v-model="formState.type"
              placeholder="请输入"
            >
              <option value="收样处留样">
                收样处留样
              </option>
              <option value="不处理">
                不处理
              </option>
            </select>
          </a-form-item>
          <div v-if="formState.type === '收样处留样'">
            <a-form-item
              label="留样期限（天）"
              :label-col="{ xs: 6 }"
              :wrapper-col="{ xs: 18 }"
            >
              <a-input-number
                v-model:value="formState.saveDayLimit"
                class="w-full"
                :min="0"
                placeholder="请输入"
              />
            </a-form-item>
            <a-form-item
              label="留样地点"
              :label-col="{ xs: 6 }"
              :wrapper-col="{ xs: 18 }"
            >
              <a-input
                v-model:value="formState.saveSite"
                placeholder="请输入"
              />
            </a-form-item>
            <a-form-item
              label="留样原因"
              :label-col="{ xs: 6 }"
              :wrapper-col="{ xs: 18 }"
            >
              <a-input
                v-model:value="formState.reason"
                placeholder="请输入"
              />
            </a-form-item>
          </div>
        </div>
      </a-form>
      <a-button
        type="primary"
        class="sampleManageApp-detail-btn"
        :loading="submitLoading"
        @click="getSample"
      >
        领取
      </a-button>
    </div>

    <DateSelector v-model:open="operationDateOpen" enable-time @select="(val) => { formState.operationDate = val }" />
  </div>
</template>

<script>
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
      baseInfo: [],
      showOther: false,
      sampleNum: '',
      objectProcessId: '',
      testObjectSn: '',
      formState: {
        type: '收样处留样',
        saveDayLimit: 90,
        operationDate: '',
      },
      operationDateOpen: false,
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
          if (res.data && JSON.stringify(res.data) !== '{}') {
            baseInfo = baseInfoFields.map((item) => {
              let value = res.data[item.field]
              if (item.field === 'isRetentionSample') {
                value = res.data[item.field] ? '是' : '否'
              }
              else if (item.field === 'appiontSaveDays') {
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
          this.sampleNum = res.data.sampleNum
          this.objectProcessId = res.data.id
          this.testObjectSn = res.data.testObjectSn

          this.formState.amount = this.sampleNum
        }
      })
    },
    getSample() {
      this.$refs.formRef.validateFields().then(() => {
        const data = { ...this.formState }
        data.objectProcessId = this.objectProcessId

        let url = mApi.sampleManageApp.getSample
        if (
          data.amount2 !== ''
          && data.amount2 !== undefined
          && data.type === '收样处留样'
        ) {
          url = mApi.sampleManageApp.sampleRoomSave
          data.amount = data.amount2
          data.operationType = 1
        }
        else {
          data.operationType = 0
          delete data.reason
          delete data.saveDayLimit
          delete data.saveSite
        }
        data.reserveTimeUnit = 'D'
        this.request(url, data)
      })
    },
    request(url, data) {
      this.submitLoading = true
      mAjax({
        method: 'POST',
        url,
        data: qs.stringify({
          params: JSON.stringify([data]),
        }),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res.success) {
          if (data.operationType === 1) {
            data.operationType = 0
            data.amount = this.formState.amount
            url = mApi.sampleManageApp.getSample
            this.request(url, data)
          }
          else {
            message.success(res.msg)
            this.$router.push({ name: 'detail' })
          }
        }
        else {
          message.error(res.msg)
        }
      }).finally(() => {
        this.submitLoading = false
      })
    },
    changeAmount() {
      // eslint-disable-next-line eqeqeq
      if (this.formState.amount != this.sampleNum) {
        this.showOther = true
      }
      else {
        this.showOther = false
      }
    },
  },
}
</script>

<style lang="less"></style>
