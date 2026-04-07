<!-- eslint-disable vue/no-unused-refs -->
<template>
  <AppProvider>
    <div style="padding: 20px">
      <a-form ref="formRef" :self-update="true" style="width: 400px">
        <a-form-item v-bind="formItemLayout" label="申请人" class="required">
          <a-input
            v-model:value="personFormat"
            placeholder="请选择申请人"
            style="width: 80%; vertical-align: bottom; margin-right: 12px"
            readonly
            disabled
          />
          <a-button :disabled="isDetail" @click="selPersonFun()">
            选择
          </a-button>
        </a-form-item>
        <a-form-item v-bind="formItemLayout" label="申请说明" class="required">
          <a-input
            v-model:value="explains"
            :disabled="isDetail"
            placeholder="申请说明"
          />
        </a-form-item>
      </a-form>
      <a-button style="margin: 10px 0" :disabled="isDetail" @click="handleAdd">
        添加
      </a-button>
      <a-table
        :bordered="true"
        :columns="expandedColumns"
        :data-source="dataSource"
        row-key="id"
        :loading="loading"
        :pagination="false"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.dataIndex === 'bookName'">
            <a-input
              v-if="record.isEdit"
              v-model:value="record.bookName"
              placeholder="请输入"
            />
            <span v-else>{{ record.bookName }}</span>
          </template>

          <template v-if="column.dataIndex === 'bookName'">
            <a-input
              v-if="record.isEdit"
              v-model:value="record.publishCode"
              placeholder="请输入"
            />
            <span v-else>{{ record.publishCode }}</span>
          </template>

          <template v-if="column.dataIndex === 'price'">
            <a-input-number
              v-if="record.isEdit"
              v-model:value="record.price"
              precision="2"
              :min="0"
              placeholder="请输入"
              @change="computeTotal(record)"
            />
            <span v-else>{{ record.price }}</span>
          </template>

          <template v-if="column.dataIndex === 'amount'">
            <a-input-number
              v-if="record.isEdit"
              v-model:value="record.amount"
              :min="0"
              precision="0"
              placeholder="请输入"
              @change="computeTotal(record)"
            />
            <span v-else>{{ record.amount }}</span>
          </template>

          <template v-if="column.dataIndex === 'total'">
            <a-input-number
              v-if="record.isEdit"
              v-model:value="record.total"
              disabled
              :min="0"
              placeholder="请输入"
            />
            <span v-else>{{ record.total }}</span>
          </template>

          <template v-if="column.dataIndex === 'purpose'">
            <a-input
              v-if="record.isEdit"
              v-model:value="record.purpose"
              placeholder="请输入"
            />
            <span v-else>{{ record.purpose }}</span>
          </template>

          <template v-if="column.dataIndex === 'actions'">
            <a
              v-if="!record.isEdit"
              href="javascript:;"
              :disabled="isDetail"
              @click="editRow(record)"
            >编辑</a>
            <a v-if="record.isEdit" href="javascript:;" @click="saveRow(record)">保存</a>
            <a
              href="javascript:;"
              :disabled="isDetail"
              :style="isDetail ? 'color:#ccc;' : 'color:red;'"
              @click="delRow(record, index)"
            >删除</a>
          </template>
        </template>
      </a-table>

      <TableTreePersonnel ref="TableTreePersonnel" :callback="getPerson" />
    </div>
  </AppProvider>
</template>

<script>
import dayjs from 'dayjs'
import { getQueryVariable } from '~/providers/common/utils'
import TableTreePersonnel from '~/providers/components/tableTreePersonnel.vue'

const expandedColumns = [
  {
    title: '规程名称',
    dataIndex: 'bookName',
    scopedSlots: { customRender: 'bookName' },
  },
  {
    title: '颁布号',
    dataIndex: 'publishCode',
    scopedSlots: { customRender: 'publishCode' },
  },
  {
    title: '单价/元',
    dataIndex: 'price',
    scopedSlots: { customRender: 'price' },
  },
  {
    title: '数量',
    dataIndex: 'amount',
    scopedSlots: { customRender: 'amount' },
  },
  {
    title: '小计',
    dataIndex: 'total',
    scopedSlots: { customRender: 'total' },
  },
  {
    title: '原因及用途',
    dataIndex: 'purpose',
    scopedSlots: { customRender: 'purpose' },
  },
  {
    title: '操作',
    dataIndex: 'actions',
    align: 'center',
    scopedSlots: { customRender: 'actions' },
    width: '120px',
  },
]

export default {
  name: 'AddEdit',
  components: { TableTreePersonnel },
  props: ['typeId', 'rangeId', 'callback'],
  data() {
    return {
      isDetail: false,
      explains: '',
      selPersonData: [],
      dataSource: [],
      loading: false,
      expandedColumns,
      editId: getQueryVariable('standardBookPurchaseId'),
      selLocation: {},
      treeData: [],
      dayjs,
      formItemLayout: {
        labelCol: {
          xs: { span: 5 },
          sm: { span: 5 },
        },
        wrapperCol: {
          xs: { span: 18 },
          sm: { span: 18 },
        },
      },

    }
  },
  computed: {
    // 计算属性的 getter
    personFormat() {
      const nameArr = this.selPersonData.map((it) => {
        return it.name
      })
      return nameArr.join()
    },
  },
  created() {
    this.getDetailsData()
  },
  methods: {
    getPerson(idsPerson, acceptData) {
      this.selPersonData = acceptData
    },
    selPersonFun() {
      // this.$refs.TableTreePersonnel.showModal(type, idsPerson, acceptData, title);
      this.$refs.TableTreePersonnel.showModal(
        'radio',
        '',
        this.selPersonData,
        '选择人员',
      )
    },
    saveRow(row) {
      if (!row.bookName) {
        window.$oAntdMessage.warning('请输入规程名称!')
        return
      }
      else if (!row.publishCode) {
        window.$oAntdMessage.warning('请输入颁布号!')
        return
      }
      row.isEdit = false
    },
    editRow(row) {
      const falg = this.dataSource.some((it) => {
        return it.isEdit
      })
      if (falg) {
        window.$oAntdMessage.warning('存在编辑中的数据!')
        return
      }
      row.isEdit = true
    },
    handleAdd() {
      const falg = this.dataSource.some((it) => {
        return it.isEdit
      })
      if (falg) {
        window.$oAntdMessage.warning('存在编辑中的数据!')
        return
      }

      this.dataSource.push({
        isEdit: true,
        bookName: '',
        publishCode: '',
        price: 0,
        amount: 0,
        total: 0,
        purpose: '',
      })
    },
    delRow(row, index) {
      this.dataSource.splice(index, 1)
    },
    computeTotal(row) {
      row.total = row.price * row.amount
    },
    getDetailsData() {
      window.$oAjax
        .get(
          `rest/standardBookPurchaseController.do?getDetail&bookPurchaseId=${this.editId}`,
        )
        .then((res) => {
          if (res.code == '20000') {
            const echo = res.data
            this.selPersonData = [
              {
                id: echo.applyPersonId,
                name: echo.applyPerson,
              },
            ]
            this.explains = echo.explains
            this.editId = echo.id

            this.dataSource = []
            echo.standardBookPurchaseDetailVos.forEach((it) => {
              it.isEdit = false
              this.dataSource.push(JSON.parse(JSON.stringify(it)))
            })
            this.isDetail = true
          }
        })
    },
  },
}
</script>

<style scoped>
.required label::before {
  content: '*';
  color: red;
}
</style>
