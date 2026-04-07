<!-- eslint-disable vue/no-unused-refs -->
<template>
  <div class="qualificationMange">
    <div class="qualificationMange-left">
      <ComHeader>资质列表</ComHeader>
      <div class="mt-4 mb-4">
        <a-row>
          <a-col span="18">
            <a-button type="primary" @click="add">
              新增
            </a-button>
            <a-button @click="edit">
              编辑
            </a-button>
            <a-button @click="deleteRow">
              删除
            </a-button>
          </a-col>
          <a-col span="6" style="text-align: right">
            <a-button @click="setting">
              资质声明设置
            </a-button>
          </a-col>
        </a-row>
      </div>
      <a-table
        :custom-row="customRow"
        :row-selection="{
          type: 'radio',
          hideDefaultSelections: false,
          selectedRowKeys,
          onChange: onSelectChange,
        }"
        :columns="columns"
        :data-source="data"
        :loading="loading"
        bordered
        :pagination="pagination"
        row-key="id"
        :row-class-name="rowClassName"
        :scroll="scroll"
      >
        <template #headerCell="{ column }">
          <template v-if="column.dataIndex === 'defaultFlag'">
            是否默认
            <a-tooltip placement="top">
              <template #title>
                <span>开启后，初次新增委托时，将默认选择该资质</span>
              </template>
              <QuestionCircleOutlined style="color: #1890ff" />
            </a-tooltip>
          </template>

          <template v-if="column.dataIndex === 'auto'">
            自动添加该资质
            <a-tooltip placement="top">
              <template #title>
                <span>开启后，在提交报告时，系统将自动将该资质添加到报告中</span>
              </template>
              <QuestionCircleOutlined style="color: #1890ff" />
            </a-tooltip>
          </template>

          <template v-if="column.dataIndex === 'statementExpiredDate'">
            资质失效日期
            <a-tooltip placement="top">
              <template #title>
                <span>该日期起，资质对应的印章、资质声明不能添加到报告中</span>
              </template>
              <QuestionCircleOutlined style="color: #1890ff" />
            </a-tooltip>
          </template>
        </template>

        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'defaultFlag'">
            <a-switch
              v-model:checked="record.defaultFlag"
              @change="
                (val) => {
                  switcher('defaultFlag', record)
                }
              "
            />
          </template>

          <template v-if="column.dataIndex === 'auto'">
            <a-switch
              v-model:checked="record.auto"
              @change="
                (val) => {
                  switcher('auto', record)
                }
              "
            />
          </template>
        </template>
      </a-table>
    </div>

    <div class="qualificationMange-handler"></div>

    <div class="qualificationMange-right">
      <ComHeader v-if="selectedRow">
        {{ selectedRow.name }}关联印章
      </ComHeader>
      <ComHeader v-else>
        关联印章
      </ComHeader>
      <div style="height: 28px" class="mb-4 mt-4">
        <a-button
          v-if="relationSealData.length"
          :loading="relationSealLoading"

          type="primary"
          @click="saveBind"
        >
          保存
        </a-button>
      </div>
      <a-table
        :row-selection="{
          selectedRowKeys: relationSelectRowKeys,
          onChange: onRelationSealSelectChange,
          getCheckboxProps: (record) => ({
            props: {
              disabled: record.sealType === 'QUALIFY',
            },
          }),
        }"
        :columns="relationSealColumns"
        :data-source="relationSealData"
        :loading="relationSealLoading"
        bordered
        :pagination="false"
        row-key="sealId"
        :row-class-name="rowClassName"
        :scroll="scroll2"
        :locale="{
          emptyText: relationSealData.length ? '暂无数据' : '请先选择资质',
        }"
      >
        <template #headerCell="{ column }">
          <template v-if="column.dataIndex === 'autoSign'">
            自动标记为已签章
            <a-tooltip placement="top">
              <template #title>
                <span>启用后，在打印报告后，有该资质章的报告，将自动标记为已盖章</span>
              </template>
              <QuestionCircleOutlined style="color: #1890ff" />
            </a-tooltip>
          </template>
        </template>

        <template #bodyCell="{ column, record, text }">
          <template v-if="column.dataIndex === 'sealName'">
            <span style="margin-right: 4px">{{ text }}</span>
            <a-tag v-if="record.sealType === 'QUALIFY'" color="#f59a23">
              资质
            </a-tag>
            <a-tag v-if="record.sealType === 'OTHER'" color="#97c21c">
              其他
            </a-tag>
          </template>
        </template>
      </a-table>
    </div>

    <EditModal
      ref="EditModal"
      v-model:value="visible"
      :edit-id="editId"
      @on-save="getData"
    />

    <SettingModal ref="SettingModal" v-model:value="settingVisible" @on-save="getData" />
  </div>
</template>

<script>
import { QuestionCircleOutlined } from '@ant-design/icons-vue'
import ComHeader from '~/providers/components/comHeader/index.vue'
import CustomProperty from '~/providers/components/CustomProperty.vue'
import { rootUrl } from '~/providers/configs/rootUrl'
import { QualificationMangeClient } from '~/providers/providers/clients/qualification-mange-client'
import { QualificationService } from '~/providers/providers/services/common-body-qualification'
import EditModal from './components/editModal.vue'
import SettingModal from './components/settingModal.vue'

const qualificationMangeClient = new QualificationMangeClient()
const qualificationService = new QualificationService()

