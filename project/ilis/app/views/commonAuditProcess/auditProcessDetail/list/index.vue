<!-- eslint-disable vue/valid-v-for -->
<template>
  <div style="overflow: hidden">
    <a-spin :spinning="spinning">
      <a-form :label-col="{ span: 4 }" :wrapper-col="{ span: 19 }">
        <a-form-item label="流程类型">
          <a-input v-model:value="form.processName" disabled />
        </a-form-item>
        <a-form-item v-for="d in filterFormItem" :label="d.name">
          <template v-if="d.type.name === 'file'">
            <HtUploadFile
              :key="d.value"
              :qr-code-url="d.value"
              :business-type="BUSINES_TYPE.WORKFLOW_FORM_FILE"
              is-reandonly
            />
          </template>
          <a-input v-else v-model:value="d.value" disabled />
        </a-form-item>
        <a-form-item label="审批进度">
          <a-steps progress-dot :current="activeKey" direction="vertical">
            <a-step
              v-for="(item) in auditers"
              :key="item.activitiNodeId"
              :status="passStatus(item.pass)"
              :title="`${item.processTaskName}${
                item.presetUserRealName ? `：${item.presetUserRealName}` : ''
              }${item.text || ''}`"
            >
              <template v-if="item.comment" #description>
                <CheckCircleOutlined
                  v-if="item.pass"
                  style="color: #52c41a"
                />
                <CloseCircleOutlined v-else style="color: #cc3030" />
                {{ item.comment }}
              </template>
            </a-step>
          </a-steps>
        </a-form-item>
      </a-form>
    </a-spin>
  </div>
</template>

<script>
/* eslint-disable eqeqeq */
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons-vue'
import { BUSINES_TYPE, HtUploadFile } from '~/components/htUploadFile'
import { getQueryVariable } from '~/providers/common/utils'

export default {
  components: {
    CheckCircleOutlined,
    CloseCircleOutlined,
    HtUploadFile,
  },
  data() {
    return {
      BUSINES_TYPE,
      form: {
        startFormProperties: [],
      },
      auditers: [],
      activeKey: -1,
      visible: false,
      spinning: true,
      businessKey: getQueryVariable('businessKey'),
      processTypeId: getQueryVariable('processTypeId'),
      processInstanceId: getQueryVariable('processInstanceId'),
    }
  },
  computed: {
    filterFormItem() {
      const { formProperties, startFormProperties } = this.form
      const formVal = formProperties ? JSON.parse(formProperties) : {}

      const forms = startFormProperties.filter((d) => {
        d.value = formVal[d.id] || ''
        if (d.type.name === 'boolean') {
          d.value = formVal[d.id] == '1' ? '是' : '否'
        }
        return d.readable
      })
      return forms
    },
  },
  created() {
    this.spinning = true
    this.getDetailData()
  },
  methods: {
    passStatus(pass) {
      if (pass)
        return 'finish'
      if (pass === false)
        return 'error'
      return 'wait'
    },
    // 获取详情数据
    async getDetailData() {
      const res = await window.$oAjax.get(
        `${window.$oApi.auditProcess.detail}/${this.processInstanceId}`,
      )
      this.spinning = false
      if (res.code !== 20000) {
        window.$oAntdMessage.error(res.message || '获取详情失败')
        return
      }
      this.form = res.data || {}
      this.getAuditPersoners(res.data)
    },
    // 初始化审核节点，获取节点预设人员
    async getAuditPersoners(res) {
      const auditTasks = res.auditTasks ? JSON.parse(res.auditTasks) : []
      const auditRecords = res.auditRecords ? JSON.parse(res.auditRecords) : []
      if (auditTasks.length === 0)
        return
      try {
        const resAuditer = await window.$oAjax.get(
          `${window.$oApi.testItem.getPresetAuditer
          }?processInstanceId=${this.processInstanceId}`,
        )
        if (resAuditer.code !== 20000) {
          window.$oAntdMessage.error(resAuditer.message || '获取节点审核人员失败')
          return
        }
        for (let i = 0; i < auditTasks.length; i++) {
          const item = auditTasks[i]
          const findItem = resAuditer.data.find(
            d => d.activitiNodeId === item.key,
          )

          let text = ''
          const matchRecord = auditRecords.filter(d => d.taskDefKey === item.key)
          if (!matchRecord?.length) {
            text = '（待审批）'
          }
          else if (matchRecord?.every(i => i.isPass)) {
            text = '（审核通过）'
          }
          else {
            text = '（审核不通过）'
          }
          if (!findItem)
            continue
          auditTasks[i] = {
            activitiNodeId: item.key,
            processTaskName: item.name,
            text,
            ...findItem,
          }
        }
        this.auditers = auditTasks
        this.showAuditProcess(res)
      }
      catch (err) {
        window.$oAntdMessage.error(err.message || '请求异常')
      }
    },
    // 回显审核进度
    showAuditProcess(res) {
      let auditRecords = res.auditRecords ? JSON.parse(res.auditRecords) : []
      if (auditRecords.length === 0)
        return
      auditRecords.sort((p, n) => p.auditTime - n.auditTime)
      const ind = auditRecords.findLastIndex(d => !d.pass)
      if (ind !== -1) {
        auditRecords = auditRecords.slice(ind + 1)
      }
      for (let i = 0; i < this.auditers.length; i++) {
        const item = this.auditers[i]
        const findItem = auditRecords.find(
          d => d.taskName === item.processTaskName,
        )
        if (!findItem)
          continue
        item.pass = findItem.pass
        item.comment = findItem.comment
        if (!item.presetUserRealName) {
          item.presetUserRealName = findItem.userRealName
        }
        this.activeKey = i
      }
    },
    // 确定审批结果
    confirmResult() {
      this.handleCancel()
      this.callback()
    },
    handleCancel() {
      this.isBatch = false
      this.visible = false
      this.showResult = false
      this.confirmLoading = false
    },
  },
}
</script>

<style lang="less" scoped>
.audit-result {
  width: 100%;
  line-height: 25px;
}
:deep(.ant-steps-dot .ant-steps-item-content) {
  width: auto;
  .ant-steps-item-title {
    font-size: 14px;
  }
}
.ant-input[disabled] {
  color: #888;
}
</style>
