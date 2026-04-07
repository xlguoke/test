<template>
  <div>
    <div class="standardList hitek-height-full">
      <a-spin class="hitek-height-full" :spinning="false">
        <a-layout class="hitek-height-full" :style="{ background: 'var(--colorBgLayout)' }">
          <a-layout>
            <a-layout-sider class="layout-sider" :style="{ background: 'var(--colorBgContainer)' }">
              <div class="category-title">
                <a-row>
                  <a-col :span="6">
                    <span class="category-title-span">检查类型：</span>
                  </a-col>
                  <a-col :span="18">
                    <a-select
                      v-model:value="selectedCategory"
                      style="width: 200px"
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
              <a-space>
                <a-button
                  v-permission="'keypoint:category:add'"
                  type="primary"
                  @click="editKeyPointCategory('add')"
                >
                  添加
                </a-button>
                <a-button
                  v-permission="'keypoint:category:edit'"
                  @click="editKeyPointCategory('edit')"
                >
                  编辑
                </a-button>
                <a-popconfirm
                  title="确认删除吗？"
                  ok-text="确认"
                  cancel-text="取消"
                  @confirm="deletedKeyPointCategory"
                >
                  <a-button
                    v-permission="'keypoint:category:delete'"
                  >
                    删除
                  </a-button>
                </a-popconfirm>
                <a-popconfirm
                  title="关联删除会删除选中的大类及其子类，确认继续吗？"
                  ok-text="确认"
                  cancel-text="取消"
                  @confirm="cascadeDeletedKeyPointCategory"
                >
                  <a-button
                    v-permission="'keypoint:category:cascade'"
                    danger
                  >
                    关联删除
                  </a-button>
                </a-popconfirm>
              </a-space>
              <a-tree
                class="mt-2"
                :show-line="true"
                :default-expand-all="true"
                :tree-data="keyPointCategoryTree"
                :replace-fields="replaceFields"
                @select="treeSelect"
              >
              </a-tree>
            </a-layout-sider>

            <a-layout class="layout" :style="{ background: 'var(--colorBgLayout)' }">
              <a-layout-content class="layout-content" :style="{ background: 'var(--colorBgContainer)' }">
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
                      class="ml-2"
                      type="primary"
                      @click="keyPointSearch"
                    >
                      查询
                    </a-button>
                  </a-col>
                </a-row>
                <a-space class="mt-2">
                  <a-button
                    v-permission="'keypoint:add'"
                    type="primary"
                    @click="editKeyPoint"
                  >
                    添加
                  </a-button>
                  <a-upload
                    :show-upload-list="false"
                    name="file"
                    :action="`${keyPointImportUrl}?categoryId=${selectedCategory}`"
                    @change="importKeyPoint"
                  >
                    <a-button
                      v-permission="'keypoint:import'"
                      type="default"
                    >
                      导入
                    </a-button>
                  </a-upload>
                  <a-button
                    v-permission="'keypoint:import'"
                    type="default"

                    @click="downloadTemplate"
                  >
                    下载模板
                  </a-button>
                  <a-button
                    v-permission="'keypoint:export'"
                    type="default"

                    @click="exportKeyPoint"
                  >
                    导出
                  </a-button>
                  <a-button
                    v-permission="'keypoint:delete'"
                    danger
                    @click="deleteKeyPoint"
                  >
                    删除
                  </a-button>
                </a-space>
                <br />
                <a-row class="mt-2">
                  <a-col :span="24">
                    <a-table
                      :data-source="keyPointData"
                      :columns="keyPointColumns"
                      :pagination="keyPointPagination"
                      :row-selection="{
                        selectedRowKeys: keyPointSelectedRowKeys,
                        onChange: keyPointOnSelectChange,
                      }"
                      row-key="id"
                    >
                      <template #bodyCell="{ column, record, text }">
                        <template v-if="column.dataIndex === 'problemPreview'">
                          <a @click="problemPreview(record)">{{ problemFilter_filter(text) }}</a>
                        </template>
                        <template v-if="column.dataIndex === 'operation'">
                          <a-button
                            v-permission="'keypoint:edit'"

                            type="link"
                            @click="
                              () => {
                                keyPointEdit(record)
                              }
                            "
                          >
                            编辑
                          </a-button>
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
      <ht-modal width="40%" :closable="false" :open="problemPreviewVisible">
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
      <ht-modal
        width="40%"
        :open="editCategoryVisible"
        title="编辑大类"
        :closable="false"
        :mask-closable="false"
        :destroy-on-close="true"
        @ok="editKeyPointCategoryOk"
        @cancel="editKeyPointCategoryCancel"
      >
        <EditKeyPointCategory
          ref="editKeyPointCategory"
          :data="editKeyPointCategoryData"
          @cancel="editKeyPointCategoryCancel"
        />
      </ht-modal>
    </div>
  </div>
