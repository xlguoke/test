<template>
  <div>
    <div class="">
      <a-spin class="" :spinning="false">
        <a-layout class="">
          <a-layout :style="{ background: 'var(--colorBgLayout)' }">
            <a-layout-sider class="layout-sider" :style="{ background: 'var(--colorBgContainer)' }">
              <div class="category-title">
                <a-row>
                  <a-col :span="24">
                    <a-select
                      v-model:value="_selectedCategory"
                      style="width: 180px"
                      disabled=""
                      @change="categoryChange"
                    >
                      <a-select-option
                        v-for="item in category"
                        :key="item.id"
                        :value="item.id"
                      >
                        {{ item.name }}
                      </a-select-option>
                    </a-select>
                  </a-col>
                </a-row>
              </div>
              <a-tree
                :show-line="true"
                :default-expand-all="true"
                :tree-data="keyPointCategoryTree"
                :replace-fields="replaceFields"
                @select="treeSelect"
              >
              </a-tree>
            </a-layout-sider>

            <a-layout class="layout">
              <a-layout-content class="layout-content">
                <a-row>
                  <a-col :span="4">
                    <a-input
                      v-model:value="searchValue"
                      placeholder="输入检查要点/常见问题后回车即可查询"
                      @keyup.enter="keyPointSearch"
                    />
                  </a-col>
                  <a-col :span="4">
                    <a-button
                      type="primary"

                      @click="keyPointSearch"
                    >
                      查询
                    </a-button>
                  </a-col>
                </a-row>
                <br />
                <a-row>
                  <a-col :span="24">
                    <a-button
                      type="primary"

                      @click="editKeyPoint"
                    >
                      添加
                    </a-button>
                  </a-col>
                </a-row>
                <br />
                <a-row>
                  <a-col :span="24">
                    <a-table
                      :data-source="keyPointData"
                      :columns="keyPointColumns"
                      :pagination="keyPointPagination"
                      :row-selection="{
                        selectedRowKeys: keyPointSelectedRowKeys,
                        onChange: keyPointOnSelectChange,
                      }"
                      :scroll="{ y: 320 }"
                      row-key="id"
                    >
                      <template #bodyCell="{ column, record, text }">
                        <template v-if="column.dataIndex === 'problemPreview'">
                          <a @click="problemPreview(record)">{{ problemFilter_filter(text) }}</a>
                        </template>
                      </template>
                    </a-table>
                  </a-col>
                </a-row>
              </a-layout-content>
            </a-layout>
          </a-layout>
        </a-layout>
      </a-spin>
    </div>
    <div class="local-modal">
      <ht-modal width="40%" :open="problemPreviewVisible">
        <ProblemPreview :data="problemPreviewData" />
        <template #footer>
          <div class="modal-footer">
            <a-button type="primary" @click="problemPreviewOk">
              确定
            </a-button>
          </div>
        </template>
      </ht-modal>
      <ht-modal
        width="50%"
        :open="editKeyPointVisible"
        title="编辑检查要点"
        :closable="false"
        :mask-closable="false"
        :destroy-on-close="true"
        @ok="editKeyPointOk"
        @cancel="editKeyPointCancel"
      >
        <EditKeyPoint
          ref="editKeyPoint"
          :data="editKeyPointData"
          :category-data="keyPointCategoryTree"
          @cancel="editKeyPointCancel"
        />
      </ht-modal>
    </div>
  </div>
</template>

<script>
import requestApi from '../../request'
import EditKeyPoint from './EditKeyPoint.vue'
import ProblemPreview from './ProblemPreview.vue'

