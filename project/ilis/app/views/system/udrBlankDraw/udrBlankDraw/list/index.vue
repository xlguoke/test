<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <a-tabs :active-key="activeKey" @change="changeTabs">
          <a-tab-pane key="2" tab="原始记录单" force-render>
            <ChildPage ref="ChildPage" :dict-data="dictData" />
          </a-tab-pane>
          <a-tab-pane key="3" tab="检测报告" force-render>
            <ChildPage ref="ChildPage" :dict-data="dictData" />
          </a-tab-pane>
        </a-tabs>
      </div>
    </a-spin>
  </div>
</template>

<script>
import qs from 'qs'
import { getQueryVariable } from '~/providers/common/utils'
import ChildPage from './components/addEdit.vue'

export default {
  components: {
    ChildPage,
  },
  data() {
    return {
      id: getQueryVariable('id'),
      activeKey: '2',
      dictData: [],
      spinning: false,
    }
  },
  created() {
    this.getDictData()
  },
  methods: {
    changeTabs(key) {
      this.activeKey = key
      this.$refs.ChildPage.getData(key)
    },
    getDictData() {
      this.spinning = true
      window.$oAjax({
        url: window.$oApi.common.getDictContent,
        method: 'POST',
        data: qs.stringify({
          list: JSON.stringify(['@udr_blank_draw_type@']),
        }),
      }).then((res) => {
        this.spinning = false
        if (
          res.success
          && res.attributes
          && res.attributes.udr_blank_draw_type
          && res.attributes.udr_blank_draw_type.length > 0
        ) {
          this.dictData = res.attributes.udr_blank_draw_type
        }
        else {
          this.dictData = []
          // eslint-disable-next-line ts/no-unused-expressions
          res.success === false
            ? window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            : ''
        }
      })
    },
  },
}
</script>

<style lang="less">
.addModalBox {
  .ant-modal-body {
    height: 450px;
    max-height: 450px;
    overflow-y: auto;
    padding: 0 15px;
  }
  /*.ant-form-item-label {*/
  /*width: 80px;*/
  /*}*/
}
</style>
