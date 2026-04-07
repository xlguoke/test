<template>
  <div class="sampleDetail">
    <div class="sampleDetail-detail">
      <van-sticky>
        <MobileTitleBar left-arrow @click-left="$router.go(-1)" />
        <div class="sampleDetail-detail-header">
          样品信息（{{ testObjectSn }}）
          <span class="sampleDetail-detail-status">检测中</span>
        </div>
      </van-sticky>

      <div class="sampleDetail-detail-content">
        <div class="sampleDetail-detail-title">
          样品基本信息
        </div>
        <div class="sampleDetail-detail-info">
          <div v-for="(info, index) in baseInfo" :key="index">
            {{ info.name }}：{{ info.value }}
          </div>
        </div>

        <div v-for="(item, index) in processInfo" :key="index">
          <div class="sampleDetail-detail-title">
            {{ item.title }}
          </div>
          <div class="sampleDetail-detail-info">
            <div v-for="(info, index2) in item.data" :key="index2">
              <div v-if="info.name !== 'sampleRoomSavedObjId'">
                {{ info.name }}：{{ info.value }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="sampleDetail-receiveTest">
        <van-form @submit="submit">
          <FormItemInput
            v-model:value="formData.operator"
            label="处理人"
            clearable
            placeholder="请输入"
          />

          <FormItemInput
            v-model:value="time"
            label="处理时间"
            disabled
          />

          <FormItemInput
            v-model:value="formData.amount"
            label="测后数量"
            clearable
            required
            placeholder="请输入"
            :rules="[{ required: true, message: '请输入领样数量' }]"
          />

          <FormItemSelect
            v-model:value="type"
            label="测后处理"
            placeholder="请输入"
            :options="[
              { name: '废弃', value: '0' },
              { name: '留样', value: '1' },
            ]"
          />

          <FormItemInput
            v-if="type === '0'"
            v-model:value="formData.reason"
            label="废弃原因"
            clearable
            placeholder="请输入"
          />

          <FormItemInput
            v-if="type === '1'"
            v-model:value="formData.receiver"
            label="留样人"
            clearable
            placeholder="请输入"
          />

          <FormItemInput
            v-if="type === '1'"
            v-model:value="formData.saveDayLimit"
            label="留样期限(天)"
            clearable
            type="digit"
            placeholder="请输入"
          />

          <FormItemInput
            v-if="type === '1'"
            v-model:value="formData.saveSite"
            label="留样地点"
            clearable
            placeholder="请输入"
          />

          <FormItemInput
            v-if="type === '1'"
            v-model:value="formData.reason"
            label="留样原因"
            clearable
            placeholder="请输入"
          />

          <van-button
            type="primary"
            class="sampleDetail-detail-btn"
            native-type="submit"
          >
            处理
          </van-button>
        </van-form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'pinia'
import qs from 'qs'
import { showLoadingToast, showNotify } from 'vant'
import FormItemInput from '~/views/mobileApp/components/MobileFormItem/FormItemInput.vue'
import FormItemSelect from '~/views/mobileApp/components/MobileFormItem/FormItemSelect.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppUserStore } from '~/views/mobileApp/store/useUserStore.ts'

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
    MobileTitleBar,
    FormItemInput,
    FormItemSelect,
  },
  data() {
    return {
      time: formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
      type: '0',
      id: this.$route.params.id,
      testObjectId: undefined,
      objectProcessId: '',
      baseInfo: [],
      processInfo: [],
      testObjectSn: '',
      formData: {
        operator: '',
        saveDayLimit: '',
        amount: '',
        reserveTimeUnit: 'D',
      },
    }
  },
  computed: {
    ...mapState(useAppUserStore, ['userInfo']),
    realName() {
      return this.userInfo.realName
    },
  },
  watch: {
    type(val) {
      if (val === '1') {
        this.formData.receiver = this.realName
      }
      else {
        this.formData.receiver = undefined
      }
    },
  },
  created() {
    this.formData.operator = this.realName
    this.getBaseInfo()
    this.getProcessInfo()
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
          this.testObjectSn = res.data.testObjectSn
        }
      })
    },
    getProcessInfo() {
      mRequest({
        method: 'GET',
        url: api.sampleManageApp.processInfo,
        params: {
          id: this.id,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res.code && res.code !== 20010) {
          let processInfo = []
          if (res.data) {
            const data = res.data.filter(
              item => item.data !== null && item.dataName === '领取样品',
            )

            processInfo = data.map((item) => {
              const keys = Object.keys(item.data)
              return {
                title: item.dataName,
                data: keys.map((key) => {
                  let value = item.data[key]
                  if (
                    key === '留样时间'
                    || key === '处理时间'
                    || key === '领取时间'
                    || key === '留样到期时间'
                  ) {
                    if (typeof value === 'string') {
                      // value = value
                    }
                    else {
                      value = value ? formatDate(value, 'YYYY-MM-DD') : ''
                    }
                  }
                  return {
                    name: key,
                    value,
                  }
                }),
              }
            })
          }
          this.processInfo = processInfo
        }
        else {
          this.processInfo = []
        }
      })
    },
    submit() {
      const data = { ...this.formData }
      data.operationDate = this.time
      data.objectProcessId = this.id
      data.operationType = this.type === '0' ? 3 : 2
      data.testObjectId = this.testObjectId

      if (this.type === '0') {
        delete data.saveDayLimit
        delete data.saveSite
      }

      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      mRequest({
        method: 'POST',
        url: api.sampleManageApp.dispose,
        data: qs.stringify({
          params: JSON.stringify([data]),
        }),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res.success) {
          showNotify({ type: 'primary', message: res.msg })
          this.$router.replace({
            name: 'sampleDetail',
            params: {
              id: this.id,
              isSubmit: true,
            },
          })
          this.$router.go(-1)
        }
        else {
          showNotify({ type: 'danger', message: res.msg })
        }
      }).finally(() => {
        toast.close()
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import url('../index.less');
</style>
