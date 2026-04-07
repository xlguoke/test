<template>
  <div>
    <a-layout class="layout">
      <a-layout-sider
        class="layout-sider "
        style="border-right: 1px solid var(--colorBorder);"
      >
        <a-tree
          :show-line="true"
          :tree-data="categoryTree"
          :default-checked-keys="[categoryDefaultCheckedKeys]"
          :default-expand-all="true"
          :replace-fields="categoryReplaceFields"
          @select="categorySelect"
        />
      </a-layout-sider>
      <a-layout-content class="layout-content">
        <div class="search-header">
          <a-input
            v-model:value="searchValue"
            placeholder="输入检查编号后回车即可查询"
            style="width: 200px;margin-right: 8px;"
            @keyup.enter="inspectionSearch"
          />
          <a-button
            type="primary"
            @click="inspectionSearch"
          >
            查询
          </a-button>
          <a-button type="default" @click="switchSearch">
            切换到高级查询
          </a-button>
        </div>
        <a-row class="shortcuts">
          <a-col :span="24">
            <span>
              <a-button
                v-permission="'inspection:add'"

                type="primary"

                @click="addInspection"
              >
                添加
              </a-button>
            </span>
            <span>
              <a-button
                v-permission="'inspection:copy'"
                type="default"
                @click="inspectionCopy"
              >
                复制
              </a-button>
            </span>
            <span>
              <a-button
                v-permission="'inspection:delete'"
                type="default"
                @click="inspectionDelete"
              >
                删除
              </a-button>
            </span>
            <span>
              <a-button
                v-permission="'inspection:edit'"
                hidden
                type="default"
                @click="undoTestAuditInfo"
              >
                撤回检查审批
              </a-button>
            </span>
            <span>
              <a-button
                v-permission="'inspection:reform'"
                hidden

                type="default"
                @click="undoReformAuditInfo"
              >
                撤回整改审批
              </a-button>
            </span>
          </a-col>
        </a-row>
        <div class="body-box">
          <a-table
            :key="scroll.x"
            :data-source="inspectionData"
            :columns="inspectionColumns"
            :pagination="inspectionPagination"
            :row-selection="{
              selectedRowKeys: inspectionSelectedRowKeys,
              onChange: inspectionOnSelectChange,
            }"
            :scroll="scroll"
            row-key="id"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'operation'">
                <a-button
                  v-if="hidden(record.testStatus, edit)"
                  v-permission="'inspection:edit'"

                  type="link"
                  @click="
                    () => {
                      inspectionEdit(record)
                    }
                  "
                >
                  编辑
                </a-button>
                <a-button
                  type="link"
                  @click="
                    () => {
                      inspectionDetail(record)
                    }
                  "
                >
                  查看详情
                </a-button>
                <a-button
                  v-if="hidden(record.reformStatus, reform)"
                  v-permission="'inspection:reform'"

                  type="link"
                  @click="
                    () => {
                      inspectionEditReformInfo(record)
                    }
                  "
                >
                  填写整改信息
                </a-button>
                <a-button
                  v-if="hidden(record.testStatus, edit)"
                  v-permission="'inspection:edit'"
                  type="link"

                  hidden
                  @click="
                    () => {
                      inspectionSubmitTestAudit(record)
                    }
                  "
                >
                  提交检查审批
                </a-button>
                <a-button
                  v-if="hidden(record.reformStatus, reform)"
                  v-permission="'inspection:reform'"
                  type="link"

                  hidden
                  @click="
                    () => {
                      inspectionSubmitReformAudit(record)
                    }
                  "
                >
                  提交整改审批
                </a-button>
              </template>
            </template>
          </a-table>
        </div>
      </a-layout-content>
    </a-layout>
    <div class="local-modal">
      <ht-modal
        width="45%"
        :open="advancedQueryVisible"
        title="高级查询"
        :closable="false"
        :mask-closable="false"
        :destroy-on-close="true"
        @ok="advancedQueryOk"
        @cancel="advancedQueryCancel"
      >
        <AdvancedQuery2 ref="advancedQuery" @submit="advancedQuery" />
      </ht-modal>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { formatTime } from '~/providers/common/utils'
import requestApi from '../request'
import AdvancedQuery2 from './components/AdvancedQuery.vue'

