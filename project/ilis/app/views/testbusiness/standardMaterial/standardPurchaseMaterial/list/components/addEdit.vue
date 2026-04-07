<template>
  <AppProvider>
    <div>
      <ht-modal
        width="1200px"
        :title="title"
        :open="visibleRules"
        :confirm-loading="confirmLoadingRules"
        :mask-closable="maskClosable"
        @ok="handleOk"
        @cancel="
          () => {
            handleCancel()
          }
        "
      >
        <a-form :self-update="true" style="width: 400px">
          <a-form-item v-bind="formItemLayout" label="申请人" class="required">
            <a-space>
              <a-input
                v-model:value="personFormat"
                placeholder="请选择申请人"
                readonly
                disabled
              />
              <a-button :disabled="isDetail" @click="selPersonFun()">
                选择
              </a-button>
            </a-space>
          </a-form-item>
          <a-form-item
            v-bind="formItemLayout"
            label="申请说明"
            class="required"
          >
            <a-input
              v-model:value="explains"
              :disabled="isDetail"
              placeholder="申请说明"
            />
          </a-form-item>
        </a-form>
        <a-button
          style="margin: 10px 0"
          :disabled="isDetail"
          @click="handleAdd"
        >
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
                placeholder="请输入规程名称"
              />
              <span v-else>{{ record.bookName }}</span>
            </template>

            <template v-if="column.dataIndex === 'publishCode'">
              <a-input
                v-if="record.isEdit"
                v-model:value="record.publishCode"
                placeholder="请输入颁布号"
              />
              <span v-else>{{ record.publishCode }}</span>
            </template>

            <template v-if="column.dataIndex === 'price'">
              <a-input-number
                v-if="record.isEdit"
                v-model:value="record.price"
                precision="2"
                :min="0"
                placeholder="请输入单价"
                @change="computeTotal(record)"
              />
              <span v-else>{{ record.price }}</span>
            </template>

            <template v-if="column.dataIndex === 'amount'">
              <a-input-number
                v-if="record.isEdit"
                v-model:value="record.amount"
                :min="0"
                :precision="0"
                placeholder="请输入数量"
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
                placeholder="请输入小计"
              />
              <span v-else>{{ record.total }}</span>
            </template>

            <template v-if="column.dataIndex === 'purpose'">
              <a-input
                v-if="record.isEdit"
                v-model:value="record.purpose"
                placeholder="请输入原因及用途"
              />
              <span v-else>{{ record.purpose }}</span>
            </template>

            <template v-if="column.dataIndex === 'actions'">
              <div class="table-handle">
                <a
                  v-if="!record.isEdit && !isDetail"
                  href="javascript:;"
                  @click="editRow(record)"
                >编辑</a>
                <a v-if="record.isEdit" href="javascript:;" @click="saveRow(record)">保存</a>
                <a
                  v-if="record.isEdit && !isDetail"
                  href="javascript:;"
                  @click="delRow(record, index)"
                >取消</a>
                <a
                  v-if="!record.isEdit && !isDetail"
                  href="javascript:;"
                  :disabled="isDetail"
                  :style="isDetail ? 'color:#ccc;' : 'color:red;'"
                  @click="delRow(record, index)"
                >删除</a>
              </div>
            </template>
          </template>
        </a-table>

        <TableTreePersonnel ref="TableTreePersonnel" :callback="getPerson" />
      </ht-modal>
    </div>
  </AppProvider>
</template>

<script>
/* eslint-disable eqeqeq */
import dayjs from 'dayjs'
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
      title: '',
      explains: '',
      selPersonData: [],
      dataSource: [],
      loading: false,
      expandedColumns,
      editId: '',
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
      editData: {},
      visibleRules: false,
      confirmLoadingRules: false,
      maskClosable: false,
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
  watch: {
    rangeId() {
      //
    },
  },
  created() {
    this.getTreeData()
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
    getTreeData() {
      // eslint-disable-next-line unused-imports/no-unused-vars
      const data = {
        // page: 1,
        // size: 9999,
        // queryParam: this.queryParam,
      }
      this.treeData = []
      window.$oAjax.get('rest/standardBookLocationController?list').then((res) => {
        if (res.code == '20000') {
          this.selectedKeys = []
          // this.getTreeDataCall(res.obj);

          this.treeData = res.data
          // #35562 需要让创建人才允许编辑
          // this.isDisabledEditManage();
        }
      })
    },
    showModal(echo, isDetail) {
      this.visibleRules = true
      if (echo) {
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
        this.isDetail = isDetail
        this.title = this.isDetail ? '详情' : '编辑'
      }
      else {
        this.isDetail = false
        this.title = '新增采购'
        this.editId = ''
        this.selPersonData = []
        this.explains = ''
        this.dataSource = []
      }
    },
    // getData() {
    //   // var self = this;
    //   var data = {
    //     id: this.rangeId,
    //   };
    //   window.$oAjax
    //     .get(window.$oApi.designGrade.rangeDetailUrl, {
    //       params: {
    //         ...data,
    //       },
    //     })
    //     .then((res) => {
    //       if (res.success) {
    //         this.editData = res.obj || {};
    //         this.typeId = res.obj.typeId;
    //       }
    //     });
    // },
    handleCancel() {
      this.visibleRules = false
      this.explains = ''
    },
    handleOk() {
      if (this.isDetail) {
        this.visibleRules = false
        return
      }
      // this.$refs.addeditchild.handleSubmit()
      if (!this.selPersonData.length) {
        window.$oAntdMessage.warning('请输入选择申请人')
        return
      }
      else if (!this.explains) {
        window.$oAntdMessage.warning('请输入申请说明')
        return
      }
      else if (!this.dataSource.length) {
        window.$oAntdMessage.warning('请添加采购规程')
        return
      }
      const falg = this.dataSource.some((it) => {
        return it.isEdit
      })
      if (falg) {
        window.$oAntdMessage.warning('存在编辑中的数据,请保存后在进行提交')
        return
      }

      const data = {
        applyPerson: this.selPersonData[0].name,
        applyPersonId: this.selPersonData[0].id,
        explains: this.explains,
        standardBookPurchaseDetailVos: this.dataSource,
      }

      if (this.editId) {
        data.id = this.editId
      }

      this.confirmLoadingRules = true
      window.$oAjax({
        method: 'POST',
        url: 'rest/standardBookPurchaseController?addOrEdit',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
        data: JSON.stringify(data),
      }).then((res) => {
        if (res && res.code == '20000') {
          window.$oAntdMessage.success(res.msg || '操作成功')
          this.visibleRules = false
          this.explains = ''
          this.editData = {}
          this.callback()
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.confirmLoadingRules = false
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
