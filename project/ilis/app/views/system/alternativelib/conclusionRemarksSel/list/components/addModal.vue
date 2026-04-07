<template>
  <div>
    <ht-modal
      :title="isAdd ? '新增' : '编辑'"
      :open="visible"
      :confirm-loading="confirmLoading"
      :centered="true"
      class="projectManageList-addModal"
      :mask-closable="false"
      width="400px"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <div>
        <a-form ref="formRef" :model="data">
          <a-form-item
            label="序号"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 18 }"
            name="sort"
            :rules="[{ required: true, message: '序号为必填项！' }]"
          >
            <a-input
              v-model:value="data.sort"
              type="number"
              placeholder="请输入序号"
            />
          </a-form-item>
          <a-form-item
            label="候选值"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 18 }"
            name="value"
            :rules="[{ required: true, message: '候选值为必填项！' }]"
          >
            <a-textarea
              v-model:value="data.value"
              placeholder="请输入候选值"
              :auto-size="{ minRows: 5, maxRows: 15 }"
            />
          </a-form-item>

          <a-form-item
            label="说明"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 18 }"
          >
            <a-input
              v-model:value="data.description"
              placeholder="请输入说明信息"
            />
          </a-form-item>
        </a-form>
      </div>
    </ht-modal>
  </div>
</template>

<script>
import { message } from 'ant-design-vue'

export default {
  props: ['isAdd', 'callback', 'formType'],
  data() {
    return {
      visible: false,
      confirmLoading: false,
      formLayout: 'horizontal',

      data: {},
    }
  },
  methods: {
    // getSelectData () {
    //   window.$oAjax({
    //     method: "POST",
    //     url: window.$oApi.common.getDictionaryData,
    //     data: qs.stringify({ dictGroupId: '402882206762317b0167626787270002' }),
    //     headers: {
    //       "X-Requested-With": "XMLHttpRequest"
    //     }
    //   }).then(res => {
    //     if (res && res.success) {
    //       this.data = res.obj
    //     } else {
    //       message.error(res.msg);
    //     }
    //   })
    // },

    showModal(data) {
      // this.getSelectData();
      this.visible = true
      if (data) {
        this.data = data
      }
      else {
        this.data = {}
      }
    },
    handleOk() {
      this.$refs.formRef.validateFields().then(() => {
        let data = {
          ...this.data,
          grouping: this.formType,
          type: 'universal',
        }
        this.confirmLoading = true
        if (this.isAdd === false) {
          data = {
            ...data,
            id: this.data.id,
          }
          // method = 'PUT'
        }
        window.$oAjax({
          method: 'post',
          url: `/rest/alternative/lib`,
          data,
          headers: {
            'content-type': 'application/json',
          },
        }).then((res) => {
          if (res.code && res.code === 20000) {
            message.success('保存成功')
            this.data = {}
            this.visible = false
            this.callback()
          }
          else {
            message.error(res.msg || res.message)
          }
          this.confirmLoading = false
        })
      })
    },
    handleCancel() {
      this.visible = false
      this.data = {}
    },
  },
}
</script>
