<template>
  <div>
    <ht-modal
      v-if="visible"
      v-model:open="visible"
      title="发起报告更正"
      centered
      :confirm-loading="confirmLoading"
      :mask-closable="false"
      @ok="handleSubmit"
      @cancel="cancelModal"
    >
      <a-form :model="alterForm">
        <li class="required_row">
          <a-form-item
            label="更正报告编号"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 15 }"
          >
            <a-input-group compact>
              <a-input
                style="width: 200px"
                disabled
                :value="
                  selReport[0].sourceRsn
                    ? selReport[0].sourceRsn
                    : selReport[0].reportNumber
                "
              />
              <a-input
                v-model:value="alterForm.snSuffix"
                style="width: 105px"
                placeholder="请输入更正编号"
                :disabled="isAlter"
              />
            </a-input-group>
          </a-form-item>
        </li>

        <a-form-item
          label="更正意见"
          class="required_row"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
        >
          <a-textarea
            v-model:value="alterForm.opinion"
            placeholder="请输入更正意见"
            :auto-size="{ minRows: 3, maxRows: 5 }"
          />
        </a-form-item>
      </a-form>

      <template #footer>
        <a-button key="back" @click="cancelModal">
          取消
        </a-button>
        <a-button
          key="submit"
          :disabled="alterForm.snSuffix == ''"
          type="primary"
          :loading="loading"
          @click="handleSubmit"
        >
          确定
        </a-button>
      </template>
    </ht-modal>
  </div>
</template>

<script>
import { message } from 'ant-design-vue'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

export default {
  props: ['callback'],
  emits: ['callback'],
  data() {
    return {
      selReport: [],
      loading: false,

      visible: false,
      confirmLoading: false,
      reportId: '',
      alterForm: {
        snSuffix: '',
        opinion: '',
      },
      isAlter: false,
    }
  },
  created() {},
  methods: {
    showModal(selReport) {
      this.alterForm = {
        snSuffix: '',
        opinion: '',
      }
      this.selReport = selReport
      this.visible = true
      this.reportId = selReport[0].id
      this.getReportSuffix(selReport[0].id)
    },
    getReportSuffix(id) {
      // eslint-disable-next-line ts/no-this-alias
      const that = this
      window.$oAjax({
        method: 'get',
        url: `rest/report/revise/snSuffix/${id}`,
      }).then((res) => {
        if (res.code === 20000) {
          that.alterForm.snSuffix = res.data
          if (that.alterForm.snSuffix) {
            this.isAlter = true
          }
        }
      })
    },

    cancelModal() {
      this.alterForm = {
        snSuffix: '',
        opinion: '',
      }
      this.visible = false
    },

    handleSubmit() {
      this.loading = true
      this.confirmLoading = true
      if (!this.alterForm.snSuffix) {
        message.warn('请输入更正报告编号')
        return
      }
      else if (!this.alterForm.opinion) {
        message.warn('请输入更正意见')
        return
      }
      window.$oAjax({
        method: 'get',
        url: `rest/report/revise/create/${this.reportId}`,
        params: this.alterForm,
      }).then((res) => {
        this.loading = false
        if (res.code === 20000) {
          message.success(res.message || res.msg || '操作成功')
          this.cancelModal()
          $emit(this, 'callback')
        }
        else {
          message.error(res.message || res.msg)
        }
        this.confirmLoading = false
      })
    },
  },
}
</script>

<style>
.required_row .ant-form-item-label:before {
  content: '*';
  color: #c30000;
  margin-right: 5px;
}
</style>
