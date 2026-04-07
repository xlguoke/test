<template>
  <div>
    <div style="padding-bottom: 10px">
      <a-button
        v-if="!userId"
        type="primary"
        style="margin-right: 5px"
        @click="add"
      >
        新增
      </a-button>
      <a-button v-if="!userId" @click="deleteData">
        删除
      </a-button>
      <a-button v-if="userId" @click="updateData">
        保存
      </a-button>
    </div>
    <a-table
      :columns="columns"
      :row-selection="rowSelection"
      :data-source="data"
      bordered
      :pagination="false"
      :row-class-name="rowClassName"
      :loading="loading"
      row-key="id"
      :custom-row="customRow"
    >
      <template #bodyCell="{ column, record, text }">
        <template v-if="['name', 'code', 'description'].includes(column.dataIndex)">
          <div>
            <a-input
              v-if="record.editable"
              style="margin: -5px 0"
              :value="text"
              @change="(e) => handleChange(e.target.value, record.id, column.dataIndex)"
            />
            <template v-else>
              {{ text }}
            </template>
          </div>
        </template>
        <template v-if="column.dataIndex === 'effectiveRange'">
          <div>
            <a-select
              v-if="record.editable"
              style="width: 100%"
              :value="text"
              @change="
                (value) => handleChange(value, record.id, 'effectiveRange')
              "
            >
              <a-select-option
                v-for="item in effectiveRangeData"
                :key="item.value"
                :value="item.value"
              >
                {{ item.name }}
              </a-select-option>
            </a-select>
            <template v-else>
              {{
                text
                  ? effectiveRangeData.find((item) => item.value == text).name
                  : ''
              }}
            </template>
          </div>
        </template>
        <template v-if="column.dataIndex === 'effectiveDepartIds'">
          <div>
            <span v-if="record.editable">
              <span v-if="record.effectiveRange == '0'">全部</span>
              <span v-if="record.effectiveRange == '1'">权限人员所在部门</span>
              <a-tree-select
                v-if="record.effectiveRange == '2'"
                style="width: 100%"
                :value="transformDepartment(text)"
                :dropdown-style="{ maxHeight: '300px', overflow: 'auto' }"
                placeholder="请选择部门"
                allow-clear
                multiple
                :tree-data="departmentData"
                tree-default-expand-all
                show-search
                @change="
                  (value) => handleChange(value, record.id, 'effectiveDepartIds')
                "
              />
            </span>
            <template v-else>
              {{ getPartmentValue(record) }}
            </template>
          </div>
        </template>
        <template v-if="column.dataIndex === 'opeartion' && record.id !== '_add'">
          <a-button v-if="!record.editable" type="link" @click.stop="edit(record)">
            编辑
          </a-button>
          <div v-else>
            <a-button type="link" @click.stop="cancleEdit(record)">
              取消
            </a-button>
            <a-button type="link" @click.stop="save">
              保存
            </a-button>
          </div>
        </template>
      </template>
    </a-table>
    <div v-if="isAdd" style="padding-top: 10px">
      <a-button type="primary" style="margin-right: 5px" @click="save">
        保存
      </a-button>
      <a-button @click="cancel">
        取消
      </a-button>
    </div>
  </div>
</template>

<script>
import { cloneDeep } from '@unovis/ts'
import { getQueryVariable } from '~/providers/common/utils'
import { edit } from '../../api'

const columns = [
  {
    title: '权限名称',
    dataIndex: 'name',
    width: '18%',
  },
  {
    title: '编码',
    dataIndex: 'code',
    width: '18%',
  },
  {
    title: '权限说明',
    dataIndex: 'description',
    width: '18%',
  },
  {
    title: '生效范围',
    dataIndex: 'effectiveRange',
    width: '18%',
  },
  {
    title: '作用部门',
    dataIndex: 'effectiveDepartIds',
    width: '18%',
  },
  {
    title: '操作',
    dataIndex: 'opeartion',
    width: '20%',
  },
]
const departmentObj = {}

