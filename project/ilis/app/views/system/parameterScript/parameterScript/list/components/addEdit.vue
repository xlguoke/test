<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-script">
        <a-form ref="formRef" :model="dataObj">
          <a-form-item
            label="脚本名称"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :rules="[{ required: true, message: '脚本名称不能为空!' }]"
            name="name"
          >
            <a-input
              v-model:value="dataObj.name"
              :disabled="isDetail"
              placeholder="请输入"
              autocomplete="off"
            />
          </a-form-item>
          <a-form-item
            label="脚本类型"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-select
              v-model:value="dataObj.category"
              :disabled="isDetail"
              placeholder="请选择"
              @change="handleSelectChange"
            >
              <a-select-option
                v-for="(comItem) in statusData"
                :key="comItem.id"
                :value="comItem.typename"
              >
                {{ comItem.typename }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
            label="序号"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :rules="[{ required: true, message: '请输入!' }]"
            name="name"
          >
            <a-input
              v-model:value="dataObj.sequence"
              :disabled="isDetail"
              placeholder="请输入"
              type="number"
            />
          </a-form-item>

          <a-form-item
            class="scriptBox"
            label="脚本内容"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <VAceEditor
              v-model:value="script"
              lang="javascript"
              theme="chrome"
              style="height: 100px"
            ></VAceEditor>
          </a-form-item>
          <a-form-item
            label="描述"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-textarea
              v-model:value="dataObj.description"
              :disabled="isDetail"
              placeholder="请输入"
              autocomplete="off"
              :auto-size="{ minRows: 3, maxRows: 6 }"
            />
          </a-form-item>
        </a-form>
      </div>
    </a-spin>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import qs from 'qs'
import { VAceEditor } from 'vue3-ace-editor'
import { getQueryVariable } from '~/providers/common/utils'
import { rootUrl } from '~/providers/configs/rootUrl'
import 'ace-builds/src-noconflict/mode-javascript'
import 'ace-builds/src-noconflict/theme-chrome'
import 'ace-builds/src-noconflict/ext-language_tools'

export default {
  components: {
    VAceEditor,
  },
  props: ['callback'],
  data() {
    return {
      spinning: false,
      rootUrl,
      formLayout: 'horizontal',

      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
      dayjs,
      statusData: [],
      isDetail: false,
      dataObj: {},
      styleObject: {
        pointerEvents: 'none',
        // cursor: def,
        backgroundColor: '#f5f5f5',
        width: '100%',
      },
      script: '',
    }
  },
  created() {
    // ilis 跳转的详情页面
    if (getQueryVariable('detailId')) {
      const id = getQueryVariable('detailId')
      this.showModal(id, true)
    }
  },
  mounted() {},
  methods: {
    handleSelectChange() {},
    getStatus() {
      window.$oAjax({
        method: 'POST',
        url: `${window.$oApi.common.getDictionaryData}`,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
        data: qs.stringify({
          dictGroupId: '3aa7ecc4-af16-4444-ba45-455bd1df',
        }),
      }).then((res) => {
        if (res && res.success) {
          this.statusData = res.obj
        }
        else {
          this.statusData = []
        }
      })
    },
    showModal(editId, isDetail) {
      this.isDetail = isDetail
      this.getStatus()
      if (editId) {
        this.spinning = true
        window.$oAjax({
          method: 'get',
          url: `${window.$oApi.parameterScript.getById}/${editId}`,
        }).then((res) => {
          if (res.code === 20000) {
            this.dataObj = res.data
            // eslint-disable-next-line ts/no-unused-expressions
            this.dataObj.script ? (this.script = this.dataObj.script) : ''
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            this.dataObj = {}
          }
          this.spinning = false
        })
        this.spinning = false

        try {
          const ele = document.getElementsByClassName('ace_scroller')[0]
          if (this.isDetail) {
            ele.style.pointerEvents = 'none'
            ele.style.backgroundColor = '#f5f5f5'
            ele.style.width = '100%'
          }
          else {
            ele.style.pointerEvents = ''
            ele.style.backgroundColor = '#fff'
            ele.style.width = '100%'
          }
        }
        catch (e) {
          // eslint-disable-next-line no-console
          console.log(e)
        }
      }
    },
    dataRequired(fieldsValue) {
      const sequence = fieldsValue.sequence ? `${fieldsValue.sequence}` : ''
      if (sequence.includes('.')) {
        window.$oAntdModal.warning(window.$oMsgTips.info('排序号不能为小数！'))
        return false
      }
      return true
    },
    handleOk() {
      this.$refs.formRef.validateFields().then(() => {
        const fieldsValue = { ...this.dataObj }
        const data = {
          ...fieldsValue,
          script: this.script,
        }

        if (this.dataObj.id) {
          data.id = this.dataObj.id
        }

        let url = window.$oApi.parameterScript.addUrl
        let method = 'POST'
        if (this.dataObj.id) {
          data.id = this.dataObj.id
          url = window.$oApi.parameterScript.updateUrl
          method = 'PUT'
        }
        if (this.dataRequired(data)) {
          this.spinning = true
          window.$oAjax({
            method,
            url,
            data: JSON.stringify(data),
            headers: {
              'content-type': 'application/json',
            },
          }).then((res) => {
            if (res.code === 21000 || res.code === 22000) {
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
    },
    // num(){
    //   if (!isPositiveInteger(queryParams.representNum)) {
    //     queryParams.msg = '请输入正整数';
    //     queryParams.element = this.representNum;
    //     return false;
    //   }
    // }
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
