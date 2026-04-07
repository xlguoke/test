<template>
  <ht-modal
    v-model:open="_value"
    title="设置签章页码"
    :mask-closable="false"
    width="80%"
    :confirm-loading="confirmLoading"
    class="setting-stamp-page"
    @cancel="cancel"
  >
    <iframe
      v-if="value"
      ref="Iframe"
      :src="iframeSrc"
      border="0"
      height="450px"
      width="100%"
    ></iframe>
    <template #footer>
      <a-button @click="cancel">
        关闭
      </a-button>
      <a-button type="primary" @click="submit">
        确定
      </a-button>
    </template>
  </ht-modal>
</template>

<script>
import { CommonBodyReportService } from '~/providers/providers/services/common-body-report'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

const commonBodyReportService = new CommonBodyReportService()

export default {
  props: ['value', 'reportIds'],
  emits: ['update:value', 'on-success'],
  data() {
    return {
      confirmLoading: false,
    }
  },
  computed: {
    iframeSrc() {
      const url = new URL(`/ilis2/view.do?page=stampPage`, location.origin)
      url.searchParams.append('pageName', 'report')
      url.searchParams.append('reportId', this.reportIds.join(','))
      return url.href
    },
    _value() {
      return this.value
    },
  },
  created() {
    window.layer = {
      msg: (msg) => {
        window.$oAntdMessage.warn({
          content: msg,
          duration: 5,
        })
      },
    }
  },
  methods: {
    async submit() {
      const { reportIds } = this
      const content = this.$refs.Iframe.contentWindow
      const data = content.getSelectDatas()

      if (reportIds.length == 1) {
        data.forEach((item) => {
          item.reportId = reportIds[0]
        })
      }

      this.confirmLoading = true
      await commonBodyReportService.file(data).finally(() => {
        this.confirmLoading = false
      })

      window.$oAntdMessage.success('操作成功！')
      $emit(this, 'on-success')
      this.cancel()
    },
    cancel() {
      $emit(this, 'update:value', false)
    },
  },
}
</script>

<style lang="less" scoped>
.setting-stamp-page {
  iframe {
    border: 0;
  }

  :deep(.ant-modal-body) {
    height: 450px;
  }
}
</style>
