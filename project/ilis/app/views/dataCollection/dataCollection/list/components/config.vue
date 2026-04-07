<template>
  <a-drawer
    :title="showType === 'detail' ? '主题详情' : '配置'"
    placement="right"
    width="70%"
    :open="visible"
    class="dataCollection-drawer dataCollection-detail"
    @close="onClose"
  >
    <a-spin :spinning="spinning">
      <div>
        <div v-if="showType === 'detail'" style="font-size: 12px">
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
        <div v-else>
          <a-button
            type="primary"

            @click="addNode(data.id, 'add')"
          >
            添加时间节点
          </a-button>
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
              <a-button
                v-if="showType !== 'detail'"
                style="margin-bottom: 5px"

                @click="
                  addNode(
                    data.id,
                    'edit',
                    item,
                    '',
                    nodeList[index - 1].nodeDate,
                    nodeList[index].nodeDate,
                  )
                "
              >
                编辑
              </a-button>
              <div v-if="item.remindDate">
                资料上报提醒时间：{{
                  item.remindDate
                    ? formatTime(item.remindDate, 'YYYY-MM-DD')
                    : ''
                }}
              </div>
              <div v-if="item.contenDetailList">
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
                      <span
                        v-if="
                          showType === 'detail'
                            && node.unUploadPersonNum
                            && node.unUploadPersonNum > 0
                        "
                        style="color: red; margin-left: 15px"
                      >
                        未上报人员({{ node.unUploadPersonNum }})：{{
                          node.unUploadPersonList
                            ? node.unUploadPersonList
                              .map((p) => p.personName)
                              .toString()
                            : ''
                        }}
                      </span>
                    </div>
                    <div
                      style="font-weight:bold;font-size:14px;overflow:hidden;padding-right;10px;"
                    >
                      <span v-if="showType === 'detail'">
                        <CheckCircleOutlined
                          :style="`color:${
                            node.isComplete === '1' ? 'green' : 'gray'
                          }`"
                        />
                      </span>
                      {{ node.content }}
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
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="dataCollection-drawer-time">
              <div class="dataCollection-drawer-ball"></div>
              <div class="dataCollection-drawer-time-div">
                {{
                  item.nodeDate ? formatTime(item.nodeDate, 'YYYY-MM-DD') : ''
                }}
                <span v-if="showType !== 'detail'">
                  <span
                    v-if="index !== 0"
                    class="dataCollection-drawer-time-span mx-2"
                    @click="
                      addNode(data.id, 'editTime', item.nodeDate, item.id)
                    "
                  ><EditOutlined /></span>
                  <span
                    v-if="index !== 0"
                    class="dataCollection-drawer-time-span"
                    @click="delNode(data.id, item.id, item.contenDetailList)"
                  ><DeleteOutlined /></span>
                </span>
              </div>
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
  </a-drawer>
</template>

<script>
import { CheckCircleOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import { downloadAccessory, formatTime } from '~/providers/common/utils'

export default {
  components: {
    CheckCircleOutlined,
    DeleteOutlined,
    EditOutlined,
  },
  props: ['addNode', 'getData'],
  data() {
    return {
      downloadAccessory,
      visible: false,
      confirmLoading: false,
      formLayout: 'horizontal',
      data: {},
      nodeList: [],
      formatTime,
      contenDetailList: [],
      showType: '',
      spinning: false,
      personData1: [],
      personData2: [],
    }
  },
  methods: {
    showModal(id, type) {
      this.showType = type
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
              nodeDate: new Date(
                dayjs(this.data.startDate).set({
                  hour: 0,
                  minute: 0,
                  second: 0,
                  millisecond: 0,
                }),
              ).getTime(),
            },
            ...(res.obj.nodeList || []),
          ]

          if (this.showType === 'detail') {
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
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.spinning = false
      })
    },
    onClose() {
      if (this.showType !== 'detail') {
        this.getData()
      }
      this.visible = false
      // this.data = {};
      // this.nodeList = [];
    },
    delNode(dataId, id, contentData) {
      let contentTips = '确定要删除吗?'
      // eslint-disable-next-line ts/no-unused-expressions
      contentData ? (contentTips = '删除时间节点会把关联的任务一起删除') : ''
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      window.$oAntdConfirm({
        title: '提示',
        content: contentTips,
        onOk() {
          window.$oAjax({
            method: 'delete',
            url: `${window.$oApi.dataCollection.deleteNode}/${id}`,
          })
            .then((res) => {
              if (res.data === 20000) {
                self.getDetailData(dataId)
              }
              else {
                window.$oAntdMessage.error(res.msg)
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

      .dataCollection-drawer-time-div {
        display: inline-block;

        .dataCollection-drawer-time-span {
          display: none;
          cursor: pointer;
        }

        &:hover {
          .dataCollection-drawer-time-span {
            display: inline-block;
          }
        }
      }
    }

    .dataCollection-drawer-block {
      position: relative;
      padding-left: 15px;
      padding-bottom: 10px;
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
