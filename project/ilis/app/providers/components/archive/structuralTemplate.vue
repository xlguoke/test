<template>
  <div>
    <div>
      <div class="dataCollection-search">
        <div>
          <a-row :gutter="10">
            <a-col :span="18">
              <a-input
                v-model:value="templateName"
                placeholder="请选择模板名称"
              />
            </a-col>
            <a-col :span="6">
              <a-button type="primary" @click="setTemplate">
                选择
              </a-button>
            </a-col>
          </a-row>
        </div>
        <div
          v-if="treeData.length > 0 && selectPage === 'radio' ? true : false"
          style="margin: 10px 0"
        >
          <a-button type="primary" @click="typeModal(false)">
            添加
          </a-button>
          <ht-modal
            :title="isEdit ? '编辑类型名称' : '添加类型名称'"
            :mask-closable="maskClosable"
            :open="visible"
            :confirm-loading="confirmLoading"
            @ok="typeOk"
            @cancel="typeCancel"
          >
            <a-form-item
              :label-col="{ span: 6 }"
              :wrapper-col="{ span: 17 }"
              label="请输入类型名称："
            >
              <a-input v-model:value="editTypeName" placeholder="请输入" />
            </a-form-item>
          </ht-modal>
          <a-button type="" @click="typeModal(true)">
            编辑
          </a-button>
          <a-button type="" @click="typeDelete">
            删除
          </a-button>
        </div>
      </div>
    </div>
    <a-table
      :columns="treeColumns"
      :locale="locale"
      :data-source="treeData"
      :row-selection="rowSelection"
      :pagination="false"
      :custom-row="customRow"
      style="margin-top: 15px"
    ></a-table>
    <SelTemplate ref="SelTemplate" :callback="getTemplate2" />
  </div>
</template>

<script>
import qs from 'qs'
import SelTemplate from './selTemplate.vue'

