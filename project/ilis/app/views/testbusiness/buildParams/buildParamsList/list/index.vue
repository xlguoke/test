<!-- eslint-disable vue/eqeqeq -->
<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div class="build-params-wrap">
    <a-form ref="formRef" layout="inline" :model="formState">
      <a-form-item label="检测大类" name="categoryName">
        <a-input
          v-model:value="formState.categoryName"
          style="width: 220px"
          allow-clear
          read-only
          placeholder="请选择大类"
          @click="openSearchModal"
        />
      </a-form-item>
      <a-form-item label="对预委托可见" name="exposed">
        <a-select
          v-model:value="formState.exposed"
          placeholder="请选择"
          style="width: 200px"
          allow-clear
        >
          <a-select-option value="1">
            是
          </a-select-option>
          <a-select-option value="0">
            否
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="参数打包名称" name="name">
        <a-input
          v-model:value="formState.name"
          style="width: 220px"
          placeholder="请输入参数打包名称"
          allow-clear
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="search">
          查询
        </a-button>
      </a-form-item>
      <a-form-item>
        <a-button @click="reset">
          重置
        </a-button>
      </a-form-item>
    </a-form>
    <div style="padding: 10px 0">
      <a-button type="primary" @click="showEditModal">
        新增
      </a-button>
      <a-button @click="deleteByIds">
        批量删除
      </a-button>
    </div>
    <a-table
      :row-selection="rowSelection"
      :scroll="scroll"
      :columns="columns"
      :data-source="dataSource"
      :pagination="pagination"
      :loading="loading"
      bordered
    >
      <template #headerCell="{ column }">
        <template v-if="column.dataIndex === 'name'">
          <div class="sort-column">
            参数打包名称
            <p class="sort-icon" @click="changeSort">
              <CaretUpOutlined
                :class="`${sortType == 'desc' ? 'text-blue-500' : ''}`"
              />
              <CaretDownOutlined
                :class="`${sortType == 'asc' ? 'text-blue-500' : ''}`"
              />
            </p>
          </div>
        </template>
      </template>

      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'exposed'">
          <a-switch
            v-model:checked="record.exposed"
            checked-children="是"
            un-checked-children="否"
            @change="changeExposed(record)"
          />
        </template>
        <template v-if="column.dataIndex === 'handle'">
          <div class="table-handle">
            <a
              href="#"
              title="详情"
              @click="showParams(record)"
            >
              详情
            </a>
            <a
              href="#"
              title="编辑"
              @click="editParams(record)"
            >
              编辑
            </a>
            <a
              href="#"
              title="删除"
              @click="deleteById(record)"
            >
              删除
            </a>
          </div>
        </template>
      </template>
    </a-table>

    <ht-modal
      v-model:open="visibleDetail"
      :title="`${showPage ? '打包项详情' : '编辑打包项'}`"
      :dialog-style="{ top: '50px' }"
      width="80%"
      fixed-height
      :confirm-loading="submitLoading"
      @ok="saveEdit"
    >
      <BuildParamsEdit
        ref="paramsEdit"
        :key="refresh"
        :show-page="showPage"
        :edit-id="editId"
        @close-edit="closeEdit"
      />
    </ht-modal>

    <TestType
      ref="testType"
      :category-id="categoryId"
      @get-test-type="getTestType"
    />
  </div>
</template>

<script>
/* eslint-disable eqeqeq */
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons-vue'
import { getQueryVariable } from '~/providers/common/utils'
import { rootUrl } from '~/providers/configs/rootUrl'
import BuildParamsEdit from '~/views/testbusiness/buildParams/buildParamsEdit/views/index.vue'
import TestType from './components/TestType.vue'

