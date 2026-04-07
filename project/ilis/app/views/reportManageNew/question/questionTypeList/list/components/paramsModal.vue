<template>
  <div>
    <ht-modal
      title="检测参数"
      :open="visible"
      width="80%"
      centered
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <div>
        <iframe
          ref="params"
          style="border: 0"
          width="100%"
          height="400"
          :src="src"
        ></iframe>
      </div>
    </ht-modal>
  </div>
</template>

<script>
import { rootUrl } from '~/providers/configs/rootUrl'

export default {
  props: ['callback'],
  data() {
    return {
      rootUrl,
      visible: false,
      iframe: null,
      url: `${rootUrl}/testParamController.do?list&canOperation=0`,
      src: '',
    }
  },
  methods: {
    showModal() {
      this.src = this.url
      this.visible = true
    },
    handleOk() {
      const params = this.getParams()
      this.callback(params)
      this.handleCancel()
    },
    handleCancel() {
      this.src = ''
      // document.getElementById("params").contentWindow.$('#dataGridOfTestParam').datagrid('clearSelections');
      // document.getElementById("params").contentWindow.$('#dataGridOfTestParam').datagrid('clearChecked');
      this.visible = false
    },
    getParams() {
      return this.$refs.params.contentWindow
        .$('#dataGridOfTestParam')
        .treegrid('getSelections')
    },
  },
}
</script>