const treeColumns = [
  {
    title: '模板名称',
    dataIndex: 'name',
  },
]
export default {
  name: 'StructuralTemplate',
  components: {
    SelTemplate,
  },
  props: ['callback'],
  data() {
    return {
      treeColumns,
      confirmLoading: false,
      maskClosable: false,
      visible: false,
      treeData: [],
      selectedRowKeys: [],
      selectedRows: [], // 选中的行
      selectPage: 'radio', // 默认单选
      isEdit: false,
      editTypeName: '',
      editTypeId: '', // 获取右侧数据id
      templateName: '', // 选择档案结构模板
      templateId: '', // 选择档案结构模板id
      documentId: '', // 归档实体id
      locale: { emptyText: '请先选择模板' },
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
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      const { selectedRowKeys } = this
      return {
        selectedRowKeys,
        type: this.selectPage,
        onChange: (selectedRowKeys, selectedRows) => {
          // this.rowSelect(selectedRows[0]);
          this.selectedRows = selectedRows
          this.selectedRowKeys = selectedRowKeys
        },
        onSelect(record, selected) {
          if (selected && self.selectPage !== 'radio') {
            self.checkSelected([record])
          }
        },
      }
    },
  },
  created() {},
  methods: {
    rowSelect(record) {
      if (this.selectPage === 'radio') {
        this.selectedRowKeys = [record.id]
        this.selectedRows = [record]
        this.callback(this.selectedRows[0].id)
      }
      else {
        if (this.selectedRowKeys.includes(record.id)) {
          const arr = this.selectedRowKeys
          arr.splice(
            arr.findIndex(item => item === record.id),
            1,
          )
          this.selectedRows = this.selectedRows.filter(
            item => item.id !== record.id,
          )
        }
        else {
          this.checkSelected([record])
        }
      }
    },
    // 设置模板树
    setFilterTree(tree, map) {
      if (!Array.isArray(tree)) {
        return []
      }
      let arr = []
      for (let i = 0; i < tree.length; i++) {
        if (map.includes(tree[i].id)) {
          let children = null
          if (tree[i].children && tree[i].children.length > 0) {
            children = this.setFilterTree(tree[i].children, map)
          }
          const obj = {
            ...tree[i],
            children,
            itemVoList: [],
            documentId: this.documentId,
          }

          if (!children || children.length === 0) {
            delete obj.children
          }

          arr.push(obj)
        }
        else {
          if (tree[i].children && tree[i].children.length > 0) {
            arr = arr.concat(this.setFilterTree(tree[i].children, map))
          }
        }
      }
      return arr
    },
    // 设置引用模板树
    setTreeData(documentId) {
      this.documentId = documentId
      const treeData = this.setFilterTree(this.treeData, this.selectedRowKeys)
      return treeData
    },
    // 选中父级勾选下级
    checkSelected(data) {
      for (let i = 0; i < data.length; i++) {
        if (!this.selectedRowKeys.includes(data[i].id)) {
          this.selectedRows.push(data[i])
          this.selectedRowKeys.push(data[i].id)
        }
        if (data[i].children && Array.isArray(data[i].children)) {
          this.checkSelected(data[i].children)
        }
      }
    },
    showModal(selectPage) {
      this.selectPage = selectPage
    },
    setTemplate() {
      this.$refs.SelTemplate.showModal()
    },
    getTemplate2(data) {
      this.templateName = data[0].name
      this.templateId = data[0].id
      this.getTreeData()
    },
    typeModal(isEdit) {
      this.isEdit = isEdit
      if (isEdit && !this.selectedRows[0].pid) {
        window.$oAntdModal.warning(window.$oMsgTips.info('根目录不可编辑'))
        return
      }
      this.editTypeName = isEdit ? this.selectedRows[0].name : ''
      this.visible = true
    },
    typeDelete() {
      if (!this.selectedRows[0].pid) {
        window.$oAntdModal.warning(window.$oMsgTips.info('根目录不能删除'))
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
              .get(window.$oApi.archiving.delFolderTemplate, {
                params: {
                  folderId,
                },
              })
              .then((res) => {
                if (res.code === 20000) {
                  self.visible = false
                  self.confirmLoading = false
                  self.selectedRowKeys = []
                  self.selectedRows = []
                  self.getTreeData()
                }
                else {
                  window.$oAntdMessage.error(res.msg || res.message)
                }
              })
          },
        })
      }
      else {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择'))
      }
    },
    typeOk() {
      // 类型新增编辑
      this.confirmLoading = true
      const data = {
        templateId: this.templateId, // 模板id
        name: this.editTypeName, // 目录名称
      }
      if (this.isEdit) {
        data.id = this.selectedRows[0].id
        data.pid = this.selectedRows[0].pid
      }
      else {
        data.pid = this.selectedRows[0].id
      }
      window.$oAjax({
        method: 'POST',
        url: window.$oApi.archiving.saveFolderTemplate,
        data: qs.stringify(data),
      }).then((res) => {
        this.confirmLoading = false
        this.typeCancel()
        if (res.code === 20000) {
          this.getTreeData()
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
    typeCancel() {
      this.editTypeName = ''
      this.visible = false
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
        if (i === 0 && defaultChecke && this.selectPage === 'radio') {
          if (this.selectedRowKeys.length === 0) {
            this.selectedRowKeys.push(data[i].id)
            this.selectedRows.push(data[i])
          }
          this.callback(this.selectedRows[0].id)
        }
        const obj = {
          ...data[i],
          value: data[i].id,
          title: data[i].name,
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
      if (!this.templateId) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择模板'))
        return
      }
      window.$oAjax({
        url: window.$oApi.archiving.getFolderTemplate,
        params: {
          templateId: this.templateId,
        },
      }).then((res) => {
        if (res.code === 20000) {
          this.treeData = this.renderTreeNodes(res.data, true)
        }
        else {
          this.treeData = []
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
    handleCancel() {
      this.templateName = ''
      this.treeData = []
      this.selectedRows = []
      this.selectedRowKeys = []
    },
  },
}
</script>

<style scoped></style>
