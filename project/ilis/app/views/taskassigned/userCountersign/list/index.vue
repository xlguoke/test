<template>
  <div class="approverCountersignConfig">
    <a-row :gutter="15" type="flex">
      <a-col style="width: 240px">
        <div class="hitek-form-layout">
          <div class="hitek-form-layout-label">
            用户账号
          </div>
          <div class="hitek-form-layout-con">
            <a-input
              v-model:value="query.username"
              style="width: 100%"
              placeholder="请输入用户账号"
              @press-enter="onSearch"
            ></a-input>
          </div>
        </div>
      </a-col>
      <a-col style="width: 240px">
        <div class="hitek-form-layout">
          <div class="hitek-form-layout-label">
            用户名称
          </div>
          <div class="hitek-form-layout-con">
            <a-input
              v-model:value="query.realName"
              style="width: 100%"
              placeholder="请输入用户名称"
              @press-enter="onSearch"
            ></a-input>
          </div>
        </div>
      </a-col>
      <a-col style="width: 240px">
        <div class="hitek-form-layout">
          <div class="hitek-form-layout-label">
            部门
          </div>
          <div class="hitek-form-layout-con">
            <a-tree-select
              v-model:value="query.departId"
              style="width: 100%"
              :dropdown-style="{ maxHeight: '300px', overflow: 'auto' }"
              placeholder="请选择部门"
              allow-clear
              :tree-data="departmentData"
              tree-default-expand-all
              show-search
            />
          </div>
        </div>
      </a-col>
      <a-col>
        <a-button @click="onSearch">
          查询
        </a-button>
        <a-button class="toolBtn-bar" @click="reset">
          重置
        </a-button>
      </a-col>
    </a-row>
    <div
      style="
        padding: 15px 0;
        margin-top: 15px;
        border-top: solid 1px var(--colorSplit);
        position: relative;
      "
    >
      <div class="approverCountersignConfig-tip">
        <p>注：</p>
        <p>
          需在系统控制参数中，启用控制参数报告批准采用会签模式，本功能方可有效；
        </p>
        <p>
          所配置的批准人员需在角色管理中授权报告批准功能权限，否则会导致指定人员后无法批准。
        </p>
      </div>
      <a-button type="primary" @click="add">
        引用人员
      </a-button>
      <a-button class="toolBtn-bar" @click="deleteRows">
        删除
      </a-button>
    </div>
    <a-table
      :columns="columns"
      :row-selection="rowSelection"
      :custom-row="customRow"
      :data-source="data"
      :pagination="pagination"
      :row-class-name="rowClassName"
      bordered
      :scroll="{ y: height }"
      :loading="loading"
      row-key="id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'mark'">
          <a-input v-model:value="record.mark" @change="onMarkChange(record)" />
        </template>
      </template>
    </a-table>
    <SelectSystemUser v-model:value="visible" @on-change="getSelectUser" />
  </div>
</template>

<script>
import qs from 'qs'
import getDepartmentData from '~/providers/api/getDepartment'
import SelectSystemUser from '~/providers/components/selectSystemUser.vue'
import { addUser, delUser, getUserList, updateMark } from '../api'

const columns = [
  {
    title: '用户账号',
    dataIndex: 'userName',
    width: '20%',
  },
  {
    title: '用户名称',
    dataIndex: 'realName',
    width: '20%',
  },
  {
    title: '部门',
    dataIndex: 'departs',
    width: '20%',
  },
  {
    title: '角色',
    dataIndex: 'roles',
    width: '20%',
  },
  {
    title: '备注',
    dataIndex: 'mark',
    width: '20%',
    scopedSlots: { customRender: 'mark' },
  },
]

