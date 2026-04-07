<template>
  <div class="contacts">
    <div class="contacts-search">
      <div v-if="otherModule">
        <a-button
          v-permission="'add:contact'"
          :disabled="isDetail"

          type="primary"
          style="margin-bottom: 5px"
          @click="
            () => {
              isAdd = true
              $refs.CreateContact.showModal()
            }
          "
        >
          新建
        </a-button>
      </div>
      <div v-else>
        <a-input
          v-model:value="searchText"
          placeholder="请输入联系人姓名"
          class="contacts-search-all"
        />
        <a-button @click="getData(true)">
          查询
        </a-button>
        <a-button
          :disabled="isDetail"
          type="primary"
          @click="
            () => {
              isAdd = true
              $refs.CreateContact.showModal()
            }
          "
        >
          新建
        </a-button>
      </div>
    </div>
    <a-table
      :scroll="otherModule ? { y: 100 } : {}"
      :columns="columns"
      :data-source="data"
      :loading="loading"
      bordered
      :row-class-name="rowClassName"
      :pagination="pagination"
      row-key="id"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'operation'">
          <a-space>
            <a-button
              v-permission="'edit:contact'"
              type="link"
              :disabled="isDetail"
              @click="edit(record)"
            >
              编辑
            </a-button>
            <a-button
              v-permission="'del:contact'"
              type="link"
              danger
              :disabled="isDetail"
              @click="deleteRow(record)"
            >
              删除
            </a-button>
          </a-space>
        </template>
      </template>
    </a-table>
    <CreateContact
      ref="CreateContact"
      :is-add="isAdd"
      :callback="otherModule ? getOtherData : getData"
      :other-module="otherModule"
      :edit-c-bdata="editCBdata"
    />
  </div>
</template>

<script>
import { message, Modal } from 'ant-design-vue'
import { getQueryVariable } from '~/providers/common/utils'
import CreateContact from './components/createContact.vue'

const columns = [
  {
    title: '姓名',
    dataIndex: 'name',
    width: '20%',
  },
  {
    title: '所属单位',
    dataIndex: 'belongUnit',
    width: '20%',
  },
  {
    title: '职位',
    dataIndex: 'position',
    width: '15%',
  },
  {
    title: '电话',
    dataIndex: 'phone',
    width: '15%',
  },
  {
    title: '邮箱',
    dataIndex: 'mail',
    width: '20%',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: '10%',
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  components: {
    CreateContact,
  },
  props: ['otherModule', 'editCBdata'],
  data() {
    return {
      id: getQueryVariable('id'),
      isDetail: getQueryVariable('status') === '1',
      data: [],
      columns,
      searchText: '',
      formLayout: 'horizontal',

      loading: false,
      page: 1,
      size: 10,
      isAdd: true,
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
      resCode: {
        20000: '请求成功',
        20010: '请求失败',
        21000: '新增成功',
        22000: '修改成功',
        23000: '删除成功',
      },
    }
  },
  watch: {
    editCBdata(newData, oldData) {
      if (
        this.otherModule
        && newData
        && JSON.stringify(newData) !== JSON.stringify(oldData)
      ) {
        this.getOtherData(newData)
      }
    },
  },
  created() {
    if (this.otherModule === true) {
      this.columns = [
        {
          title: '姓名',
          dataIndex: 'name',
          width: '20%',
        },
        {
          title: '职位',
          dataIndex: 'position',
          width: '15%',
        },
        {
          title: '电话',
          dataIndex: 'phone',
          width: '15%',
        },
        {
          title: '邮箱',
          dataIndex: 'mail',
          width: '20%',
        },
      ]

      this.getOtherData(this.editCBdata)
    }
    else {
      this.getData()
    }
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getData(flag) {
      if (flag) {
        this.page = 1
      }

      const { page, size, searchText } = this
      this.loading = true
      window.$oRest
        .get(`${window.$oApi.testItem.contactList}/${this.id}`, {
          params: {
            page,
            size,
            person: searchText,
          },
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          if (res && res.data) {
            this.data = res.data.rows
            this.pagination.total = res.data.count
            this.pagination.current = page
            this.pagination.pageSize = size
            this.loading = false
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
        })
    },
    // 获取合同段/单位工程下的联系人
    getOtherData(data) {
      this.loading = true
      let type = 'unit'
      if (`${data.type}` === '-1') {
        type = 'contract'
      }
      window.$oAjax({
        method: 'get',
        url: `${window.$oApi.testItem.getPersonInCU}/${type}/${data.key}`,
      }).then((res) => {
        if (res && res.data) {
          this.data = res.data
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.loading = false
      })
    },
    // 搜索
    search() {
      // eslint-disable-next-line unused-imports/no-unused-vars
      const data = this.searchText
    },
    // 编辑
    edit(data) {
      this.isAdd = false
      this.$refs.CreateContact.showModal(data)
    },
    // 删除
    deleteRow(data) {
      Modal.confirm({
        title: '删除',
        content: `确认删除 ${data.name} 吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: () => {
          window.$oRest
            .delete(`${window.$oApi.testItem.addContact}/${data.id}`)
            .then((res) => {
              if (res && res.code) {
                message.success(res.message)
                this.getData()
              }
              else {
                window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
              }
            })
        },
      })
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
