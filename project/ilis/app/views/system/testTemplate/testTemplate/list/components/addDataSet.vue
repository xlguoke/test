<template>
  <div>
    <ht-modal
      title="新增数据集"
      :open="visible"
      centered
      class="projectManageList-addModal"
      :mask-closable="false"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-spin :spinning="spinning">
        <div class="spin-content">
          <a-form ref="formRef" :model="formState">
            <a-form-item
              label="数据集名称"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 17 }"
              :rules="[{ required: true, message: '数据集名称为必填项！' }]"
              name="recordSetName"
            >
              <a-input
                v-model:value="formState.recordSetName"
                placeholder="请输入"
              />
            </a-form-item>
            <a-form-item
              label="检测项目ID"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 17 }"
              :rules="[{ required: true, message: 'groupkey为必填项！' }]"
              name="groupkey"
            >
              <a-input
                v-model:value="formState.groupkey"
                placeholder="请输入"
              />
            </a-form-item>
            <a-form-item
              label="样品ID"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 17 }"
              :rules="[{ required: true, message: '样品ID为必填项！' }]"
              name="testObjectId"
            >
              <a-input
                v-model:value="formState.testObjectId"
                placeholder="请输入"
              />
            </a-form-item>
          </a-form>
        </div>
      </a-spin>
    </ht-modal>
  </div>
</template>

<script>
export default {
  props: ['callback'],
  data() {
    return {
      visible: false,
      spinning: false,
      formLayout: 'horizontal',
      formState: {},
      testObjectId: '',
    }
  },
  created() {},
  methods: {
    showModal(testObjectId) {
      this.visible = true
      this.testObjectId = testObjectId
    },
    handleOk() {
      this.$refs.formRef.validateFields().then(() => {
        const values = { ...this.formState }
        this.spinning = true
        const obj = {
          groupKey: values.groupkey,
          recordSetName: values.recordSetName,
          testObjectId: values.testObjectId,
        }
        window.$oAjax({
          method: 'POST',
          url: window.$oApi.testTemplate.synRecordSet,
          data: JSON.stringify([obj]),
          headers: {
            'Content-Type': 'application/json',
          },
        }).then((res) => {
          if (res.code === 20000) {
            window.$oAntdMessage.success('新增成功！')
            this.handleCancel()
            this.callback()
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
          this.spinning = false
        })
      })
    },
    handleCancel() {
      this.visible = false
      this.testObjectId = ''
      this.formState = {}
    },
  },
}
</script>

<style></style>
