<template>
  <div class="sampleScanRecord">
    <a-collapse v-model:active-key="activeKey" :accordion="true">
      <a-collapse-panel
        key="1"
        :header="
          `委托附件(${
            attachmentObj.consign ? attachmentObj.consign.length : 0
          })`
        "
      >
        <a-table
          :bordered="true"
          :columns="columns"
          :data-source="attachmentObj.consign"
          :pagination="false"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'operation'">
              <div class="table-handle">
                <a
                  v-if="'pdf,jpg,png,jpeg,bmp,gif'.includes(record.fileType)"
                  href="javascript:;"
                  @click="previewFile(record)"
                >预览</a>
                <a href="javascript:;" @click="getFileBlob(record)">下载</a>
              </div>
            </template>
          </template>
        </a-table>
      </a-collapse-panel>
      <a-collapse-panel
        key="2"
        :header="
          `样品附件(${
            attachmentObj.sample ? attachmentObj.sample.length : 0
          })`
        "
      >
        <a-table
          :bordered="true"
          :columns="columns"
          :data-source="attachmentObj.sample"
          :pagination="false"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'operation'">
              <div class="table-handle">
                <a
                  v-if="'pdf,jpg,png,jpeg,bmp,gif'.includes(record.fileType)"
                  href="javascript:;"
                  @click="previewFile(record)"
                >预览</a>
                <a href="javascript:;" @click="getFileBlob(record)">下载</a>
              </div>
            </template>
          </template>
        </a-table>
      </a-collapse-panel>
      <a-collapse-panel
        key="3"
        :header="
          `任务附件(${
            attachmentObj.task ? attachmentObj.task.length : 0
          })`
        "
      >
        <a-table
          :bordered="true"
          :columns="columns"
          :data-source="attachmentObj.task"
          :pagination="false"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'operation'">
              <div class="table-handle">
                <a
                  v-if="'pdf,jpg,png,jpeg,bmp,gif'.includes(record.fileType)"
                  href="javascript:;"
                  @click="previewFile(record)"
                >预览</a>
                <a href="javascript:;" @click="getFileBlob(record)">下载</a>
              </div>
            </template>
          </template>
        </a-table>
      </a-collapse-panel>
      <a-collapse-panel
        key="4"
        :header="`报告附件(${attachmentObj.report.length})`"
      >
        <a-table
          :bordered="true"
          :columns="columns"
          :data-source="attachmentObj.report"
          :pagination="false"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'operation'">
              <div class="table-handle">
                <a
                  v-if="'pdf,jpg,png,jpeg,bmp,gif'.includes(record.fileType)"
                  href="javascript:;"
                  @click="previewFile(record)"
                >预览</a>
                <a href="javascript:;" @click="getFileBlob(record)">下载</a>
              </div>
            </template>
          </template>
        </a-table>
      </a-collapse-panel>
    </a-collapse>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { downloadFile, getQueryVariable } from '~/providers/common/utils'

export default {
  data() {
    return {
      activeKey: ['1'],
      reportId: '',
      consignId: '',
      columns: [
        {
          title: '文件名称',
          dataIndex: 'name',
          key: 'name',
        },
        {
          title: '文件格式',
          dataIndex: 'fileType',
          key: 'fileType',
          width: '140',
        },
        {
          title: '文件大小',
          dataIndex: 'size',
          key: 'size',
          width: '140',
          customRender: ({ text }) =>
            text ? `${(text / 1024 / 1024).toFixed(3)}M` : '0M',
        },
        {
          title: '上传时间',
          dataIndex: 'createDate',
          key: 'createDate',
          width: '140',
          customRender: ({ text: time }) =>
            time ? dayjs(time).format('YYYY-MM-DD HH:mm:ss') : '',
        },
        {
          dataIndex: 'operation',
          title: '操作',
          width: '15%',
        },
      ],
      attachmentObj: {
        consign: [],
        report: [],
        sample: [],
        task: [],
      },
    }
  },
  created() {
    this.reportId = getQueryVariable('reportId')
    this.consignId = getQueryVariable('consignId')
    this.getData()
  },
  methods: {
    previewFile(row) {
      window.open(row.url, '_blank')
    },
    getData() {
      this.loading = true
      const { reportId, consignId } = this
      window.$oAjax
        .get(`/rest/tReportOtherFileController/fileInfo`, {
          params: { reportId, consignId },
        })
        .then((res) => {
          if (res && res.success) {
            this.attachmentObj = res.obj
          }
          this.loading = false
        })
    },
    // 获取文件流
    getFileBlob(row) {
      window.$oAjax({
        url: row.url,
        method: 'get',
        responseType: 'blob',
      }).then((res) => {
        const blob = new Blob([res])
        const url = window.URL.createObjectURL(blob)
        downloadFile(url, row.name)
      })
    },
  },
}
</script>
