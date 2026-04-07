<!-- eslint-disable vue/eqeqeq -->
<!-- eslint-disable vue/no-unused-refs -->
<!-- eslint-disable vue/valid-v-for -->
<template>
  <div>
    <ht-modal
      v-if="visible"
      :title="addEditTitle"
      centered
      :open="visible"
      :mask-closable="false"
      width="85%"
      :z-index="999"
      class="hitek-add-modal"
      @cancel="
        () => {
          visible = false
        }
      "
    >
      <div style="height: 600px; overflow: auto">
        <a-tabs v-model:active-key="tabActiveKey">
          <a-tab-pane key="1" tab="评价信息">
          </a-tab-pane>
          <a-tab-pane key="2" tab="供货信息" :disabled="!formData.supplierId">
          </a-tab-pane>
        </a-tabs>

        <a-spin :spinning="spinning">
          <a-form v-show="tabActiveKey == '1'" ref="formRef" style="width: 100%">
            <a-collapse v-model:active-key="activeKey">
              <a-collapse-panel key="1" header="供应商信息">
                <ul class="form_wrap">
                  <li class="required_row">
                    <a-form-item
                      label="供应商名称"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                    >
                      <a-select
                        v-model:value="formData.supplierId"
                        :disabled="isDetail"
                        placeholder="请选择供应商"
                        @change="handleChange"
                      >
                        <a-select-option
                          v-for="it in suppliersList"
                          :value="it.id"
                        >
                          {{ it.name }}
                        </a-select-option>
                      </a-select>
                    </a-form-item>
                  </li>
                  <li>
                    <a-form-item
                      label="供应商类型"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                    >
                      <a-input
                        :disabled="true"
                        :value="dictionaryEnum[selSupplierVal.type]"
                      />
                    </a-form-item>
                  </li>
                  <li>
                    <a-form-item
                      label="地址"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                    >
                      <a-input
                        v-model:value="selSupplierVal.site"
                        :disabled="true"
                      />
                    </a-form-item>
                  </li>

                  <li>
                    <a-form-item
                      label="邮箱"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                    >
                      <a-input
                        v-model:value="selSupplierVal.mail"
                        :disabled="true"
                      />
                    </a-form-item>
                  </li>

                  <li>
                    <a-form-item
                      label="邮编"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                    >
                      <a-input
                        v-model:value="selSupplierVal.postcode"
                        :disabled="true"
                      />
                    </a-form-item>
                  </li>

                  <li>
                    <a-form-item
                      label="联系人"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                    >
                      <a-input
                        v-model:value="selSupplierVal.contacts"
                        :disabled="true"
                      />
                    </a-form-item>
                  </li>

                  <li>
                    <a-form-item
                      label="联系电话"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                    >
                      <a-input
                        v-model:value="selSupplierVal.tel"
                        :disabled="true"
                      />
                    </a-form-item>
                  </li>

                  <li>
                    <a-form-item
                      label="经营内容"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                    >
                      <a-input
                        v-model:value="selSupplierVal.operationContent"
                        :disabled="true"
                      />
                    </a-form-item>
                  </li>
                  <li>
                    <a-form-item
                      label="备注"
                      :label-col="{ span: 8 }"
                      :wrapper-col="{ span: 16 }"
                    >
                      <a-input
                        v-model:value="selSupplierVal.remark"
                        :disabled="true"
                      />
                    </a-form-item>
                  </li>
                </ul>
              </a-collapse-panel>
              <a-collapse-panel key="2" header="评价内容">
                <template v-for="it in evaluationFieldConfig">
                  <a-form-item
                    v-if="it.status == 10"
                    :label="it.itemContent"
                    :label-col="{ span: 3 }"
                    :wrapper-col="{ span: 17 }"
                  >
                    <a-input
                      v-if="it.itemType == 'txt'"
                      v-model:value="it.assessItemResult"
                      style="width: 100%"
                      :disabled="isDetail"
                      placeholder="请输入"
                    />

                    <a-input-number
                      v-else-if="it.itemType == 'txt_num'"
                      v-model:value="it.assessItemResult"
                      style="width: 100%"
                      :disabled="isDetail"
                      placeholder="请输入"
                    />

                    <a-radio-group
                      v-else-if="it.itemType == 'radio'"
                      v-model:value="it.assessItemResult"
                      :disabled="isDetail"
                    >
                      <a-radio v-for="cit in it.candidateValue" :value="cit">
                        {{ cit }}
                      </a-radio>
                    </a-radio-group>

                    <a-checkbox-group
                      v-else-if="it.itemType == 'checkbox'"
                      v-model:value="it.assessItemResult"
                      :disabled="isDetail"
                    >
                      <a-checkbox v-for="cit in it.candidateValue" :value="cit">
                        {{ cit }}
                      </a-checkbox>
                    </a-checkbox-group>
                  </a-form-item>
                </template>
              </a-collapse-panel>
              <a-collapse-panel key="3" header="评价结论">
                <a-form-item
                  label="评价结果"
                  :label-col="{ span: 3 }"
                  :wrapper-col="{ span: 17 }"
                >
                  <a-radio-group
                    v-model:value="formData.assessResult"
                    :disabled="isDetail"
                  >
                    <a-radio value="准入供应商">
                      准入供应商
                    </a-radio>
                    <a-radio value="合格供应商">
                      合格供应商
                    </a-radio>
                    <a-radio value="不合格供应商">
                      不合格供应商
                    </a-radio>
                  </a-radio-group>
                </a-form-item>

                <a-form-item
                  label="评价意见"
                  :label-col="{ span: 3 }"
                  :wrapper-col="{ span: 17 }"
                >
                  <a-textarea
                    v-model:value="formData.assessOpinion"
                    :disabled="isDetail"
                    placeholder="支持输入250个汉字和标点符号!"
                    :max-length="250"
                    :rows="4"
                  />
                </a-form-item>
              </a-collapse-panel>
            </a-collapse>
          </a-form>

          <div v-show="tabActiveKey == '2'">
            <p style="margin-bottom: 10px">
              <a-button v-if="!isDetail" type="primary" @click="openEqList">
                选择
              </a-button>
            </p>
            <a-table
              :columns="tableColumns"
              :pagination="false"
              :data-source="supplierDeliveryList"
              bordered
              row-key="id"
            >
              <template #bodyCell="{ column, record }">
                <template v-if="column.dataIndex === 'operation' && !isDetail">
                  <span>
                    <a style="color: red" @click="(e) => deleteRow(e, record)">删除</a>
                  </span>
                </template>
              </template>
            </a-table>
          </div>
        </a-spin>
      </div>
      <template #footer>
        <div>
          <a-button v-if="!isDetail" @click="handleCancel">
            取消
          </a-button>
          <a-button
            v-if="!isDetail"
            type="primary"
            :loading="spinning"
            @click="handleSaveOk"
          >
            确定
          </a-button>
          <a-button v-if="isDetail" @click="handleCancel">
            关闭
          </a-button>
        </div>
      </template>
    </ht-modal>

    <SelectEquip ref="SelectEquip" :callback="getEquip" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import SelectEquip from '~/providers/components/equip/selectEquip.vue'

