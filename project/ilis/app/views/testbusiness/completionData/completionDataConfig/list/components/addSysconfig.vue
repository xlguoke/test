<template>
  <div>
    <ht-modal
      :title="titleModal"
      centered
      :open="visible"
      :mask-closable="false"
      class="hitek-add-modal"
      width="600px"
      @cancel="handleCancel"
    >
      <template #footer>
        <div>
          <a-button v-if="!isDetail" @click="handleCancel">
            取消
          </a-button>
          <a-button v-if="!isDetail" type="primary" @click="handleOk">
            确定
          </a-button>
          <a-button v-if="isDetail" type="primary" @click="handleCancel">
            关闭
          </a-button>
          <div style="clear: both"></div>
        </div>
      </template>
      <a-spin :spinning="spinning">
        <div class="spin-script">
          <a-form ref="formRef" :model="dataObj">
            <a-form-item
              label="名称"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
              name="name"
              :rules="[{ required: true, message: '名称不能为空!' }]"
            >
              <a-input
                v-model:value="dataObj.name"
                :disabled="isDetail"
                placeholder="请输入"
                autocomplete="off"
              />
            </a-form-item>
            <a-form-item
              label="根路径"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
              name="basePath"
              :rules="[{ required: true, message: '请输入!' }]"
            >
              <a-input
                v-model:value="dataObj.basePath"
                :disabled="isDetail"
                placeholder="请输入"
              />
            </a-form-item>
            <a-form-item
              label="目录Api"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
            >
              <a-input
                v-model:value="dataObj.menuUri"
                :disabled="isDetail"
                placeholder="请输入"
              />
            </a-form-item>
            <a-form-item
              label="文件Api"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
            >
              <a-input
                v-model:value="dataObj.documentUri"
                :disabled="isDetail"
                placeholder="请输入"
              />
            </a-form-item>
            <a-form-item
              label="handler"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
              name="handler"
              :rules="[{ required: true, message: '请输入!' }]"
            >
              <a-input
                v-model:value="dataObj.handler"
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
import dayjs from 'dayjs'
import { rootUrl } from '~/providers/configs/rootUrl'

export default {
  props: ['callback'],
  data() {
    return {
      spinning: false,
      visible: false,
      isDetail: false,
      rootUrl,
      titleModal: '新增系统配置',
      formLayout: 'horizontal',

      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
      dayjs,
      statusData: [],
      dataObj: {},
      styleObject: {
        pointerEvents: 'none',
        backgroundColor: '#f5f5f5',
        width: '100%',
      },
      script: '',
    }
  },
  created() {},
  mounted() {},
  methods: {
    showModal(dataObj, isDetail) {
      this.isDetail = isDetail
      if (dataObj) {
        this.titleModal = '编辑系统配置'
      }
      if (isDetail) {
        this.titleModal = '查看系统配置'
      }
      if (dataObj) {
        this.dataObj = dataObj
        // eslint-disable-next-line ts/no-unused-expressions
        this.dataObj.script ? (this.script = this.dataObj.script) : ''
        if (this.isDetail) {
          $('.ace_scroller').css(this.styleObject)
        }
        else {
          $('.ace_scroller').css({
            pointerEvents: '',
            // cursor: def,
            backgroundColor: '#fff',
            width: '100%',
          })
        }
      }
      this.visible = true
    },
    dataRequired() {
      // var basePath = fieldsValue.basePath ? fieldsValue.basePath + "" : "";
      // if (basePath.indexOf('.') > -1) {
      // window.$oAntdModal.warning(window.$oMsgTips.info('排序号不能为小数！'));
      // return false;
      // }
      return true
    },
    handleOk() {
      this.$refs.formRef.validateFields().then(() => {
        const data = {
          ...this.dataObj,
          reportFile: true,
          recordFile: true,
          attachment: true,
        }

        if (dataObj) {
          data.id = this.dataObj.id
        }

        const url = window.$oApi.completionDataConfig.addUpdateSystemProfile
        let method = 'POST'
        if (this.dataObj) {
          data.id = this.dataObj.id
          method = 'PUT'
        }
        if (this.dataRequired(data)) {
          this.spinning = true
          window.$oAjax({
            method,
            url,
            data,
            headers: {
              'content-type': 'application/json',
            },
          }).then((res) => {
            if (res.code === 21000 || res.code === 22000) {
              window.$oAntdMessage.success('操作成功')
              this.handleCancel()
              this.callback()
            }
            else {
              window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            }
            this.spinning = false
          })
        }
      })
    },
    handleCancel() {
      this.dataObj = {}
      this.script = ''
      this.visible = false
    },
  },
}
</script>

<style lang="less">
.scriptBox {
  label:before {
    display: inline-block;
    content: '*';
    margin-right: 4px;
    color: #f5222d;
    font-size: 14px;
    font-family: SimSun, sans-serif;
    line-height: 1;
  }
  .ace_tooltip {
    visibility: hidden;
  }
}
</style>
