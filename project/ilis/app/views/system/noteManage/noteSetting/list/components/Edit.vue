<template>
  <ht-modal
    v-model:open="visible"
    width="600px"
    :mask-closable="false"
    :keyboard="false"
    title="编辑短信"
  >
    <a-spin :spinning="loading">
      <div style="max-height: 70vh">
        <h3 class="ht-page-title" style="margin-top: 0">
          短信内容
        </h3>
        <a-alert
          type="info"
          show-icon
        >
          <template #message>
            1. 由于短信内容政策监管严格，短信内容编辑修改后，将导致发送速度较慢
            <br />
            2. 为确保短信内容修改后能够完整发送，请使用模拟发送功能测试
            <br />
            3. 短信内容长度上限为400字
            <br />
            4. 点击短信变量的“变量”列内容，可快速将变量插入到短信内容光标位置
          </template>
        </a-alert>
        <a-row style="margin-bottom: 12px">
          <a-col :span="4">
            短信名称：
          </a-col>
          <a-col :span="8">
            {{ dataObj.name }}
          </a-col>
          <a-col :span="4">
            业务模块：
          </a-col>
          <a-col :span="8">
            {{ dataObj.module }}
          </a-col>
        </a-row>
        <a-form
          ref="formRef"
          :label-col="{ span: 4 }"
          :wrapper-col="{ span: 20 }"
          :model="dataObj"
        >
          <a-form-item
            label="短信内容"
            :rules="[{ required: true, message: '短信内容不能为空' }]"
            name="content"
          >
            <a-textarea
              ref="contentInput"
              v-model:value="dataObj.content"
              type="textarea"
              :rows="4"
              :max-length="400"
              placeholder="请输入短信内容"
              @change="
                (e) => {
                  dataObj.content = e.target.value
                }
              "
              @blur="handleBlur($event)"
            ></a-textarea>
            <p
              style="
                position: absolute;
                right: 0;
                line-height: 16px;
                color: #aaa;
                font-size: 12px;
              "
            >
              {{ dataObj.content ? dataObj.content.length : 0 }}
              / 400
            </p>
          </a-form-item>
        </a-form>
        <h3 class="ht-page-title">
          短信变量
          <span style="float: right; color: #ccc; font-weight: 500">变量格式：[变量]</span>
        </h3>
        <a-table
          :data-source="dataObj.variables"
          :columns="columns"
          :pagination="false"
        >
          <template #bodyCell="{ column, text }">
            <template v-if="column.dataIndex === 'name'">
              <span
                class="var-name"
                href="#"
                title="点击复制"
                @click="copyName(text)"
              >
                {{ text }}
              </span>
            </template>
          </template>
        </a-table>
      </div>
    </a-spin>
    <template #footer>
      <div class="clearfix">
        <a-button @click="visible = false">
          关闭
        </a-button>
        <a-button type="primary" :disabled="saveLoading" @click="okBtn">
          确定
        </a-button>
      </div>
    </template>
  </ht-modal>
</template>

<script>
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

const columns = [
  { title: '变量', dataIndex: 'name', scopedSlots: { customRender: 'name' } },
  { title: '释义', dataIndex: 'describe' },
  { title: '预览值', dataIndex: 'example' },
]

export default {
  components: {
  },
  emits: ['load'],
  data() {
    return {
      visible: false,
      loading: false,
      saveLoading: false,
      columns,
      dataId: '',
      dataObj: {
        content: '',
        variables: [],
      },
      tableData: [],
      selectionStart: -1,
      selectionEnd: -1,
    }
  },
  methods: {
    showModal(id) {
      this.dataObj = {
        content: '',
        variables: [],
      }
      this.tableData = []
      this.dataId = id
      this.visible = true
      this.getData()
    },
    getData() {
      this.loading = true
      window.$oAjax
        .get(`/rest/sms/template/${this.dataId}`)
        .then((res) => {
          this.loading = false
          if (res.code !== 20000) {
            return window.$oErrorAlert(res.message)
          }
          this.dataObj = res.data
          window.$oNextTick(() => {
            this.$refs.contentInput.focus()
          })
        })
        .catch((err) => {
          this.loading = false
          window.$oErrorAlert(err.message)
        })
    },
    // 保存
    okBtn() {
      this.$refs.formRef.validateFields().then(() => {
        this.saveLoading = true
        const val = { ...this.dataObj }
        window.$oAjax
          .post(
            `/rest/sms/template/modify-content/${this.dataId}`,
            {
              content: val.content,
            },
            {
              headers: {
                'Content-Type': 'application/json',
              },
            },
          )
          .then((res) => {
            this.saveLoading = false
            if (res.code !== 20000) {
              return window.$oErrorAlert(res.message)
            }
            $emit(this, 'load')
            this.visible = false
          })
          .catch((err) => {
            this.saveLoading = false
            window.$oErrorAlert(err.message)
          })
      })
    },
    // 失去光标事件
    handleBlur(e) {
      this.selectionStart = e.target.selectionStart
      this.selectionEnd = e.target.selectionEnd
      setTimeout(() => {
        this.selectionStart = -1
        this.selectionEnd = -1
      }, 300)
    },
    // 复制变量
    async copyName(text) {
      if (this.selectionStart === -1) {
        return window.$oAntdModal.info({
          title: '提示',
          content:
            '请将光标聚焦至短信内容的输入框内，并让光标处于需要插入变量的位置',
          okText: '确定',
          centered: true,
        })
      }
      const val = `[${text}]`
      const oldVal = this.dataObj.content
      const lStr = oldVal.slice(0, this.selectionStart)
      const rStr = oldVal.slice(this.selectionEnd)
      const newVal = lStr + val + rStr
      const input = this.$refs.contentInput
      this.dataObj.content = newVal
      input.focus()
      setTimeout(() => {
        input.$el.setSelectionRange(
          this.selectionStart,
          this.selectionStart + val.length,
        )
        this.selectionStart = -1
        this.selectionEnd = -1
      }, 10)
    },
  },
}
</script>

<style lang="less" scoped>
.ant-col {
  margin-top: 12px;
}
.ant-col-4 {
  text-align: right;
  color: #aaa;
}
:deep(.ant-form-item) {
  margin-bottom: 24px;
  .ant-form-explain {
    position: absolute;
    font-size: 12px;
  }
  .ant-form-item-required {
    color: #aaa;
  }
}
.var-name {
  color: var(--colorPrimary);
  cursor: pointer;
}
</style>
