<!-- eslint-disable vue/no-template-shadow -->
<template>
  <div class="hitek-height-full accessory-warp">
    <a-spin :spinning="spinning" style="height: 100%">
      <div style="padding: 0 15px; height: calc(100% - 50px); overflow-y: auto">
        <a-collapse v-model:active-key="activeKey">
          <a-collapse-panel
            v-for="(i, k) in accessoryDataObj"
            :key="k"
            :header="k"
          >
            <a-table
              v-if="k === annexTableKey"
              :data-source="accessoryDataObj[k]"
              :columns="columns"
              :pagination="false"
              row-key="testParamId"
              bordered
            >
              <template #bodyCell="{ column, text }">
                <template v-if="['equipmentList', 'testPrincipleList'].includes(column.dataIndex)">
                  <div :class="`${text.length > 0 ? 'flex-cell' : ''}`">
                    <div class="annex-tags">
                      <span
                        v-for="(d, i) in text"
                        :key="i"
                        class="ant-tag ant-tag-blue"
                      >
                        <span style="cursor: pointer" @click="previewFile(d)">{{
                          d.annexName
                        }}</span>
                        <EditOutlined
                          v-if="!isDetail"
                          @click="editFileName(d)"
                        />
                        <CloseOutlined
                          v-if="!isDetail"
                          @click="() => text.splice(i, 1)"
                        />
                      </span>
                    </div>
                    <a-upload
                      v-if="!isDetail"
                      :multiple="true"
                      :before-upload="(file) => beforeUpload(file, text, k)"
                      :show-upload-list="false"
                    >
                      <a-button type="link">
                        上传文件
                      </a-button>
                    </a-upload>
                  </div>
                </template>
              </template>
            </a-table>
            <template v-else>
              <a-upload
                v-if="!isDetail"
                :multiple="true"
                :before-upload="
                  (file) => beforeUpload(file, accessoryDataObj[k], k)
                "
                :show-upload-list="false"
                list-type="picture-card"
              >
                <PlusOutlined style="font-size: 34px; color: #ccc" />
                <p style="color: #999">
                  上传
                </p>
              </a-upload>
              <div
                v-for="(file, i) in accessoryDataObj[k]"
                :key="file.id"
                class="file-item"
              >
                <div class="file-con">
                  <template v-if="isImage(file.annexName)">
                    <img v-if="file.annexUrl" :src="file.annexUrl" />
                    <img v-else :src="file.blobUrl" />
                  </template>
                  <FilePdfOutlined v-else-if="isPdf(file.annexName)" />
                  <FileExcelOutlined
                    v-else-if="isExcel(file.annexName)"
                  />
                  <FileWordOutlined v-else-if="isWord(file.annexName)" />
                  <FileZipOutlined v-else-if="isZip(file.annexName)" />
                  <FileOutlined v-else />
                </div>
                <div class="file-name">
                  <p class="name" :title="file.annexName">
                    {{ file.annexName }}
                  </p>
                  <EditOutlined
                    v-if="!isDetail"
                    class="edit-name-icon"
                    @click="editFileName(file)"
                  />
                </div>
                <CloseCircleOutlined
                  v-if="!isDetail"
                  class="remove-icon"
                  @click="() => accessoryDataObj[k].splice(i, 1)"
                />
              </div>
            </template>
          </a-collapse-panel>
        </a-collapse>
      </div>
      <div
        v-if="!isDetail"
        style="
          padding: 10px 15px 0;
          text-align: right;
          border-top: 1px solid #f8f8f8;
        "
      >
        <a-button
          type="primary"
          style="margin-right: 10px; width: 70px"
          @click="saveAccessory"
        >
          确 定
        </a-button>
        <a-button style="margin-right: 10px" @click="updatePageData">
          获取最新附件
        </a-button>
        <a-button @click="closeParentLayer">
          关 闭
        </a-button>
      </div>
    </a-spin>

    <ht-modal
      :open="visible"
      title="修改附件名称"
      width="380px"
      :closable="false"
      :mask-closable="false"
      @cancel="visible = false"
      @ok="confirmEdit"
    >
      <div style="padding: 30px 0">
        <a-input v-model:value="fileName" style="width: 300px" />
        {{ fileSuffix }}
      </div>
    </ht-modal>
  </div>