export default {
  components: {
    BuildParamsEdit,
    TestType,
    CaretDownOutlined,
    CaretUpOutlined,
  },
  data() {
    return {
      submitLoading: false,
      visibleDetail: false,
      refresh: '',
      columns: [
        { dataIndex: 'name', key: 'name' },
        {
          title: '检测大类',
          dataIndex: 'categoryConcatName',
          key: 'categoryConcatName',
        },
        { title: '检测参数', dataIndex: 'paramNames', key: 'paramNames' },
        {
          title: '对预委托可见',
          dataIndex: 'exposed',
          key: 'exposed',
        },
        {
          title: '操作',
          dataIndex: 'handle',
          key: 'handle',
          width: 120,
        },
      ],
      scroll: { y: document.body.clientHeight - 220 },
      pagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.page = page
          this.getDataSource()
        },
        onShowSizeChange: (page, size) => {
          this.page = 1
          this.size = size
          this.getDataSource()
        },
      },
      rowSelection: {
        onChange: (selectedRowKeys) => {
          this.selectedRowKeys = selectedRowKeys
        },
      },
      rootUrl,
      editId: '',
      showPage: false,
      loading: true,
      formState: {},
      query: {},
      categoryId: '',
      dataSource: [],
      selectedRowKeys: [],
      page: 1,
      size: 10,
      saveTimer: null,
      sampleTree: [],
      sortType: '', // asc / desc
      sortLoad: false,
    }
  },
  mounted() {
    const bigCategoryId = getQueryVariable('categoryId')
    if (bigCategoryId) {
      this.categoryId = bigCategoryId
      this.getBigCategoryTree(bigCategoryId)
    }
    this.getDataSource()
  },
  methods: {
    // 收样信息页面跳转，获取大类名称
    getBigCategoryTree(bigCategoryId) {
      window.$oAjax
        .get('bigCategoryController.do?comboTreeSyncByName&name=', {
          params: {
            page: 1,
            size: 9999,
            queryParam: '',
            queryType: 'sample',
          },
        })
        .then((res) => {
          const tree = res && res.length > 0 ? res : []
          const path = ''
          let pathStr = ''
          ;(function findById(tree, id, path) {
            for (let i = 0; i < tree.length; i++) {
              let tempPath = path
              tempPath = tempPath ? `${tempPath}-${tree[i].text}` : tree[i].text
              if (tree[i].id == id) {
                pathStr = tempPath
                return tempPath
              }
              else {
                if (!tree[i].children || tree[i].children.length == 0)
                  continue
                const result = findById(tree[i].children, id, tempPath)
                if (result)
                  return result
              }
            }
          })(tree, bigCategoryId, path)

          this.formState.categoryName = pathStr
        })
    },
    // 排序
    changeSort() {
      if (this.sortLoad)
        return
      this.sortLoad = true
      this.sortType = this.sortType == 'asc' ? 'desc' : 'asc'
      this.getDataSource()
      return false
    },
    // 查询列表数据
    getDataSource(load) {
      load && (this.page = 1)
      if (this.dataSource.length === 0 && this.page > 1) {
        this.page = 1
      }
      const { page, size, query, categoryId } = this
      const search = { ...query }
      search.exposed
        = query.exposed == undefined ? '' : query.exposed == '1'
      this.loading = true
      window.$oAjax
        .get(window.$oApi.buildParams.list, {
          params: {
            page,
            size,
            pagination: true,
            categoryId,
            sort: 'name',
            order: this.sortType,
            ...search,
          },
        })
        .then((res) => {
          const list = res.data.rows || []

          list.length > 0
          && list.forEach((d) => {
            d.key = d.id
          })
          this.dataSource = list
          this.pagination.total = res.data.count
          this.pagination.current = page
          this.pagination.pageSize = size
          this.selectedRowKeys = []
          this.loading = false
          this.sortLoad = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    // 查询
    search(e) {
      e.preventDefault()
      this.query = { ...this.formState }
      this.getDataSource(true)
    },
    // 重置查询表单
    reset() {
      this.formState = {}
      this.query = {}
      this.categoryId = ''
      this.getDataSource(true)
    },
    openSearchModal() {
      this.$refs.testType.showModal()
    },
    // 搜索选择大类
    getTestType(info) {
      this.categoryId = info.id
      this.formState.categoryName = info.name
    },
    closeEdit() {
      this.visibleDetail = false
    },
    saveEdit() {
      if (this.showPage) {
        return (this.visibleDetail = false)
      }

      this.submitLoading = true
      this.$refs.paramsEdit.save(() => {
        this.submitLoading = false
        this.getDataSource()
        this.visibleDetail = false
      }, () => {
        this.submitLoading = false
      })
    },
    showEditModal(clear = true, closeShow = true) {
      if (clear) {
        this.editId = ''
      }
      if (closeShow) {
        this.showPage = false
      }
      this.refresh = new Date().getTime()
      this.visibleDetail = true
    },
    // 切换预委托
    changeExposed(row) {
      window.$oAjax.put(
        `${window.$oApi.buildParams.editById}/${row.id}/exposes`,
        {},
        true,
        true,
      ).catch(() => {
        row.exposed = false
      })
    },
    // 详情
    showParams(rows) {
      this.editId = rows.id
      this.showPage = true
      this.showEditModal(false, false)
    },
    // 编辑
    editParams(rows) {
      this.editId = rows.id
      this.showEditModal(false)
    },
    // 批量删除
    deleteByIds() {
      const ids = this.selectedRowKeys
      if (ids.length === 0) {
        return window.$oAntdMessage.warning('请选择需要删除的数据')
      }
      // eslint-disable-next-line ts/no-this-alias
      const that = this
      window.$oAntdConfirm({
        title: '提示',
        content: '确认删除选中的数据？',
        onOk() {
          ids.forEach((d) => {
            window.$oAjax
              .delete(`${window.$oApi.buildParams.editById}/${d}`)
              .then(() => {
                that.getDataSource()
              })
          })
        },
      })
    },
    // 删除
    deleteById(row) {
      // eslint-disable-next-line ts/no-this-alias
      const that = this
      window.$oAntdConfirm({
        title: '提示',
        content: '确认删除这条数据？',
        onOk() {
          window.$oAjax
            .delete(`${window.$oApi.buildParams.editById}/${row.id}`)
            .then(() => {
              that.getDataSource()
            })
        },
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
