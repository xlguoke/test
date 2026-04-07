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
import qs from 'qs'

export default {
  props: ['callback'],
  data() {
    return {
      visible: false,
      confirmLoading: false,
      folderName: '',
      mainEntityId: '',
      editInfo: {},
      pid: '',
      isAdd: true,
    }
  },
  methods: {
    showModal(mainEntityId, pid, editInfo) {
      this.isAdd = !editInfo
      this.mainEntityId = mainEntityId || ''
      this.pid = pid || ''
      if (editInfo) {
        this.folderName = editInfo.title
        this.editInfo = editInfo
      }

      this.visible = true
    },
    cancelModal() {
      this.folderName = ''
      this.visible = false
    },
    handleSubmit() {
      if (this.folderName == '') {
        window.$oAntdModal.warning(window.$oMsgTips.info('请输入目录名'))
        return
      }

      this.confirmLoading = true
      window.$oAjax({
        method: 'POST',
        url: window.$oApi.folderManages.saveFolder,
        data: qs.stringify({
          'parent.id': this.isAdd ? this.pid : this.editInfo.pid || '',
          'mainEntityId': this.mainEntityId,
          'name': this.folderName,
          'id': this.isAdd ? undefined : this.pid,
        }),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          // "content-type": "application/json"
        },
      }).then((res) => {
        if (res && res.success) {
          window.$oAntdMessage.success(res.message || res.msg)
          this.cancelModal()
          this.callback()
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.message || res.msg))
        }
        this.confirmLoading = false
      })
    },
  },
}
</script>

<style></style>
