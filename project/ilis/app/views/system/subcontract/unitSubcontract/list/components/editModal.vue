<template>
  <div>
    <ht-modal
      v-model:open="visible"
      :title="addEditTitle"
      :mask-closable="false"
      width="720px"
      :centered="true"
      :body-style="{ 'max-height': `${height - 300}px`, 'overflow-y': 'auto' }"
      class="biddingPerformance-editModal"
      @ok="handleSubmit"
      @cancel="cancelModal"
    >
      <a-spin :spinning="spinning">
        <div class="spin-content">
          <a-form ref="formRef" :model="dataObj">
            <a-form-item
              label="单位名称"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
              :rules="[{ required: true, message: '单位名称为必填项！' }]"
              name="unitName"
            >
              <a-input
                v-model:value="dataObj.unitName"
                :disabled="isDetail"
                placeholder="请输入单位名称"
              />
            </a-form-item>
            <a-form-item
              label="联系人"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
              :rules="[{ required: true, message: '联系人为必填项！' }]"
              name="contactPerson"
            >
              <a-input
                v-model:value="dataObj.contactPerson"
                :disabled="isDetail"
                placeholder="请选择联系人"
              />
            </a-form-item>
            <a-form-item
              label="联系电话"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
            >
              <a-input
                v-model:value="dataObj.contactNumber"
                :disabled="isDetail"
                placeholder="请输入"
              />
            </a-form-item>
            <a-form-item
              label="联系地址"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
            >
              <a-input
                v-model:value="dataObj.contactAddr"
                :disabled="isDetail"
                placeholder="请输入"
              />
            </a-form-item>
            <a-form-item
              label="资质等级"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
              :rules="[{ required: true, message: '资质等级为必填项！' }]"
              name="qualificationLevel"
            >
              <a-input
                v-model:value="dataObj.qualificationLevel"
                :disabled="isDetail"
                placeholder="请输入"
              />
            </a-form-item>

            <div v-if="customFields.length > 0">
              <a-form-item
                v-for="item in customFields"
                :key="item.id"
                :label="item.columnName"
                :label-col="labelCol"
                :wrapper-col="wrapperCol"
              >
                <span v-if="item.columnType === 'inputNumber'">
                  <a-input-number
                    v-model:value="dataObj[item.id]"
                    style="width: 100%"
                    :disabled="item.disabled"
                    placeholder="请输入"
                  />
                </span>
                <span v-else-if="item.columnType === 'input'">
                  <a-input
                    v-model:value="dataObj[item.id]"
                    style="width: 100%"
                    :disabled="item.disabled"
                    placeholder="请输入"
                  />
                </span>
                <span v-else-if="item.columnType === 'radio'">
                  <a-radio-group
                    v-model:value="dataObj[item.id]"
                    :disabled="item.disabled"
                    name="radioGroup"
                  >
                    <a-radio value="是">是</a-radio>
                    <a-radio value="否">否</a-radio>
                  </a-radio-group>
                </span>
                <span v-else-if="item.columnType === 'select'">
                  <a-select
                    v-model:value="dataObj[item.id]"
                    :disabled="item.disabled"
                    placeholder="请选择"
                    style="width: 100%"
                  >
                    <a-select-option
                      v-for="(v, index) in item.columnValue
                        ? item.columnValue.split(',')
                        : []"
                      :key="index"
                      :value="v"
                    >
                      {{ v }}
                    </a-select-option>
                  </a-select>
                </span>
                <span v-else-if="item.columnType === 'textArea'">
                  <a-textarea
                    v-model:value="dataObj[item.id]"
                    :disabled="item.disabled"
                  />
                </span>
                <span v-else-if="item.columnType === 'date'">
                  <a-date-picker
                    v-model:value="dataObj[item.id]"
                    :disabled="item.disabled"
                    placeholder="`请选择"
                    style="width: 100%"
                    format="YYYY-MM-DD"
                    value-format="YYYY-MM-DD"
                  />
                </span>
              </a-form-item>
            </div>
            <a-form-item
              label="备注"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
            >
              <a-textarea
                v-model:value="dataObj.remark"
                :disabled="isDetail"
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
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
      visible: false,
      spinning: false,
      isAdd: true,
      isDetail: false,
      addEditTitle: '分包单位新增',
      dataObj: {},
      customFields: [],
      height: document.body.clientHeight,
    }
  },
  created() {},
  methods: {
    getCustomFields() {
      window.$oAjax
        .get(window.$oApi.common.customProperties, {
          params: {
            customizeType: 'subcontract-unit',
          },
        })
        .then((res) => {
          if (res.code === 20000) {
            this.customFields = res.data || []
            if (
              this.dataObj.customValues
              && this.dataObj.customValues.length > 0
            ) {
              this.customFields = [
                ...this.customFields,
                ...this.dataObj.customValues
                  .filter(c => c.disabled)
                  .map((c) => {
                    const copy = { ...c }
                    copy.id = c.columnId
                    return copy
                  }),
              ]
            }
            this.customFields = this.customFields.map(item => ({
              ...item,
              disabled: item.disabled || this.isDetail,
            }))
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
          this.spinning = false
        })
    },
    async showModal(editId, addEditTitle, isDetail) {
      this.visible = true
      this.isAdd = !editId
      this.addEditTitle = addEditTitle
      this.isDetail = isDetail
      this.spinning = true
      if (editId) {
        await window.$oAjax({
          url: `${window.$oApi.unitSubcontract.getIdUrl}/${editId}`,
          method: 'GET',
        }).then((res) => {
          let newObj = {}
          if (res.code === 20000) {
            newObj = res.data
            if (newObj.customValues && newObj.customValues.length > 0) {
              const obj = {}
              // eslint-disable-next-line array-callback-return
              newObj.customValues.map((item) => {
                obj[item.columnId] = item.columnValue
              })
              newObj = {
                ...newObj,
                ...obj,
              }
            }
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
          this.dataObj = { ...newObj }
          window.$oNextTick(() => {
            this.$refs.formRef.validateFields()
          })
        })
        this.getCustomFields()
      }
      else {
        this.getCustomFields()
        window.$oNextTick(() => {
          this.$refs.formRef.resetFields()
        })
      }
    },
    cancelModal() {
      this.visible = false
      this.dataObj = {}
      this.customFields = []
    },
    handleSubmit() {
      this.$refs.formRef.validateFields().then(() => {
        const values = { ...this.dataObj }
        const data = values
        const customValues = []
        this.customFields
          .filter(c => !c.disabled)
          // eslint-disable-next-line array-callback-return
          .map((item) => {
            customValues.push({
              columnId: item.id,
              columnValue: data[item.id],
            })
            delete data[item.id]
          })
        let method = 'POST'
        if (!this.isAdd) {
          data.id = this.dataObj.id
          method = 'PUT'
        }

        if (customValues.length > 0) {
          data.customValues = customValues
        }

        this.spinning = true
        window.$oAjax({
          method,
          url: window.$oApi.unitSubcontract.addUpdateUrl,
          data,
          headers: {
            'content-type': 'application/json',
          },
        }).then(
          (res) => {
            if (res.code === 20000) {
              this.cancelModal()
              this.dataObj = {}
              this.callback()
            }
            else {
              window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            }
            this.spinning = false
          },
        ).catch(() => {
          this.spinning = false
        })
      })
    },
  },
}
</script>

<style lang="less">
.ant-form-explain {
  font-size: 12px;
}
.biddingPerformance-editModal {
  .ant-form-item-label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
