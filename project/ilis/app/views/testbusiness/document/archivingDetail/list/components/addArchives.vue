<template>
  <div>
    <ht-modal
      title="新增档案"
      :open="visible"
      width="460px"
      @ok="handleOk"
      @cancel="cancel"
    >
      <a-radio-group v-model:value="value">
        <a-radio :style="radioStyle" :value="0">
          上传文件
        </a-radio>
        <a-radio v-if="isShowProjcet" :style="radioStyle" :value="1">
          引用系统内文件
        </a-radio>
        <a-radio :style="radioStyle" :value="2">
          新增纸质档案
        </a-radio>
      </a-radio-group>
    </ht-modal>

    <CommonUpload
      ref="CommonUpload"
      :max="1"
      :uploadcall="uploadcall"
      :file-lists="fileLists"
      :multiple="true"
    />
    <ht-modal
      title="引用系统内文件"
      centered
      :open="systemVisible"
      :mask-closable="false"
      width="80%"
      class="addModalBox"
      @cancel="systemCancel"
    >
      <SystemFile ref="SystemFile" />
      <template #footer>
        <div>
          <a-button @click="systemCancel">
            取消
          </a-button>
          <a-button type="primary" @click="systemOk">
            确定
          </a-button>
          <div style="clear: both"></div>
        </div>
      </template>
    </ht-modal>
    <AddFile ref="AddFile" :callback="getAddFile" />
    <SelProjcet ref="SelProjcet" :callback="getProject" />
  </div>
</template>

<script>
import CommonUpload from '~/providers/components/uploadComponent.vue'
import AddFile from './addFile.vue'
import SelProjcet from './selProjcet.vue'
import SystemFile from './systemFile.vue'

export default {
  components: {
    CommonUpload,
    SystemFile,
    SelProjcet,
    AddFile,
  },
  data() {
    return {
      visible: false,
      systemVisible: false,
      value: 0,
      radioStyle: {
        display: 'block',
        height: '30px',
        lineHeight: '30px',
      },
      data: {},
      fileLists: [],
      isShowProjcet: false,
      dataProjcet: [],
    }
  },
  methods: {
    showModal(data, documentId) {
      this.visible = true
      window.$oAjax({
        url: window.$oApi.archivingDetail.getSyProjects,
        method: 'get',
        params: { id: documentId },
      }).then((res) => {
        if (res.code === 20000) {
          if (Object.getOwnPropertyNames(res.data).length > 0) {
            this.isShowProjcet = true
            for (const key in res.data) {
              this.dataProjcet.push({ id: key, name: res.data[key] })
            }
          }
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
      this.data = data
    },
    cancel() {
      this.visible = false
      this.isShowProjcet = false
      this.systemVisible = false
      this.value = 0
      this.data = {}
      this.fileLists = []
      this.dataProjcet = []
    },
    uploadcall(fileList) {
      if (fileList && fileList.length > 0) {
        const file = fileList[0]
        const formData = {
          objectId: this.data.id,
          pType: this.data.typeOfItem == '2' ? 1 : 2,
          dataFrom: this.value,
          attachId: file.id,
          dataName: file.attachmenttitle,
        }
        this.addArchive(formData)
      }
    },
    addArchive(formData) {
      window.$oAjax
        .post(window.$oApi.archivingDetail.addArchives, formData, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .then((res) => {
          if (res.code === 20000) {
            this.systemVisible = false
            if (this.value === 2) {
              this.$refs.AddFile.handleCancel()
            }

            this.cancel()

            window.$oNextTick(() => {
              this.$parent.reloadList()
            })
          }
          else {
            window.$oAntdModal.warning(
              window.$oMsgTips.info(res.msg || res.message || '操作失败'),
            )
          }
        })
        .catch(() => {})
    },
    handleOk() {
      if (this.value === 0) {
        this.$refs.CommonUpload.showModal()
      }
      else if (this.value === 1) {
        if (this.dataProjcet.length === 1) {
          this.getProject(this.dataProjcet)
        }
        else {
          this.$refs.SelProjcet.showModal(this.dataProjcet)
        }
      }
      else {
        this.$refs.AddFile.showModal()
      }
    },
    getProject(data) {
      this.systemVisible = true
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      const recordId = data[0].id
      if (this.$refs.SystemFile) {
        this.$refs.SystemFile.showModal(recordId)
      }
      else {
        let timer = setInterval(() => {
          if (self.$refs.SystemFile) {
            clearInterval(timer)
            timer = null
            self.$refs.SystemFile.showModal(recordId)
          }
        }, 100)
      }
    },
    systemCancel() {
      this.systemVisible = false
    },
    systemOk() {
      const systemAll = this.$refs.SystemFile.getData()
      const systemIdArr = systemAll.map(item => item.attachmentId)
      const systemNameArr = systemAll.map(
        item => item.achievementName || item.attachmentName,
      )
      const formData = {
        objectId: this.data.id,
        pType: this.data.typeOfItem == '2' ? 1 : 2,
        dataFrom: '1',
        dataName: systemNameArr.join(';'),
        attachId: systemIdArr.join(';'),
      }
      this.addArchive(formData)
    },
    getAddFile(data) {
      const formData = {
        ...data,
        objectId: this.data.id,
        pType: this.data.typeOfItem == '2' ? 1 : 2,
        dataFrom: '2',
      }
      this.addArchive(formData)
    },
  },
}
</script>

<style lang="less"></style>
