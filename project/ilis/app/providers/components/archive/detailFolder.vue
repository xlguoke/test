<template>
  <div>
    <div>
      <div class="dataCollection-search">
        <div v-if="!isSelect" style="margin: 10px 0">
          <a-button
            v-permission="'detailFolderAdd'"
            type="primary"
            @click="typeModal(false)"
          >
            添加
          </a-button>
          <ht-modal
            :title="isEdit ? '编辑类型名称' : '添加类型名称'"
            :mask-closable="false"
            centered
            :open="visibleFolder"
            :confirm-loading="confirmLoading"
            @ok="typeOk"
            @cancel="typeCancel"
          >
            <a-form-item
              :label-col="{ span: 6 }"
              :wrapper-col="{ span: 17 }"
              label="请输入类型名称："
            >
              <a-input v-model:value="editDocumentName" placeholder="请输入" />
            </a-form-item>
          </ht-modal>
          <a-button
            v-permission="'detailFolderUpdate'"
            @click="typeModal(true)"
          >
            编辑
          </a-button>
          <a-button
            v-permission="'detailFolderDelete'"
            @click="typeDelete"
          >
            删除
          </a-button>
          <a-button
            v-permission="'detailTemplateQuote'"
            @click="setTemplate"
          >
            引用档案结构模板
          </a-button>
        </div>
      </div>
    </div>
    <a-table
      id="tableBox"
      :columns="treeColumns"
      :scroll="{ y: maxHeight || undefined }"
      :locale="locale"
      :data-source="treeData"
      :row-selection="isSelect ? rowSelection : null"
      :pagination="false"
      :custom-row="customRow"
      :row-class-name="rowClassName"
    ></a-table>
    <ht-modal
      :title="isEdit ? '编辑类型名称' : '添加类型名称'"
      :mask-closable="false"
      centered
      :open="visibleTemplate"
      class="hitek-add-modal"
      @ok="templateOk"
      @cancel="templateCancel"
    >
      <StructuralTemplate ref="StructuralTemplate" :callback="getTemplate" />
    </ht-modal>
  </div>
</template>

<script>
import { getQueryVariable } from '~/providers/common/utils'
// import qs from "qs";
import StructuralTemplate from './structuralTemplate.vue'

