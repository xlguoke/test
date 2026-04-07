<template>
  <ht-modal
    title="化学名称导入"
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
        <a-button type="link" :loading="downloadLoading" @click="downloadModule">
          下载导入模板
        </a-button>
        <ul style="margin-top: 20px">
          <li>
            1.
            支持导入格式为xlsx的文件(手动修改文件后缀无效)模版中的表头不可更改，不可删除
          </li>
          <li>
            2. 模板中所有信息在导入前必须清除强制换行（否则导入后提示“\n”）
          </li>
          <li>3. 化学名称编号唯一</li>
          <li>4. 红色标题为必填列,其它为选填列</li>
          <li>5. 若存在多位保管人，则中间用英文逗号隔开</li>
          <li>
            6. 管理级别、计量单位、所属类别、化学品类型
            关联化学品后不支持更新导入
          </li>
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
      const formData = new FormData()
      formData.append('file', file)

      this.importLoading = true
      window.$oAjax({
        method: 'post',
        url: `/rest/chemical/category/import`,
        data: formData,
      }).then((res) => {
        this.importLoading = false
        if (res.code !== 20000) {
          window.$oAntdMessage.error(res.message)
          return
        }
        if (res.data && !res.data.succeed) {
          const failMsg = res.data.failRows
          const msg = []
          for (let i = 0; i < failMsg.length; i++) {
            const err = failMsg[i]
            msg.push(h('p', `第${err.rowNum}行：${err.failReason}`))
          }
          window.$oAntdModal.error({
            title: '导入失败',
            content: h('div', {}, msg),
          })
          return
        }
        window.$oAntdMessage.success('导入成功')
        this.$parent.getData()
        this.importLoading = false
        this.visible = false
      })
      return false
    },
    // 下载模板
    downloadModule() {
      this.downloadLoading = true
      const a = document.createElement('a')
      const href = `/ilis2/rest/chemical/category/downloadExcelTemplate`
      a.href = href
      a.click()
      this.downloadLoading = false
    },
  },
}
</script>
