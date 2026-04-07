<template>
  <div class="scan-code-query">
    <a-input
      ref="scanCodeQueryData"
      v-model:value="searchString"
      :placeholder="placeholder"
      @change="changeValue"
    />
    <a-button style="margin-left: 10px" type="primary" @click="enterSearch">
      添加
    </a-button>
  </div>
</template>

<script>
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

export default {
  props: {
    value: String,
    processObjectIds: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '输入标签编码回车或扫描标签码即可添加',
    },
    /**
     * @param {string} scanType 扫码类型 sampleFlow(样品流转) | example(标养室出入库) | equipment(设备外出)
     */
    scanType: {
      type: String,
      default: 'sampleFlow',
    },
  },
  emits: ['enter', 'update:value'],
  data() {
    return {
      apiUrl: '/rest/allObjectController/getProcessInfo',
      searchString: this.value,
      timer: null,
      scanCodeQuery: null,
    }
  },
  mounted() {
    if (!document.getElementById('scan_code_script')) {
      const _script = document.createElement('script')
      _script.src = '/ilis2/plug-in/assets/js/scanCodeQueryData.js'
      _script.id = 'scan_code_script'
      document.body.appendChild(_script)
    }

    this.initQueryInput()
  },
  methods: {
    initQueryInput() {
      if (!window.commonScanCodeQuery) {
        this.timer = setInterval(() => {
          this.initQueryInput()
        }, 500)
        return
      }

      this.timer && clearInterval(this.timer)
      this.scanCodeQuery = window.commonScanCodeQuery({
        ele: this.$refs.scanCodeQueryData.$el,
        type: this.scanType,
        query: this.scanCodeQueryCallback,
      })
    },
    scanCodeQueryCallback(err, data) {
      if (err) {
        return window.$oAntdMessage.error(err.message || '查询数据异常')
      }
      $emit(this, 'enter', { err, data })
    },
    changeValue() {
      $emit(this, 'update:value', this.searchString)
    },
    async enterSearch() {
      this.scanCodeQuery.query()
    },
  },
}
</script>

<style lang="less" scoped>
.scan-code-query {
  display: inline-flex;
  min-width: 400px;
}
</style>
