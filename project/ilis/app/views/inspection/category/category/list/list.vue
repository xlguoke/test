<template>
  <div>
    <div>
      <a-row>
        <a-col :span="24">
          <p class="description">
            说明：
          </p>
          <p class="description">
            1.启用审批后，需在系统管理-业务与流程绑定中设置对应审批流程，流程方可真正执行；
          </p>
          <p class="description">
            2.各检查类型，可独立设置自定义字段，用于检查填写；
          </p>
        </a-col>
      </a-row>
      <a-space>
        <a-input
          v-model:value="searchValue"
          class="w-[320px]"
          placeholder="输入检查类型后回车即可查询"
          @keyup.enter="handleSearch"
        />
        <a-button type="primary" @click="handleSearch">
          查询
        </a-button>
      </a-space>
      <a-row>
        <a-col :span="24">
          <a-button
            v-permission="'category:add'"

            type="primary"

            @click="handleAdd"
          >
            添加检查类型
          </a-button>
        </a-col>
      </a-row>
      <a-row>
        <a-col :span="24">
          <a-table
            bordered
            :data-source="dataSource"
            :columns="columns"
            :loading="loading"
            :pagination="categoryPagination"
            row-key="id"
          >
            <template #bodyCell="{ column, record, text }">
              <template v-if="column.dataIndex === 'enableInspectionAudit'">
                <a-switch
                  :checked="text"
                  @change="(checked) => inspectionAuditChange(checked, record)"
                />
              </template>
              <template v-if="column.dataIndex === 'enableReformAudit'">
                <a-switch
                  :checked="text"
                  @change="
                    (checked) => {
                      reformAuditChange(checked, record)
                    }
                  "
                />
              </template>
              <template v-if="column.dataIndex === 'operation'">
                <a-popconfirm
                  v-if="dataSource.length"
                  title="确定要删除吗？"
                  @confirm="() => onDelete(record)"
                >
                  <a-button
                    v-permission="'category:delete'"

                    type="link"
                  >
                    删除
                  </a-button>
                </a-popconfirm>
                <a-button
                  v-permission="'category:edit'"

                  type="link"
                  @click="
                    () => {
                      onEdit(record)
                    }
                  "
                >
                  编辑
                </a-button>
                <a-button
                  v-permission="'category:custom'"

                  type="link"
                  @click="
                    () => {
                      editCustom(record)
                    }
                  "
                >
                  设置自定义字段
                </a-button>
                <a-button
                  v-permission="'category:sn'"

                  type="link"
                  @click="
                    () => {
                      editCodeGeneration(record)
                    }
                  "
                >
                  设置检查编号生成规则
                </a-button>
                <a-button
                  v-permission="'category:key-point'"

                  type="link"
                  @click="
                    () => {
                      setKeyPoint(record)
                    }
                  "
                >
                  设置检查要点与常见问题
                </a-button>
              </template>
            </template>
          </a-table>
        </a-col>
      </a-row>
    </div>
    <div>
      <ht-modal
        :open="editVisible"
        title="编辑检查类型"
        :closable="false"
        :mask-closable="false"
        :destroy-on-close="true"
        @ok="editOk"
        @cancel="editCancel"
      >
        <Edit ref="edit" :data="editData" @cancel="editCancel"></Edit>
      </ht-modal>
      <ht-modal
        :open="customVisible"
        width="50%"
        title="自定义字段配置"
        :mask-closable="false"
        :closable="false"
        :destroy-on-close="true"
      >
        <CustomProperty :customize-type="customizeType" />
        <template #footer>
          <div class="modal-footer">
            <a-button type="primary" @click="customOk">
              确定
            </a-button>
          </div>
        </template>
      </ht-modal>
      <ht-modal
        :open="codeGenerationVisible"
        width="50%"
        title="编辑编号生成规则"
        :closable="false"
        :mask-closable="false"
        :destroy-on-close="true"
      >
        <CodeGeneration
          ref="codeGeneration"
          :category-id="categoryId"
          :customize-type="customizeType"
          @code-preview="codeGenerationPreview"
        />
        <template #footer>
          <div class="modal-footer">
            <a-button type="primary" @click="codeGenerationOk">
              确定
            </a-button>
          </div>
        </template>
      </ht-modal>
    </div>
  </div>
</template>

<script>
import CustomProperty from '~/providers/components/CustomProperty.vue'
import { request } from '../request'
import CodeGeneration from './components/CodeGeneration.vue'
import Edit from './components/Edit.vue'