const columns = [
  {
    title: '化学品名称编号',
    dataIndex: 'sn',
  },
  {
    title: '化学名称',
    dataIndex: 'name',
  },
  {
    title: '管理等级',
    dataIndex: 'manageLevel',
  },
  {
    title: '计量单位',
    dataIndex: 'unit',
  },
  {
    title: '[单位体积（质量)] 掺量',
    dataIndex: 'blendAmount',
  },
  {
    title: '实际使用数量',
    dataIndex: 'totalAmount',
    scopedSlots: { customRender: 'totalAmount' },
  },
]

export default {
  components: { SelectEquip },
  props: ['callback'],
  data() {
    return {
      tableColumns: [
        {
          title: '供货内容',
          dataIndex: 'eqName',
        },
        {
          title: '管理编号',
          dataIndex: 'archiveSn',
        },
        {
          title: '规格型号',
          dataIndex: 'standard',
        },
        {
          title: '量程',
          dataIndex: 'eqRange',
        },
        {
          title: '精度',
          dataIndex: 'eqAccuracy',
        },
        {
          title: '供货日期',
          dataIndex: 'buyDate',
        },
        {
          title: '验收日期',
          dataIndex: 'acceptanceDate',
        },
        {
          title: '验收结果',
          dataIndex: 'acceptanceStatus',
        },
        {
          title: '操作',
          dataIndex: 'operation',
          width: 125,
          scopedSlots: { customRender: 'operation' },
        },
      ],
      supplierDeliveryList: [],
      tabActiveKey: '1',
      evaluationFieldConfig: [],
      dictionaryEnum: {},
      suppliersList: [],
      selSupplierVal: {},
      id: '',
      editType: 1, // 1 新增  2 修改
      addEditTitle: '新增',
      visible: false,
      data: [],
      activeKey: [1, 2, 3],
      spinning: false,
      isDetail: false,
      dayjs,
      columns,
      customFields: [],
      formData: {
        assessResult: '',
        assessOpinion: '',
        supplierId: null,
        id: '',
        assessItemResultList: [],
      },
    }
  },
  computed: {},
  created() {
    this.init()
    this.getSupplierTypeByDict()
  },
  methods: {
    openEqList() {
      const acceptData = []
      this.$refs.SelectEquip.showModal('checkbox', acceptData)
    },
    // 选择设备 回显
    getEquip(acceptData) {
      if (!acceptData.length) {
        window.$oAntdMessage.warning('没有选择设备!')
        return
      }
      this.spinning = true
      const eqIds = acceptData.map((it) => {
        return it.id
      })
      window.$oAjax
        .post(
          'rest/supplierController/add/equipment',
          {
            supplierId: this.selSupplierVal.id,
            equipmentIds: eqIds,
          },
          {
            headers: {
              'Content-Type': 'application/json; charset=UTF-8',
            },
          },
        )
        .then((res) => {
          this.spinning = false
          if (res.code === 20000) {
            window.$oAntdMessage.success('添加成功')
            this.getSupplierSupply(this.selSupplierVal.id)
          }
        })
    },
    init() {},
    handleChange(v) {
      this.suppliersList.forEach((it) => {
        if (v == it.id) {
          this.selSupplierVal = it

          this.getSupplierSupply(v)
        }
      })
    },
    // 获取供应商类型字典
    async getSupplierTypeByDict() {
      await window.$oAjax
        .get(
          '/dictionaryController.do?getListByGroupId&dictGroupId=a85c02db699e11ee920650ebf6ecba75',
        )
        .then((res) => {
          if (res.success) {
            res.obj.forEach((it) => {
              this.dictionaryEnum[it.typecode] = it.typename
            })
          }
        })
    },

    // 获取评价自定义字段
    async getEvaluateConfigData() {
      this.spinning = true
      const r = await window.$oAjax
        .get(`/rest/supplier/assess/item/list`, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          this.spinning = false
          if (res.code === 20000) {
            const arr = res.data.map((it) => {
              it.assessItemResult = ''
              if (it.itemType == 'radio' || it.itemType == 'checkbox') {
                it.candidateValue = it.candidateValue.split(',')
                if (it.itemType == 'checkbox') {
                  it.assessItemResult = []
                }
              }
              return it
            })
            // this.evaluationFieldConfig = arr;
            this.evaluationFieldConfig = arr
          }
          else {
            this.data = []
          }
          this.spinning = false
        })

      return r
    },
    // 打开编辑弹窗
    async openModel(id, isDetail) {
      this.clearForm()
      this.isDetail = isDetail
      this.visible = true
      this.getAllSuppliers()
      await this.getEvaluateConfigData()

      if (id) {
        this.id = id
        this.addEditTitle = '编辑'
        if (isDetail) {
          this.addEditTitle = '详情'
        }
        this.editType = 2
        window.$oAjax.get(`/rest/supplier/assess/detail/${id}`).then((res) => {
          if (res.code === 20000) {
            this.formData = res.data
            res.data.assessItemResult.forEach((it1) => {
              this.evaluationFieldConfig.forEach((it2) => {
                if (it1.supplierAssessItemId == it2.id) {
                  if (
                    it2.itemType == 'checkbox'
                    && typeof it1.assessItemResult == 'string'
                  ) {
                    it2.assessItemResult = it1.assessItemResult.split(',')
                  }
                  else {
                    it2.assessItemResult = it1.assessItemResult
                  }
                }
              })
            })
            // this.evaluationFieldConfig.forEach((it) => {
            //
            //
            //
            // });

            this.handleChange(res.data.supplierId)
          }
        })
      }
      else {
        this.addEditTitle = '新增'
      }
    },
    // 获取供应商供货信息
    getSupplierSupply(id) {
      this.spinning = true
      window.$oAjax
        .get(`/rest/supplierController/supply?id=${id}`, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          this.spinning = false
          if (res.code === 20000) {
            this.supplierDeliveryList = res.data
            // this.evaluationFieldConfig = arr;
          }
          else {
            this.supplierDeliveryList = []
          }
          this.spinning = false
        })
    },
    deleteRow(e, row) {
      window.$oAjax
        .post(
          'rest/supplierController/remove/equipment',
          {
            supplierId: this.selSupplierVal.id,
            equipmentIds: [row.eqId],
          },
          {
            headers: {
              'Content-Type': 'application/json; charset=UTF-8',
            },
          },
        )
        .then((res) => {
          if (res.code === 20000) {
            window.$oAntdMessage.success('删除成功')
            this.getSupplierSupply(this.selSupplierVal.id)
          }
        })
    },
    clearForm() {
      this.isDetail = false
      this.id = ''
      this.formData = {
        assessResult: '',
        assessOpinion: '',
        supplierId: null,
        id: '',
        assessItemResultList: [],
      }
      this.selSupplierVal = {}
      this.tabActiveKey = '1'
      this.supplierDeliveryList = []
    },
    // async dictionary(type) {
    //   let res = await window.$oAjax.post(
    //     window.$oApi.common.getDictionaryData,
    //     qs.stringify({
    //       dictGroupId: type,
    //     })
    //   );
    //   return res;
    // },

    handleCancel() {
      this.visible = false
    },

    // 获取所有供应商
    async getAllSuppliers() {
      const res = await window.$oAjax.post(
        'rest/supplierController.do?datagrid',
        {
          page: 1,
          rows: 999999,
        },
        {
          headers: {
            'content-type': 'application/json',
          },
        },
      )
      this.suppliersList = res.rows
    },

    // 保存数据
    async handleSaveOk() {
      if (!this.formData.supplierId) {
        window.$oAntdMessage.warning('请选择供应商名称!')
        return
      }
      this.spinning = true
      const p1 = this.evaluationFieldConfig.map((it) => {
        // if (it.itemType == "checkbox" || it.itemType == "radio") {
        //
        // }
        return {
          supplierAssessItemId: it.id,
          assessItemResult:
            it.itemType == 'checkbox' && Array.isArray(it.assessItemResult)
              ? it.assessItemResult.join(',')
              : it.assessItemResult,
        }
      })
      this.formData.assessItemResultList = p1
      const res = await window.$oAjax({
        method: this.formData.id ? 'put' : 'post',
        url: 'rest/supplier/assess',
        data: this.formData,
        headers: {
          'content-type': 'application/json',
        },
      })
      this.spinning = false
      if (res.code === 20000) {
        window.$oAntdMessage.success('操作成功')
        this.visible = false
        this.callback()
      }
      else {
        window.$oAntdMessage.warning(res.message)
      }
    },
  },
}
</script>

<style lang="less">
.form_wrap {
  li {
    display: inline-block;
    width: 360px;
    height: 45px;
  }
  .required_row .ant-form-item-label:before {
    content: '*';
    color: #c30000;
    margin-right: 5px;
  }
}
</style>

<style>
/* .hitek-add-modal .ant-modal-body {
  max-height: calc(100vh - 180px) !important;
  min-height: 300px !important;
} */
.ant-collapse > .ant-collapse-item > .ant-collapse-header {
  line-height: 15px !important;
}
.show-required {
  position: absolute;
  right: 40px;
  top: 65px;
  z-index: 100;
}

.required_row .ant-form-item-label:before {
  content: '*';
  color: #c30000;
  margin-right: 5px;
}
</style>