</template>

<script>
import { CloseCircleOutlined, CloseOutlined, EditOutlined, FileExcelOutlined, FileOutlined, FilePdfOutlined, FileWordOutlined, FileZipOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { getQueryVariable } from '~/providers/common/utils'
import Upload from '~/providers/components/upload.vue'

const columns = [
  {
    title: '检测参数',
    dataIndex: 'testParamName',
    width: '20%',
  },
  {
    title: '设备布置图',
    dataIndex: 'equipmentList',
    width: '40%',
  },
  {
    title: '试验原理及连接图',
    dataIndex: 'testPrincipleList',
    width: '40%',
  },
]

export default {
  components: {
    // eslint-disable-next-line vue/no-unused-components
    Upload,
    CloseCircleOutlined,
    CloseOutlined,
    EditOutlined,
    FileExcelOutlined,
    FilePdfOutlined,
    FileWordOutlined,
    FileZipOutlined,
    FileOutlined,
    PlusOutlined,
  },
  data() {
    return {
      visible: false,
      spinning: false,
      activeKey: [],
      testTaskId: '',
      reportId: '',
      paramId: '',
      isDetail: false,
      columns,
      accessoryDataObj: {
        样品照片: [],
        试验原理图及设备布设图: [],
        现场工作照片: [],
        其它: [],
      },
      annexTableKey: '试验原理图及设备布设图',
      taskTestParams: [],
      fileName: '',
      fileSuffix: '',
      editFileObj: {},
      saveLoading: false,
    }
  },
  created() {
    this.initData()
  },
  methods: {
    updatePageData() {
      this.initData()
    },
    async initData() {
      this.spinning = true
      this.getRouteParam()
      await this.getTaskTestParams()
      await this.getAccessory()
      this.spinning = false
    },
    getRouteParam() {
      const status = getQueryVariable('status')
      const reportReviseStatus = getQueryVariable('reportReviseStatus')
      const reportPage = getQueryVariable('type') === 'report'
      this.testTaskId = getQueryVariable('testTaskId')
      this.reportId = getQueryVariable('reportId')
      this.isDetail
        = reportPage
          || (status !== '20'
            && !(reportReviseStatus == '10' || reportReviseStatus == '30'))
    },
    // 获取任务检测参数
    async getTaskTestParams() {
      try {
        const res = await window.$oAjax({
          url: `/testTaskController.do?getTestTaskParams`,
          method: 'post',
          params: {
            testTaskId: this.testTaskId,
          },
        })
        this.taskTestParams = res.obj || []
      }
      catch (err) {
        this.$mesage.error(err.mesage || '获取任务检测参数失败')
      }
    },
    // 获取附件信息
    async getAccessory() {
      try {
        const res = await window.$oAjax.get(
          `/rest/task/indicator/annex/${this.testTaskId}`,
        )
        if (res.code !== 20000) {
          // eslint-disable-next-line no-new
          new Error(res)
          return
        }
        this.activeKey = []
        for (const k in this.accessoryDataObj) {
          if (res.data[k]) {
            this.accessoryDataObj[k] = res.data[k]
          }
          else {
            if (k === this.annexTableKey) {
              const list1 = res.data['设备布置图'] || []
              const list2 = res.data['试验原理及连接图'] || []
              this.accessoryDataObj[k] = await this.initTableData(list1, list2)
            }
            else {
              this.accessoryDataObj[k] = []
            }
          }
          this.activeKey.push(k)
        }
      }
      catch (err) {
        window.$oAntdMessage.error(err.message || '获取附件列表失败')
      }
    },
    // 合并“设备布置图”、“试验原理及连接图”数据，在同一表格展示
    initTableData(list1, list2) {
      const datas = []
      for (let i = 0; i < this.taskTestParams.length; i++) {
        const paramItem = this.taskTestParams[i]
        const filter1 = list1.filter(
          d => d.testParamId === paramItem.testParamId,
        )
        const filter2 = list2.filter(
          d => d.testParamId === paramItem.testParamId,
        )
        datas.push({
          testParamId: paramItem.testParamId,
          testParamName: paramItem.displayName,
          equipmentList: filter1,
          testPrincipleList: filter2,
        })
      }
      return datas
    },
    // 上传附件
    async beforeUpload(file, accessorys, title) {
      const type = file.name.substring(file.name.lastIndexOf('.') + 1)
      if (title !== '其它' && !['png', 'jpg', 'jpeg'].includes(type)) {
        window.$oAntdMessage.error('只支持上传png、jpg、jpeg格式文件')
        // eslint-disable-next-line prefer-promise-reject-errors
        return Promise.reject()
      }
      file.annexName = file.name
      file.blobUrl = await this.initBlobUrl(file)
      accessorys.push(file)
      // eslint-disable-next-line prefer-promise-reject-errors
      return Promise.reject()
    },
    async initBlobUrl(file) {
      return await new Promise((resolve) => {
        const reader = new FileReader()
        reader.readAsArrayBuffer(file)
        reader.onload = function (event) {
          const blob = new Blob([event.target.result], { type: file.type })
          window.URL = window.URL || window.webkitURL
          const blobURL = window.URL.createObjectURL(blob)
          resolve(blobURL)
        }
      })
    },
    // 编辑附件名称
    editFileName(file) {
      const ind = file.annexName.lastIndexOf('.')
      this.editFileObj = file
      this.fileName = file.annexName.substring(0, ind)
      this.fileSuffix = file.annexName.substring(ind)
      this.visible = true
    },
    confirmEdit() {
      if (!this.fileName) {
        window.$oAntdMessage.warning('附件名称不能为空')
        return
      }
      this.editFileObj.annexName = this.fileName + this.fileSuffix
      this.visible = false
    },
    // 上传附件
    async uploadFile(file) {
      const formData = new FormData()
      formData.append('file', file)
      try {
        const res = await window.$oAjax({
          url: window.$oApi.common.upload,
          method: 'post',
          data: formData,
        })
        if (res && res.success) {
          const file = res.obj
          if (file && file.length > 0) {
            return file[0]
          }
        }
        return Promise.reject(res)
      }
      catch (err) {
        return Promise.reject(err)
      }
    },
    // 处理未上传的附件
    async formatUnUploadAnnex(file, k) {
      if (!file.uid)
        return file
      try {
        const res = await this.uploadFile(file)
        return {
          testParamId: '',
          testParamName: '',
          testTaskId: this.testTaskId,
          annexName: file.annexName,
          annexUrl: res.realpath,
          annexTypeName: k,
          indicatorAnnexId: '',
        }
      }
      catch (err) {
        window.$oAntdMessage.error(err.message || '上传失败')
        return file
      }
    },
    // 处理保存参数
    async formatSaveData() {
      const annexList = []
      for (const k in this.accessoryDataObj) {
        const files = this.accessoryDataObj[k]
        for (let i = 0; i < files.length; i++) {
          let file = files[i]
          if (k !== this.annexTableKey) {
            file = await this.formatUnUploadAnnex(file, k)
            annexList.push(file)
            continue
          }
          for (let m = 0; m < file.equipmentList.length; m++) {
            let item = file.equipmentList[m]
            item = await this.formatUnUploadAnnex(item, '设备布置图')
            item.testParamId = file.testParamId
            item.testParamName = file.testParamName
            annexList.push(item)
          }
          for (let n = 0; n < file.testPrincipleList.length; n++) {
            let item = file.testPrincipleList[n]
            item = await this.formatUnUploadAnnex(item, '试验原理及连接图')
            item.testParamId = file.testParamId
            item.testParamName = file.testParamName
            annexList.push(item)
          }
        }
      }
      return annexList
    },
    // 保存
    async saveAccessory() {
      this.spinning = true
      const annexList = await this.formatSaveData()
      window.$oAjax
        .post(
          `/rest/task/indicator/annex`,
          {
            testTaskId: this.testTaskId,
            annex: annexList,
          },
          {
            headers: {
              'content-type': 'application/json',
            },
          },
        )
        .then(() => {
          this.spinning = false
          window.$oAntdMessage.success('保存成功')
          this.getAccessory()
        })
        .catch((err) => {
          this.spinning = false
          window.$oAntdMessage.error(err.mesage || '保存失败')
        })
    },
    // 预览
    previewFile(file) {
      window.open(file.annexUrl, '_blank')
    },
    isImage(name) {
      const type = this.fileType(name)
      return ['png', 'jpg', 'jpeg'].includes(type)
    },
    isPdf(name) {
      return this.fileType(name) === 'pdf'
    },
    isExcel(name) {
      const type = this.fileType(name)
      return ['xls', 'xlsx'].includes(type)
    },
    isWord(name) {
      const type = this.fileType(name)
      return ['doc', 'docx'].includes(type)
    },
    isZip(name) {
      const type = this.fileType(name)
      return ['zip', 'rar', 'JAR', '7z'].includes(type)
    },
    fileType(name) {
      if (!name)
        return ''
      const ind = name.lastIndexOf('.')
      if (ind === -1)
        return ''
      return name.substring(ind + 1)
    },
    // 关闭父级弹窗
    closeParentLayer() {
      window.parent.layer && window.parent.layer.closeAll()
    },
  },
}
</script>

<style lang="less" scoped>
.accessory-warp {
  height: 100%;
  :deep(.ant-spin-container) {
    height: 100%;
  }
  :deep(.ant-collapse-content-box::after) {
    content: '';
    display: block;
    clear: both;
    visibility: hidden;
  }
  :deep(.ant-upload-picture-card-wrapper) {
    width: auto;
    float: left;
  }
  .file-item {
    float: left;
    margin-right: 8px;
    margin-bottom: 8px;
    position: relative;
    width: 104px;
    height: 104px;
    border: 1px solid #ccc;
    border-radius: 4px;
    text-align: center;
    .file-con {
      margin: 5px 5px 0;
      height: 73px;
      overflow: hidden;
      border-radius: 4px;
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .anticon {
        font-size: 50px;
        margin-top: 12px;
        color: #2687d6;
        &.anticon-file-pdf {
          color: #c9701c;
        }
        &.anticon-file-zip {
          color: #666;
        }
      }
    }
    .file-name {
      display: flex;
      align-items: center;
      margin: 2px 5px 0;
      font-size: 12px;
      height: 20px;
      text-align: left;
      border-radius: 2px;
      width: calc(100% - 10px);
      .name {
        flex: 1;
        margin-right: 3px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .edit-name-icon {
        cursor: pointer;
        color: #aaa;
        &:hover {
          color: #666;
        }
      }
    }
    .remove-icon {
      position: absolute;
      right: 2px;
      top: 2px;
      z-index: 10;
      color: #e42626;
      opacity: 0;
      transition: 0.1s;
      cursor: pointer;
      &:hover {
        opacity: 1 !important;
      }
    }
    &:hover .remove-icon {
      opacity: 0.8;
    }
  }

  :deep(.ant-table-tbody > tr > td) {
    padding: 3px 8px;
  }
  .flex-cell {
    display: flex;
    align-items: center;
    .annex-tags {
      flex: 1;
      flex-wrap: wrap;
      .ant-tag {
        margin: 2px;
        white-space: initial;
      }
      .anticon {
        margin: 0;
        font-size: 12px;
        color: rgba(0, 0, 0, 0.45);
        &:hover {
          color: rgba(0, 0, 0, 1);
        }
      }
      .anticon-edit {
        margin-left: 6px;
      }
    }
  }
}
</style>
