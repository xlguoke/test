<!-- eslint-disable vue/no-unused-refs -->
<!-- eslint-disable vue/valid-v-for -->
<template>
  <div>
    <ht-modal
      v-if="visible"
      title="预览"
      centered
      :open="visible"
      :mask-closable="false"
      width="700px"
      class="hitek-add-modal"
      @cancel="
        () => {
          visible = false
        }
      "
    >
      <a-spin :spinning="spinning">
        <a-form ref="formRef" style="width: 100%">
          <template v-for="it in evaluateConfigList">
            <a-form-item
              v-if="it.status == 10"
              :label="it.itemContent"
              :label-col="{ span: 7 }"
              :wrapper-col="{ span: 15 }"
            >
              <a-input
                v-if="it.itemType == 'txt'"
                style="width: 100%"
                placeholder="请输入"
              />

              <a-input-number
                v-else-if="it.itemType == 'txt_num'"
                style="width: 100%"
                placeholder="请输入"
              />

              <a-radio-group v-else-if="it.itemType == 'radio'">
                <a-radio v-for="cit in it.candidateValue" :value="cit">
                  {{ cit }}
                </a-radio>
              </a-radio-group>

              <a-checkbox-group v-else-if="it.itemType == 'checkbox'">
                <a-checkbox v-for="cit in it.candidateValue" :value="cit">
                  {{ cit }}
                </a-checkbox>
              </a-checkbox-group>
            </a-form-item>
          </template>
        </a-form>
      </a-spin>

      <template #footer>
        <div>
          <a-button type="primary" :loading="spinning" @click="visible = false">
            关闭
          </a-button>
        </div>
      </template>
    </ht-modal>
  </div>
</template>

<script>
import { rootUrl } from '~/providers/configs/rootUrl'

export default {
  props: ['callback'],
  data() {
    return {
      evaluateConfigList: [],
      taskVisibleUrl: `${rootUrl}/reportCreateController.do?goRelationTaskChoosePage`,
      taskVisible: false,
      selStockPerson: [],
      id: '',
      editType: 1, // 1 新增  2 修改
      fileList: [],
      uploadUrl: `${rootUrl}/uploadController.do?upload`,
      addEditTitle: '新增',
      visible: false,
      data: [],
      spinning: false,
      isDetail: false,
      formData: {},
    }
  },
  computed: {},
  created() {
    this.init()
  },
  methods: {
    init() {},
    async openModel(echo, isDetail) {
      this.getData()
      this.isDetail = isDetail
      this.clearForm()
      this.visible = true
    },
    clearForm() {
      this.id = ''
      this.formData = {}
    },

    getData() {
      this.spinning = true
      window.$oAjax
        .get(`/rest/supplier/assess/item/list`, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          this.spinning = false
          if (res.code === 20000) {
            this.evaluateConfigList = res.data.map((it) => {
              if (it.itemType == 'radio' || it.itemType == 'checkbox') {
                it.candidateValue = it.candidateValue.split(',')
              }
              return it
            })
          }
          else {
            this.data = []
          }
          this.spinning = false
        })
    },
    handleCancel() {
      this.visible = false
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
