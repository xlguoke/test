<!-- eslint-disable vue/eqeqeq -->
<template>
  <ht-modal
    v-model:open="visible"
    width="500px"
    :mask-closable="false"
    :keyboard="false"
    :title="title"
    :confirm-loading="saveLoading"
    @ok="okBtn"
  >
    <a-spin :spinning="spinning">
      <a-form ref="formRef" :model="editObj" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item
          label="标记类型"
          :rules="[{ required: true, message: '请输入标记类型' }]"
          name="textType"
        >
          <a-input
            v-model:value="editObj.textType"
            placeholder="请输入标记类型"
            :disabled="disabled"
          />
        </a-form-item>
        <a-form-item label="标记说明">
          <a-textarea
            v-model:value="editObj.explainText"
            placeholder="请输入标记说明"
            :disabled="disabled"
          />
        </a-form-item>
        <a-form-item
          label="缩写标识"
          :rules="[{ required: true, message: '请输入缩写标识' }]"
          name="text"
        >
          <a-input
            v-model:value="editObj.text"
            placeholder="请输入缩写标识"
            :disabled="disabled"
          />
        </a-form-item>
        <a-form-item label="颜色选择器">
          <!-- <colorPicker v-model:value="markColor" :disabled="disabled" /> -->
          <input v-model="markColor" type="color" :disabled="disabled" />
        </a-form-item>
        <a-form-item
          label="标记显示范围"
          :rules="[{ required: true, message: '请选择标记显示范围' }]"
          name="markRange"
        >
          <a-select
            v-model:value="editObj.markRange"
            allow-clear
            mode="multiple"
            placeholder="请选择标记显示范围"
            :disabled="disabled"
          >
            <a-select-opt-group v-show="tabIndex == 'MANAGE_ASSIGN_PAGE'" label="委托收样">
              <a-select-option value="CONSIGN">
                委托管理
              </a-select-option>
            </a-select-opt-group>
            <a-select-opt-group
              v-show="
                tabIndex == 'MANAGE_ASSIGN_PAGE'
                  || tabIndex == 'MANAGE_TEST_PAGE'
              "
              label="试验检测"
            >
              <a-select-option value="ASSIGN">
                任务分配
              </a-select-option>
              <a-select-option value="TASK">
                试验任务
              </a-select-option>
              <a-select-option value="REVIEW">
                试验复核
              </a-select-option>
            </a-select-opt-group>
            <a-select-opt-group label="报告管理">
              <a-select-option value="EDIT">
                编制报告
              </a-select-option>
              <a-select-option value="AUDIT">
                报告审核
              </a-select-option>
              <a-select-option value="APPROVE">
                报告批准
              </a-select-option>
              <a-select-option value="PRINT">
                报告打印
              </a-select-option>
              <a-select-option value="GRANT">
                报告发放
              </a-select-option>
            </a-select-opt-group>
          </a-select>
        </a-form-item>
        <a-form-item label="排序号">
          <a-input-number
            v-model:value="editObj.orderNum"
            :precision="0"
            :disabled="disabled"
            placeholder="请输入排序号"
            style="width: 100%"
          />
        </a-form-item>
        <a-form-item label="是否启用">
          <a-switch
            v-model:checked="editObj.isEnable"
            checked-children="是"
            un-checked-children="否"
            :disabled="disabled"
          />
        </a-form-item>
      </a-form>
    </a-spin>
  </ht-modal>
</template>

<script>
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

export default {
  name: 'Detail',
  props: ['tabIndex'],
  emits: ['updateList'],
  data() {
    return {
      title: '新增',
      visible: false,
      spinning: false,
      saveLoading: false,
      id: '',
      disabled: false,
      editObj: {},
      markColor: '#000000',
    }
  },
  methods: {
    showModal(id, isEdit) {
      this.disabled = !isEdit
      this.editObj = {}
      this.id = id
      if (!this.id) {
        this.title = '新增'
      }
      else if (isEdit) {
        this.title = '编辑'
      }
      else {
        this.title = '详情'
      }
      this.visible = true

      if (id) {
        this.getDetailData()
      }
    },
    getDetailData() {
      if (!this.id)
        return
      this.spinning = true
      window.$oAjax
        .get(`${window.$oApi.statusMarker.detail}&id=${this.id}`)
        .then((res) => {
          this.spinning = false
          if (res.success) {
            this.markColor = res.obj.markColor
            this.editObj = {
              ...res.obj,
              markRange: res.obj.markRange ? res.obj.markRange.split(',') : [],
              // eslint-disable-next-line eqeqeq
              isEnable: res.obj.isEnable == '1',
            }
          }
          else {
            window.$oAntdMessage.error('获取数据失败')
          }
        })
    },
    okBtn() {
      this.$refs.formRef.validateFields().then(async () => {
        const params = { ...this.editObj }
        if (params.markRange && params.markRange.length > 0) {
          params.markRange = params.markRange.join(',')
        }
        params.managePage = this.tabIndex
        params.isEnable = params.isEnable ? '1' : '0'
        params.markColor = this.markColor

        if (this.id) {
          params.id = this.id
        }

        this.saveLoading = true
        try {
          // eslint-disable-next-line unused-imports/no-unused-vars
          const res = await window.$oAjax.post(
            window.$oApi.statusMarker.save,
            params,
            {
              headers: {
                'Content-Type': 'application/json; charset=utf-8',
              },
            },
          )
          this.saveLoading = false
          this.visible = false
          $emit(this, 'updateList')
        }
        // eslint-disable-next-line unused-imports/no-unused-vars
        catch (e) {
          this.saveLoading = false
        }
      })
    },
  },
}
</script>

<style lang="less" scoped>
:deep(.ant-select-selection--multiple) {
  min-height: 75px;
}
:deep(.m-colorPicker) {
  padding: 4px 6px;
  border: 1px solid #d9d9d9 !important;
  border-radius: 4px !important;
  cursor: pointer;
}
:deep(.m-colorPicker .colorBtn) {
  width: 100px !important;
  height: 18px !important;
}
</style>
