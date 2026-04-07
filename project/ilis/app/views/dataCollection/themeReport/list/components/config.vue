<template>
  <a-drawer
    title="主题详情"
    placement="right"
    :closable="false"
    width="70%"
    :open="visible"
    class="dataCollection-drawer dataCollection-detail"
    @close="onClose"
  >
    <a-spin :spinning="spinning">
      <CloseOutlined
        style="
          cursor: pointer;
          position: absolute;
          right: 0px;
          top: -44px;
          font-size: 16px;
          z-index: 1000;
        "
        @click="onClose"
      />
      <div>
        <div style="font-size: 12px">
          <div class="dataCollection-detail-name">
            {{ data.themeName }}
            <span
              class="dataCollection-detail-tag"
              :style="`background:${
                data.themeStatus === '0' ? '#247abb' : 'gray'
              }`"
            >{{ data.themeStatus === '0' ? '进行中' : '已结束' }}</span>
          </div>
          <div style="padding-top: 10px">
            项目简介：{{ data.themeIntroduction }}
          </div>
          <div>
            负责人：{{
              personData1.map((item) => item.personName).toString()
            }}
          </div>
          <div>
            参与人：{{
              personData2.map((item) => item.personName).toString()
            }}
          </div>
        </div>

        <div class="dataCollection-drawer-timeLine">
          <div
            v-for="(item, index) in nodeList"
            :key="index"
            :class="`dataCollection-drawer-block ${
              item.currentNode === 'current'
                ? 'dataCollection-drawer-time-current'
                : ''
            } ${
              item.currentNode === 'after'
                ? 'dataCollection-drawer-time-after'
                : ''
            }  ${
              item.currentNode === 'before'
                ? 'dataCollection-drawer-time-before'
                : ''
            }`"
          >
            <div v-if="index !== 0">
              <div v-if="item.contenDetailList">
                <div style="font-size: 14px">
                  资料上报提醒时间：{{
                    item.remindDate
                      ? formatTime(item.remindDate, 'YYYY-MM-DD')
                      : ''
                  }}
                </div>
                <div
                  v-for="(node, index2) in item.contenDetailList"
                  :key="index2"
                >
                  <div style="padding-top: 2px">
                    <div style="float: right; color: #aaa">
                      资料上报负责人：{{
                        node.personList
                          ? node.personList.map((p) => p.personName).toString()
                          : ''
                      }}
                    </div>
                    <div
                      style="font-weight:bold;font-size:14px;overflow:hidden;padding-right;10px;"
                    >
                      {{ node.content }}
                      <span
                        v-if="node.waitReport === '0'"
                        style="
                          font-size: 12px;
                          border: solid 1px #4caf50;
                          border-radius: 3px;
                          padding: 1px 5px;
                          font-weight: normal;
                          color: #4caf50;
                          background: rgba(76, 175, 80, 0.3);
                        "
                      >待上报</span>
                    </div>
                    <div style="clear: both"></div>
                    <div>
                      <div
                        v-for="file in node.contentAttachmentList"
                        :key="file.id"
                      >
                        <a
                          href="javascript:;"
                          style="text-decoration: underline"
                          @click="downloadAccessory(file.attachmentId)"
                        >{{ file.attachmentName }}</a>
                        <span
                          style="
                            color: gray;
                            vertical-align: middle;
                            margin-left: 5px;
                          "
                        >{{ file.createName }} {{ file.createDate }}</span>
                        <DeleteOutlined
                          v-if="file.uploadPersonId === nowUserId"
                          class="dataCollection-drawer-delete"
                          @click="deleteFile(file.id)"
                        />
                      </div>
                    </div>
                    <a-button
                      v-if="node.allowedUpload"

                      style="margin-top: 5px"
                      @click="uploadFile(node)"
                    >
                      上传文件
                    </a-button>
                  </div>
                </div>
              </div>
            </div>
            <div class="dataCollection-drawer-time">
              <div class="dataCollection-drawer-ball"></div>
              {{ item.nodeDate ? formatTime(item.nodeDate, 'YYYY-MM-DD') : '' }}
            </div>
          </div>
        </div>
      </div>
    </a-spin>
    <div
      style="
        position: absolute;
        bottom: 0;
        right: 0;
        padding: 15px;
        width: 100%;
        text-align: right;
        background: #fff;
      "
    >
      <a-button type="primary" @click="onClose">
        关闭
      </a-button>
    </div>
    <UploadComponent
      ref="UploadComponent"
      :uploadcall="getFileData"
      :max="1"
      :file-lists="fileLists"
    />
  </a-drawer>
</template>

<script>
import { CloseOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import { downloadAccessory, formatTime } from '~/providers/common/utils'
import UploadComponent from '~/providers/components/uploadComponent.vue'

export default {
  components: {
    UploadComponent,
    CloseOutlined,
    DeleteOutlined,
  },
  props: ['getData'],
  data() {
    return {
      downloadAccessory,
      visible: false,
      confirmLoading: false,
      data: {},
      nodeList: [],
      formatTime,
      contenDetailList: [],
      spinning: false,
      personData1: [],
      personData2: [],
      fileLists: [],
      id: '',
      dataCollectionContentId: '',
      nowUserId: localStorage.getItem('userId'),
    }
  },
  methods: {
    showModal(id) {
      this.id = id
      if (id) {
        this.getDetailData(id)
      }
      this.visible = true
    },
    getDetailData(id) {
      this.spinning = true
      window.$oAjax({
        method: 'get',
        url: window.$oApi.dataCollection.detail,
        params: {
          id,
        },
        headers: {
          // "X-Requested-With": "XMLHttpRequest"
          'Content-Type': 'application/json',
        },
      }).then((res) => {
        if (res && res.success) {
          this.data = res.obj
          this.nodeList = [
            {
              nodeDate: this.data.startDate,
            },
            ...(res.obj.nodeList || []),
          ]

          this.personData1 = res.obj.personList
            .filter(person => person.personType === '1')
            .map(person => ({
              personName: person.personName,
              personId: person.personId,
              personType: '1',
            }))
          this.personData2 = res.obj.personList
            .filter(person => person.personType === '2')
            .map(person => ({
              personName: person.personName,
              personId: person.personId,
              personType: '2',
            }))
        }
        else {
          message.error(res.msg || res.message)
        }
        this.spinning = false
      })
    },
    onClose() {
      this.getData()
      this.visible = false
      // this.data = {};
      // this.nodeList = []
    },
    getFileData(data) {
      this.fileLists = data.map(item => ({
        uid: item.id,
        name: item.attachmenttitle,
        status: 'done',
        url: item.realpath,
      }))
      this.upload()
    },
    uploadFile(data) {
      this.dataCollectionContentId = data.id
      this.$refs.UploadComponent.showModal()
    },
    upload() {
      if (this.fileLists.length === 0) {
        return
      }
      const fileData = this.fileLists[0]
      const data = {
        attachmentId: fileData.uid,
        attachmentName: fileData.name,
        path: fileData.url,
        dataCollectionContentId: this.dataCollectionContentId,
      }

      window.$oAjax({
        method: 'POST',
        url: window.$oApi.dataCollection.addFile,
        data,
        headers: {
          // "X-Requested-With": "XMLHttpRequest"
          'Content-Type': 'application/json',
        },
      }).then((res) => {
        if (res && res.success) {
          message.success(res.msg || res.message)
          this.fileLists = []
          this.getDetailData(this.id)
        }
        else {
          message.error(res.msg || res.message)
        }
      })
    },
    deleteFile(id) {
      Modal.confirm({
        title: '删除',
        content: `确认该附件吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          this.loading = true
          window.$oAjax({
            method: 'get',
            url: window.$oApi.dataCollection.deleteFile,
            params: {
              id,
            },
          }).then((res) => {
            if (res.success) {
              message.success(res.message || res.msg || '操作成功')
              this.getDetailData(this.id)
            }
            else {
              message.error(res.message || res.msg)
            }
          })
        },
      })
    },
  },
}
</script>