</template>

<script>
import { getQueryVariable } from '~/providers/common/utils'
import api from '../api'
import EditKeyPoint from './components/EditKeyPoint.vue'
import EditKeyPointCategory from './components/EditKeyPointCategory.vue'
import ProblemPreview from './components/ProblemPreview.vue'

export default {
  name: 'List',
  components: {
    ProblemPreview,
    EditKeyPoint,
    EditKeyPointCategory,
  },
  props: {},
  data() {
    return {
      problemPreviewVisible: false,
      editKeyPointVisible: false,
      editCategoryVisible: false,
      selectedCategory: '',
      selectedKeyPointCategory: null,
      category: [],
      keyPointCategoryTree: [],
      searchValue: '',
      replaceFields: {
        children: 'children',
        title: 'name',
        key: 'id',
      },
      keyPointImportUrl: `/ilis2/rest/survey/document/composite.xlsx`,
      keyPointExportUrl: `/ilis2/rest/survey/document/composite.xlsx`,
      downloadTemplateUrl: `/ilis2/rest/inspectionKeypoint/downloadExcelTemplate`,
      keyPointData: [],
      keyPointColumns: [
        {
          title: '序号',
          dataIndex: 'orderNumber',
          width: '5%',
        },
        {
          title: '所属分类',
          dataIndex: 'category',
          width: '10%',
        },
        {
          title: '检查要点',
          dataIndex: 'keypoint',
          width: '30%',
        },
        {
          title: '要点说明',
          dataIndex: 'description',
          width: '30%',
        },
        {
          title: '常见问题',
          dataIndex: 'problemPreview',
          ellipsis: true,
          width: '15%',
        },

        {
          title: '操作',
          dataIndex: 'operation',
          width: '10%',
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
  computed: {},
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
      api.category.list(param).then((res) => {
        _this.category = { ...res.data.rows }
        const dc = getQueryVariable('selectedCategory')
        _this.selectedCategory = dc || (_this.category
          ? _this.category[0].id
          : '')
        _this.initTree(_this.selectedCategory)
      })
    },
    initTree(categoryId) {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      api.keyPointCategory.tree({ inspectionCategoryId: categoryId }).then((res) => {
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
      api.keyPoint.list(params).then((res) => {
        _this.keyPointData = res.data.rows
        _this.keyPointPagination.total = res.data.count
        _this.keyPointPagination.current = _this.keyPointDataPage
        _this.keyPointPagination.pageSize = _this.keyPointDataSize
      })
    },
    initKeyPointData() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      _this.keyPointData = []
      _this.keyPointPagination.total = 0
      _this.keyPointPagination.current = _this.keyPointDataPage
      _this.keyPointPagination.pageSize = _this.keyPointDataSize
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
      const category = obj.category
        ? obj.category
        : this.joinKeyPointCategory().category
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
    joinKeyPointCategory() {
      const categoryId = this.selectedKeyPointCategory[0]
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      const categoryArray = []
      let category = ''
      let parent = ''
      _this._joinKeyPointCategory(
        this.keyPointCategoryTree,
        categoryId,
        categoryArray,
      )
      categoryArray.forEach((item, index) => {
        category = `-${item}${category}`
        if (index !== 0) {
          parent = `-${item}${parent}`
        }
      })

      return { category: category.substring(1), parent: parent.substring(1) }
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
      api.keyPoint.entry(record.id).then((res) => {
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
      const inspectionCategory = categoryId
        ? this.joinKeyPointCategory().category
        : null
      this.editKeyPointCategoryData = {
        id: null,
        inspectionCategoryId: this.selectedCategory,
        inspectionCategory,
        name: '',
        orderNumber: null,
        pid: categoryId,
      }
    },
    editKeyPointCategory(type) {
      if (type === 'add') {
        this.buildCategoryData()
      }
      else {
        const kpc = this.findSelectedKeyPointCategory()
        if (!kpc) {
          window.$oAntdMessage.error('请选择需要编辑的大类')
          return false
        }
        const inspectionCategory = this.joinKeyPointCategory().parent
        this.editKeyPointCategoryData = {
          ...kpc,
          inspectionCategory,
        }
      }
      this.editCategoryVisible = true
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
    editKeyPointCategoryOk() {
      this.$refs.editKeyPointCategory.submit()
    },
    editKeyPointCategoryCancel() {
      this.initTree(this.selectedCategory)
      this.editCategoryVisible = false
    },
    deletedKeyPointCategory() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      const id
        = _this.selectedKeyPointCategory
          && this.selectedKeyPointCategory.length > 0
          ? _this.selectedKeyPointCategory[0]
          : null
      if (!id) {
        window.$oAntdMessage.error('请选择需要删除的大类')
        return false
      }
      // 若选中节点有子节点则不允许从这个地方删除
      const category = _this.findSelectedKeyPointCategory()
      if (category.children && category.children.length > 0) {
        window.$oAntdMessage.error(
          '您所删除的大类包含有子类，不能从当前入口删除，若需删除大类及其子类，请点击【关联删除】',
        )
        return false
      }

      api.keyPointCategory.delete(id).then(() => {
        _this.selectedKeyPointCategory = []
        _this.initKeyPointData()
        _this.initTree(_this.selectedCategory)
      })
    },
    cascadeDeletedKeyPointCategory() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      const id
        = _this.selectedKeyPointCategory
          && this.selectedKeyPointCategory.length > 0
          ? _this.selectedKeyPointCategory[0]
          : null
      if (!id) {
        window.$oAntdMessage.error('请选择需要删除的大类')
        return false
      }
      api.keyPointCategory.cascadeDelete(id).then(() => {
        _this.selectedKeyPointCategory = []
        _this.initKeyPointData()
        _this.initTree(_this.selectedCategory)
      })
    },
    importKeyPoint(info) {
      const key = 'importKeyPoint'

      if (info.file.status === 'uploading') {
        window.$oAntdMessage.loading({ content: '正在上传中...', key })
      }
      else if (info.file.response) {
        if (info.file.response.success || info.file.response.code === 20000) {
          window.$oAntdMessage.success({ content: '导入成功!', key, duration: 2 })
          this.initKeyPoint()
        }
        else {
          window.$oAntdMessage.error({
            content: `导入失败：${
              info.file.response.msg || info.file.response.message
            }`,
            key,
            duration: 2,
          })
        }
      }
    },
    downloadTemplate() {
      const a = document.createElement('a')
      a.href = `${this.downloadTemplateUrl}?categoryId=${this.selectedCategory}`
      a.click()
    },
    exportKeyPoint() {
      const a = document.createElement('a')
      a.href = `${this.keyPointExportUrl}?categoryId=${this.selectedCategory}`
      a.click()
    },
    deleteKeyPoint() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      window.$oAntdConfirm({
        title: '删除',
        content: `确认删除吗？`,
        okText: '确认',
        mask: false,
        cancelText: '取消',
        onOk: () => {
          api.keyPoint.delete(_this.keyPointSelectedRowKeys).then(() => {
            window.$oAntdMessage.success('删除成功')
            _this.initKeyPoint()
          })
        },
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import 'css/index.less';
.modal-footer {
  height: 30px;
}
</style>
