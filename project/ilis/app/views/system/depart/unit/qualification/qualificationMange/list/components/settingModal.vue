<template>
  <div>
    <ht-modal
      v-model:open="_value"
      title="资质声明设置"
      :confirm-loading="submitLoading"
      :mask-closable="false"
      width="800px"
      :centered="true"
      :body-style="{ 'max-height': `${height - 100}px`, 'overflow-y': 'auto' }"
      @ok="handleSubmit"
      @cancel="cancelModal"
    >
      <a-spin :spinning="spinning">
        <ComHeader>资质声明模式</ComHeader>
        <a-select
          v-model:value="selectType"
          style="width: 100%"
          placeholder="请选择"
          @change="onChangeType"
        >
          <a-select-option
            v-for="item in typeList"
            :key="item.typecode"
            :value="item.typecode"
          >
            {{ item.typename }}
          </a-select-option>
        </a-select>

        <template v-if="selectType === 'PART' || selectType === 'ALL'">
          <ComHeader class="mt-4">
            资质声明内容
          </ComHeader>
          <a-textarea
            v-model:value.trim="content"
            placeholder="请输入"
            :max-length="50"
            :rows="2"
          />
          <p style="color: var(--colorError)" class="mt-2">
            注意：“[资质名称（证书编号）]”为固定内容，请勿删除或修改！
          </p>
        </template>

        <template v-if="selectType === 'PART' || selectType === 'ALL'">
          <ComHeader class="mt-4">
            资质列表
          </ComHeader>
          <a-button v-if="selectType === 'PART'" class="mb-2" @click="onAdd">
            添加
          </a-button>
          <a-table
            :columns="columns"
            :data-source="selectType === 'PART' ? tableList : allTableList"
            bordered
            :loading="tableLoading"
            :pagination="false"
            row-key="id"
            :scroll="{ y: 220 }"
          >
            <template #bodyCell="{ column, record }">
              <template v-if="column.dataIndex === 'statementEnableDate'">
                <a-date-picker
                  v-model:value="record.statementEnableDate"
                  value-format="YYYY-MM-DD"
                  @change="onSaveStatementDate(record, 'statementEnableDate')"
                />
              </template>
              <template v-if="column.dataIndex === 'statementExpiredDate'">
                <a-date-picker
                  v-model:value="record.statementExpiredDate"
                  value-format="YYYY-MM-DD"
                  @change="onSaveStatementDate(record, 'statementExpiredDate')"
                />
              </template>
              <template v-if="column.dataIndex === 'Action'">
                <DeleteOutlined
                  title="删除"
                  style="color: var(--colorError)"
                  @click="onDel(record)"
                />
              </template>
            </template>
          </a-table>
        </template>
      </a-spin>
    </ht-modal>

    <QualificationSelector2
      v-model:value="qualificationSelectorVisible"
      @select="selectQualification"
    />
  </div>
</template>

<script>
import { DeleteOutlined } from '@ant-design/icons-vue'
import { message, Modal } from 'ant-design-vue'
import ComHeader from '~/providers/components/comHeader/index.vue'
import { QualificationService } from '~/providers/providers/services/common-body-qualification'
import { SystemPropertyService } from '~/providers/providers/services/systemProperty'
import { TSBusinessParamControllerService } from '~/providers/providers/services/tSBusinessParamController'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'
import QualificationSelector2 from './QualificationSelector.vue'

const qualificationService = new QualificationService()
const systemPropertyService = new SystemPropertyService()
const tsBusinessParamControllerService = new TSBusinessParamControllerService()

