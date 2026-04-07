<template>
  <div class="sampleDetail">
    <div class="sampleDetail-detail">
      <van-sticky>
        <MobileTitleBar left-arrow @click-left="$router.go(-1)" />
        <div class="sampleDetail-detail-header">
          样品信息（{{ testObjectSn }}）
          <span class="sampleDetail-detail-status">待检测</span>
        </div>
      </van-sticky>

      <div class="sampleDetail-detail-content">
        <div class="sampleDetail-detail-title">
          样品基本信息
        </div>
        <div class="sampleDetail-detail-info">
          <div
            v-for="(info, index) in baseInfo"
            :key="index"
            :style="`${
              info.fontWeight ? 'font-weight: bold;color: #333;' : ''
            }`"
          >
            {{ info.name }}：{{ info.value }}
          </div>
        </div>
      </div>

      <div class="sampleDetail-receiveTest">
        <van-form @submit="getSample">
          <FormItemInput
            v-model:value="formData.receiver"
            label="领样人"
          />

          <FormItemDate
            v-model:value="formData.operationDate"
            label="领样时间"
            placeholder="请选择"
          />

          <FormItemInput
            v-model:value="formData.amount"
            label="领样数量"
            clearable
            required
            placeholder="请输入"
            type="digit"
            :rules="[{ required: true, message: '请输入领样数量' }]"
            @input="changeAmount"
          />

          <div v-if="showOther">
            <FormItemInput
              v-model:value="formData.amount2"
              label="余样数量"
              placeholder="请输入"
              required
              clearable
              type="digit"
              :rules="[{ required: true, message: '请输入余样数量' }]"
            />

            <FormItemSelect
              v-model:value="formData.type"
              label="余样处理"
              placeholder="请选择"
              required
              clearable
              :options="['收样处留样', '不处理']"
              :rules="[{ required: true, message: '请输入余样处理' }]"
            />

            <div v-if="formData.type === '收样处留样'">
              <FormItemInput
                v-model:value="formData.saveDayLimit"
                label="留样期限(天)"
                clearable
                type="digit"
                placeholder="请输入"
              />

              <FormItemInput
                v-model:value="formData.saveSite"
                label="留样地点"
                clearable
                placeholder="请输入"
              />

              <FormItemInput
                v-model:value="formData.reason"
                label="留样原因"
                clearable
                placeholder="请输入"
              />
            </div>
          </div>

          <van-button
            type="primary"
            class="sampleDetail-detail-btn"
            native-type="submit"
          >
            领取
          </van-button>
        </van-form>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { mapState } from 'pinia'
import qs from 'qs'
import { showDialog, showLoadingToast, showNotify } from 'vant'
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import FormItemInput from '~/views/mobileApp/components/MobileFormItem/FormItemInput.vue'
import FormItemSelect from '~/views/mobileApp/components/MobileFormItem/FormItemSelect.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppUserStore } from '~/views/mobileApp/store/useUserStore.ts'

const dateType = {
  D: '天',
  M: '月',
  Y: '年',
}

const baseInfoFields = [
  { name: '样品名称', field: 'sampleName', fontWeight: true },
  { name: '资质类型', field: 'qualification', fontWeight: true },
  { name: '检测参数', field: 'paramName', fontWeight: true },
  { name: '试验规程', field: 'stdGist', fontWeight: true },
  { name: '评定标准', field: 'stdStandard', fontWeight: true },
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
    MobileTitleBar,
    FormItemDate,
    FormItemInput,
    FormItemSelect,
  },
  data() {
    return {
      id: this.$route.params.id,
      testObjectId: undefined,
      baseInfo: [],
      showOther: false,
      sampleNum: '',
      objectProcessId: '',
      testObjectSn: '',
      formData: {
        type: '',
        amount: '',
        saveDayLimit: '',
        receiver: '',
        reserveTimeUnit: 'D',
        operationDate: dayjs().format(EDateFormatType.YYYY_MM_DD),
      },
      countSampleRoomSave: 0,
    }
  },
  computed: {
    ...mapState(useAppUserStore, ['userInfo']),
    realName() {
      return this.userInfo.realName
    },
  },
  created() {
    this.formData.receiver = this.realName
    this.getBaseInfo()
  },
  methods: {
    getBaseInfo() {
      mRequest({
        method: 'GET',
        url: api.sampleManageApp.baseInfo,
        params: {
          id: this.id,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res.code && res.code !== 20010) {
          this.testObjectId = res.data.testObjectId
          this.countSampleRoomSave = res.data.countSampleRoomSave

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
                fontWeight: item.fontWeight,
              }
            })
          }
          this.baseInfo = baseInfo
          this.sampleNum = res.data.sampleNum
          this.formData.amount = res.data.sampleNum
          this.objectProcessId = res.data.id
          this.testObjectSn = res.data.testObjectSn
        }
      })
    },
    getSample() {
      const data = { ...this.formData }
      data.objectProcessId = this.objectProcessId

      let url = api.sampleManageApp.getSample
      if (
        data.amount2 !== ''
        && data.amount2 !== undefined
        && data.type === '收样处留样'
      ) {
        url = api.sampleManageApp.sampleRoomSave
        data.amount = data.amount2
        data.operationType = 1
      }
      else {
        data.operationType = 0
      }

      if (data.type === '不处理') {
        delete data.saveDayLimit
        delete data.saveSite
        delete data.reason
      }

      this.request(url, data)
    },
    request(url, data) {
      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      mRequest({
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
            data.amount = this.formData.amount
            url = api.sampleManageApp.getSample
            this.request(url, data)
          }
          else {
            showNotify({ type: 'success', message: res.msg })
            this.$router.replace({
              name: 'sampleDetail',
              params: {
                id: this.id,
                isSubmit: true,
              },
            })
            this.$router.go(-1)
          }
        }
        else {
          showDialog({ message: res.msg })
        }
      }).finally(() => {
        toast.close()
      })
    },
    changeAmount() {
      if (this.countSampleRoomSave > 0) {
        this.showOther = false
      }
      else {
        if (String(this.formData.amount) !== String(this.sampleNum)) {
          this.showOther = true
          this.formData.type = '收样处留样'
        }
        else {
          this.showOther = false
          this.formData.type = undefined
        }
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import url('../index.less');
</style>
