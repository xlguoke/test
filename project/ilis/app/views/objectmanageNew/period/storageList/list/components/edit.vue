<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div>
    <ht-modal
      ref="UpdateSample"
      title="编辑入库信息"
      :open="visible"
      centered
      class="samplingManage-sample"
      :mask-closable="false"
      width="400px"
      :confirm-loading="loading"
      @cancel="handleCancel"
      @ok="handleOk"
    >
      <div class="spin-content">
        <a-form
          v-bind="layout"
          ref="ruleForm"
          :model="formData"
          :rules="rules"
          :hide-required-mark="false"
          style="width: 100%"
        >
          <a-form-item label="入库日期" required name="saveDate">
            <ADatePicker
              v-model:value="formData.saveDate"
              type="date"
              placeholder="请选择"
              style="width: 100%"
            />
          </a-form-item>
          <a-form-item label="存放位置" required name="site">
            <a-popover
              placement="bottom"
              trigger="click"
              title="位置选择"
            >
              <template #content>
                <p>
                  <span>位置分组：</span>
                  <a-form-item-rest>
                    <a-cascader
                      v-if="treeData"
                      v-model:value="selSiteGourpId"
                      style="width: 180px"
                      :options="treeData"
                      :field-names="fieldNames"
                      placeholder="请选择分组"
                      :allow-clear="false"
                      change-on-select
                      @change="onChangeSleGroup"
                    />
                  </a-form-item-rest>
                </p>
                <p style="margin-top: 10px">
                  <span>存放位置：</span>
                  <a-form-item-rest>
                    <a-select
                      v-model:value="selSiteId"
                      style="width: 180px"
                      placeholder="请先选择分组"
                      @change="handleChangeSelSite"
                    >
                      <a-select-option
                        v-for="item in siteList"
                        :key="item.id"
                        :value="item.id"
                      >
                        {{ item.sn }}
                      </a-select-option>
                    </a-select>
                  </a-form-item-rest>
                </p>
              </template>
              <a-auto-complete
                v-model:value="formData.site"
                placeholder="请选择或输入存放位置"
              />
            </a-popover>
          </a-form-item>
          <a-form-item label="入库人" required name="user">
            <a-input
              v-model:value="formData.user"
              placeholder="请输入"
              style="width: 100%"
            />
          </a-form-item>
        </a-form>
      </div>
    </ht-modal>
  </div>
</template>

<script>
/* eslint-disable eqeqeq */
import dayjs from 'dayjs'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

