<template>
  <ht-modal
    title="采购导入"
    :open="visible"
    :closable="false"
    :mask-closable="false"
    width="550px"
    @cancel="closeModal"
  >
    <a-spin :spinning="importLoading">
      <div style="height: 200px">
        <a-upload :before-upload="importData" :show-upload-list="false">
          <a-button>导入文件</a-button>
        </a-upload>
        <a-button
          type="link"
          :loading="downloadLoading"
          @click="downloadModule"
        >
          下载导入模板
        </a-button>
        <ul style="margin-top: 20px">
          <li>
            1.支持导入格式为xlsx的文件(手动修改文件后缀无效)，模版中的表头不可更改，不可删除；
          </li>
          <li>
            2.模板中所有信息在导入前必须清除强制换行（否则导入后提示“\n”）；
          </li>
          <li>3.化学品编号必须唯一；</li>
          <li>4.红色标题为必填列,其它为选填列；</li>
          <li>
            5.请从化学名称管理中自行导出最新的化学名称、化学名称编号后维护；
          </li>
          <li>6.若存在多位保管人，中间用英文逗号隔开；</li>
          <li>7.已入库化学品不支持更新导入；</li>
        </ul>
      </div>
    </a-spin>
    <template #footer>
      <a-button :disabled="importLoading" @click="closeModal">
        关闭
      </a-button>
    </template>
  </ht-modal>
</template>

<script>
import { downloadExcelTemplate, storageInImport } from '~/providers/api/chemicals'
import { downloadFile } from '~/providers/common/utils'

export default {
  data() {
    return {
      visible: false,
      importLoading: false,
      downloadLoading: false,
    }
  },
  methods: {
    closeModal() {
      this.visible = false
    },
    openModal() {
      this.visible = true
    },
    // 导入
    importData(file) {
      const diff = file.name.lastIndexOf('.')
      const type = file.name.substring(diff)
      if (!['.xls', '.xlsx'].includes(type)) {
        window.$oAntdMessage.warning('只支持上传.xls、.xlsx格式的文件')
        return false
      }
      this.importLoading = true
      storageInImport({ file })
        .then((res) => {
          this.importLoading = false
          if (res.code !== 20000) {
            window.$oAntdMessage.error(res.message)
            return
          }
          if (res.data && res.data.failRows) {
            const failMsg = res.data.failRows
            const msg = []
            for (let i = 0; i < failMsg.length; i++) {
              const err = failMsg[i]
              msg.push(h('p', `第${err.rowNum}行：${err.failReason}`))
            }
            if (!res.data.succeed) {
              window.$oAntdModal.error({
                title: '导入失败',
                content: () => h('div', {}, msg),
              })
              return
            }
            else {
              window.$oAntdModal.success({
                title: '导入成功',
                content: () => h('div', {}, msg),
              })
            }
          }
          else {
            window.$oAntdMessage.success('导入成功')
          }
          this.$parent.getData()
          this.visible = false
        })
        .catch((err) => {
          this.importLoading = false
          window.$oAntdMessage.error(err.message || '导入失败')
        })
      return false
    },
    // 下载模板
    downloadModule() {
      this.downloadLoading = true
      downloadExcelTemplate().then((res) => {
        this.downloadLoading = false
        const blob = new Blob([res])
        const href = window.URL.createObjectURL(blob)
        downloadFile(href, '化学品导入模板.xlsx')
      })
    },
  },
}
</script>
