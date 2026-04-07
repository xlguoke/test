<template>
  <div>
    <ht-modal
      v-model:open="visible"
      :title="isAdd ? '新建联系人' : '编辑联系人'"
      :confirm-loading="confirmLoading"
      :mask-closable="false"
      class="createContact-modal"
      @ok="handleSubmit"
      @cancel="cancelModal"
    >
      <a-form ref="formRef" :model="data">
        <a-form-item
          label="姓名"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
          :rules="[{ required: true, message: '请输入姓名！' }]"
          name="name"
        >
          <a-input
            v-model:value="data.name"
            placeholder="请输入姓名"
          />
        </a-form-item>
        <a-form-item
          label="职位"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
        >
          <a-input
            v-model:value="data.position"
            placeholder="请输入职位"
          />
        </a-form-item>
        <a-form-item
          label="电话"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
          :rules="[{ required: true, message: '请输入电话！' }]"
          name="phone"
        >
          <a-input
            v-model:value="data.phone"
            placeholder="请输入电话"
          />
        </a-form-item>
        <a-form-item
          label="邮箱"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
          name="mail"
        >
          <a-input
            v-model:value="data.mail"
            placeholder="请输入邮箱"
          />
        </a-form-item>
        <a-form-item
          label="所属单位"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
          :rules="[{ required: true, message: '请选择所属单位！' }]"
          name="belongUnit"
        >
          <a-tree-select
            v-model:value="data.belongUnit"
            :disabled="otherModule"
            placeholder="请选择所属单位"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            :tree-data="treeData"
            :load-data="onLoadData"
            @select="selectEvent"
          />
        </a-form-item>
      </a-form>
    </ht-modal>
  </div>
</template>

<script>
import { message } from 'ant-design-vue'
import { getQueryVariable } from '~/providers/common/utils'
import { insertTreeNode } from '~/providers/transformUtils/utils'

let treeDataKeyId = {}
let treeDataKeyName = {}
let treeTypeData = {}

