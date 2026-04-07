<template>
  <div id="components-layout-demo-basic">
    <a-layout>
      <a-layout-header class="header">
        报告文件
      </a-layout-header>
      <a-layout-content>
        <a-list item-layout="horizontal" :data-source="data">
          <template #renderItem="{ item }">
            <a-list-item>
              <a-list-item-meta
                :description="item || description"
                @click="openFile(item)"
              >
                <template #title>
                  <a>{{ item.title }}</a>
                </template>
                <template #avatar>
                  <a-avatar :src="imgUrl" />
                </template>
              </a-list-item-meta>
              <div class="report-file-div">
                报告文件
              </div>
            </a-list-item>
          </template>
        </a-list>
      </a-layout-content>
    </a-layout>
  </div>
</template>

<script>
export default {
  metaInfo: {
    meta: [
      {
        ele: null,
        name: 'viewport',
        content:
          'width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=2,user-scalable=yes',
      },
    ],
  },
  components: {},
  data() {
    return {
      visible: false,
      data: [],
      reportId: '',
      unitCode: '',
      imgUrl: `/ilis2/plug-in/pdfjs-mobile/pdfjs/web/images/24gf-fileText.png`,
    }
  },
  computed: {},
  created() {
    this.init()
    this.getReportFile()
  },
  methods: {
    description_filter(item) {
      const u = item.url.split('/')
      return u[u.length - 1]
    },
    init() {
      const query = window.location.pathname
      const split = query.split('/api/exam/info/')
      try {
        const param = split[1].split('/')
        this.unitCode = param[0]
        this.reportId = param[1]
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (e) {}
    },
    getReportFile() {
      window.$oAjax
        .get(`${window.$oApi.reportFile}/${this.unitCode}/${this.reportId}`)
        .then((res) => {
          const data = res.data
          this.data = data
          if (data.length > 0) {
            document.title = data[0].reportNo
          }

          if (data.length === 1) {
            this.openFile(data[0])
          }
        })
    },
    openFile(item) {
      if (item.type === 'pdf' || item.type === 'PDF') {
        if (item.exist) {
          this.$router.push({
            name: 'viewport',
            query: {
              src: window.encodeURIComponent(item.url),
              filename: window.encodeURIComponent(this.title),
            },
          })
        }
        else {
          window.$oAntdModal.warning(
            window.$oMsgTips.info('报告还未生成PDF或PDF生成失败，请稍后再试'),
          )
        }
      }
      else {
        window.$oAntdModal.warning(window.$oMsgTips.info('不支持的文件类型'))
      }
    },
  },
}
</script>

<style scoped>
.header {
  background-color: antiquewhite !important;
  font-size: 20px;
  text-align: center;
}
.report-file-div {
  margin-right: 10px;
  padding: 2px 5px;
  background-color: #f3f3f3;
  color: #9e9494;
  border-radius: 5px;
}
.ant-list-item {
  padding: 12px 16px;
}
</style>

<style lang="less">
@import './index.less';
</style>
