<template>
  <div class="sampleDetail">
    <div class="sampleDetail-detail">
      <van-sticky>
        <MobileTitleBar left-arrow @click-left="$router.go(-1)" />
        <div class="sampleDetail-detail-header">
          样品信息（{{ testObjectSn }}）
          <span class="sampleDetail-detail-status mr-2">测后留样</span>
          <span v-if="auditStatus === '30'" class="sampleDetail-detail-status">提前处理审核通过</span>
          <span
            v-if="sampleExpire"
            class="sampleDetail-detail-status"
            style="border-color: red; color: red"
          >{{ sampleExpire === 2 ? '留样已到期' : '留样未到期' }}</span>
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
      </div>

      <div class="sampleDetail-receiveTest">
        <van-form @submit="submit">
          <FormItemSelect
            v-model:value="formData.operationType"
            label="处理方式"
            :disabled="!!auditType"
            :options="early ? [
              { name: '废弃', value: '6' },
              { name: '返还', value: '7' },
              { name: '利用', value: '8' },
            ] : [
              { name: '废弃', value: '4' },
              { name: '返还', value: '5' },
              { name: '利用', value: '8' },
            ]"
          />

          <FormItemDate
            v-if="formData.operationType === '4' || formData.operationType === '6'"
            v-model:value="formData.operationDate"
            label="样品废弃日期"
            placeholder="请选择"
          />

          <FormItemDate
            v-if="formData.operationType === '5' || formData.operationType === '7'"
            v-model:value="formData.operationDate"
            label="样品返还日期"
            placeholder="请选择"
          />

          <template v-if="formData.operationType === '4' || formData.operationType === '6'">
            <FormItemInput
              v-model:value="formData.operator"
              label="经办人"
              clearable
              placeholder="请输入"
            />

            <FormItemInput
              v-model:value="formData.amount"
              label="废弃数量"
              clearable
              placeholder="请输入"
              required
              :rules="[{ required: true, message: '请输入废弃数量' }]"
            />

            <FormItemInput
              v-model:value="formData.reason"
              label="废弃原因"
              clearable
              placeholder="请输入"
            />
          </template>

          <template v-if="formData.operationType === '5' || formData.operationType === '7'">
            <FormItemInput
              v-model:value="formData.receiver"
              label="接受人"
              clearable
              placeholder="请输入"
            />

            <FormItemInput
              v-model:value="formData.operator"
              label="经办人"
              clearable
              placeholder="请输入"
            />

            <FormItemInput
              v-model:value="formData.amount"
              label="返还数量"
              clearable
              placeholder="请输入"
              required
              :rules="[{ required: true, message: '请输入返还数量' }]"
            />

            <FormItemInput
              v-model:value="formData.remark"
              label="备注"
              clearable
              placeholder="请输入"
            />
          </template>

          <template v-if="formData.operationType === '8'">
            <FormItemInput
              v-model:value="formData.operator"
              label="经办人"
              clearable
              placeholder="请输入"
            />

            <FormItemInput
              v-model:value="formData.amount"
              label="利用数量"
              clearable
              placeholder="请输入"
              required
              :rules="[{ required: true, message: '请输入利用数量' }]"
            />

            <FormItemInput
              v-model:value="formData.reason"
              label="申请利用原因"
              clearable
              placeholder="请输入"
            />

            <FormItemPerson
              v-if="auditStatus !== '30'"
              v-model:value="person"
              label="审核人员"
            />
          </template>

          <van-button
            native-type="submit"
            type="primary"
            class="sampleDetail-detail-btn"
          >
            确定
          </van-button>
        </van-form>
      </div>
    </div>
  </div>
</template>

<script>
import qs from 'qs'
import { showDialog, showLoadingToast, showNotify } from 'vant'
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import FormItemInput from '~/views/mobileApp/components/MobileFormItem/FormItemInput.vue'
import FormItemPerson from '~/views/mobileApp/components/MobileFormItem/FormItemPerson.vue'
import FormItemSelect from '~/views/mobileApp/components/MobileFormItem/FormItemSelect.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'

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
    FormItemInput,
    FormItemSelect,
    FormItemDate,
    FormItemPerson,
    MobileTitleBar,
  },
  data() {
    return {
      sampleExpire: '',
      id: this.$route.params.id,
      early: this.$route.params.early,
      auditType: null,
      auditStatus: null,
      testObjectId: undefined,
      baseInfo: [],
      testObjectSn: '',
      formData: {
        operationType: '4',
      },
      person: [],
    }
  },
  created() {
    this.sampleExpire = sessionStorage.getItem('sampleExpire')
    if (this.early) {
      this.formData.operationType = '6'
    }

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
          let baseInfo = []
          if (res.data && JSON.stringify(res.data) !== '{}') {
            this.testObjectId = res.data.testObjectId
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

          if (res.data.auditInfo && res.data.auditInfo.status) {
            this.auditStatus = res.data.auditInfo.status
            this.auditType = res.data.auditInfo.type

            if (this.auditType) {
              if (this.early) {
                this.auditType === '1' && (this.formData.operationType = '6')
                this.auditType === '2' && (this.formData.operationType = '7')
                this.auditType === '4' && (this.formData.operationType = '8')
              }
              else {
                this.auditType === '1' && (this.formData.operationType = '4')
                this.auditType === '2' && (this.formData.operationType = '5')
                this.auditType === '4' && (this.formData.operationType = '8')
              }
            }
          }
        }
      })
    },
    // 为利用时，需要走审核流程
    addAudit() {
      if (this.person.length === 0) {
        showDialog({ message: '请选择审核人员!' })
        return
      }

      const data = { ...this.formData }
      data.objectProcessId = this.id
      data.testObjectId = this.testObjectId
      data.operationDate = undefined

      const moduleParamStr = {
        operations: [data],
        auditPersons: [
          {
            userId: this.person[0].id,
            auditSequence: 1,
          },
        ],
      }

      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      mRequest({
        method: 'POST',
        url: api.sampleManageApp.addAudit,
        data: qs.stringify({
          moduleParamStr: JSON.stringify(moduleParamStr),
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
    submit() {
      if (this.formData.operationType === '8' && this.auditStatus !== '30') {
        this.addAudit()
        return
      }

      const data = { ...this.formData }
      data.objectProcessId = this.id
      data.testObjectId = this.testObjectId

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
          showDialog({ message: res.msg || res.message || '操作失败' })
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
