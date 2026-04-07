<template>
  <div>
    <ht-modal
      v-model:open="visible"
      :title="isAdd ? '新增工程划分' : '编辑工程划分'"
      :confirm-loading="confirmLoading"
      width="760px"
      :mask-closable="false"
      @ok="handleSubmit"
      @cancel="handleCancel"
    >
      <a-form ref="formRef" :model="data">
        <a-form-item
          label="所属上级工程划分"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
          :rules="[{ required: true, message: '请选择所属上级工程划分！' }]"
          name="sid"
        >
          <a-tree-select
            v-model:value="data.sid"
            disabled
            placeholder="请选择所属上级工程划分"
            :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            :tree-data="treeData"
            :show-checked-strategy="SHOW_PARENT"
            :selected-keys="selectedKeys"
            :load-data="onLoadData"
            @select="onSelect"
          />
        </a-form-item>
        <a-form-item
          label="工程大类"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
          :rules="[{ required: true, message: '请选择工程大类！' }]"
          name="type"
        >
          <a-select
            v-model:value="data.type"
            placeholder="请选择工程大类"
            @select="(e) => handleChange(e)"
          >
            <a-select-option
              v-for="(item, index) in categoriesData"
              :key="index"
              :value="item.value"
            >
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          label="工程名称"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
          :rules="[{ required: true, message: '请输入工程名称！' }]"
          name="unitProjectName"
        >
          <a-input
            v-model:value="data.unitProjectName"
            placeholder="请输入工程名称"
          />
        </a-form-item>
        <a-form-item
          label="工程划分类别"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
        >
          <a-auto-complete
            v-model:value="data.unitProjectType"
            style="width: 100%"
            placeholder="请选择工程划分类别"
            @select="handleSearch"
            @change="handleSearch"
          >
            <template #dataSource>
              <template v-if="`${data.type}` === '1'">
                <a-select-option
                  v-for="(item, index) in unitData"
                  :key="index"
                  :value="item.typename"
                >
                  {{ item.typename }}
                </a-select-option>
              </template>
              <template v-else-if="`${data.type}` === '2'">
                <a-select-option
                  v-for="(item, index) in branchData"
                  :key="index"
                  :value="item.typename"
                >
                  {{ item.typename }}
                </a-select-option>
              </template>
              <template v-else-if="`${data.type}` === '3'">
                <a-select-option
                  v-for="(item, index) in subData"
                  :key="index"
                  :value="item.typename"
                >
                  {{ item.typename }}
                </a-select-option>
              </template>
            </template>
          </a-auto-complete>
        </a-form-item>
        <a-form-item
          label="工程编号"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
        >
          <a-input
            v-model:value="data.projectCode"
            placeholder="请输入工程编号"
          />
        </a-form-item>
        <a-form-item
          label="说明"
          :label-col="{ span: 5 }"
          :wrapper-col="{ span: 15 }"
        >
          <a-textarea
            v-model:value="data.description"
            placeholder="请输入说明"
            :rows="4"
          />
        </a-form-item>
      </a-form>
      <Contacts
        v-if="!isAdd"
        :other-module="true"
        :edit-c-bdata="editCBdata"
      />
    </ht-modal>
  </div>
</template>

<script>
import { TreeSelect } from 'ant-design-vue'
import { getQueryVariable } from '~/providers/common/utils'
import Contacts from '../../contacts/index.vue'

const SHOW_PARENT = TreeSelect.SHOW_PARENT

