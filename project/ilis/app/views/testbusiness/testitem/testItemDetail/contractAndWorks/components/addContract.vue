<template>
  <div>
    <ht-modal
      v-model:open="visible"
      :title="isAdd ? '新增合同段' : '编辑合同段'"
      :confirm-loading="confirmLoading"
      centered
      width="760px"
      :mask-closable="false"
      @ok="handleSubmit"
      @cancel="cancelModal"
    >
      <a-form ref="formRef" :model="data">
        <a-form-item
          label="合同段类型"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          :rules="[{ required: true, message: '请选择合同段类型！' }]"
          name="contractPartType"
        >
          <a-select
            v-model:value="data.contractPartType"
            placeholder="请选择合同段类型"
          >
            <a-select-option
              v-for="(item, index) in contractType"
              :key="index"
              :value="item.value"
            >
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          label="合同段名称"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          :rules="[{ required: true, message: '请输入合同段名称！' }]"
          name="contractPartName"
        >
          <a-input
            v-model:value="data.contractPartName"
            placeholder="请输入合同段名称"
          />
        </a-form-item>
        <a-form-item
          label="合同段编号"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          :rules="[{ required: true, message: '请输入合同段编号！' }]"
          name="contractPartCode"
        >
          <a-input
            v-model:value="data.contractPartCode"
            placeholder="请输入合同段编号"
          />
        </a-form-item>
        <a-form-item
          label="施工单位"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
        >
          <a-input
            v-model:value="data.constructionUnit"
            placeholder="请输入施工单位"
          />
        </a-form-item>
        <a-form-item
          label="监理单位"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
        >
          <a-input
            v-model:value="data.supervisingUnit"
            placeholder="请输入监理单位"
          />
        </a-form-item>
        <a-form-item
          label="说明"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
        >
          <a-textarea
            v-model:value="data.description"
            placeholder="请输入说明"
            :rows="4"
          />
        </a-form-item>
        <a-form-item
          label="是否与外部系统对接"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
          :rules="[{ required: true, message: '请选择是否与外部系统对接！' }]"
          name="needSync"
        >
          <a-radio-group
            v-model:value="data.needSync"
            @change="(e) => changeDurationType(e.target.value)"
          >
            <a-radio :value="true">
              是
            </a-radio>
            <a-radio :value="false">
              否
            </a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          label="系统对接配置"
          :label-col="labelCol"
          :wrapper-col="wrapperCol"
        >
          <a-textarea
            v-model:value="data.syncJson"
            :disabled="!data.needSync"
            placeholder="请联系海特人员进行添加"
            :rows="4"
          />
        </a-form-item>
      </a-form>
      <Contacts
        v-if="!isAdd"
        :other-module="true"
        :edit-c-bdata="editCBdata"
      />
    </ht-modal>
  </div>
</template>

<script>
import { message } from 'ant-design-vue'
import { getQueryVariable } from '~/providers/common/utils'
import Contacts from '../../contacts/index.vue'

export default {
  components: {
    Contacts,
  },
  props: ['contractType', 'callback', 'isAdd'],
  data() {
    return {
      id: getQueryVariable('id'),

      visible: false,
      confirmLoading: false,
      labelCol: { span: 5 },
      wrapperCol: { span: 15 },
      data: {
        contractPartType: undefined,
        contractPartName: '',
        contractPartCode: '',
        constructionUnit: '',
        supervisingUnit: '',
        description: '',
        needSync: false,
        syncJson: '',
      },
      editCBdata: {},
      styleObject: {
        pointerEvents: 'none',
        backgroundColor: '#f5f5f5',
        width: '100%',
      },
    }
  },
  methods: {
    async showModal(data) {
      if (data) {
        this.editCBdata = data
        await window.$oRest({
          url: `${window.$oApi.testItem.contract}/${data.key}`,
        }).then((res) => {
          if (res && res.data) {
            // 检测合同字段有没有被删除
            let q = false
            this.contractType.forEach((item) => {
              if (item.value == res.data.contractPartType) {
                q = true
              }
            })
            // eslint-disable-next-line ts/no-unused-expressions
            q ? '' : (res.data.contractPartType = undefined)
            this.data = res.data
            this.data.id = data.key
          }
        })
      }
      else {
        this.data = {
          contractPartType: undefined,
          contractPartName: '',
          contractPartCode: '',
          constructionUnit: '',
          supervisingUnit: '',
          description: '',
          needSync: false,
          syncJson: '',
        }
      }

      this.visible = true
    },
    cancelModal() {
      this.visible = false
      this.data = {
        contractPartType: undefined,
        contractPartName: '',
        contractPartCode: '',
        constructionUnit: '',
        supervisingUnit: '',
        description: '',
        needSync: false,
        syncJson: '',
      }
    },
    handleSubmit() {
      this.$refs.formRef.validateFields().then(() => {
        const values = { ...this.data }
        this.confirmLoading = true
        let contractPartTypeName = ''
        this.contractType.forEach((item) => {
          if (item.value == values.contractPartType) {
            contractPartTypeName = item.name
          }
        })

        const data = {
          ...values,
          projectId: this.id,
          contractPartTypeName,
        }
        let method = 'POST'

        if (!this.isAdd) {
          data.id = this.data.id
          method = 'PUT'
        }
        window.$oRest({
          method,
          url: `${window.$oApi.testItem.contract}`,
          data,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'content-type': 'application/json',
          },
        }).then(
          (res) => {
            if (res && res.code) {
              message.success(res.message)
              this.cancelModal()
              this.data = {
                contractPartType: undefined,
                contractPartName: '',
                contractPartCode: '',
                constructionUnit: '',
                supervisingUnit: '',
                description: '',
                needSync: false,
                syncJson: '',
              }
              this.callback()
            }
            else {
              window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            }
            this.confirmLoading = false
          },
        ).catch(() => {
          this.confirmLoading = false
        })
      })
    },
    changeDurationType(value) {
      this.data.needSync = value
    },
  },
}
</script>

<style lang="less" scoped>
:deep(.ant-modal-body) {
  height: 450px;
  overflow: hidden;
  overflow-y: auto;
}
</style>
