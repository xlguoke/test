<template>
  <div class="projectDetail">
    <div class="projectDetail-tab">
      <div class="projectDetail-tab-btn">
        <router-link to="/">
          委托编号
        </router-link>
        <router-link to="/sampleList">
          样品编号
        </router-link>
        <router-link v-if="visible" to="/provideToCustomerSampleList">
          来样编号
        </router-link>
        <router-link to="/taskList">
          任务编号
        </router-link>
        <router-link to="/recordList">
          记录编号
        </router-link>
        <router-link to="/reportList">
          报告编号
        </router-link>
      </div>
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import { getQueryVariable } from '~/providers/common/utils'

export default {
  components: {},
  data() {
    return {
      id: getQueryVariable('id'),
      status: getQueryVariable('status'),
      visible: false,
    }
  },
  created() {
    this.getEnableProvideToCustomerSampleCode()
  },
  methods: {
    /**
     * 是否开启 来样编号
     */
    getEnableProvideToCustomerSampleCode() {
      window.$oAjax({
        url: `${window.$oApi.getBusinessParam}&key=ENABLE_PROVIDE_TO_CUSTOMER_SAMPLE_CODE`,
        method: 'GET',
      }).then((res) => {
        if (res.success && res.obj === 'Y') {
          this.visible = true
        }
      })
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
