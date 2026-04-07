<template>
  <div>
    <ht-modal
      title="导入规程资料"
      :open="visible"
      :closable="false"
      :mask-closable="false"
      width="550px"
      @cancel="closeModal"
    >
      <a-spin :spinning="importLoading">
        <div>
          <ComHeader>导入步骤</ComHeader>
          <ul style="margin: 12px 0 20px">
            <li>
              1. 下载用户签名信息导入模板，<a
                href="javascript:;"
                @click="downloadModule"
              >点击下载</a>
            </li>
            <li>2. 根据模板内容填写规程资料台账</li>
            <li>
              3. 点击下方“选择文件”选中（单选）编辑好的模板文件后，即可导入
            </li>
          </ul>
          <ComHeader>选择文件</ComHeader>
          <span>模板文件：</span>
          <a-upload :before-upload="importData" :show-upload-list="false">
            <a-button type="primary">
              导入文件
            </a-button>
          </a-upload>
        </div>
      </a-spin>
      <template #footer>
        <div class="clearfix">
          <a-button :disabled="importLoading" @click="closeModal">
            取消
          </a-button>
        </div>
      </template>
    </ht-modal>

    <ht-modal
      title="导入失败"
      :open="failVisible"
      :closable="false"
      :mask-closable="false"
      width="600px"
      @cancel="closeFailModal"
    >
      <div style="min-height: 30vh">
        <p style="margin-bottom: 8px">
          导入模板中存在以下问题，请编辑模板文件后重新导入！
        </p>
        <a-table
          :columns="columns"
          :data-source="errors"
          :pagination="false"
          :scroll="{ y: '50vh' }"
        ></a-table>
      </div>
      <template #footer>
        <div class="clearfix">
          <a-button type="primary" @click="failVisible = false">
            确定
          </a-button>
        </div>
      </template>
    </ht-modal>
  </div>
</template>

<script>
import ComHeader from '~/providers/components/comHeader/index.vue'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

const columns = [
  {
    title: '行号',
    dataIndex: 'row',
    width: 70,
    align: 'center',
  },
  {
    title: '问题内容',
    dataIndex: 'message',
  },
]

export default {
  components: {
    ComHeader,
  },
  emits: ['refresh'],
  data() {
    return {
      columns,
      visible: false,
      importLoading: false,
      downloadLoading: false,
      failVisible: false,
      errors: [],
    }
  },
  methods: {
    closeModal() {
      this.visible = false
    },
    openModal() {
      this.visible = true
    },
    closeFailModal() {
      this.failVisible = false
    },
    // 导入
    importData(file) {
      const diff = file.name.lastIndexOf('.')
      const type = file.name.substring(diff)
      if (!['.xls', '.xlsx'].includes(type)) {
        window.$oAntdMessage.warning('只支持上传.xls、.xlsx格式的文件')
        return false
      }
      const formData = new FormData()
      formData.append('file', file)

      this.importLoading = true
      window.$oAjax({
        method: 'post',
        url: `rest/standardBookStoreController/archives-import`,
        data: formData,
      })
        .then((res) => {
          this.importLoading = false
          if (res.code === 20010) {
            window.$oAntdMessage.error(res.message)
            return
          }
          if (!res.data.success && res.data.errors && res.data.errors.length) {
            this.errors = res.data.errors
            this.failVisible = true
            return
          }
          window.$oAntdMessage.success('导入成功')
          this.closeModal()
          $emit(this, 'refresh')
        })
        .catch(() => {
          this.importLoading = false
        })
      return false
    },
    // 下载模板
    downloadModule() {
      this.downloadLoading = true
      const a = document.createElement('a')
      const href = `/ilis2/rest/standardBookStoreController/archives-import/template`
      a.href = href
      a.target = '_blank'
      a.click()
      this.downloadLoading = false
    },
  },
}
</script>
