<template>
  <div>
    <ht-modal
      v-model:open="visible"
      title="修改版本"
      centered
      :force-render="true"
      :mask-closable="false"
      class="components-selectPersonnel"
      width="800px"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-spin :spinning="spinning">
        <div class="spin-content">
          <a-form-item
            label="资质类型"
            :label-col="{ span: 3 }"
            :wrapper-col="{ span: 19 }"
          >
            <a-select
              v-model="templateType"
              style="width: 60%"
              @change="handleSelectChange"
            >
              <a-select-option value="">
                全部
              </a-select-option>
              <a-select-option
                v-for="(item, index) in dictData"
                :key="index"
                :value="item.id"
              >
                {{ item.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <div class="content-table">
            <a-table
              v-if="data.length > 0"
              :columns="columns"
              :data-source="data"
              row-key="templateId"
              :row-class-name="rowClassName"
              :pagination="false"
              :row-selection="rowSelection"
              bordered
              :custom-row="customRow"
            />
          </div>
        </div>
      </a-spin>
    </ht-modal>
  </div>
</template>

<script>
import qs from 'qs'

const columns = [
  {
    title: '模板版本号',
    dataIndex: 'versionsNo',
  },
  {
    title: '系统模板名称',
    dataIndex: 'name',
  },
  {
    title: '系统模板ID',
    dataIndex: 'templateId',
  },
  {
    title: 'html模板组件',
    dataIndex: 'htmlFile',
  },
  {
    title: 'html模板组件名称',
    dataIndex: 'htmlComponent',
  },
]

export default {
  props: ['callback'],
  data() {
    return {
      templateType: '',
      columns,
      selectedRowKeys: [],
      selectedRows: [],
      dictData: [],
      useUdrIds: '',
      spinning: false,
      visible: false,
      fristLoad: false,
      qualificationTypeID: '',
      data: [],
      customRow: (record) => {
        return {
          onClick: () => {
            this.selectedRowKeys = [record.templateId]
            this.selectedRows = [record]
          },
        }
      },
    }
  },
  computed: {
    rowSelection() {
      const { selectedRowKeys } = this
      return {
        selectedRowKeys,
        type: 'radio',
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
        getCheckboxProps: record => ({
          props: {
            disabled: !!record.disabled,
          },
        }),
      }
    },
  },
  created() {
    this.getDictData()
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    handleSelectChange(value) {
      this.qualificationTypeID = value
      this.getData()
    },
    handleCancel() {
      this.data = []
      this.selectedRows = []
      this.selectedRowKeys = []
      this.visible = false
    },
    getDictData() {
      this.spinning = true
      window.$oAjax({
        url: window.$oApi.testTemplate.getDict,
        method: 'POST',
        data: qs.stringify({
          list: JSON.stringify(['@testQual@']),
        }),
      }).then((res) => {
        this.spinning = false
        this.fristLoad = true
        if (
          res.success
          && res.attributes
          && res.attributes.testQual
          && res.attributes.testQual.length > 0
        ) {
          this.dictData = res.attributes.testQual
        }
        else {
          this.dictData = []
        }
      })
    },
    getData() {
      if (this.fristLoad) {
        window.$oAjax({
          method: 'GET',
          params: {
            useUdrIds: this.useUdrIds,
            qualificationTypeID: this.qualificationTypeID,
          },
          url: window.$oApi.testTemplate.versionList,
        }).then((res) => {
          this.spinning = false
          if (res.code === 20000 && res.data && res.data.length > 0) {
            this.data = res.data
            this.selectedRows.push(
              this.data.find(
                item => item.templateId === this.selectedRowKeys[0],
              ),
            )
          }
          else {
            this.data = []
          }
        })
      }
    },
    showModal(ids, templateId) {
      this.visible = true
      this.spinning = true
      this.useUdrIds = ids
      this.selectedRowKeys = [templateId]
      this.getData()
    },
    cancelModal() {
      this.selectedRowKeys = []
      this.rowSelection.selectedRowKeys = []
      this.visible = false
    },
    handleSubmit() {
      if (this.selectedRows.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择一条数据'))
        return
      }
      this.spinning = true
      window.$oAjax({
        method: 'POST',
        data: JSON.stringify({
          groupKey: this.selectedRows[0].groupKey,
          templateId: this.selectedRows[0].templateId,
          templateName: this.selectedRows[0].name,
          fileType: this.selectedRows[0].fileType,
          htmlFile: this.selectedRows[0].htmlFile,
          htmlComponent: this.selectedRows[0].htmlComponent,
          useUdrIds: this.useUdrIds,
        }),
        headers: {
          'content-type': 'application/json',
        },
        url: window.$oApi.testTemplate.updateVersion,
      }).then((res) => {
        this.spinning = false
        if (res.code === 20000) {
          this.cancelModal()
          this.callback()
        }
        else {
          window.$oAntdModal.warning(
            window.$oMsgTips.info(res.msg || res.message || '请求异常'),
          )
        }
      })
    },
  },
}
</script>

<style lang="less">
.searchBox {
  display: flex;
  margin-bottom: 10px;
}
.content-table {
  height: 300px;
  overflow-y: auto;
}
</style>
