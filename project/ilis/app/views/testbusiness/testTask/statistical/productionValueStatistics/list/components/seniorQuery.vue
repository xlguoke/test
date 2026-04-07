<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div>
    <ht-modal
      title="高级查询"
      centered
      :open="visible"
      :mask-closable="false"
      width="960px"
      @cancel="handleCancel"
      @ok="handleOk"
    >
      <a-spin :spinning="spinning">
        <div class="spin-content">
          <a-form ref="formRef" :model="dataObj">
            <a-row>
              <a-col :span="12">
                <a-form-item
                  label="委托年月"
                  :label-col="labelCol"
                  :wrapper-col="wrapperCol"
                >
                  <a-range-picker
                    :placeholder="['开始月份', '结束月份']"
                    format="YYYY-MM"
                    :mode="mode2"
                    :value="dateBeginEnd.length > 0 ? dateBeginEnd : null"
                    @panel-change="handlePanelChange"
                    @change="handleChange"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item
                  label="检测大类"
                  :label-col="labelCol"
                  :wrapper-col="wrapperCol"
                >
                  <a-row :gutter="15">
                    <a-col :span="18">
                      <a-input
                        :value="bigData && bigData.length > 0
                          ? bigData.map((item) => item.name).join('; ')
                          : ''"
                        :disabled="true"
                        :class="{ readonlyCls: !isDetail }"
                        placeholder="请选择"
                        autocomplete="off"
                      />
                    </a-col>
                    <a-col :span="6" style="text-align: right">
                      <a-button style="float: right" @click="setBigCate">
                        选择
                      </a-button>
                    </a-col>
                  </a-row>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item
                  label="委托单位"
                  :label-col="labelCol"
                  :wrapper-col="wrapperCol"
                >
                  <a-input
                    v-model:value="dataObj.consignUnit"
                    placeholder="请输入"
                    autocomplete="off"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item
                  label="工程项目"
                  :label-col="labelCol"
                  :wrapper-col="wrapperCol"
                >
                  <a-input
                    v-model:value="dataObj.consignProject"
                    placeholder="请输入"
                    autocomplete="off"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item
                  label="委托人"
                  :label-col="labelCol"
                  :wrapper-col="wrapperCol"
                >
                  <a-input
                    v-model:value="dataObj.sampleSenderName"
                    placeholder="请输入"
                    autocomplete="off"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item
                  label="委托人电话"
                  :label-col="labelCol"
                  :wrapper-col="wrapperCol"
                >
                  <a-input
                    v-model:value="dataObj.sampleSenderTel"
                    placeholder="请输入"
                    autocomplete="off"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item
                  label="委托编号"
                  :label-col="labelCol"
                  :wrapper-col="wrapperCol"
                >
                  <a-input
                    v-model:value="dataObj.consignSn"
                    placeholder="请输入"
                    autocomplete="off"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item
                  label="样品编号"
                  :label-col="labelCol"
                  :wrapper-col="wrapperCol"
                >
                  <a-input
                    v-model:value="dataObj.testObjectSn"
                    placeholder="请输入"
                    autocomplete="off"
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item
                  label="资质类型"
                  :label-col="labelCol"
                  :wrapper-col="wrapperCol"
                >
                  <a-select
                    v-model:value="dataObj.qualificationTypeId"
                    placeholder="请选择"
                  >
                    <a-select-option :value="undefined">
                      全部
                    </a-select-option>
                    <a-select-option
                      v-for="(item, index) in qualificationTypeData"
                      :key="index"
                      :value="item.id"
                    >
                      {{ item.name }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item
                  label="检测类别"
                  :label-col="labelCol"
                  :wrapper-col="wrapperCol"
                >
                  <a-select v-model:value="dataObj.checkTypeId" placeholder="请选择">
                    <a-select-option :value="undefined">
                      全部
                    </a-select-option>
                    <a-select-option
                      v-for="(item, index) in checkTypeData"
                      :key="index"
                      :value="item.id"
                    >
                      {{ item.name }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>

              <a-col :span="12">
                <a-form-item
                  label="是否分包"
                  :label-col="labelCol"
                  :wrapper-col="wrapperCol"
                >
                  <a-select v-model:value="dataObj.themeType" placeholder="请选择">
                    <a-select-option :value="undefined">
                      全部
                    </a-select-option>
                    <a-select-option value="1">
                      是
                    </a-select-option>
                    <a-select-option value="0">
                      否
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item
                  label="已提交正式报告"
                  :label-col="labelCol"
                  :wrapper-col="wrapperCol"
                >
                  <a-switch
                    v-model:checked="dataObj.commitedFormalReport"
                    default-checked
                  />
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item
                  label="委托数据来源"
                  :label-col="labelCol"
                  :wrapper-col="wrapperCol"
                >
                  <a-select
                    v-model:checked="dataObj.consignBigType"
                    placeholder="请选择"
                  >
                    <a-select-option :value="undefined">
                      全部
                    </a-select-option>
                    <a-select-option value="1">
                      创建委托
                    </a-select-option>
                    <a-select-option value="2">
                      创建综合任务
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :span="12">
                <a-form-item
                  label="缴费状态"
                  :label-col="labelCol"
                  :wrapper-col="wrapperCol"
                >
                  <a-select v-model:checked="dataObj.feeStatus" placeholder="请选择">
                    <a-select-option :value="undefined">
                      全部
                    </a-select-option>
                    <a-select-option value="1">
                      已结清
                    </a-select-option>
                    <a-select-option value="2">
                      部分缴费
                    </a-select-option>
                    <a-select-option value="3">
                      未缴费
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
            </a-row>
          </a-form>
        </div>
      </a-spin>
      <SelectBigCate ref="SelectBigCate" :callback="getBigCate" />
    </ht-modal>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import SelectBigCate from '~/providers/components/bigCategory.vue'
import { rootUrl } from '~/providers/configs/rootUrl'

export default {
  components: {
    SelectBigCate,
  },
  props: ['callback'],
  data() {
    return {
      spinning: false,
      rootUrl,
      formLayout: 'horizontal',
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
      dayjs,
      visible: false,
      isDetail: false,
      dataObj: {
        commitedFormalReport: true,
      },
      mode2: ['month', 'month'],
      dateBeginEnd: [],
      bigData: [],
      checkTypeData: [],
      qualificationTypeData: [],
    }
  },
  created() {},
  methods: {
    // 选择检测大类  setBigCate
    setBigCate() {
      const acceptData = this.bigData.length > 0 ? this.bigData : []
      this.$refs.SelectBigCate.showModal('checkbox', acceptData)
    },
    // 选择检测大类 回显
    getBigCate(acceptData) {
      this.bigData = acceptData
    },
    getTypeData() {
      window.$oAjax({ url: window.$oApi.consignList.getConsginTestType }).then(
        (res) => {
          let arr = []
          if (res.length > 0) {
            arr = res
          }
          else {
            // eslint-disable-next-line ts/no-unused-expressions
            res.success === false
              ? window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
              : ''
          }
          this.checkTypeData = [...arr]
        },
      )

      window.$oAjax({ url: window.$oApi.common.qualifications }).then((res) => {
        let arr = []
        if (res.code !== 20010) {
          arr = res.data
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.qualificationTypeData = [...arr]
      })
    },
    async showModal(dateBeginEnd) {
      await this.getTypeData()
      this.dateBeginEnd = dateBeginEnd
      this.visible = true
    },
    dataRequired() {
      if (this.dateBeginEnd.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('委托年月不能为空!'))
        return false
      }
      return true
    },
    handleOk() {
      const data = { ...this.dataObj }
      if (this.dataRequired()) {
        data.dateBeginEnd = this.dateBeginEnd
        for (const key in data) {
          if (!data[key]) {
            data[key] = ''
          }
        }
      }
      this.callback(data)
      this.handleCancel()
    },
    handleCancel() {
      this.dataObj = {
        commitedFormalReport: true,
      }
      this.bigData = []
      this.visible = false
    },
    handlePanelChange(value, mode) {
      this.dateBeginEnd = value

      this.mode2 = [
        mode[0] === 'date' ? 'month' : mode[0],
        mode[1] === 'date' ? 'month' : mode[1],
      ]
    },
    handleChange(value) {
      // this.value = value;
      // 点击删除时设置
      this.dateBeginEnd = value
    },
  },
}
</script>

<style lang="less">
.equipmentOutgo-add-modal {
  .ant-modal-body {
    max-height: 450px;
    overflow-y: auto;
  }
  .text-right {
    text-align: right;
  }
}
</style>