export default {
  name: 'List',
  components: {
    AdvancedQuery2,
  },
  data() {
    return {
      // 检查类型树
      categoryTree: [],
      // 检查类型树 属性替换方案
      categoryReplaceFields: {
        children: 'children',
        title: 'name',
        key: 'id',
      },
      // 按钮显示权限
      edit: ['检查中', '撤回修改中', '检查审批不通过', null],
      reform: ['整改中', null],
      // 被选中的检查类型
      categorySelected: '',
      // 默认选中的检查类型
      categoryDefaultCheckedKeys: this.$route.query.categoryDefaultCheckedKeys,
      // 快捷查询
      searchValue: '',
      // 检查列表
      inspectionData: [],
      scroll: { x: 1440 },
      // 默认检查列检查列
      inspectionDefaultColumns: [
        {
          title: '检查编号',
          dataIndex: 'sn',
          width: 160,
          fixed: 'left',
        },
        {
          title: '检查对象',
          dataIndex: 'testObject',
          width: 180,
        },
        {
          title: '检查日期',
          dataIndex: 'testDate',
          customRender({ text: time, record }) {
            if (!time) {
              return ''
            }
            if (
              formatTime(time, 'YYYY-MM-DD')
              === formatTime(record.testDateEnd, 'YYYY-MM-DD')
            ) {
              return formatTime(time, 'YYYY-MM-DD')
            }
            else {
              return `${formatTime(time, 'YYYY-MM-DD')} ~ ${formatTime(
                record.testDateEnd,
                'YYYY-MM-DD',
              )}`
            }
          },
          width: 180,
        },
        {
          title: '检查人',
          dataIndex: 'personNames',
          width: 100,
        },
        {
          title: '检查状态',
          dataIndex: 'testStatus',
          width: 80,
        },
        {
          title: '整改状态',
          dataIndex: 'reformStatus',
          width: 80,
        },
        {
          title: '创建人',
          dataIndex: 'createName',
          width: 80,
        },
      ],
      // 自定义检查列
      inspectionCustomColumns: [],
      // 操作列
      inspectionOperationColumns: [
        {
          title: '操作',
          dataIndex: 'operation',
          scopedSlots: { customRender: 'operation' },
          fixed: 'right',
          width: 200,
        },
      ],
      // 检查列检查列
      inspectionColumns: [],

      // 检查列表分页数据
      inspectionDataPage: 1,
      inspectionDataSize: 10,
      inspectionSelectedRowKeys: [],
      inspectionSelectedRows: [],
      inspectionPagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.inspectionDataPage = page
          this.initInspectionList()
        },
        onShowSizeChange: (page, size) => {
          this.inspectionDataPage = 1
          this.inspectionDataSize = size
          this.initInspectionList()
        },
      },
      // 高级查询相关
      advancedQueryVisible: false,
      // 高级查询参数
      advancedQueryParam: {},
    }
  },
  computed: {},
  created() {
    this.inspectionColumns = this.inspectionDefaultColumns.concat(
      this.inspectionOperationColumns,
    )
    this.initCategory()
  },
  methods: {
    /**
     * 初始化自定义列
     */
    initCustomColumn() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      _this.inspectionCustomColumns = []
      requestApi.inspection
        .customProperties(`inspection_type_${_this.categorySelected}`)
        .then((res) => {
          if (res.data && res.data.length && res.data.length > 0) {
            res.data.forEach((item) => {
              _this.inspectionCustomColumns.push({
                title: item.columnName,
                dataIndex: item.id,
                width: 100,
                customRender({ record }) {
                  if (
                    !record.customizeValues
                    || record.customizeValues.length < 1
                  ) {
                    return ''
                  }
                  const customize = record.customizeValues.find(
                    it => it.columnId === item.id,
                  )
                  if (customize) {
                    return customize.columnValue
                  }
                  else {
                    return ''
                  }
                },
              })
            })
          }
          _this.inspectionColumns = _this.inspectionDefaultColumns
            .concat(_this.inspectionCustomColumns)
            .concat(_this.inspectionOperationColumns)

          const scrollWidth = _this.inspectionColumns.reduce((total, item) => {
            return total + item.width
          }, 0)
          if (scrollWidth > 1440) {
            this.scroll = { x: scrollWidth }
          }

          _this.initInspectionList()
        })
    },

    /**
     * 初始化检查类型
     */
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
        _this.categoryTree = res.data.rows
        if (
          _this.categoryDefaultCheckedKeys
          && _this.categoryDefaultCheckedKeys.length > 0
        ) {
          _this.categorySelect(_this.categoryDefaultCheckedKeys)
        }
      })
    },

    /**
     * 按钮隐藏
     */
    hidden(status, type) {
      const s = type.find(it => it === status)
      return !!s
    },

    /**
     * 检查类型选择事件
     */
    categorySelect(value) {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      _this.categorySelected = value[0]
      this.initCustomColumn()
    },

    /**
     * 初始化检查列表
     */
    initInspectionList(advancedQueryParams) {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      const defaultParams = {
        quickQry: _this.searchValue,
        page: _this.inspectionDataPage,
        size: _this.inspectionDataSize,
        inspectionCategoryId: _this.categorySelected,
      }
      let params = {}

      if (advancedQueryParams) {
        delete defaultParams.quickQry
        params = { ...defaultParams, ...advancedQueryParams }
      }
      else {
        params = { ...defaultParams }
      }
      requestApi.inspection
        .list(params)
        .then((res) => {
          _this.inspectionData = res.data.rows
          _this.inspectionPagination.total = res.data.count
          _this.inspectionPagination.current = _this.inspectionDataPage
          _this.inspectionPagination.pageSize = _this.inspectionDataSize
        })
        .catch(() => {
          _this.inspectionData = []
          _this.inspectionPagination.total = 0
          _this.inspectionPagination.current = _this.inspectionDataPage
          _this.inspectionPagination.pageSize = _this.inspectionDataSize
        })
    },
    /**
     *编辑检查列表
     */
    inspectionSearch() {
      this.initInspectionList()
    },

    /**
     *新增检查
     */
    addInspection() {
      if (this.categorySelected) {
        this.$router.push({
          name: 'Edit',
          query: {
            categoryId: this.categorySelected,
            inspectionId: null,
            openType: 'edit',
          },
        })
      }
      else {
        window.$oAntdMessage.error('请先指定检查大类')
      }
    },

    /**
     *复制检查
     */
    inspectionCopy() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      if (
        _this.inspectionSelectedRowKeys.length > 1
        || _this.inspectionSelectedRowKeys.length === 0
      ) {
        window.$oAntdMessage.error('请选择一条数据')
        return false
      }
      const selectedId = _this.inspectionSelectedRowKeys[0]
      requestApi.inspection.copy(selectedId).then((res) => {
        _this.initInspectionList(_this.advancedQueryParam)
        _this.inspectionSelectedRowKeys = [res.data]
        _this.$router.push({
          name: 'Edit',
          query: {
            categoryId: this.categorySelected,
            inspectionId: res.data,
            openType: 'edit',
          },
        })
      })
    },

    /**
     *删除检查
     */
    inspectionDelete() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      if (_this.inspectionSelectedRowKeys.length === 0) {
        window.$oAntdMessage.error('请选择一条数据')
        return false
      }
      window.$oAntdConfirm({
        title: '提示',
        content: '确定要删除吗？',
        okText: '确定',
        okType: 'primary',
        cancelText: '取消',
        onOk() {
          requestApi.inspection
            .delete(_this.inspectionSelectedRowKeys)
            .then(() => {
              _this.initInspectionList()
              _this.inspectionSelectedRowKeys = []
            })
        },
      })
    },

    /**
     *撤回检查审批
     */
    undoTestAuditInfo() {},

    /**
     *撤回整改审批
     */
    undoReformAuditInfo() {},

    /**
     * 切换高级查询
     */
    switchSearch() {
      this.advancedQueryVisible = true
    },

    /**
     * 高级查询确定按键
     */
    advancedQueryOk() {
      this.searchValue = ''
      this.$refs.advancedQuery.submit()
    },

    /**
     * 高级查询
     */
    advancedQuery(params) {
      if (params.testDate && params.testDate.length > 0) {
        const date = params.testDate
        params.testDateStart = dayjs(date[0]).format('YYYY-MM-DD')
        params.testDateEnd = dayjs(date[1]).format('YYYY-MM-DD')
        delete params.testDate
      }
      this.advancedQueryParam = params
      this.initInspectionList(params)
      this.advancedQueryVisible = false
    },

    /**
     * 高级查询取消
     */
    advancedQueryCancel() {
      this.advancedQueryVisible = false
    },

    /**
     *编辑检查列表
     */
    inspectionEdit(record) {
      this.$router.push({
        name: 'Edit',
        query: {
          categoryId: this.categorySelected,
          inspectionId: record.id,
          openType: 'edit',
        },
      })
    },

    /**
     * 查看检查详情
     */
    inspectionDetail(record) {
      this.$router.push({
        name: 'Edit',
        query: {
          categoryId: this.categorySelected,
          inspectionId: record.id,
          openType: 'detail',
        },
      })
    },

    /**
     * 填写整改信息
     */
    inspectionEditReformInfo(record) {
      this.$router.push({
        name: 'Edit',
        query: {
          categoryId: this.categorySelected,
          inspectionId: record.id,
          openType: 'reform',
        },
      })
    },

    /**
     * 提交检查审批
     */
    inspectionSubmitTestAudit() {},
    /**
     * 提交整改审批
     */
    inspectionSubmitReformAudit() {},

    /**
     * 检查列表选择事件
     */
    inspectionOnSelectChange(keys) {
      this.inspectionSelectedRowKeys = keys
    },
  },
}
</script>

<style lang="less" scoped>
.layout {
  height: 95.5vh;
  overflow-x: hidden !important;
  background: var(--colorBgContainer);
  .layout-sider {
    width: 200px !important;
    min-width: 150px;
    max-width: 250px !important;
    overflow: auto;
    padding: 10px;
    height: 100%;
    position: fixed;
    left: 0;
    background: var(--colorBgContainer);
    .category-title {
      margin-bottom: 20px;
      .category-title-span {
        line-height: 28px;
        font-weight: bold;
      }
    }
  }
  .layout-content {
    margin-left: 200px;
    padding: 0 10px;
    width: calc(100% - 200px);
    background: var(--colorBgContainer);
    min-height: 280px;
    height: 100%;
    overflow: initial;

    .search-header {
      padding-bottom: 15px;
      border-bottom: 1px var(--colorSplit) solid;
    }

    .shortcuts {
      padding: 15px 0;
      border-bottom: 1px var(--colorSplit) solid;
      span {
        margin-right: 10px;
      }
      .icon {
        vertical-align: center;
        height: 17.98px;
      }
    }

    .body-box {
      padding-top: 15px;
      .ant-table .ant-btn {
        margin-right: 0;
        padding: 0 4px;
      }
    }
  }
}
</style>