export default {
  props: ['isAdd', 'callback', 'otherModule', 'editCBdata'],
  data() {
    return {
      selUnit: {},

      expandedKeys: [],
      autoExpandParent: true,
      checkedKeys: [],
      selectedKeys: [],
      visible: false,
      confirmLoading: false,
      data: {
        name: '',
        position: '',
        phone: '',
        mail: '',
        belongUnit: [],
        contractPartId: null,
        unitProjectId: null,
      },
      treeData: [],
      id: getQueryVariable('id') || '',
      belongUnitName: '',
    }
  },
  watch: {
    checkedKeys() {},
  },
  created() {},
  methods: {
    selectEvent(v, node) {
      this.selUnit = node
    },
    getTreeData(param) {
      window.$oRest({
        method: 'GET',
        url: window.$oApi.testItem.getTree,
        params: param,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res.code === 20000) {
          this.treeData = this.getTreeDataFormat(res.data)
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
    getTreeDataFormat(data) {
      if (!Array.isArray(data)) {
        return
      }
      const arr = []
      for (let i = 0; i < data.length; i++) {
        let children = []
        const item = data[i]
        if (data[i].children && data[i].children.length != 0) {
          children = this.getTreeDataFormat(data[i].children)
        }
        treeDataKeyId = {
          ...treeDataKeyId,
          [item.oid]: item.name,
        }

        treeDataKeyName = {
          ...treeDataKeyName,
          [item.name]: item.id,
        }

        treeTypeData = {
          ...treeTypeData,
          [item.oid]: {
            type: item.type,
            name: item.name,
          },
        }
        const obj = {
          ...data[i],
          value: data[i].oid,
          title: data[i].name,
          key: data[i].oid,
          isLeaf: false,
          children,
        }
        if (children.length === 0) {
          delete obj.children
        }
        arr.push(obj)
      }
      return arr
    },
    onLoadData(treeNode) {
      return new Promise((resolve) => {
        if (treeNode.children) {
          resolve()
          return
        }
        setTimeout(() => {
          const data = {
            id:
              treeNode.type > 0
                ? treeNode.sid
                : treeNode.id,
            type: treeNode.type,
            levelCode: treeNode.levelCode || '',
          }
          // 树获取三个参数
          window.$oRest
            .get(window.$oApi.testItem.getTree, {
              headers: {
                'X-Requested-With': 'XMLHttpRequest',
              },
              params: data,
              dataType: 'JSON',
            })
            .then((res) => {
              if (res.code === 20000) {
                // treeNode.children = this.getTreeDataFormat(res.data)
                // this.treeData = [...this.treeData]
                insertTreeNode(this.treeData, treeNode.id, res.data)
                this.treeData = this.getTreeDataFormat(this.treeData)
              }
              else {
                window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
              }
            })

          resolve()
        }, 1000)
      })
    },
    getTreeDataFormat2(data, flag) {
      let obj = {}
      const children = []

      // eslint-disable-next-line no-prototype-builtins
      if (data.hasOwnProperty('children')) {
        for (let i = 0; i < data.children.length; i++) {
          children.push(this.getTreeDataFormat2(data.children[i], flag))
        }
      }

      obj = {
        ...data,
        key: data.id,
        title: data.name,
        value: data.id,
        children,
      }

      treeDataKeyId = {
        ...treeDataKeyId,
        [data.id]: data.name,
      }

      treeDataKeyName = {
        ...treeDataKeyName,
        [data.name]: data.id,
      }

      treeTypeData = {
        ...treeTypeData,
        [data.id]: {
          type: data.type,
          name: data.name,
        },
      }

      // if(obj.type == null){
      //   obj.disabled = true
      // }

      return obj
    },
    showModal(data) {
      this.treeData = []
      this.expandedKeys = []
      if (data) {
        this.selUnit = {
          name: data.belongUnit,
          id: data.contractPartId || data.unitProjectId,
          type: data.contractPartId ? -1 : '',
        }
        this.data = {
          ...data,
          // belongUnit: data.contractPartId || data.unitProjectId || data.projectId || undefined
        }
        // this.belongUnitName = data.belongUnit;
      }
      else {
        this.data = {
          name: '',
          position: '',
          phone: '',
          mail: '',
          belongUnit: '',
          contractPartId: null,
          unitProjectId: null,
        }
      }
      if (this.otherModule) {
        this.belongUnitName = this.editCBdata.name
      }
      let param = { id: this.id }
      if (this.editCBdata) {
        let id = this.id
        let type = null
        let levelCode = null
        if (this.editCBdata.type > 0) {
          id = this.editCBdata.sid
          type = this.editCBdata.type
          if (
            this.editCBdata.levelCode
            && this.editCBdata.levelCode.length >= 4
          ) {
            levelCode = this.editCBdata.levelCode.substring(
              0,
              this.editCBdata.levelCode.length - 4,
            )
          }
        }
        param = { id, type, levelCode }
      }
      this.getTreeData(param)

      this.visible = true
    },
    cancelModal() {
      this.data = {
        name: '',
        position: '',
        phone: '',
        mail: '',
        belongUnit: '',
        contractPartId: null,
        unitProjectId: null,
      }
      this.belongUnitName = ''
      this.visible = false
    },
    handleSubmit() {
      this.$refs.formRef.validateFields().then(() => {
        const data = { ...this.data }
        let method = 'POST'
        // let type = '';
        // /**
        //  * 合同段
        //  */
        // type= -1;
        // /**
        //  * 工程项目
        //  */
        // type = -2;
        // /**
        //  * 单位工程
        //  */
        // type = 1;
        // /**
        //  * 分部工程
        //  */
        // type = 2;
        // /**
        //  * 分项工程
        //  */
        // type = 3;
        if (this.selUnit.type == '-2') {
          window.$oAntdModal.warning(
            window.$oMsgTips.info('所属单位不能选择工程项目，请选择其子级'),
          )
          return
        }
        if (this.selUnit.type == -1) {
          data.contractPartId = this.selUnit.id
        }
        else {
          data.unitProjectId = this.selUnit.id
        }
        if (this.isAdd === false) {
          data.id = this.data.id
          method = 'PUT'
        }

        data.projectId = this.id
        this.confirmLoading = true
        data.belongUnit = this.selUnit.name

        window.$oRest({
          method,
          url: window.$oApi.testItem.addContact,
          data,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'content-type': 'application/json',
          },
        }).then(
          (res) => {
            if (res && res.code) {
              this.treeData = []
              message.success(res.message)
              if (this.otherModule) {
                this.callback(this.editCBdata)
              }
              else {
                this.callback()
              }
              this.cancelModal()
            }
            else {
              window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            }
            this.confirmLoading = false
          },
          () => {
            this.confirmLoading = false
          },
        )
      })
    },
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys
      this.autoExpandParent = false
    },
    onCheck(checkedKeys) {
      this.checkedKeys = checkedKeys
    },
    onSelect(selectedKeys, info) {
      this.selectedKeys = selectedKeys
      this.data.belongUnit = info.node.title
    },
    onChange(id, value, record) {
      const { type } = record.triggerNode.dataRef
      if (type == 'contract') {
        this.data.contractPartId = id
        this.data.unitProjectId = null
        this.data.id = id
      }
      else if (type == 'unit') {
        this.data.unitProjectId = id
        this.data.contractPartId = null
        this.data.id = id
      }
    },
  },
}
</script>

<style lang="less">
.createContact-modal {
  .ant-tree > li:last-child {
    padding-top: 2px;
  }
}
</style>
