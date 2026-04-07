<template>
  <ht-modal
    title="通知修改委托"
    width="460px"
    :open="value"
    :closable="false"
    :mask-closable="false"
    :destroy-on-close="true"
    :confirm-loading="confirmLoading"
    @ok="submit"
    @cancel="cancel"
  >
    <a-textarea v-model:value="noticeContent" placeholder="请输入" :rows="8" />
  </ht-modal>
</template>

<script>
import { message } from 'ant-design-vue'
import { NoticeControllerService } from '~/providers/providers/services/noticeController'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

const noticeControllerService = new NoticeControllerService()

export default {
  props: ['value', 'reportIds'],
  emits: ['update:value', 'on-success'],
  data() {
    return {
      noticeContent: '',
      confirmLoading: false,
    }
  },
  watch: {
    value(val) {
      if (!val) {
        this.noticeContent = ''
      }
    },
  },
  methods: {
    async submit() {
      if (!this.noticeContent) {
        message.error('请输入通知修改委托内容')
        return
      }
      this.confirmLoading = true
      const res = await noticeControllerService
        .doConsignModifyNotice({
          objectId: this.reportIds.join(','),
          type: 4,
          noticeContent: this.noticeContent,
        })
        .finally(() => {
          this.confirmLoading = false
        })

      if (res.success !== false) {
        window.$oAntdModal.success({
          title: '提示',
          content:
            '通知修改委托后，报告内容可能存在变更，若有报告内容变更，请点击重新生成报告；重新生成报告后，需要重新进行电子签名（若启用电子签名）与签章',
        })
        $emit(this, 'on-success')
        this.cancel()
      }
    },
    cancel() {
      $emit(this, 'update:value', false)
    },
  },
}
</script>
