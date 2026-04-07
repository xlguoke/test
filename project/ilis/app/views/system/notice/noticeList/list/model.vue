<template>
  <a-spin :spinning="loading">
    <div class="contentbox">
      <div class="title">
        {{ data.noticeTitle }}
      </div>
      <div class="time">
        发布时间：{{ timeFormat(data.createTime) }}
      </div>
      <hr />
      <div>
        <div class="content clearfix" v-html="data.noticeContent"></div>
        <div
          v-if="data.attaches && data.attaches.length"
          style="background: #fff; padding-top: 10px"
        >
          <h3>附件</h3>
          <ul v-if="data.attaches && data.attaches.length" class="file-list">
            <li
              v-for="(item) in data.attaches"
              :key="item.id"
              class="file-item"
            >
              <span class="file-name" :title="item.attachmenttitle">
                {{ item.attachmenttitle }}
              </span>
              <p
                class="download-icon"
                @click="getFileBlob(item.realpath, item.attachmenttitle)"
              >
                <DownloadOutlined />
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </a-spin>
</template>

<script>
import { DownloadOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import { downloadFile, getQueryVariable } from '~/providers/common/utils'

export default {
  components: {
    DownloadOutlined,
  },
  props: ['id'],
  data() {
    return {
      loading: false,
      data: {},
    }
  },
  created() {
    const id = getQueryVariable('id') || this.id

    id && this.getDetailData(id)
  },
  methods: {
    getDetailData(id) {
      this.visible = true
      this.loading = true
      window.$oAjax
        .get(`noticeController.do?readNotice&noticeId=${id}`, {})
        .then((res) => {
          this.loading = false
          if (res.success) {
            this.data = res.obj || {}
          }
        })
        .catch(() => {
          this.loading = false
        })
    },
    handleCancel() {
      this.visible = false
      this.data = {}
    },
    getFileBlob(url, name) {
      window.$oAjax({
        url,
        method: 'get',
        responseType: 'blob',
      }).then((res) => {
        const blob = new Blob([res])
        const url = window.URL.createObjectURL(blob)
        downloadFile(url, name)
      })
    },
    timeFormat(time) {
      if (!time) {
        return ''
      }
      return dayjs(time).format('YYYY-MM-DD HH:mm:ss')
    },
  },
}
</script>

<style lang="less" scoped>
*{font-size:initial;font-weight:initial}h3{font-weight:600}.title{font-family:"Microsoft YaHei";font-size:20px;text-align:center;/*// padding-bottom: 4px;*//*// padding-top: 10px;*/font-weight:600}.time{text-align:right;color:#444;font-size:12px;padding-bottom:4px}hr{margin:10px 0}.contentbox{ :deep(.content) {
    h1, h2, h3, h4, h5, h6{
      font-weight: bold;
    }
  }}.file-list{margin-top:4px;.file-item {
    display: inline-flex;
    align-items: center;
    padding-left: 8px;
    margin-top: 4px;
    margin-right: 8px;
    border: 1px solid #dcdcdc;
    border-radius: 4px;
    .file-name {
      flex: 1;
      margin-right: 8px;
      max-width: 300px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      font-size: 14px;
    }
    .download-icon {
      width: 50px;
      border-left: 1px solid #dcdcdc;
      text-align: center;
      font-size: 18px;
      color: #1890ff;
      cursor: pointer;
      &:hover {
        opacity: 0.8;
      }
    }
  }}
</style>