export default {
  emits: ['success-ok'],
  data() {
    return {
      selSiteId: '',
      selSiteGourpId: '',
      siteList: [],
      selSite: {},
      selGroupSite: [],
      fieldNames: { label: 'name', value: 'id', children: 'children' },
      treeData: [],
      dayjs,
      loading: false,
      visible: false,

      formData: {
        saveDate: dayjs(new Date()) || undefined, // 入库时间
        site: '',
        user: '',
      },
      layout: {
        labelCol: { span: 5 },
        wrapperCol: { span: 19 },
      },
      rules: {
        saveDate: [
          { required: true, message: '入库日期不能为空', trigger: 'change' },
        ],
        site: [{ required: true, message: '位置不能为空', trigger: 'change' }],
        user: [
          { required: true, message: '入库人不能为空', trigger: 'change' },
        ],
      },
      data: {}, // 编辑回显数据
    }
  },
  computed: {},
  created() {
    this.getTree()
  },
  methods: {
    handleChangeSelSite(v) {
      this.siteList.forEach((item) => {
        if (item.id == v) {
          this.selSite = item
        }
      })
      let str = ''
      this.selGroupSite.forEach((item) => {
        str += `${item.name}/`
      })
      this.formData.site = str + this.selSite.sn
      this.$refs.ruleForm.validate('site')
    },
    onChangeSleGroup(v, node) {
      this.selGroupSite = node
      window.$oAjax({
        method: 'get',
        url: `/rest/periodStorageSite/getAll`,
        params: {
          groupId: v[v.length - 1],
        },
      }).then((res) => {
        if (res.code == '20000') {
          this.siteList = res.data
          if (res.data.length > 0) {
            this.selSite = res.data[0]
            this.selSiteId = res.data[0].id
            let str = ''
            this.selGroupSite.forEach((item) => {
              str += `${item.name}/`
            })
            this.formData.site = str + this.selSite.sn
            this.$refs.ruleForm.validate('site')
          }
          else {
            this.selSite = {}
            this.selSiteId = ''
            this.formData.site = ''
          }
        }
        else {
          window.$oAntdMessage.error(res.message)
        }
      })
    },
    // 获取存放组
    getTree() {
      window.$oAjax
        .get(`/rest/periodStorageSiteGroup/tree`)
        .then((res) => {
          if (Number.parseInt(res.code) === 20000) {
            this.treeData = res.data
          }
          else {
            window.$oAntdMessage.error(res.message)
          }
        })
    },

    // 保存提交数据
    async handleOk() {
      let result = false
      await this.$refs.ruleForm.validateFields().then(() => {
        result = true
      })
      if (!result) {
        return
      }

      const obj = {
        site: this.formData.site, // p1
        user: this.formData.user, // p2
      }
      if (this.formData.saveDate) {
        obj.date = this.formData.saveDate.format('YYYY-MM-DD') // p3
      }

      let str = ''
      this.selGroupSite.forEach((item) => {
        str += `${item.name}/`
      })
      str = str + this.selSite.sn

      if (str == this.formData.site) {
        obj.siteId = this.selSite.id // 入库位置id p4
      }
      const periodStorageId = this.data.periodStorageId
      this.loading = true
      window.$oAjax({
        url: `${window.$oApi.storageList.editStorageIn}/${periodStorageId}/storage`,
        data: JSON.stringify(obj),
        method: 'put',
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
      }).then((res) => {
        if (res.code === 20000) {
          window.$oAntdMessage.success('操作成功')
          this.handleCancel()
          $emit(this, 'success-ok')
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      }).finally(() => {
        this.loading = false
      })
    },
    handleCancel() {
      this.formData.user = ''
      this.formData.site = ''
      this.formData.date = undefined
      this.selSiteId = ''
      this.selSiteGourpId = ''
      this.siteList = []
      this.selSite = {}
      this.selGroupSite = []
      this.visible = false
    },
    showModal(record) {
      this.data = record
      this.getEditData(record)
      this.visible = true
    },
    // 编辑回显
    getEditData(record) {
      this.formData.saveDate = dayjs(record.operationDate)
      this.formData.site = record.saveSite || ''
      this.formData.user = record.operator || ''

      // 根据saveSite解析出group路径和site名称
      if (record.saveSite && record.saveSiteId) {
        // 分割路径，最后一部分是site名称，前面的是group路径
        const pathParts = record.saveSite.split('/')
        const siteName = pathParts.pop() // 最后一个元素是site名称
        const groupPath = pathParts // 剩余的是group路径

        // 查找匹配的group节点
        this.findGroupAndSite(groupPath, siteName, record.saveSiteId)
      }
    },

    // 根据group路径和site名称查找对应的group和site
    findGroupAndSite(groupPath, siteName, siteId) {
      // 递归查找group节点
      const findGroupNode = (nodes, pathIndex) => {
        if (pathIndex >= groupPath.length)
          return null

        for (let i = 0; i < nodes.length; i++) {
          const node = nodes[i]
          if (node.name === groupPath[pathIndex]) {
            // 如果是路径中的最后一个group节点
            if (pathIndex === groupPath.length - 1) {
              return { node, path: groupPath.slice(0, pathIndex + 1) }
            }
            // 继续在子节点中查找
            if (node.children) {
              const result = findGroupNode(node.children, pathIndex + 1)
              if (result) {
                return result
              }
            }
          }
        }
        return null
      }

      // 查找group节点
      const groupResult = findGroupNode(this.treeData, 0)
      if (groupResult) {
        // 设置选中的group
        const groupIdPath = []
        let currentNode = this.treeData

        for (let i = 0; i < groupResult.path.length; i++) {
          for (let j = 0; j < currentNode.length; j++) {
            if (currentNode[j].name === groupResult.path[i]) {
              groupIdPath.push(currentNode[j].id)
              currentNode = currentNode[j].children || []
              break
            }
          }
        }

        this.selGroupSite = groupResult.path.map((name, index) => ({
          name,
          id: groupIdPath[index],
        }))
        this.selSiteGourpId = groupIdPath

        // 获取该group下的所有site
        window.$oAjax({
          method: 'get',
          url: `/rest/periodStorageSite/getAll`,
          params: {
            groupId: groupIdPath[groupIdPath.length - 1],
          },
        }).then((res) => {
          if (res.code == '20000') {
            this.siteList = res.data

            // 查找匹配的site
            const matchedSite = res.data.find(item => item.id === siteId)
            if (matchedSite) {
              this.selSite = matchedSite
              this.selSiteId = matchedSite.id
            }
          }
          else {
            window.$oAntdMessage.error(res.message)
          }
        })
      }
    },
  },
}
</script>

  <style lang="less">
  .container-search-all {
    width: 400px;
    margin-right: 5px;
    .ant-table-thead {
      .ant-checkbox {
        display: none;
      }
    }
  }
  .more-header {
    padding: 8px;
    border-bottom: 1px dashed;
    margin-bottom: 10px;
    color: var(--colorPrimary);
  }
  </style>
