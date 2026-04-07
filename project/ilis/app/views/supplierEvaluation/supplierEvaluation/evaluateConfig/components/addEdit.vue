<template>
  <div>
    <ht-modal
      v-if="visible"
      :title="addEditTitle"
      centered
      :open="visible"
      :mask-closable="false"
      width="500px"
      class="hitek-add-modal"
      @cancel="
        () => {
          visible = false
        }
      "
    >
      <a-spin :spinning="spinning">
        <a-form ref="formRef" style="width: 100%" :model="formData">
          <a-form-item
            label="评价项目"
            :label-col="{ span: 7 }"
            :wrapper-col="{ span: 15 }"
            :rules="[{ required: true, message: `请输入评价项目` }]"
            name="item"
          >
            <a-input
              v-model:value="formData.item"
              placeholder="请输入评价项目"
            />
          </a-form-item>
          <a-form-item
            label="评价内容"
            :label-col="{ span: 7 }"
            :wrapper-col="{ span: 15 }"
            :rules="[{ required: true, message: `请输入评价内容` }]"
            name="itemContent"
          >
            <a-input
              v-model:value="formData.itemContent"
              placeholder="请输入评价内容"
            />
          </a-form-item>

          <a-form-item
            label="评价结果类型"
            :label-col="{ span: 7 }"
            :wrapper-col="{ span: 15 }"
            :rules="[{ required: true, message: `请选择评价结果类型` }]"
            name="itemType"
          >
            <a-select
              v-model:value="formData.itemType"
              placeholder="请选择评价结果类型"
              @change="
                (v) => {
                  selType = v
                }
              "
            >
              <a-select-option value="txt">
                文本框
              </a-select-option>
              <a-select-option value="txt_num">
                数字文本框
              </a-select-option>
              <a-select-option value="radio">
                单选框
              </a-select-option>
              <a-select-option value="checkbox">
                复选框
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
            v-if="selType == 'radio' || selType == 'checkbox'"
            label="评价结果候选值"
            :label-col="{ span: 7 }"
            :wrapper-col="{ span: 15 }"
            :rules="[{ required: true, message: `请输入候选值` }]"
            name="candidateValue"
          >
            <a-input
              v-model:value="formData.candidateValue"
              placeholder="请输入候选值以英文逗号','分隔"
            />
          </a-form-item>

          <a-form-item
            label="备注"
            :label-col="{ span: 7 }"
            :wrapper-col="{ span: 15 }"
          >
            <a-input
              v-model:value="formData.remark"
              placeholder="请输入备注"
            />
          </a-form-item>
          <a-form-item
            label="排序号"
            :label-col="{ span: 7 }"
            :wrapper-col="{ span: 15 }"
          >
            <a-input
              v-model:value="formData.orderNum"
              placeholder="请输入排序号"
            />
          </a-form-item>

          <a-form-item
            label="状态"
            :label-col="{ span: 7 }"
            :wrapper-col="{ span: 15 }"
          >
            <a-select
              v-model:value="formData.status"
              :disabled="isDetail"
              placeholder="请选择"
            >
              <a-select-option value="10">
                启用
              </a-select-option>
              <a-select-option value="20">
                禁用
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-form>
      </a-spin>

      <template #footer>
        <div>
          <a-button @click="handleCancel">
            取消
          </a-button>
          <a-button type="primary" :loading="spinning" @click="handleSaveOk">
            确定
          </a-button>
        </div>
      </template>
    </ht-modal>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { rootUrl } from '~/providers/configs/rootUrl'

const columns = [
  {
    title: '化学品编号',
    dataIndex: 'sn',
  },
  {
    title: '品名',
    dataIndex: 'categoryName',
  },
  {
    title: '用途',
    dataIndex: 'effect',
  },

  {
    title: '纯度',
    dataIndex: 'purity',
  },
  {
    title: '浓度',
    dataIndex: 'concentration',
  },
  {
    title: '计量单位',
    dataIndex: 'unit',
  },
  {
    title: '可用余量',
    dataIndex: 'amount',
  },
  {
    title: '出库数量',
    dataIndex: 'stockNum',
    scopedSlots: { customRender: 'stockNum' },
  },
  {
    title: '操作',
    dataIndex: 'actions',
    scopedSlots: { customRender: 'actions' },
  },
]

export default {
  props: ['callback'],
  data() {
    return {
      selType: '',
      taskVisibleUrl: `${rootUrl}/reportCreateController.do?goRelationTaskChoosePage`,
      taskVisible: false,
      selPersonType: '',
      departmentData: [],
      selPersonData: [],
      chemicalsMingle: [],
      id: '',
      editType: 1, // 1 新增  2 修改
      fileList: [],
      uploadUrl: `${rootUrl}/uploadController.do?upload`,
      addEditTitle: '新增',
      visible: false,
      data: [],
      activeKey: [1, 2, 3],
      spinning: false,
      isDetail: false,
      dayjs,
      columns,
      dataSource: [],
      customFields: [],
      formData: {
        itemType: 'txt',
        status: '10',
      },
      selPersonData: [],
      measurementUnit: [],
      safetyType: [],
      featureType: [],
      levelList: [],

      selManageLeve: {},
      selChemicalsData: [],
    }
  },
  computed: {},
  created() {
    this.init()
  },
  methods: {
    init() {},

    depChange(v, option) {
      this.selDepartment = {
        id: v,
        name: option[0],
      }
    },
    selTaskFun() {
      this.taskVisible = true
    },

    async openModel(echo, isDetail) {
      this.isDetail = isDetail
      this.clearForm()
      this.visible = true
      this.addEditTitle = '新增'
      if (echo && echo.id) {
        this.id = echo.id
        this.selType = echo.itemType
        this.formData = echo
        // this.formData=echo;

        this.addEditTitle = '编辑'
        if (isDetail) {
          this.addEditTitle = '详情'
        }
      }
    },
    clearForm() {
      this.id = ''
      this.formData = {}
      this.selType = ''
    },

    handleCancel() {
      this.visible = false
    },

    handleSaveOk() {
      this.$refs.formRef.validateFields().then(() => {
        window.$oAjax({
          method: this.id ? 'put' : 'post',
          url: 'rest/supplier/assess/item',
          data: {
            ...this.formData,
            id: this.id,
          },
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'content-type': 'application/json',
          },
        }).then((res) => {
          this.spinning = false
          if (res && res.code === 20000) {
            window.$oAntdMessage.success('操作成功')
            this.visible = false
            this.callback()
          }
          else {
            window.$oAntdMessage.error(res.message || res.msg)
          }
        })
      })
    },
  },
}
</script>

<style lang="less">
.form_wrap {
  li {
    display: inline-block;
    width: 360px;
    height: 45px;
  }
  .required_row .ant-form-item-label:before {
    content: '*';
    color: #c30000;
    margin-right: 5px;
  }
}
</style>

<style>
/* .hitek-add-modal .ant-modal-body {
  max-height: calc(100vh - 180px) !important;
  min-height: 300px !important;
} */
.ant-collapse > .ant-collapse-item > .ant-collapse-header {
  line-height: 15px !important;
}
</style>
