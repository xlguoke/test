<template>
  <div>
    <ht-modal
      :title="isAdd ? '新增邮寄单' : '编辑邮寄单'"
      :open="visible"
      :confirm-loading="confirmLoading"
      :centered="true"
      class="projectManageList-addModal"
      :mask-closable="false"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <div>
        <a-form ref="formRef" :model="data">
          <a-form-item
            label="邮寄单名称"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
            :rules="[{ required: true, message: '邮寄单名称为必填项！' }]"
            name="infoSubject"
          >
            <a-input
              v-model:value="data.infoSubject"
              placeholder="请输入邮寄单名称"
            />
          </a-form-item>
          <a-form-item
            label="收件人"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
            :rules="[{ required: true, message: '邮寄地址为必填项！' }]"
            name="receiver"
          >
            <a-input
              v-model:value="data.receiver"
              placeholder="请输入收件人"
            />
          </a-form-item>

          <a-form-item
            label="收件人电话"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
            :rules="[{ required: true, message: '收件人电话为必填项！', validateTrigger: 'blur' }]"
            name="phone"
          >
            <a-input
              v-model:value="data.phone"
              placeholder="请输入收件人电话"
            />
          </a-form-item>

          <a-form-item
            label="邮寄地址"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
            :rules="[{ required: true, message: '邮寄地址为必填项！' }]"
            name="address"
          >
            <a-input
              v-model:value="data.address"
              placeholder="请输入邮寄地址"
            />
          </a-form-item>
          <a-form-item
            label="邮寄公司"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
            :rules="[{ required: true, message: '邮寄公司为必选项！' }]"
            name="expressCompanyCode"
          >
            <a-select
              v-model:value="data.expressCompanyCode"
              placeholder="请输入邮寄公司"
            >
              <a-select-option
                v-for="item in expressCompanyData"
                :key="item.id"
                :value="item.typecode"
              >
                {{ item.typename }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
            label="邮编"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
            :rules="[{ required: true, message: '邮编为必填项！' }]"
            name="postalCode"
          >
            <a-input
              v-model:value="data.postalCode"
              placeholder="请输入邮编"
            />
          </a-form-item>
        </a-form>
      </div>
    </ht-modal>
  </div>
</template>

<script>
import { message } from 'ant-design-vue'
import qs from 'qs'

export default {
  props: ['isAdd', 'callback'],
  data() {
    return {
      visible: false,
      confirmLoading: false,
      formLayout: 'horizontal',
      data: {},
      expressCompanyData: [],
    }
  },
  methods: {
    getSelectData() {
      window.$oAjax({
        method: 'POST',
        url: window.$oApi.common.getDictionaryData,
        data: qs.stringify({ dictGroupId: '402882206762317b0167626787270002' }),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res && res.success) {
          this.expressCompanyData = res.obj
        }
        else {
          message.error(res.msg)
        }
      })
    },
    showModal(data) {
      this.getSelectData()
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
        let data = { ...this.data }
        let method = 'POST'
        this.confirmLoading = true

        if (this.isAdd === false) {
          data = {
            ...data,
            id: this.data.id,
          }
          method = 'PUT'
        }

        data.expressCompany = this.expressCompanyData.find(
          item => item.typecode == data.expressCompanyCode,
        ).typename

        window.$oAjax({
          method,
          url: window.$oApi.mailListConfig.operation,
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

<style></style>