export default {
  name: 'List',
  components: {
    Edit,
    CustomProperty,
    CodeGeneration,
  },

  data() {
    return {
      dataSource: [],
      categoryPage: 1,
      categorySize: 10,
      categoryId: null,
      categoryPagination: {
        current: 1,
        total: 0,
        ...window.pageConfig,
        onChange: (page) => {
          this.keyPointDataPage = page
          this.initCategory()
        },
        onShowSizeChange: (page, size) => {
          this.keyPointDataPage = 1
          this.keyPointDataSize = size
          this.initCategory()
        },
      },
      columns: [
        {
          title: '序号',
          dataIndex: 'sn',
          width: '5%',
        },
        {
          title: '检查类型',
          dataIndex: 'name',
          width: '15%',
        },
        // TODO(审批功能没有开启，页面先隐藏)
        // {
        //     title: '启用检查审批',
        //     dataIndex: 'enableInspectionAudit',
        //     width:'5%',
        // },
        // {
        //     title: '启用整改审批',
        //     dataIndex: 'enableReformAudit',
        //     width:'5%'
        // },
        {
          title: '检查编号生成规则',
          dataIndex: 'codeRule',
          width: '15%',
        },
        {
          title: '备注',
          dataIndex: 'remark',
          width: '20%',
        },
        {
          title: '操作',
          dataIndex: 'operation',
        },
      ],
      searchValue: '',
      editVisible: false,
      loading: false,
      customVisible: false,
      codeGenerationVisible: false,
      keyPointVisible: false,
      customizeType: null,
      editData: {},
      codePreview: '',
    }
  },
  created() {
    this.initCategory()
  },
  methods: {
    onDelete(key) {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      request.category.delete(key.id).then(() => {
        _this.initCategory()
      })
    },
    onEdit(record) {
      this.editData = { ...record }
      this.editVisible = true
    },
    editCustom(record) {
      this.customizeType = `inspection_type_${record.id}`
      this.customVisible = true
    },
    editCodeGeneration(record) {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      _this.categoryId = record.id
      _this.customizeType = `inspection_type_${record.id}`
      _this.codeGenerationVisible = true
    },

    setKeyPoint(report) {
      const url = `inspectionKeypoint.do?goList&selectedCategory=${report.id}`

      top.addTabs
      && top.addTabs({
        id: '1',
        title: '检查要点与常见问题',
        close: false,
        url,
      })
    },

    initCategory() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      _this.loading = true
      const params = {
        page: _this.categoryPage,
        size: _this.categorySize,
        orderBy: 'sn',
        order: 'asc',
        quickQry: _this.searchValue,
      }
      request.category.list(params).then((res) => {
        _this.dataSource = res.data.rows
        _this.categoryPagination.total = res.data.count
        _this.categoryPagination.current = _this.categoryPage
        _this.categoryPagination.pageSize = _this.categorySize
        _this.loading = false
      })
    },
    initEditData() {
      this.editData = {
        id: null,
        sn: null,
        name: '',
        enableInspectionAudit: false,
        enableReformAudit: false,
        codeRule: '',
        remark: '',
      }
    },
    handleAdd() {
      this.initEditData()
      this.editVisible = true
    },
    handleSearch() {
      this.initCategory()
    },
    inspectionAuditChange(checked, record) {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      record.enableInspectionAudit = checked
      request.category.edit(record).then(() => {
        _this.initCategory()
      })
    },
    reformAuditChange(checked, record) {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      record.enableReformAudit = checked
      request.category.edit(record).then(() => {
        _this.initCategory()
      })
    },
    editOk() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      window.$oNextTick(() => {
        _this.$refs.edit.submit()
      })
    },
    editCancel() {
      this.initEditData()
      this.initCategory()
      this.editVisible = false
    },
    customOk() {
      this.customVisible = false
    },
    codeGenerationOk() {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      _this.$refs.codeGeneration.checkEditing().then((res) => {
        if (res) {
          _this.refreshCodePreview(_this.categoryId)
          _this.categoryId = ''
          _this.codeGenerationVisible = false
        }
        else {
          window.$oAntdConfirm({
            title: '确定',
            content: `检查编号还有待保存的修改，确定要将这些数据丢弃吗？`,
            okText: '确认',
            mask: false,
            cancelText: '取消',
            onOk: () => {
              _this.refreshCodePreview(_this.categoryId)
              _this.categoryId = ''
              _this.codeGenerationVisible = false
            },
          })
        }
      })
    },
    refreshCodePreview(categoryId) {
      // eslint-disable-next-line ts/no-this-alias
      const _this = this
      const params = {
        id: categoryId,
        codeRule: this.codePreview,
      }
      // 表格中没数据就不调用该接口
      _this.$refs.codeGeneration.checkDataExists().then((res) => {
        if (res) {
          request.category.refreshCodePreview(params).then(() => {
            _this.initCategory()
          })
        }
      })
    },
    codeGenerationPreview(preview) {
      this.codePreview = preview
    },
  },
}
</script>

<style scoped>
.editable-cell {
  position: relative;
}
.editable-cell-input-wrapper,
.editable-cell-text-wrapper {
  padding-right: 24px;
}
.editable-cell-text-wrapper {
  padding: 5px 24px 5px 5px;
}
.editable-cell-icon,
.editable-cell-icon-check {
  position: absolute;
  right: 0;
  width: 20px;
  cursor: pointer;
}
.editable-cell-icon {
  line-height: 18px;
  display: none;
}
.editable-cell-icon-check {
  line-height: 28px;
}
.editable-cell:hover .editable-cell-icon {
  display: inline-block;
}
.editable-cell-icon:hover,
.editable-cell-icon-check:hover {
  color: #108ee9;
}
.editable-add-btn {
  margin-bottom: 8px;
}
.description {
  color: green;
}
.ant-row {
  margin: 10px 0;
}
.modal-footer {
  height: 30px;
}
</style>