export default {
  components: {
    ComHeader,
    QualificationSelector2,
    DeleteOutlined,
  },
  props: ['value', 'id'],
  emits: ['update:value', 'on-save'],
  data() {
    return {
      spinning: false,
      submitLoading: false,
      qualificationSelectorVisible: false,
      height: document.body.clientHeight,
      tableLoading: false,
      tableList: [],
      allTableList: [],
      selectType: undefined,
      typeList: [],
      content: '',
      contentId: null,
    }
  },
  computed: {
    contentKey() {
      return this.selectType === 'ALL'
        ? 'QUALIFICATION_STATEMENT_ALL_FORMAT'
        : 'QUALIFICATION_STATEMENT_AUTO_FORMAT'
    },
    _value: {
      get() {
        return this.value
      },
      set(newValue) {
        $emit(this, 'update:value', newValue)
      },
    },
    columns() {
      const _c = [
        {
          title: '序号',
          dataIndex: 'order',
          width: 60,
          align: 'center',
          customRender: ({ index }) => index + 1,
        },
        { title: '资质名称', width: 150, dataIndex: 'name', ellipsis: true },
        { title: '证书编号', width: 150, dataIndex: 'certificateNo', ellipsis: true },
        { title: '生效日期', width: 130, dataIndex: 'statementEnableDate' },
        { title: '失效日期', width: 130, dataIndex: 'statementExpiredDate' },
      ]

      if (this.selectType !== 'ALL') {
        _c.push({ title: '操作', dataIndex: 'Action', align: 'center', width: 65 })
      }

      return _c
    },
  },
  watch: {
    async _value(val) {
      if (val === true) {
        await this.getBusinessParam()
        this.getContent()
        this.getAutoStatementList()
      }
    },
  },
  methods: {
    async getBusinessParam() {
      const res
        = await tsBusinessParamControllerService.qualificationStatementType()
      this.typeList = res.data.selectTypes
      this.selectType = res.data.value
    },
    onChangeType() {
      this.getContent()
      this.getAutoStatementList()
    },
    async getContent() {
      this.content = ''
      this.contentId = null

      if (this.selectType === 'NONE') {
        return
      }

      this.spinning = true
      const res = await systemPropertyService
        .getKey(this.contentKey)
        .finally(() => {
          this.spinning = false
        })
      this.content
        = res.data.propertyValue || '本报告适用资质：[资质名称（证书编号）]'
      this.contentId = res.data.id
    },
    async selectQualification(rows) {
      const unAutoStatement = rows.filter(i => !i.autoStatement)

      this.tableLoading = true
      await Promise.all(
        unAutoStatement.map(i =>
          qualificationService.switcher('autoStatement', i.id),
        ),
      ).finally(() => {
        this.tableLoading = false
      })

      this.getAutoStatementList()
    },
    async getAutoStatementList() {
      if (!['PART', 'ALL'].includes(this.selectType)) {
        return
      }

      this.tableLoading = true
      const res = await qualificationService.pagination(1, 999).finally(() => {
        this.tableLoading = false
      })

      this.tableList = res.rows.filter(i => i.autoStatement)
      this.allTableList = res.rows.map(i => ({
        ...i,
        _statementEnableDate: i.statementEnableDate,
        _statementExpiredDate: i.statementExpiredDate,
      }))
    },
    async onSaveStatementDate(record, key) {
      const statementEnableDate = record.statementEnableDate
      const statementExpiredDate = record.statementExpiredDate

      if (statementEnableDate && statementExpiredDate) {
        if (key === 'statementEnableDate' && new Date(record.statementEnableDate).getTime() > new Date(statementExpiredDate).getTime()) {
          Modal.warning({
            title: '提示',
            content: '资质生效日期不能大于资质失效日期！',
          })
          record.statementEnableDate = record._statementEnableDate
          return
        }

        if (key === 'statementExpiredDate' && new Date(record.statementExpiredDate).getTime() < new Date(statementEnableDate).getTime()) {
          Modal.warning({
            title: '提示',
            content: '资质失效日期不能小于资质生效日期！',
          })
          record.statementExpiredDate = record._statementExpiredDate
          return
        }
      }

      await qualificationService.updateStatementDate({
        id: record.id,
        statementEnableDate,
        statementExpiredDate,
      })
      record[`_${key}`] = record[key]
      message.success('保存成功')
    },
    onAdd() {
      this.qualificationSelectorVisible = true
    },
    onDel(row) {
      window.$oAntdConfirm({
        title: '删除',
        content: `确认删除吗？`,
        okText: '确认',
        cancelText: '取消',
        onOk: async () => {
          await qualificationService.switcher('autoStatement', row.id)
          this.getAutoStatementList()
        },
      })
    },
    cancelModal() {
      $emit(this, 'update:value', false)
      this.content = ''
      this.contentId = null
    },
    async updateBusinessParam() {
      // eslint-disable-next-line unused-imports/no-unused-vars
      const res = await tsBusinessParamControllerService.updateBusinessParam({
        key: 'QUALIFICATION_STATEMENT_TYPE',
        value: this.selectType,
      })
    },
    async saveContent() {
      if (this.selectType === 'NONE') {
        return
      }

      // eslint-disable-next-line unused-imports/no-unused-vars
      const res = await systemPropertyService.save({
        id: this.contentId,
        propertyKey: this.contentKey,
        propertyValue: this.content,
      })
    },
    async handleSubmit() {
      if (
        this.selectType !== 'NONE'
        && !this.content.includes('[资质名称（证书编号）]')
      ) {
        window.$oAntdModal.warning({
          title: '提示',
          content:
            '资质声明内容中的“[资质名称（证书编号）]”为固定内容，请勿删除或修改，请检查后再提交！',
        })
        return
      }

      this.submitLoading = true
      await Promise.all([
        this.updateBusinessParam(),
        this.saveContent(),
      ]).finally(() => {
        this.submitLoading = false
      })

      this.cancelModal()
      $emit(this, 'on-save')
    },
  },
}
</script>
