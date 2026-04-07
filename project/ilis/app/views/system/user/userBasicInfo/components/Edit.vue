<template>
  <ht-modal
    v-model:open="visible"
    width="600px"
    :mask-closable="false"
    :keyboard="false"
    title="编辑消息"
  >
    <a-spin :spinning="loading">
      <div style="max-height: 70vh">
        <h3 class="ht-page-title" style="margin-top: 0">
          消息内容
        </h3>
        <div class="alert-info">
          <ExclamationCircleFilled />
          <div class="alert-con">
            1. 消息内容长度上限为400字
            <br />
            2. 点击消息变量的“变量”列内容，可快速将变量插入到消息内容光标位置
          </div>
        </div>
        <a-row style="margin-bottom: 12px">
          <a-col :span="4">
            消息标题：
          </a-col>
          <a-col :span="8">
            {{ editData.messageTitle }}
          </a-col>
        </a-row>
        <a-form
          ref="formRef"
          :label-col="{ span: 4 }"
          :wrapper-col="{ span: 20 }"
          :model="dataObj"
        >
          <a-form-item
            label="消息内容"
            :rules="[{ required: true, message: '消息内容不能为空' }]"
            name="content"
          >
            <a-textarea
              ref="contentInput"
              v-model:value="dataObj.content"
              :rows="4"
              :maxlength="400"
              placeholder="请输入消息内容"
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
              {{ dataObj.content ? dataObj.content.length : 0 }} / 400
            </p>
          </a-form-item>
        </a-form>
        <h3 class="ht-page-title">
          消息变量
          <span style="float: right; color: #ccc; font-weight: 500">变量格式：[变量]</span>
        </h3>
        <a-table :data-source="tableData" :columns="columns" :pagination="false">
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
        <a-button type="primary" :loading="saveLoading" @click="okBtn">
          确定
        </a-button>
      </div>
    </template>
  </ht-modal>
</template>

<script>
import { ExclamationCircleFilled } from '@ant-design/icons-vue'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

const columns = [
  { title: '变量', dataIndex: 'name', scopedSlots: { customRender: 'name' } },
  { title: '释义', dataIndex: 'describe' },
  { title: '预览值', dataIndex: 'example' },
]

export default {
  components: {
    ExclamationCircleFilled,
  },
  props: ['editData'],
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
      },
      tableData: [],
      selectionStart: -1,
      selectionEnd: -1,
    }
  },
  methods: {
    showModal(record) {
      this.dataObj = {
        content: '',
      }
      this.tableData = []
      this.dataId = record.id
      this.visible = true

      window.$oNextTick(() => {
        this.dataObj.content = record.content
      })
      this.getData()
    },
    getData() {
      this.loading = true
      window.$oAjax
        .get(`rest/msgType/${this.dataId}/variable`)
        .then((res) => {
          this.loading = false
          if (res.code !== 20000) {
            return window.$oErrorAlert(res.message)
          }
          this.tableData = res.data
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
          .put(`rest/msgType/${this.dataId}/content`, val.content, {
            headers: {
              'Content-Type': 'application/json',
            },
          })
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
            '请将光标聚焦至消息内容的输入框内，并让光标处于需要插入变量的位置',
          okText: '确定',
          centered: true,
        })
      }
      const val = `[${text}]`
      const oldVal = this.dataObj.content || ''
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
.alert-info {
  display: flex;
  padding: 8px 12px;
  background-color: #e5f3ff;
  color: #555;
  border-radius: 2px;
  font-size: 12px;
  .anticon {
    margin-top: 3px;
    font-size: 14px;
    color: var(--colorPrimary);
  }

  .alert-con {
    margin-left: 6px;
    flex: 1;
    width: 0;
  }

  &.alert-info-error {
    background-color: #ffe8e8;

    .anticon {
      color: red;
    }
  }
}
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
  color: var(--colorError);
  cursor: pointer;
}
</style>
