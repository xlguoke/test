<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div id="bodyBox" ref="bodyBox">
    <ht-modal
      :open="visible"
      :title="title"
      centered
      :keyboard="false"
      :footer="null"
      @cancel="handleCancel"
    >
      <div style="display: flex">
        <a-upload
          name="file"
          :before-upload="beforeUpload"
          :show-upload-list="false"
          :action="importUrl"
          @change="handleChange"
        >
          <a-button type="primary" :loading="fileLoading">
            {{ fileLoading ? '文件上传中' : '上传文件' }}
          </a-button>
        </a-upload>
        <a-button type="link" style="margin-left: 10px" @click="handleExport">
          <LinkOutlined /> 下载导入模板
        </a-button>
      </div>
      <p class="item">
        1.支持导入格式为xlsx的文件(手动修改文件后缀无效)。
      </p>
      <p class="item">
        2.模板中所有信息在导入前必须清除强制换行（否则导入后提示“\n”）
      </p>
      <p class="item" style="color: red">
        3.智能装置ID编号必须唯一
      </p>
      <p class="item">
        4.带<span style="color: red">*</span>的标题列为必填列,其它为选填列
      </p>
    </ht-modal>
  </div>
</template>

<script>
import { LinkOutlined } from '@ant-design/icons-vue'
import { downloadFile } from '~/providers/common/utils'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'
import { deviceXls } from '../../api'

export default {
  components: {
    LinkOutlined,
  },
  emits: ['update'],
  data() {
    return {
      title: '设备关联关系导入',
      visible: false,
      importUrl: `/ilis2/rest/eq/devices.xlsx`,
      fileLoading: false,
    }
  },
  methods: {
    showModel() {
      this.visible = true
    },
    // 新增
    handleOk() {
      this.visible = false
    },
    // 取消
    handleCancel() {
      this.visible = false
      // 重置数据
    },
    // 上传之前
    beforeUpload(file) {
      this.fileLoading = true
      if (
        file.name.endsWith('.xls')
        || file.name.endsWith('.xlsx')
        || file.name.endsWith('.XLS')
        || file.name.endsWith('.XLSX')
      ) {
        return true
      }
      this.fileLoading = false
      window.$oAntdMessage.warning('上传的文件不符合类型')
      return false
    },
    handleChange(info) {
      if (info.file.status === 'done') {
        window.$oAntdMessage.success(`${info.file.name} 文件上传成功`)
        $emit(this, 'update')
        this.visible = false
        this.fileLoading = false
      }
      else if (info.file.status === 'error') {
        this.fileLoading = false
        window.$oAntdMessage.error(info.file.response.msg)
      }
    },
    // 下载
    async handleExport() {
      const res = await deviceXls()
      if (res.status === 200) {
        const blob = new Blob([res.data])
        const href = window.URL.createObjectURL(blob)
        const fileName = '设备关联关系模板.xlsx'
        downloadFile(href, fileName)
      }
    },
  },
}
</script>

<style lang="less" scoped>
.item {
  margin-top: 10px;
}
.table {
  margin-top: 10px;
  max-height: 300px;
  overflow-y: auto;
}
</style>
