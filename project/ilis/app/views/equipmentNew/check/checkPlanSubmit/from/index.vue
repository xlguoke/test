<template>
  <div class="checkManageSubmit-form">
    <div
      v-if="pageType === '1'"
      style="font-size: 14px; padding-bottom: 10px; font-weight: bold"
    >
      {{ pageType1.planDepartName }}{{ pageType1.planYear }}年{{
        pageType1.planMouth ? `${pageType1.planMouth}月` : ''
      }}度设备校验计划
    </div>

    <ProcessForm
      ref="processFormRef"
      :hide-remark="true"
      :show-copy-to="true"
      :process-type="config[pageType].id"
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 17 }"
    />
    <div class="checkManageSubmit-submit">
      <a-button :loading="submitLoading" type="primary" @click="submit">
        提交
      </a-button>
    </div>
  </div>
</template>

<script>
/* 多个地方的提交共用该提交页面
  type值：
  1 年度校检计划
  2 校验确认
*/
import { getQueryVariable } from '~/providers/common/utils'

export default {
  data() {
    return {
      config: {
        // 设备检校计划审批 AuditType.java
        1: {
          id: '20',
          formApi: '/rest/auditProcess/getStartFormData',
          submitApi: window.$oApi.checkPlanSubmit.submit,
        },
        2: {
          id: '30',
          formApi: '/rest/auditProcess/getStartFormData',
          submitApi: window.$oApi.checkPlanSubmit.submit2,
        },
      },
      data: [],
      id: getQueryVariable('id'),
      pageType: getQueryVariable('pageType'),
      pageType1: {
        planDepartName: getQueryVariable('planDepartName'),
        planYear: getQueryVariable('planYear'),
        planMouth: getQueryVariable('planMouth'),
      },
      submitLoading: false,
    }
  },
  methods: {
    async submit() {
      const data = await this.$refs.processFormRef.getProcessFormData()

      this.submitLoading = true
      window.$oAjax
        .get(this.config[this.pageType].submitApi, {
          params: {
            id: this.id,
            formPropertyJson: JSON.stringify(data.formPropertyJson),
            presetAuditers: encodeURIComponent(JSON.stringify(data.presetAuditers)),
          },
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          if ((res.code && res.code !== 20010) || res.success) {
            window.$oAntdMessage.success(res.msg || '提交成功')

            window.parent.InitObj
            && window.parent.InitObj.reloadDataGrid
            && window.parent.InitObj.reloadDataGrid()
            if (window.parent.layer) {
              window.parent.layer.msg('提交成功')
              window.parent.layer.closeAll()
            }
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.message || res.msg))
          }
        })
        .finally(() => {
          this.submitLoading = false
        })
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