export default {
  components: {
    SelectSystemUser,
  },
  data() {
    return {
      data: [],
      columns,
      visible: false,
      loading: false,
      query: {},
      page: 1,
      size: 10,
      height: document.body.clientHeight - 250,
      selectedRowKeys: [],
      selectedRows: [],
      departmentData: [],
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.page = page
          this.getData()
        },
        onShowSizeChange: (page, size) => {
          this.page = 1
          this.size = size
          this.getData()
        },
      },
      customRow: (record) => {
        return {
          onClick: () => {
            if (this.selectedRowKeys.includes(record.id)) {
              this.selectedRowKeys = this.selectedRowKeys.filter(
                item => item !== record.id,
              )
              this.selectedRows = this.selectedRows.filter(
                item => item.id !== record.id,
              )
            }
            else {
              this.selectedRowKeys.push(record.id)
              this.selectedRows.push(record)
            }
          },
        }
      },
    }
  },
  computed: {
    rowSelection() {
      return {
        type: 'checkbox',
        hideDefaultSelections: false,
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys, selectedRows) => {
          this.selectedRowKeys = selectedRowKeys
          this.selectedRows = selectedRows
        },
      }
    },
  },
  async created() {
    this.getData()

    // 获取部门下拉数据
    this.departmentData = await getDepartmentData()
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    // 重置查询
    reset() {
      this.query = {}
      this.onSearch()
    },
    // 获取数据
    async getData() {
      const { query, page, size } = this

      this.loading = true
      try {
        const res = await getUserList(
          qs.stringify({
            ...query,
            page,
            size,
          }),
        )

        if (res.code && res.code === 20000) {
          this.data = res.data.rows
          this.pagination.total = res.data.count
          this.pagination.current = page
          this.pagination.pageSize = size
          this.selectedRowKeys = []
          this.selectedRows = []
        }
      }
      catch (e) {
        // eslint-disable-next-line no-console
        console.log(e)
        window.$oAntdModal.warning(window.$oMsgTips.info('数据请求异常，请稍后再试'))
      }
      this.loading = false
    },
    // 查询
    onSearch() {
      this.page = 1
      this.getData()
    },
    // 新增弹窗
    add() {
      this.visible = true
    },
    // 获取选择的人员
    async getSelectUser(rowKeys) {
      const formData = new FormData()
      formData.append('userIds', rowKeys.join(','))
      const res = await addUser(formData)

      try {
        if (res.code !== 20010) {
          window.$oAntdMessage.success('引用成功！')
          this.getData()
        }
        else {
          window.$oAntdModal.warning(
            window.$oMsgTips.info(
              res.msg || res.message || '数据处理异常，请稍后再试',
            ),
          )
        }
      }
      catch (e) {
        // eslint-disable-next-line no-console
        console.log(e)
        window.$oAntdModal.warning(window.$oMsgTips.info('数据处理异常，请稍后再试'))
      }
    },
    // 删除
    deleteRows() {
      if (this.selectedRowKeys.length == 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请选择要删除的数据'))
        return
      }

      const names = this.selectedRows.map(item => item.realName)

      window.$oAntdConfirm({
        title: '删除',
        content: `确认删除勾选的人员${names.join('，')}吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: async () => {
          try {
            const res = await delUser(this.selectedRowKeys.join(','))
            if (res.code !== 20010) {
              this.getData()
              window.$oAntdMessage.success('删除成功！')
            }
            else {
              window.$oAntdModal.warning(
                window.$oMsgTips.info(
                  res.msg || res.message || '数据处理异常，请稍后再试',
                ),
              )
            }
          }
          catch (e) {
            // eslint-disable-next-line no-console
            console.log(e)
            window.$oAntdModal.warning(window.$oMsgTips.info('数据处理异常，请稍后再试'))
          }
        },
      })
    },
    // 编辑备注
    onMarkChange(record) {
      if (record.timer) {
        clearTimeout(record.timer)
        record.timer = null
      }
      record.timer = setTimeout(() => {
        const formData = new FormData()
        formData.append('id', record.id)
        formData.append('mark', record.mark)
        updateMark(formData)
      }, 1 * 1000)
    },
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
