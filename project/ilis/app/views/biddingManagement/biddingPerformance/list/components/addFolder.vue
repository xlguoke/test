<template>
  <div>
    <ht-modal
      v-model:open="visible"
      :title="isAdd ? '新增' : '编辑'"
      :confirm-loading="confirmLoading"
      :mask-closable="false"
      :centered="true"
      @ok="handleSubmit"
      @cancel="cancelModal"
    >
      <a-input v-model:value="folderName" placeholder="请输入目录名" />
    </ht-modal>
  </div>
</template>

<script>
import { message } from 'ant-design-vue'

export default {
  props: ['callback', 'pid', 'mainId', 'editInfo'],
  data() {
    return {
      visible: false,
      confirmLoading: false,
      folderName: '',
      isAdd: true,
    }
  },
  methods: {
    showModal(data) {
      if (data) {
        this.isAdd = false
        this.folderName = data.title
      }
      else {
        this.isAdd = true
      }
      this.visible = true
    },
    cancelModal() {
      this.folderName = ''
      this.visible = false
    },
    handleSubmit() {
      if (this.folderName == '') {
        message.warn('请输入目录名')
        return
      }
      this.confirmLoading = true

      window.$oAjax({
        method: 'POST',
        url: window.$oApi.biddingPerformance.addFile,
        data: {
          pid: this.isAdd ? this.pid : this.editInfo.pid,
          mainId: this.mainId,
          folderName: this.folderName,
          id: this.isAdd ? undefined : this.pid,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
      }).then((res) => {
        if (res && res.success) {
          message.success(res.message || res.msg)
          this.cancelModal()
          this.callback()
        }
        else {
          message.error(res.message || res.msg)
        }
        this.confirmLoading = false
      })
    },
  },
}
</script>

<style></style>