export default {
  name: 'List',
  components: {
    ProblemPreview,
    EditKeyPoint,
  },
  props: {
    selectedCategory: {
      required: true,
    },
  },
  data() {
    return {
      problemPreviewVisible: false,
      editKeyPointVisible: false,
      editCategoryVisible: false,
      selectedKeyPointCategory: null,
      category: [],
      keyPointCategoryTree: [],
      searchValue: '',
      replaceFields: {
        children: 'children',
        title: 'name',
        key: 'id',
      },
      keyPointImportUrl: ``,
      keyPointData: [],
      keyPointColumns: [
        {
          title: '排序',
          dataIndex: 'orderNumber',
        },
        {
          title: '所属分类',
          dataIndex: 'category',
        },
        {
          title: '检查要点',
          dataIndex: 'keypoint',
        },
        {
          title: '要点说明',
          dataIndex: 'description',
        },
        {
          title: '常见问题',
          dataIndex: 'problemPreview',
          ellipsis: true,
        },
      ],
      keyPointDataPage: 1,
      keyPointDataSize: 10,
      keyPointPagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.keyPointDataPage = page
          this.initKeyPoint()
        },
        onShowSizeChange: (page, size) => {
          this.keyPointDataPage = 1
          this.keyPointDataSize = size
          this.initKeyPoint()
        },
      },
      keyPointSelectedRowKeys: [],
      keyPointSelectedRows: [],
      problemPreviewData: '',
      editKeyPointCategoryData: {},
      editKeyPointData: {},
    }
  },
  computed: {
    _selectedCategory() { return this.selectedCategory },
  },
  beforeCreate() {},
  mounted() {},
  created() {
    this.initCategory()
  },
  methods: {
    problemFilter_filter(text) {
      return text ? text.replace(/@@/g, '；') : ''
    },
    categoryChange(value) {
      this.initTree(value)
    },
    initCategory() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      const param = {
        page: 1,
        size: 99999,
        orderBy: 'sn',
        order: 'asc',
      }
      requestApi.category.list(param).then((res) => {
        _this.category = { ...res.data.rows }
        _this.initTree(_this.selectedCategory)
      })
    },
    initTree(categoryId) {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      requestApi.category
        .tree({ inspectionCategoryId: categoryId })
        .then((res) => {
          _this.keyPointCategoryTree = res.data
        })
    },
    initKeyPoint() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      const selected
        = _this.selectedKeyPointCategory
          && this.selectedKeyPointCategory.length > 0
          ? _this.selectedKeyPointCategory[0]
          : null
      const params = {
        keypointCategoryId: selected,
        quickQry: _this.searchValue,
        orderBy: 'orderNumber',
        order: 'asc',
        page: _this.keyPointDataPage,
        size: _this.keyPointDataSize,
      }
      requestApi.keyPoint.list(params).then((res) => {
        _this.keyPointData
          = res.data.count > 0
            ? res.data.rows.map((item) => {
                return {
                  ...item,
                  sort: `${_this.joinKeyPointSort(item.categoryId)}-${
                    item.orderNumber
                  }`,
                }
              })
            : res.data.rows
        _this.keyPointPagination.total = res.data.count
        _this.keyPointPagination.current = _this.keyPointDataPage
        _this.keyPointPagination.pageSize = _this.keyPointDataSize
      })
    },
    buildKeyPoint() {
      const categoryId
        = this.selectedKeyPointCategory
          && this.selectedKeyPointCategory.length > 0
          ? this.selectedKeyPointCategory[0]
          : null
      const obj = this.findSelectedKeyPointCategory()
      if (!obj) {
        window.$oAntdMessage.error('请选择大类')
      }
      const category = obj.category ? obj.category : this.joinKeyPointCategory()
      this.editKeyPointData = {
        id: null,
        category,
        categoryId,
        orderNumber: null,
        keypoint: null,
        description: null,
        problems: [],
      }
    },
    joinKeyPointSort(keyPointCategoryId) {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      let sort = ''
      const sortArray = []
      _this._joinKeyPointSort(
        this.keyPointCategoryTree,
        keyPointCategoryId,
        sortArray,
      )

      sortArray.forEach((item) => {
        sort = `-${item}${sort}`
      })
      return sort.substring(1)
    },
    _joinKeyPointSort(tree, id, sortArray) {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      const f = tree.find((item) => {
        if (item.id === id) {
          return true
        }
        else {
          return _this._joinKeyPointSort(item.children, id, sortArray)
        }
      })
      if (f) {
        sortArray.push(f.orderNumber)
        return true
      }
      else {
        return false
      }
    },
    joinKeyPointCategory() {
      const categoryId = this.selectedKeyPointCategory[0]
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      const categoryArray = []
      let category = ''
      _this._joinKeyPointCategory(
        this.keyPointCategoryTree,
        categoryId,
        categoryArray,
      )
      categoryArray.forEach((item) => {
        category = `-${item}${category}`
      })
      return category.substring(1)
    },
    _joinKeyPointCategory(tree, id, category) {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      const f = tree.find((item) => {
        if (item.id === id) {
          return true
        }
        else {
          return _this._joinKeyPointCategory(item.children, id, category)
        }
      })
      if (f) {
        category.push(f.name)
        return true
      }
      else {
        return false
      }
    },
    treeSelect(value) {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      _this.selectedKeyPointCategory = value
      this.initKeyPoint()
    },
    keyPointSearch() {
      this.initKeyPoint()
    },
    keyPointOnSelectChange(keys) {
      this.keyPointSelectedRowKeys = keys
    },
    keyPointEdit(record) {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      requestApi.keyPoint.entry(record.id).then((res) => {
        _this.editKeyPointData = res.data
        this.editKeyPointVisible = true
      })
    },
    problemPreview(record) {
      this.problemPreviewData = record
      this.problemPreviewVisible = true
    },
    problemPreviewOk() {
      this.problemPreviewVisible = false
      this.problemPreviewData = {}
    },
    editKeyPoint() {
      this.buildKeyPoint()
      this.editKeyPointVisible = true
    },
    editKeyPointOk() {
      this.$refs.editKeyPoint.submit()
    },
    editKeyPointCancel() {
      this.editKeyPointVisible = false
      this.initKeyPoint()
    },
    buildCategoryData() {
      const categoryId
        = this.selectedKeyPointCategory
          && this.selectedKeyPointCategory.length > 0
          ? this.selectedKeyPointCategory[0]
          : null
      const inspectionCategory = categoryId ? this.joinKeyPointCategory() : null
      this.editKeyPointCategoryData = {
        id: null,
        inspectionCategoryId: this.selectedCategory,
        inspectionCategory,
        name: '',
        orderNumber: null,
        pid: categoryId,
      }
    },
    findSelectedKeyPointCategory() {
      const category
        = this.selectedKeyPointCategory
          && this.selectedKeyPointCategory.length > 0
          ? this.selectedKeyPointCategory[0]
          : null
      const keyPointCategoryArray = []
      this.recursive(this.keyPointCategoryTree, category, keyPointCategoryArray)
      if (keyPointCategoryArray.length === 0) {
        return null
      }
      return keyPointCategoryArray[0]
    },
    recursive(tree, id, keyPointCategoryArray) {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      tree.forEach((item) => {
        if (item.id === id) {
          keyPointCategoryArray.push(item)
        }
        else if (item.children) {
          _this.recursive(item.children, id, keyPointCategoryArray)
        }
      })
    },
  },
}
</script>

<style lang="less" scoped>
.modal-footer {
  height: 30px;
}
.layout-sider {
  padding: 10px;
  height: 65vh;
  .category-title {
    margin-bottom: 20px;
    .category-title-span {
      line-height: 28px;
      font-weight: bold;
    }
  }
}
.layout {
  padding: 0 10px;
  .layout-content {
    background: var(--colorBgContainer);
    padding: 10px;
    margin: 0;
    height: 65vh;
    min-height: 280px;
  }
}
</style>