// const treeColumns = [
//   {
//     title: '模板名称',
//     dataIndex: 'name',
//   }
// ];
export default {
  components: {
    StructuralTemplate,
  },
  // props: ['callback','isSelect','addEditRow','editId', 'maxHeight'],
  props: ['callback', 'addEditRow', 'editId', 'maxHeight'],
  data() {
    return {
      treeColumns: [],
      documentId: getQueryVariable('documentId') || '',
      confirmLoading: false,
      visibleFolder: false,
      visibleTemplate: false,
      treeData: [],
      selectedRowKeys: [],
      selectedRows: [], // 选中的行
      selectPage: 'radio', // 默认单选
      isEdit: false,
      editDocumentName: '',
      editTypeId: '', // 获取右侧数据id
      templateName: '', // 选择档案结构模板
      templateId: '', // 选择档案结构模板id
      locale: { emptyText: '请先选择模板' },
      isSelect: false,
      customRow: (record) => {
        return {
          onClick: () => {
            this.rowSelect(record)
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
          this.rowSelect(selectedRows[0])
        },
        getCheckboxProps: record => ({
          props: {
            disabled: !!record.disabled,
          },
        }),
      }
    },
  },
  created() {},
  methods: {
    rowClassName(record) {
      let className = 'light-row'
      if (record.id === this.selectedRowKeys[0]) {
        className = 'dark-row'
      }
      return className
    },
    rowSelect(record) {
      if (this.isSelect) {
        this.selectedRowKeys = [record.id]
        this.selectedRows = [record]
        this.callback(record)
      }
      else {
        if (this.selectedRowKeys.includes(record.id)) {
          $(`#tableBox tr[data-row-key="${record.id}"]`).removeClass(
            'hitek-tableRow-active',
          )
          const arr = this.selectedRowKeys
          arr.splice(
            arr.findIndex(item => item === record.id),
            1,
          )
          this.selectedRows = this.selectedRows.filter(
            item => item.id !== record.id,
          )
          this.callback()
        }
        else {
          $(`#tableBox tr[data-row-key="${record.id}"]`)
            .addClass('hitek-tableRow-active')
            .siblings()
            .removeClass('hitek-tableRow-active')
          this.selectedRowKeys = [record.id]
          this.selectedRows = [record]
          this.callback(record)
        }
      }
    },
    templateOk() {
      const data = this.$refs.StructuralTemplate.selectedRows
      if (data.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择数据'))
      }
      else {
        const selTreeData = this.$refs.StructuralTemplate.setTreeData(
          this.documentId,
        )
        this.addEditRow('', selTreeData)
        this.templateCancel()
      }
    },
    templateCancel() {
      this.$refs.StructuralTemplate.handleCancel()
      this.visibleTemplate = false
    },
    setTemplate() {
      this.visibleTemplate = true
      window.$oNextTick(() => {
        this.$refs.StructuralTemplate.showModal('checkbox')
      })
      // let self = this;
      // if(this.$refs.StructuralTemplate){
      //   this.$refs.StructuralTemplate.showModal('checkbox')
      // }else{
      //   let timer = setInterval(function () {
      //     if(self.$refs.StructuralTemplate){
      //       clearInterval(timer);
      //       timer = null;
      //       self.$refs.StructuralTemplate.showModal('checkbox')
      //     }
      //   }, 100);
      // }
    },
    getTemplate(data) {
      this.templateName = data[0].name
      this.templateId = data[0].id
      this.getTreeData()
    },
    typeModal(isEdit) {
      if (isEdit) {
        if (this.selectedRowKeys.length === 0) {
          window.$oAntdModal.warning(window.$oMsgTips.info('请先选择数据'))
          return
        }
      }
      this.isEdit = isEdit
      this.editDocumentName = isEdit ? this.selectedRows[0].name : ''
      this.visibleFolder = true
    },
    typeDelete() {
      if (this.selectedRowKeys.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先选择数据'))
        return
      }
      const folderId = this.selectedRows[0].id
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      if (this.selectedRows[0].id) {
        window.$oAntdConfirm({
          title: '提示',
          content: '子目录及归档资料项将一并被删除，是否继续？',
          onOk() {
            window.$oAjax
              .delete(`${window.$oApi.archivingDetail.delFolder}/${folderId}`)
              .then((res) => {
                if (res.code === 20000) {
                  // self.handleCancel();
                  self.selectedRows = []
                  self.selectedRowKeys = []
                  self.getTreeData()
                }
                else {
                  // eslint-disable-next-line ts/no-unused-expressions
                  res.success === false
                    ? window.$oAntdMessage.error(res.msg || res.message)
                    : ''
                }
                self.confirmLoading = false
              })
          },
        })
      }
      else {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择目录'))
      }
    },
    typeOk() {
      // 类型新增编辑
      this.confirmLoading = true
      let method
      let url
      let data = {}
      // editTypeId
      if (this.isEdit) {
        method = 'PUT'
        url = window.$oApi.archivingDetail.updateFolder
        data = {
          id: this.selectedRows[0].id, // 父级目录
          name: this.editDocumentName, // 目录名称
          documentId: this.selectedRows[0].documentId, // 模板id
        }
      }
      else {
        method = 'POST'
        data = {
          documentId:
            this.selectedRows.length > 0
              ? this.selectedRows[0].documentId
              : this.documentId, // 模板id
          name: this.editDocumentName, // 目录名称
        }
        if (this.selectedRows.length > 0) {
          data.pid = this.selectedRows[0].id
        }
        url = window.$oApi.archivingDetail.addFolder
      }
      window.$oAjax({
        method,
        url,
        data,
        headers: {
          'Content-Type': 'application/json',
        },
      }).then((res) => {
        this.confirmLoading = false
        this.typeCancel()
        if (res.code === 20000) {
          this.getTreeData()
        }
        else {
          // eslint-disable-next-line ts/no-unused-expressions
          res.success === false
            ? window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            : ''
        }
      })
    },
    typeCancel() {
      this.editDocumentName = ''
      this.visibleFolder = false
    },
    renderTreeNodes(data, defaultChecke) {
      if (!Array.isArray(data)) {
        return
      }
      const arr = []
      for (let i = 0; i < data.length; i++) {
        let children = []
        if (data[i].children && data[i].children.length != 0) {
          children = this.renderTreeNodes(data[i].children, false)
        }
        if (i === 0 && defaultChecke && this.isSelect) {
          if (this.selectedRowKeys.length === 0) {
            this.selectedRowKeys.push(data[i].id)
            this.selectedRows.push(data[i])
          }
          this.callback(this.selectedRows[0])
        }
        const obj = {
          ...data[i],
          value: data[i].id,
          title: data[i].name,
          itemVoList: data[i].itemVoList ? data[i].itemVoList : [],
          key: data[i].id,
          children,
        }
        if (children.length === 0) {
          delete obj.children
        }
        arr.push(obj)
      }
      return arr
    },
    getTreeData() {
      window.$oAjax({
        url: window.$oApi.archivingDetail.treeFolderList,
        params: { documentId: this.documentId },
      }).then((res) => {
        if (res.code === 20000) {
          this.treeData = this.renderTreeNodes(res.data, true)
          if (this.selectedRowKeys.length > 0) {
            this.callback(this.selectedRows[0])
          }
          else {
            this.callback()
          }
        }
        else {
          this.treeData = []
          this.callback()
          // eslint-disable-next-line ts/no-unused-expressions
          res.success === false
            ? window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            : ''
        }
      })
    },
    handleCancel() {
      this.visibleFolder = false
      this.templateName = ''
      this.treeData = []
      this.selectedRows = []
      this.selectedRowKeys = []
    },
    showModal(archiveName, treeData, isSelect) {
      // eslint-disable-next-line ts/no-unused-expressions
      isSelect ? (this.isSelect = isSelect) : ''
      this.treeColumns = [
        {
          title: archiveName,
          dataIndex: 'name',
        },
      ]
      if (treeData) {
        this.treeData = treeData
      }
      else {
        this.getTreeData()
      }
    },
  },
}
</script>

<style scoped></style>