<style lang="less">
.dataCollection-drawer {

  .ant-drawer-body {
    padding: 15px;
    padding-top: 55px;
    padding-bottom: 55px;
  }

  .dataCollection-drawer-timeLine {
    margin-top: 15px;
    font-size: 12px;

    .dataCollection-drawer-time {
      font-size: 14px;
      font-weight: bold;
      position: relative;
      padding-top: 10px;

      .dataCollection-drawer-ball {
        position: absolute;
        width: 10px;
        height: 10px;
        border-radius: 50%;
        background: #fff;
        border: solid 2px #1890ff;
        top: 15px;
        left: -20px;
      }
    }

    .dataCollection-drawer-block {
      position: relative;
      padding-left: 15px;
      padding-bottom: 5px;
      border-left: solid 1px #e2e2e2;
    }

    .dataCollection-drawer-time-current {
      .dataCollection-drawer-time {
        color: #40a9ff;
      }
    }

    .dataCollection-drawer-time-after {
      .dataCollection-drawer-time {
        color: gray;

        .dataCollection-drawer-ball {
          border-color: gray;
        }
      }
    }

    .dataCollection-drawer-delete {
      color: red;
      font-size: 14px;
      vertical-align: middle;
      margin-left: 5px;
      cursor: pointer;
    }
  }
}
.dataCollection-detail {
  .dataCollection-detail-name {
    font-size: 16px;
    font-weight: bold;
  }

  .dataCollection-detail-tag {
    font-size: 12px;
    border-radius: 3px;
    color: #fff;
    display: inline-block;
    padding: 2px 5px;
    margin-left: 5px;
  }
}
</style>