export default {
  components: {
    EditModal,
    SettingModal,
    // eslint-disable-next-line vue/no-unused-components
    CustomProperty,
    ComHeader,
    QuestionCircleOutlined,
  },
  data() {
    return {
      rootUrl,
      data: [],
      selectPage: 'radio',
      loading: false,
      visible: false,
      settingVisible: false,
      editId: null,
      scroll: {
        x: document.body.clientWidth * 0.6,
        y: document.body.clientHeight - 220,
        scrollToFirstRowOnChange: true,
      },
      scroll2: {
        y: document.body.clientHeight - 220,
        scrollToFirstRowOnChange: true,
      },
      columns: qualificationMangeClient.tableColumns,
      relationSealColumns: qualificationMangeClient.realtionSealTableColumns,
      relationSealData: [],
      relationSealLoading: false,
      relationSelectRowKeys: [],
      selectedRowKeys: [],
      page: 1,
      size: 10,
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
            this.selectedRowKeys = [record.id]
            this.onSelectQualification()
          },
        }
      },
    }
  },
  computed: {
    selectedRow() {
      const { selectedRowKeys } = this
      const selectedId = selectedRowKeys[0]

      if (selectedId) {
        return this.data.find(i => i.id === selectedId)
      }

      return null
    },
  },
  created() {
    this.getData()
  },
  methods: {
    async switcher(type, row) {
      event.stopPropagation()

      this.loading = true
      const res = await qualificationService.switcher(type, row.id)
      if (res.code !== 20010) {
        window.$oAntdMessage.success('操作成功')
        this.getData()
      }
      this.loading = false
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    async getData() {
      const { page, size } = this

      this.loading = true
      const res = await qualificationService.pagination(page, size)
      this.data = res.rows
      this.pagination.total = res.total
      this.pagination.current = page
      this.pagination.pageSize = size
      this.loading = false
    },
    add() {
      this.editId = null
      this.visible = true
    },
    edit() {
      event.stopPropagation()
      const { selectedRowKeys } = this

      if (selectedRowKeys.length === 0) {
        window.$oAntdModal.warning({
          title: '提示',
          content: '请选择要编辑的数据',
        })
        return
      }

      this.editId = selectedRowKeys[0]
      this.visible = true
    },
    setting() {
      event.stopPropagation()
      this.settingVisible = true
    },
    async saveBind() {
      const { relationSelectRowKeys, relationSealData, selectedRow } = this
      const rows = relationSealData.filter(i =>
        relationSelectRowKeys.includes(i.sealId),
      )

      this.relationSealLoading = true
      const res = await qualificationService
        .bind(
          selectedRow.id,
          rows.map(item => ({
            sealId: item.sealId,
            sealName: item.sealName,
          })),
        )
        .finally(() => {
          this.relationSealLoading = false
        })

      if (res.code !== 20010) {
        window.$oAntdMessage.success('操作成功')
        this.getData()
      }
    },
    getDelTip(text) {
      const result = []
      result.push(h('p', '删除后将无法恢复！请谨慎删除！'))

      if (text) {
        result.push(
          h(
            'p',
            {
              style: {
                marginTop: '8px',
              },
            },
            [
              h('input', {
                style: {
                  verticalAlign: 'middle',
                  marginRight: '4px',
                  marginBottom: '4px',
                },
                attrs: {
                  type: 'checkbox',
                  id: 'delSealVersion',
                },
              }),
              `同时删除资质印章${text.join('')}`,
            ],
          ),
        )
      }

      return result
    },
    async deleteRow() {
      const { selectedRowKeys } = this

      if (selectedRowKeys.length === 0) {
        window.$oAntdModal.warning({
          title: '提示',
          content: '请选择要删除的数据',
        })
        return
      }

      this.loading = true
      const res = await qualificationService
        .relationSeals(selectedRowKeys[0])
        .finally(() => {
          this.loading = false
        })

      let text = null

      if (res.code !== 20010) {
        const rows = res.data.filter(i => i.sealType === 'QUALIFY')
        if (rows.length > 0) {
          text = rows.map(i => `[${i.sealName}]`)
        }
      }

      window.$oAntdConfirm({
        title: '您确定要删除？',
        content: () => this.getDelTip(text),
        okText: '确认',
        cancelText: '取消',
        onOk: async () => {
          let checked = false
          const ele = document.getElementById('delSealVersion')

          ele && (checked = ele.checked)
          const res = await qualificationService.delete(
            selectedRowKeys[0],
            checked,
          )

          if (res.code !== 20010) {
            if (this.selectedRowKeys.includes(selectedRowKeys[0])) {
              this.selectedRowKeys = []
              this.relationSelectRowKeys = []
              this.relationSealData = []
            }
            window.$oAntdMessage.success('删除成功')
            this.getData()
          }
        },
      })
    },
    async onSelectQualification() {
      const { selectedRowKeys } = this

      this.relationSealLoading = true
      const res = await qualificationService
        .relationSeals(selectedRowKeys[0])
        .finally(() => {
          this.relationSealLoading = false
        })

      if (res.code !== 20010) {
        this.relationSealData = res.data
      }

      this.relationSelectRowKeys = this.relationSealData
        .filter(i => !!i.id)
        .map(i => i.sealId)
    },
    onRelationSealSelectChange(selectedRowKeys) {
      this.relationSelectRowKeys = selectedRowKeys
    },
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
      this.onSelectQualification()
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
