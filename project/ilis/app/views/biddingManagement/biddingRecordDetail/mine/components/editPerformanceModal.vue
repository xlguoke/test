<template>
  <div>
    <ht-modal
      v-model:open="uploadVisible"
      title="新增"
      centered
      :confirm-loading="confirmLoading"
      class="otherAchievement-uploadModal"
      :mask-closable="false"
      @ok="handleSubmit"
      @cancel="cancelModal"
    >
      <a-form ref="formRef" :model="formState">
        <a-form-item
          label="序号"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
          :rules="[{ required: true, message: '请输入序号' }]"
        >
          <a-inputNumber
            v-model:value="formState.quoteIndex"
            style="width: 100%"
            placeholder="请输入序号"
          />
        </a-form-item>
        <a-form-item
          label="业绩"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
        >
          <a-button
            style="float: right"
            @click="
              () => {
                $refs.SelectPerformance.showModal()
              }
            "
          >
            选择
          </a-button>
          <div style="font-size: 12px" class="mt-1.5">
            {{ biddingPerformanceData.name }}
          </div>
        </a-form-item>
      </a-form>
    </ht-modal>
    <SelectPerformance ref="SelectPerformance" :callback="getPerformance" />
  </div>
</template>

<script>
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'
import SelectPerformance from './selectPerformance.vue'

export default {
  components: {
    SelectPerformance,
  },
  props: ['callback', 'recordId', 'unitId'],
  data() {
    return {
      uploadVisible: false,
      confirmLoading: false,
      dayjs,
      biddingPerformanceData: {},
      formState: {},
    }
  },
  methods: {
    showModal() {
      this.uploadVisible = true
    },
    cancelModal() {
      this.formState = {}
      this.biddingPerformanceData = {}
      this.uploadVisible = false
    },
    handleSubmit() {
      if (!this.biddingPerformanceData.id) {
        message.warn('请选择业绩')
        return
      }

      this.$refs.formRef.validateFields().then(() => {
        this.confirmLoading = true
        const data = {
          ...this.formState,
          recordId: this.recordId,
          unitId: this.unitId,
          biddingPerformanceId: this.biddingPerformanceData.id,
        }

        window.$oAjax({
          method: 'POST',
          url: `${window.$oApi.biddingRecord.performanceOperation}`,
          data,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'content-type': 'application/json',
          },
        }).then(
          (res) => {
            if (res && res.success) {
              this.cancelModal()
              message.success(res.message || res.msg)
              this.callback()
            }
            else {
              message.error(res.message || res.msg)
            }
            this.confirmLoading = false
          },
          () => {
            this.confirmLoading = false
          },
        )
      })
    },
    getPerformance(data) {
      if (data && data.length > 0) {
        this.biddingPerformanceData = {
          id: data[0].id,
          name: data[0].performanceName,
        }
      }
    },
  },
}
</script>

<style></style>