export default {
  components: {
    Contacts,
  },
  props: ['callback', 'isAdd'],
  data() {
    return {
      id: getQueryVariable('id'),

      visible: false,
      confirmLoading: false,
      unitData: [
        { name: '路基工程', value: '0001' },
        { name: '路面工程', value: '0002' },
        { name: '桥梁工程', value: '0003' },
        { name: '隧道工程', value: '0004' },
        { name: '绿化工程', value: '0005' },
        { name: '声屏障工程', value: '0006' },
        { name: '交通安全设施', value: '0007' },
        { name: '交通机电工程', value: '0008' },
        { name: '附属设施', value: '0009' },
        { name: '(JTG F80/1-2004)环保工程', value: '0010' },
        { name: '(JTG F80/1-2004)互通立交工程', value: '0011' },
        { name: '(特大斜拉桥、特大悬索桥)塔及辅助、过渡墩', value: '0012' },
        { name: '(特大斜拉桥、特大悬索桥)锚碇', value: '0013' },
        { name: '(特大斜拉桥、特大悬索桥)上部钢结构制作与防护', value: '0014' },
        { name: '(特大斜拉桥、特大悬索桥)上部结构浇筑与安装', value: '0015' },
        {
          name: '(特大斜拉桥、特大悬索桥)桥面系、附属工程及桥梁总体',
          value: '0016',
        },
        { name: '其它', value: '0000' },
      ],
      branchData: [],
      subData: [],
      categoriesData: [
        { name: '单位工程', value: '1' },
        { name: '分部工程', value: '2' },
        { name: '分项工程', value: '3' },
      ],
      treeData: [],
      selectedKeys: [],
      SHOW_PARENT,
      data: {
        sid: '',
        sType: '',
        parentName: '',
        unitProjectType: '',
        type: '',
        unitProjectName: '',
        projectCode: '',
        description: '',
      },
      editCBdata: {},
      selObj: {},
      parentName: '',
    }
  },
  watch: {
    checkedKeys() {},
  },
  created() {
    this.getTree()
    this.getCategory()
  },
  methods: {
    async getCategory() {
      const url = window.$oApi.common.getDictionary
      await window.$oAjax.post(`${url}&typegroupid=xmjcfxgc`).then((res) => {
        if (res.rows && Array.isArray(res.rows)) {
          this.subData = res.rows
        }
      })
      await window.$oAjax.post(`${url}&typegroupid=xmjcdwgc`).then((res) => {
        if (res.rows && Array.isArray(res.rows)) {
          this.unitData = res.rows
        }
      })
      await window.$oAjax.post(`${url}&typegroupid=xmjcfbgc`).then((res) => {
        if (res.rows && Array.isArray(res.rows)) {
          this.branchData = res.rows
        }
      })
    },
    showModal(data, obj) {
      this.editCBdata = data
      this.visible = true
      if (data) {
        window.$oRest({
          url: `${window.$oApi.testItem.unitProject}/${data.oid}`,
        }).then((res) => {
          if (res && res.data) {
            this.data = res.data
            this.data.type = `${res.data.type}`
            this.data.id = res.data.id
            this.data.sid = res.data.belongsId
            this.selectedKeys = [res.data.belongsId]
            this.selObj = {
              oid: res.data.belongsId ? res.data.belongsId : '',
              type: res.data.sType ? res.data.sType : '',
              name: res.data.parentName ? res.data.parentName : '',
            }
            this.parentName = res.data.parentName || ''
          }
        })
      }
      else {
        if (obj) {
          this.selObj = {
            oid: obj.oid ? obj.oid : '',
            type: obj.type ? obj.type : '',
            name: obj.name ? obj.name : '',
          }
        }
        else {
          // eslint-disable-next-line ts/no-unused-expressions
          this.treeData.length > 0 ? (this.selObj = this.treeData[0]) : ''
        }
        this.data = {
          sid: this.selObj.oid || '',
          sType: this.selObj.type || '',
          parentName: this.selObj.name || '',
          unitProjectType: '',
          type: '',
          unitProjectName: '',
          projectCode: '',
          description: '',
        }
        this.parentName = this.data.parentName || ''
      }
    },
    cancelModal() {
      this.visible = false
    },
    getTree() {
      window.$oRest
        .get(window.$oApi.testItem.getTree, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
          params: { id: this.id },
          dataType: 'JSON',
        })
        .then((res) => {
          if (res.code === 20000) {
            const data = res.data
            this.treeData = this.getTreeData(data)
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
        })
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
                treeNode.children = this.getTreeData(res.data)
                this.treeData = [...this.treeData]
              }
              else {
                window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
              }
            })
          resolve()
        }, 1000)
      })
    },
    getTreeData(data) {
      if (!Array.isArray(data)) {
        return
      }
      const arr = []
      for (let i = 0; i < data.length; i++) {
        let children = []
        if (data[i].children && data[i].children.length !== 0) {
          children = this.getTreeData(data[i].children)
        }
        const obj = {
          ...data[i],
          value: data[i].oid,
          title: data[i].name,
          key: data[i].oid,
          disabled: data.type === 'unit',
          children,
        }
        if (children.length === 0) {
          delete obj.children
        }
        arr.push(obj)
      }
      return arr
    },
    onSelect(selectedKeys, info) {
      this.selObj = info.dataRef
    },
    handleCancel() {
      this.visible = false
      this.confirmLoading = false
      this.data = {
        sid: '',
        sType: '',
        parentName: '',
        unitProjectType: '',
        type: '',
        unitProjectName: '',
        projectCode: '',
        description: '',
      }
    },
    handleSubmit() {
      this.$refs.formRef.validateFields().then(() => {
        this.confirmLoading = true
        const values = { ...this.data }
        const data = {
          ...values,
          unitProjectType: this.data.unitProjectType,
          sType: this.selObj.type,
          parentName: this.selObj.name,
          sid: this.selObj.oid,
        }
        let method = 'POST'

        if (!this.isAdd) {
          data.id = this.data.id
          data.belongsId = this.data.belongsId
          method = 'PUT'
        }

        window.$oRest({
          method,
          url: `${window.$oApi.testItem.unit}`,
          data,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'content-type': 'application/json',
          },
        }).then(
          (res) => {
            if (res && res.code) {
              window.$oAntdMessage.success(res.message)
              this.cancelModal()
              this.data = {
                sid: '',
                sType: '',
                parentName: '',
                unitProjectType: '',
                type: '',
                unitProjectName: '',
                projectCode: '',
                description: '',
              }
              this.callback()
            }
            else {
              window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            }
            this.confirmLoading = false
          },
        ).catch(() => {
          this.confirmLoading = false
        })
      })
    },
    handleChange(e) {
      this.data.type = e
    },
    handleSearch() {},
  },
}
</script>

<style></style>
