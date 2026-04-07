<template>
  <div>
    <ht-modal
      title="选择文件"
      :open="visible"
      width="500px"
      :keyboard="false"
      :mask-closable="false"
      class="questionType-modal"
      :centered="true"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <div style="margin-bottom: 5px">
        <a-input
          v-model:value="fileName"
          style="width: 200px"
          placeholder="请输入文件名称查询"
          @keypress.enter="searchFileByName"
        ></a-input>
        <a-button type="primary" @click="searchFileByName">
          查询
        </a-button>
      </div>
      <a-tree
        :expanded-keys="expandedKeys"
        :auto-expand-parent="autoExpandParent"
        :selected-keys="selectedKeys"
        :tree-data="treeData"
        @select="onSelect"
        @expand="onExpand"
      />
      <p
        v-show="treeData.length === 0"
        style="text-align: center; color: #999; line-height: 150px"
      >
        未查到数据
      </p>
    </ht-modal>
  </div>
</template>

<script>
import { getQueryVariable } from '~/providers/common/utils'

const fileType = {
  0: 'UDR录入模板',
  1: '报告文件',
  2: '记录文件',
  3: '附件',
  4: '首件报告',
  5: '历史报告文件',
  6: '结果录入模板',
}

export default {
  props: ['callback'],
  data() {
    return {
      visible: false,
      fileType,
      treeData: [],
      originData: [],
      selectedKeys: [],
      selectedObj: [],
      isAdd: true,
      fileName: '',
      loading: false,
      isReportPage: getQueryVariable('reportPage') == 1, // 报告审核、报告批准页面进入
      testTaskId: getQueryVariable('testTaskId'),
      reportId: '',
      expandedKeys: [],
      autoExpandParent: true,
    }
  },
  methods: {
    showModal(reportId) {
      if (reportId) {
        this.reportId = reportId
      }
      this.selectedKeys = []
      this.selectedObj = []
      this.fileName = ''
      this.visible = true
      this.getData()
    },
    handleCancel() {
      this.visible = false
      this.fileName = ''
    },
    handleOk() {
      this.callback(this.selectedObj)
      this.handleCancel()
    },
    searchFileByName() {
      const fileName = this.fileName.toLocaleLowerCase()
      const list = JSON.parse(JSON.stringify(this.originData))
      for (let i = 0; i < list.length; i++) {
        for (let j = 0; j < list[i].children.length; j++) {
          const item = list[i].children[j]
          if (!item.title.toLocaleLowerCase().includes(fileName.trim())) {
            list[i].children.splice(j, 1)
            j--
          }
        }
        if (list[i].children.length === 0) {
          list.splice(i, 1)
          i--
        }
      }
      this.selectedKeys = []
      this.selectedObj = []
      this.treeData = list
    },
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys
      this.autoExpandParent = false
    },
    onSelect(keys) {
      if (keys.length) {
        const item = this.findDataItem(keys[0])
        if (!item.reportFileId)
          return
        this.selectedObj = item
      }
      else {
        this.selectedObj = []
      }
      this.selectedKeys = keys
    },
    getData() {
      this.loading = true
      if (this.isReportPage) {
        this.getDataById()
        return
      }
      window.$oAjax
        .get(window.$oApi.reportQuestion.getReportAndFile + this.testTaskId)
        .then((res) => {
          this.loading = false
          if (!res || !res.data) {
            this.treeData = []
            return
          }
          const dataObj = res.data
          const result = []
          for (const k in dataObj) {
            this.expandedKeys.push(k)
            dataObj[k].forEach((d) => {
              d.key = d.reportFileId
              d.title = d.reportFileName
            })
            result.push({
              key: k,
              title: k,
              children: dataObj[k],
            })
          }
          this.treeData = result
          this.originData = [...result]
        })
    },
    //  编制报告文件列表
    getDataById() {
      window.$oAjax
        .get(window.$oApi.reportQuestion.getReportAndFileById + this.reportId)
        .then((res) => {
          if (!res || !res.data || res.data.length === 0) {
            this.treeData = []
            return
          }
          const datas = [
            {
              key: res.data[0].reportNum,
              title: res.data[0].reportNum,
              children: res.data.map(d => ({
                key: d.reportFileId,
                title: d.reportFileName,
                ...d,
              })),
            },
          ]
          this.expandedKeys.push(res.data[0].reportNum)
          this.treeData = datas
          this.originData = [...datas]
        })
    },
    findDataItem(key) {
      for (let i = 0; i < this.treeData.length; i++) {
        const d = this.treeData[i]
        if (key === d.key)
          return d
        if (d.children && d.children.length) {
          for (let j = 0; j < d.children.length; j++) {
            const c = d.children[j]
            if (key === c.key)
              return c
          }
        }
      }
      return null
    },
  },
}
</script>

<style lang="less">
.questionType-modal {
  .ant-modal-body {
    height: 350px;
    overflow-y: auto;
  }

  .ant-table-thead > tr > th,
  .ant-table-tbody > tr > td {
    padding: 5px 8px;
  }
}
</style>
