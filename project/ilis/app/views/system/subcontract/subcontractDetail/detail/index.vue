<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div class="subcontractDetail">
    <div class="subcontractDetail-title">
      <strong v-if="dataObj.sampleName" style="font-size: 18px">{{ dataObj.sampleName }}
        <span v-if="dataObj.standard">({{ dataObj.standard }})</span>
      </strong>
    </div>
    <div style="padding: 2px 0" class="text-sm">
      流程状态：{{ dataObj.status || '未设置流程状态' }}
      <a-button
        type="primary"
        class="ml-2"
        @click="setSelStatus"
      >
        设置
      </a-button>
    </div>
    <div style="padding-bottom: 10px; border-bottom: solid 1px #e2e2e2">
      <div class="subcontractDetail-stitle">
        基本信息
      </div>
      <div class="contentBox">
        <a-form ref="formRef" :model="dataObj">
          <a-row :gutter="16">
            <a-col :span="12">
              <div class="hitek-form-layout">
                <div class="hitek-form-layout-label">
                  委托单位
                </div>
                <div class="hitek-form-layout-con">
                  <a-form-item>
                    <a-input
                      v-model:value="dataObj.consignUnit"
                      :disabled="true"
                      :class="{ readonlyCls: !isDetail }"
                    />
                  </a-form-item>
                </div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="hitek-form-layout">
                <div class="hitek-form-layout-label">
                  工程项目
                </div>
                <div class="hitek-form-layout-con">
                  <a-form-item>
                    <a-input
                      v-model:value="dataObj.consignProject"
                      :disabled="true"
                      :class="{ readonlyCls: !isDetail }"
                    />
                  </a-form-item>
                </div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="hitek-form-layout">
                <div class="hitek-form-layout-label">
                  委托编号
                </div>
                <div class="hitek-form-layout-con">
                  <a-form-item>
                    <a-input
                      v-model:value="dataObj.consignSn"
                      :disabled="true"
                      :class="{ readonlyCls: !isDetail }"
                    />
                  </a-form-item>
                </div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="hitek-form-layout">
                <div class="hitek-form-layout-label">
                  样品编号
                </div>
                <div class="hitek-form-layout-con">
                  <a-form-item>
                    <a-input
                      v-model:value="dataObj.sampleSn"
                      :disabled="true"
                      :class="{ readonlyCls: !isDetail }"
                    />
                  </a-form-item>
                </div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="hitek-form-layout">
                <div class="hitek-form-layout-label">
                  工程部位/用途
                </div>
                <div class="hitek-form-layout-con">
                  <a-form-item>
                    <a-input
                      v-model:value="dataObj.projectPartAndUse"
                      :disabled="true"
                      :class="{ readonlyCls: !isDetail }"
                    />
                  </a-form-item>
                </div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="hitek-form-layout">
                <div class="hitek-form-layout-label">
                  委托日期
                </div>
                <div class="hitek-form-layout-con">
                  <a-form-item>
                    <a-date-picker
                      v-model:value="dataObj.consignDate"
                      :disabled="isDetail"
                      style="width: 100%"
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD"
                    />
                  </a-form-item>
                </div>
              </div>
            </a-col>
            <a-col :span="12">
              <div class="hitek-form-layout">
                <div class="hitek-form-layout-label">
                  要求报告日期
                </div>
                <div class="hitek-form-layout-con">
                  <a-form-item>
                    <a-date-picker
                      v-model:value="dataObj.requireReportDate"
                      :disabled="isDetail"
                      style="width: 100%"
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD"
                    />
                  </a-form-item>
                </div>
              </div>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </div>
    <div class="subcontractDetail-tab">
      <router-view></router-view>
    </div>
    <SelStatus ref="SelStatus" @success-select="getSelStatus" />
  </div>
</template>

<script>
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import { getQueryVariable } from '~/providers/common/utils'
import { useVue2MigrationStore } from '~/store/vue2MigrationStore'
import SelStatus from '~/views/system/subcontract/subcontractManage/list/components/selStatus.vue'

export default {
  components: {
    // SelectUnit,
    SelStatus,
  },
  data() {
    return {
      id: getQueryVariable('id'),
      isDetail: true,
      dayjs,
      formLayout: 'horizontal',
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
      dataObj: {},
    }
  },
  created() {
    window._getDetailInfo = this.getDetailInfo
    this.getDetailInfo()
  },
  methods: {
    setSelStatus() {
      this.$refs.SelStatus.showModal(this.id, this.dataObj.status)
    },
    getDetailInfo() {
      window.$oAjax({
        url: window.$oApi.subcontractManage.detailUrl,
        params: { id: this.id },
      }).then((res) => {
        if (res.code === 20000) {
          const data = res.data
          data.consignDate = data.consignDate ? dayjs(data.consignDate).format('YYYY-MM-DD') : ''
          data.subcontractDate = data.subcontractDate ? dayjs(data.subcontractDate).format('YYYY-MM-DD') : ''
          this.dataObj = res.data
          const { setDataObj } = useVue2MigrationStore()
          setDataObj(res.data)
        }
        else {
          this.dataObj = {}
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
    getSelStatus(val) {
      this.dataObj.status = val
    },
    getUnit(data) {
      if (data && data.length > 0) {
        window.$oAjax({
          method: 'POST',
          url: `${window.$oApi.biddingRecord.setWinUnit}`,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'content-type': 'application/json',
          },
          data: {
            id: this.id,
            winBidUnitName: data[0].unitName,
            winBidUnitId: data[0].id,
          },
        }).then((res) => {
          if (res && res.success) {
            message.success(res.message || res.msg)
            this.getDetailInfo()
          }
          else {
            message.error(res.message || res.msg)
          }
        })
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
