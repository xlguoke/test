<template>
  <div class="sampleManageApp-detail">
    <div class="sampleManageApp-detail-header">
      样品信息（{{ testObjectSn }}）
      <span class="sampleManageApp-detail-status">测后留样</span>
      <span
        class="sampleManageApp-detail-status"
        style="border-color: red; color: red"
      >留样未到期</span>
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
          label="申请处理方式"
          :label-col="{ xs: 6 }"
          :wrapper-col="{ xs: 18 }"
        >
          <select
            v-model="formState.operationType"
            placeholder="请输入"
          >
            <option value="6">
              废弃
            </option>
            <option value="7">
              返还
            </option>
            <option value="9">
              利用
            </option>
          </select>
        </a-form-item>
        <a-form-item
          label="申请原因"
          :label-col="{ xs: 6 }"
          :wrapper-col="{ xs: 18 }"
        >
          <a-input v-model:value="formState.reason" placeholder="请输入" />
        </a-form-item>
        <a-form-item
          label="申请处理数量"
          :label-col="{ xs: 6 }"
          :wrapper-col="{ xs: 18 }"
        >
          <a-input v-model:value="formState.amount" placeholder="请输入" />
        </a-form-item>
        <a-form-item
          label="审核人员"
          :label-col="{ xs: 6 }"
          :wrapper-col="{ xs: 18 }"
        >
          <span
            v-for="(item, index) in person"
            :key="item.id"
            :class="`sampleManageApp-detail-person ${
              index == '0' ? 'active' : ''
            }`"
          >
            <span>{{ item.name }}</span>
          </span>
          <a-button
            style="margin-bottom: 5px"
            @click="showDrawer"
          >
            <PlusCircleOutlined />
            添加
          </a-button>
        </a-form-item>
      </a-form>
      <SelectPerson ref="SelectPerson" :callback="getPerson" />
      <a-button
        type="primary"
        class="sampleManageApp-detail-btn"
        :loading="submitLoading"
        @click="submit"
      >
        提交申请
      </a-button>
    </div>
  </div>
</template>

<script>
import { PlusCircleOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import qs from 'qs'
import mAjax from '~/providers-moblie/common/ajax'
import mApi from '~/providers-moblie/common/api'
import SelectPerson from './selectPerson.vue'

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
    SelectPerson,
    PlusCircleOutlined,
  },
  data() {
    return {
      person: [],
      id: this.$route.params.id,
      baseInfo: [],
      testObjectSn: '',
      formState: {
        operationType: '6',
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
    submit() {
      if (this.person.length === 0) {
        message.warn('请选择审核人员!')
        return
      }

      const data = { ...this.formState }
      data.objectProcessId = this.id
      data.id = this.id

      const moduleParamStr = {
        operations: [data],
        auditPersons: [
          {
            userId: this.person[0].id,
            auditSequence: 1,
          },
        ],
      }

      this.submitLoading = true
      mAjax({
        method: 'POST',
        url: mApi.sampleManageApp.addAudit,
        data: qs.stringify({
          moduleParamStr: JSON.stringify(moduleParamStr),
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
    getPerson(data) {
      // if(this.person.find(item=>item.id == data.id)){
      //   message.warn("审核人员已存在");
      //   return;
      // }
      // this.person.push(data);
      this.person = [data]
    },
    showDrawer() {
      this.$refs.SelectPerson.showDrawer()
    },
  },
}
</script>

<style lang="less"></style>