export default {
  data() {
    return {
      data: [],
      cacheData: [],
      columns,
      loading: false,
      isAdd: false,
      isEdit: false,
      recordCopy: {},
      selectedRowKeys: [],
      ids: [],
      effectiveRangeData: [
        { name: '全部', value: '0' },
        { name: '权限人员所在部门', value: '1' },
        { name: '指定部门', value: '2' },
      ],
      userId: getQueryVariable('userId'),
      customRow: (record) => {
        return {
          onClick: () => {
            const index = this.selectedRowKeys.indexOf(record.id)
            if (index >= 0) {
              this.selectedRowKeys.splice(index, 1)
            }
            else {
              this.selectedRowKeys.push(record.id)
            }
          },
        }
      },
      firstStatus: true,
      departmentData: [],
    }
  },
  computed: {
    rowSelection() {
      return {
        hideDefaultSelections: false,
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys) => {
          this.selectedRowKeys = selectedRowKeys
        },
      }
    },
  },
  created() {
    this.getLaboratoryData()
  },
  methods: {
    transformDepartment(text) {
      if (!text)
        return []

      // 如果是字符串：拆分成数组
      if (typeof text === 'string') {
        return text.split(',').filter(Boolean)
      }

      // 如果已经是数组：直接返回
      if (Array.isArray(text)) {
        return text
      }
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getLaboratoryData() {
      window.$oAjax.get(window.$oApi.common.getDepartmentTree).then((res) => {
        // this.departmentData = res.filter(item=>item['fieldMap.orgType']=='2')
        if (res && res.length > 0) {
          res.shift()
          this.departmentData = this.formatDepartmentData(res)
        }
        this.getData()
      })
    },
    formatDepartmentData(data) {
      if (!(data && Array.isArray(data))) {
        return []
      }
      const arr = []
      // eslint-disable-next-line array-callback-return
      data.map((item) => {
        let children = []
        if (item.children && item.children.length > 0) {
          children = this.formatDepartmentData(item.children)
        }
        departmentObj[item.id] = item.text
        arr.push({
          title: item.text,
          value: item.id,
          key: item.id,
          children,
        })
      })

      return arr
    },
    getData() {
      // eslint-disable-next-line unused-imports/no-unused-vars
      const { page, size, processObjectId } = this
      this.loading = true
      window.$oAjax
        .get(window.$oApi.auditAuthority.list, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          if (res.code && res.code !== 20010) {
            this.data = res.data || []
            this.selectedRowKeys = []
            this.cacheData = this.data.map(item => ({ ...item }))
            this.loading = false

            if (this.firstStatus && this.userId) {
              this.getUserInfo()
              this.firstStatus = false
            }
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.message || res.msg))
            this.loading = false
          }
        })
    },
    getPartmentValue(data) {
      if (data.effectiveRange == '0') {
        return '全部'
      }
      else if (data.effectiveRange == '1') {
        return '权限人员所在部门'
      }
      else {
        const value = data.effectiveDepartIds
        if (value) {
          return value
            .split(',')
            .map(item => departmentObj[item])
            .join(',')
        }
        else {
          return ''
        }
      }
    },
    // 新增
    add() {
      if (this.isAdd) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先完成当前新增!'))
        return
      }
      if (this.isEdit) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先完成当前编辑!'))
        return
      }

      this.isAdd = true
      this.data.push({
        id: '_add',
        editable: true,
        effectiveRange: '1',
      })
    },
    // 编辑
    edit(record) {
      if (this.isAdd) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先保存或取消当前新增'))
        return
      }
      this.isEdit = true
      record.editable = true
      // 标识被编辑的数据
      record.updated = '_edit'
      this.recordCopy = cloneDeep(record)
    },
    cancleEdit(record) {
      record = this.recordCopy
      const index = this.data.findIndex((item) => {
        return item.id === record.id
      })
      if (index !== -1) {
        this.data[index] = this.recordCopy
      }
      record.editable = false
      this.isEdit = false
    },
    // 删除
    deleteData() {
      if (this.isAdd) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先保存或取消当前新增'))
        return
      }
      if (this.selectedRowKeys.length == 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先选择要删除的数据'))
        return
      }

      window.$oAntdConfirm({
        title: '删除',
        content: `确认删除吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          Promise.all(
            this.selectedRowKeys.map(item => this.requestDelete(item)),
          ).then(() => {
            window.$oAntdMessage.success('操作成功')
            this.getData()
          })
        },
      })
    },
    requestDelete(id) {
      return new Promise((resolve, reject) => {
        window.$oAjax({
          method: 'DELETE',
          url: window.$oApi.auditAuthority.delete,
          params: { id },
        }).then((res) => {
          if (res.code && res.code !== 20010) {
            resolve()
          }
          else {
            // eslint-disable-next-line prefer-promise-reject-errors
            reject()
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
        })
      })
    },
    handleChange(value, id, column) {
      const newData = [...this.data]
      const target = newData.filter(item => id === item.id)[0]
      if (target) {
        target[column] = value
        this.data = newData
      }
    },
    save() {
      const params = this.data.find(item => (item.id == '_add') || (item.updated == '_edit'))
      // eslint-disable-next-line prefer-regex-literals
      const reg = new RegExp('^\\w+$', '')
      if (!reg.test(params.code)) {
        window.$oAntdModal.warning(
          window.$oMsgTips.info('编码必填且只能是字母，数字和下划线的组合'),
        )
        return
      }

      if (params.name === undefined || params.name === '') {
        window.$oAntdModal.warning(
          window.$oMsgTips.info('审核权限的名称不能为空!'),
        )
        return
      }
      if (params.code === undefined || params.code === '') {
        window.$oAntdModal.warning(window.$oMsgTips.info('审核权限的编码不能为空!'))
        return
      }

      if (params.effectiveRange == '2') {
        if (params.effectiveDepartIds) {
          if (params.effectiveDepartIds.length == 0) {
            window.$oAntdModal.warning(window.$oMsgTips.info('请选择作用的部门！'))
            return
          }
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info('请选择作用的部门！'))
          return
        }
      }

      if (params.effectiveDepartIds) {
        params.effectiveDepartIds = params.effectiveDepartIds.toString()
      }

      if (params.updated) {
        this.update(params)
        return
      }
      window.$oAjax({
        method: 'POST',
        url: window.$oApi.auditAuthority.add,
        params,
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res.code && res.code !== 20010) {
          window.$oAntdMessage.success('操作成功')
          this.getData()
          this.isAdd = false
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
    async update(params) {
      delete params.updated
      delete params.editable
      delete params.createDate
      delete params.updateDate
      await edit(params)
        .then(() => {
          window.$oAntdMessage.success('操作成功')
          this.isEdit = false
        })
        .catch(() => {
          params.updated = '_edit'
          params.editable = true
        })
      this.firstStatus = true
      this.getData()
      this.isAdd = false
    },
    updateData() {
      window.$oAjax({
        method: 'PUT',
        url: window.$oApi.auditAuthority.update,
        params: {
          userId: this.userId,
          authorityIds: this.selectedRowKeys.toString(),
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res.code && res.code !== 20010) {
          window.$oAntdMessage.success('操作成功')
          this.firstStatus = true
          this.getData()
          this.isAdd = false
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
    cancel() {
      this.data = this.data.filter(item => item.id !== '_add')
      this.isAdd = false
      this.selectedRowKeys = []
    },
    getUserInfo() {
      window.$oAjax({
        method: 'GET',
        url: window.$oApi.auditAuthority.getUserInfo,
        params: {
          userId: this.userId,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res.code && res.code !== 20010) {
          this.selectedRowKeys = res.data.map(item => item.id)
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
