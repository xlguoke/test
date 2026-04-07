<template>
  <div>
    <ht-modal
      v-if="visible"
      :title="addEditTitle"
      centered
      :open="visible"
      :mask-closable="false"
      width="80%"
      class="hitek-add-modal"
      @cancel="
        () => {
          visible = false
        }
      "
    >
      <a-spin :spinning="spinning">
        <a-form ref="formRef" style="width: 100%" :model="formData">
          <a-collapse v-model:active-key="activeKey">
            <a-collapse-panel key="1" header="基本信息">
              <ul class="form_wrap">
                <li>
                  <a-form-item
                    label="出库批号"
                    :label-col="{ span: 8 }"
                    :wrapper-col="{ span: 16 }"
                  >
                    <a-input
                      v-model:value="formData.batchSn"
                      :disabled="true"
                      placeholder="暂存后自动生成出库批号"
                    />
                  </a-form-item>
                </li>
                <li>
                  <a-form-item
                    label="出库类型"
                    :label-col="{ span: 8 }"
                    :wrapper-col="{ span: 16 }"
                    name="type"
                    :rules="[{ required: true, message: `请输入` }]"
                  >
                    <a-select
                      v-model:value="formData.type"
                      :disabled="isDetail"
                      placeholder="请选择"
                    >
                      <a-select-option value="检测申领">
                        检测申领出库
                      </a-select-option>
                      <a-select-option value="配置溶液">
                        配置溶液出库
                      </a-select-option>
                      <a-select-option value="失效">
                        失效出库
                      </a-select-option>
                      <a-select-option value="调拨">
                        调拨出库
                      </a-select-option>
                      <!-- <a-select-option value="配置溶液直接使用"
                          >配置溶液直接使用出库
                        </a-select-option> -->
                    </a-select>
                  </a-form-item>
                </li>

                <li>
                  <a-form-item
                    label="预计出库日期"
                    :label-col="{ span: 8 }"
                    :wrapper-col="{ span: 16 }"
                    name="planOutboundDate"
                    :rules="[{ required: true, message: `请选择` }]"
                  >
                    <a-date-picker
                      v-model:value="formData.planOutboundDate"
                      :disabled="isDetail"
                      placeholder="请选择"
                      style="width: 100%"
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD"
                    />
                  </a-form-item>
                </li>

                <li>
                  <a-form-item
                    label="预计归还日期"
                    :label-col="{ span: 8 }"
                    :wrapper-col="{ span: 16 }"
                  >
                    <a-date-picker
                      v-model:value="formData.planReturnDate"
                      :disabled="isDetail"
                      placeholder="请选择"
                      style="width: 100%"
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD"
                    />
                  </a-form-item>
                </li>

                <li>
                  <a-form-item
                    label="领取部门"
                    :label-col="{ span: 8 }"
                    :wrapper-col="{ span: 16 }"
                    name="receiveDepartId"
                    :rules="[{ required: true, message: `请选择` }]"
                  >
                    <a-tree-select
                      v-model:value="formData.receiveDepartId"
                      :disabled="isDetail"
                      :dropdown-style="{ maxHeight: '405px', overflow: 'auto' }"
                      placeholder="请选择部门"
                      allow-clear
                      :tree-data="departmentData"
                      tree-default-expand-all
                      @change="depChange"
                    />
                  </a-form-item>
                </li>

                <li class="required_row">
                  <a-form-item
                    label="领取人"
                    :label-col="{ span: 8 }"
                    :wrapper-col="{ span: 16 }"
                  >
                    <div style="display: flex; justify-content: space-between">
                      <!-- <span v-for="item in selReceivePerson" :key="item.id">
                          {{ item.name }}
                        </span> -->
                      <a-input
                        v-model:value="personFormatForDraw"
                        placeholder="请选择"
                        readonly
                        disabled
                        style="width: 80%"
                      />
                      <a-button :disabled="isDetail" @click="selPersonFun(1)">
                        选择
                      </a-button>
                    </div>
                  </a-form-item>
                </li>

                <li class="required_row">
                  <a-form-item
                    label="出库人"
                    :label-col="{ span: 8 }"
                    :wrapper-col="{ span: 16 }"
                  >
                    <div style="display: flex; justify-content: space-between">
                      <!-- <span v-for="item in selStockPerson" :key="item.id">
                          {{ item.name }}
                        </span> -->
                      <a-input
                        v-model:value="personFormatForStock"
                        placeholder="请选择"
                        readonly
                        disabled
                        style="width: 80%"
                      />
                      <a-button :disabled="isDetail" @click="selPersonFun(2)">
                        选择
                      </a-button>
                    </div>
                  </a-form-item>
                </li>

                <li>
                  <a-form-item
                    label="实际出库日期"
                    :label-col="{ span: 8 }"
                    :wrapper-col="{ span: 16 }"
                    name="outboundDate"
                    :rules="[{ required: true, message: `请选择` }]"
                  >
                    <a-date-picker
                      v-model:value="formData.outboundDate"
                      :disabled="isDetail"
                      placeholder="请选择"
                      style="width: 100%"
                      format="YYYY-MM-DD"
                      value-format="YYYY-MM-DD"
                    />
                  </a-form-item>
                </li>

                <li>
                  <a-form-item
                    label="关联任务"
                    :label-col="{ span: 8 }"
                    :wrapper-col="{ span: 16 }"
                  >
                    <div style="display: flex; justify-content: space-between">
                      <!-- <span v-for="item in selTaskData" :key="item.id">
                          {{ item.testTaskCode }}
                        </span> -->
                      <a-input
                        v-model:value="formatForTask"
                        placeholder="请选择"
                        readonly
                        disabled
                        style="width: 80%"
                      />

                      <a-button :disabled="isDetail" @click="selTaskFun()">
                        选择
                      </a-button>
                    </div>
                  </a-form-item>
                </li>
                <li>
                  <a-form-item
                    label="备注"
                    :label-col="{ span: 8 }"
                    :wrapper-col="{ span: 16 }"
                  >
                    <a-input
                      v-model:value="formData.remark"
                      :disabled="isDetail"
                      placeholder="请输入"
                    />
                  </a-form-item>
                </li>
              </ul>
            </a-collapse-panel>
            <a-collapse-panel key="2" header="配置化学用品">
              <a-button
                style="margin-bottom: 8px"
                :disabled="isDetail"
                @click="handleAddChemicals"
              >
                添加
              </a-button>
              <a-table
                :columns="columns"
                :data-source="selChemicalsData"
                :pagination="false"
                row-key="chemicalId"
              >
                <template #bodyCell="{ column, record }">
                  <template v-if="column.dataIndex === 'stockNum'">
                    <a-input-number
                      v-model:value="record.stockNum"
                      :min="0"
                      :disabled="isDetail"
                    />
                  </template>
                  <template v-if="column.dataIndex === 'remain'">
                    <span>{{ record.amount }}</span>
                  </template>
                  <template v-if="column.dataIndex === 'actions'">
                    <a
                      :disabled="isDetail"
                      href="javascript:;"
                      @click="onChemicalsRemove(record)"
                    >移除</a>
                  </template>
                </template>
              </a-table>
            </a-collapse-panel>
          </a-collapse>
        </a-form>
      </a-spin>

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
            暂存
          </a-button>
          <a-button
            v-if="!isDetail"
            type="primary"
            :loading="spinning"
            @click="handleShipmentOk"
          >
            领用出库
          </a-button>
        </div>
      </template>
    </ht-modal>

    <ht-modal
      title="选择关联任务"
      centered
      :open="taskVisible"
      width="60%"
      :z-index="999999"
      @cancel="cancelModal"
      @ok="getTask"
    >
      <iframe
        v-if="taskVisible"
        id="taskVisible"
        style="border: 0"
        width="100%"
        height="400px"
        :src="`${taskVisibleUrl}&testPersons=${selReceivePerson?.map(item => item.id).join(',')}`"
      ></iframe>
    </ht-modal>

    <TableTreePersonnel ref="TableTreePersonnel" :callback="getPerson" />
    <SelInventoryChemicals ref="selChemicalsRef" :callback="getChemicalsData" />

    <PutStorage ref="putStorageRef" :callback="putStorageCallBack" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import qs from 'qs'
import getDepartmentData from '~/providers/api/getDepartment'
import TableTreePersonnel from '~/providers/components/tableTreePersonnel.vue'
import { rootUrl } from '~/providers/configs/rootUrl'
import PutStorage from './putStorage.vue'
import SelInventoryChemicals from './selInventoryChemicals.vue'

const columns = [
  {
    title: '化学品编号',
    dataIndex: 'sn',
  },
  {
    title: '品名',
    dataIndex: 'categoryName',
  },
  {
    title: '用途',
    dataIndex: 'effect',
  },

  {
    title: '纯度',
    dataIndex: 'purity',
  },
  {
    title: '浓度',
    dataIndex: 'concentration',
  },
  {
    title: '计量单位',
    dataIndex: 'unit',
  },
  {
    title: '可用余量',
    dataIndex: 'amount',
  },
  {
    title: '出库数量',
    dataIndex: 'stockNum',
    scopedSlots: { customRender: 'stockNum' },
  },
  {
    title: '操作',
    dataIndex: 'actions',
    scopedSlots: { customRender: 'actions' },
  },
]

export default {
  components: { TableTreePersonnel, SelInventoryChemicals, PutStorage },
  props: ['callback'],
  data() {
    return {
      selTaskData: [],
      taskVisibleUrl: `${rootUrl}/reportCreateController.do?goRelationTaskChoosePage`,
      taskVisible: false,
      selStockPerson: [],
      selReceivePerson: [],
      selPersonType: '',
      departmentData: [],
      selPersonData: [],
      chemicalsMingle: [],
      id: '',
      editType: 1, // 1 新增  2 修改
      fileList: [],
      uploadUrl: `${rootUrl}/uploadController.do?upload`,
      addEditTitle: '新增',
      visible: false,
      data: [],
      activeKey: [1, 2, 3],
      spinning: false,
      isDetail: false,
      dayjs,
      columns,
      dataSource: [],
      customFields: [],
      formData: {
        categoryName: '',
        categoryId: '',
      },
      selPersonData: [],
      measurementUnit: [],
      safetyType: [],
      featureType: [],
      levelList: [],

      selManageLeve: {},
      selChemicalsData: [],
    }
  },
  computed: {
    // 计算属性的 getter
    personFormatForDraw() {
      const nameArr = this.selReceivePerson.map((it) => {
        return it.name
      })
      return nameArr.join()
    },

    formatForTask() {
      const nameArr = this.selTaskData.map((it) => {
        return it.testTaskCode
      })
      return nameArr.join()
    },

    personFormatForStock() {
      const nameArr = this.selStockPerson.map((it) => {
        return it.name
      })
      return nameArr.join()
    },
  },
  created() {
    this.init()
  },
  methods: {
    init() {
      // this.dictionary("chemical_measurement_unit_id").then((res) => {
      //   this.measurementUnit = res.obj;
      // });
      // this.dictionary("chemical_safety_type_id").then((res) => {
      //   this.safetyType = res.obj;
      // });
      // this.dictionary("chemical_feature_id").then((res) => {
      //   this.featureType = res.obj;
      // });
      // this.getLevelList();

      // 获取部门下拉数据
      getDepartmentData().then((res) => {
        this.departmentData = res
      })
    },
    handleAddChemicals() {
      this.$refs.selChemicalsRef.showModal(
        'checkbox',
        this.selChemicalsData.map((it) => {
          return {
            ...it,
            id: it.chemicalId,
          }
        }),
      )
    },
    depChange(v, option) {
      this.selDepartment = {
        id: v,
        name: option[0],
      }
    },
    selTaskFun() {
      this.taskVisible = true
    },

    // 获取关联任务
    getTask() {
      const data = document
        .getElementById('taskVisible')
        .contentWindow
        .$('#dataGrid')
        .datagrid('getSelections')
      this.taskVisible = false

      this.selTaskData = data
    },
    cancelModal() {
      this.eqVisible = false
      this.taskVisible = false
    },

    async openModel(id, isDetail) {
      this.isDetail = isDetail
      this.clearForm()
      this.visible = true
      this.addEditTitle = '新增'
      if (id) {
        this.id = id
        this.addEditTitle = '编辑'
        if (isDetail) {
          this.addEditTitle = '详情'
        }
        this.editType = 2
        const res = await window.$oAjax.get(`/rest/chemical/inventory/out/${id}`)
        if (res.code === 20000) {
          const baseData = res.data[0]
          this.formData = baseData

          if (baseData.receiverIds) {
            baseData.receiverIds.split(',').forEach((it, index) => {
              this.selReceivePerson.push({
                name: baseData.receivers.split(',')[index],
                id: it,
              })
            })
          }
          if (baseData.outboundPersonIds) {
            baseData.outboundPersonIds.split(',').forEach((it, index) => {
              this.selStockPerson.push({
                name: baseData.outboundPersons.split(',')[index],
                id: it,
              })
            })
          }
          if (baseData.receiveDepartId) {
            this.selDepartment = {
              id: baseData.receiveDepartId,
              name: baseData.receiveDepart,
            }
          }

          if (baseData.taskRelations && baseData.taskRelations.length) {
            this.selTaskData = [...baseData.taskRelations]
          }

          this.selChemicalsData = res.data.map((it) => {
            it.chemical.stockNum = it.amount
            it.chemical.id = it.id
            it.chemical.chemicalId = it.chemicalId
            return JSON.parse(JSON.stringify(it.chemical))
          })

          // if (res.data.attachments.length) {
          //   this.fileList = res.data.attachments.map((it) => {
          //     return {
          //       uid: it.id,
          //       name: it.attachmenttitle,
          //       status: "done",
          //       response: {
          //         success: true,
          //         obj: [it],
          //       },
          //       url: it.realpath,
          //     };
          //   });
          // }
        }
      }
    },
    clearForm() {
      this.id = ''
      this.formData = {}
      this.selChemicalsData = []
      this.selStockPerson = []
      this.selReceivePerson = []
      this.selTaskData = []
      this.activeKey = [1, 2, 3]
    },
    async dictionary(type) {
      const res = await window.$oAjax.post(
        window.$oApi.common.getDictionaryData,
        qs.stringify({
          dictGroupId: type,
        }),
      )
      return res
    },
    async getLevelList() {
      window.$oAjax
        .get(`/rest/chemical/level/all`, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          if (res.code == '20000') {
            this.levelList = res.data
          }
        })
    },

    changeManageLeve(value, option) {
      this.selManageLeve = option.data.attrs.data
    },

    selPersonFun(t) {
      // this.$refs.TableTreePersonnel.showModal(type, idsPerson, acceptData, title);
      this.selPersonType = t // 1 为领取人 2，出库人

      const echo = t == 1 ? this.selReceivePerson : this.selStockPerson

      this.$refs.TableTreePersonnel.showModal('', '', echo, '选择人员')
    },
    handleCancel() {
      this.visible = false
    },
    formDataFormat(callback) {
      this.$refs.formRef.validateFields().then(() => {
        const data = { ...this.formData }

        if (this.selDepartment.id) {
          data.receiveDepart = this.selDepartment.name
          data.receiveDepartId = this.selDepartment.id
        }
        else {
          window.$oAntdMessage.warning('请选择领取部门')
          return
        }

        if (this.selReceivePerson.length) {
          const nameArr = []
          const idArr = []
          this.selReceivePerson.forEach((it) => {
            nameArr.push(it.name)
            idArr.push(it.id)
          })
          data.receivers = nameArr.join()
          data.receiverIds = idArr.join()
        }
        else {
          window.$oAntdMessage.warning('请选择领取人')
          return
        }

        if (this.selStockPerson.length) {
          const nameArr = []
          const idArr = []
          this.selStockPerson.forEach((it) => {
            nameArr.push(it.name)
            idArr.push(it.id)
          })
          data.outboundPersons = nameArr.join()
          data.outboundPersonIds = idArr.join()
        }
        else {
          window.$oAntdMessage.warning('请选择出库人')
          return
        }

        if (this.selTaskData.length) {
          data.taskRelations = this.selTaskData.map((it) => {
            return {
              testTaskId: it.id,
              testTaskCode: it.testTaskCode,
            }
          })
        }

        if (!this.selChemicalsData.length) {
          window.$oAntdMessage.warning('请选择出库化学品')
        }
        else {
          const dataArr = this.selChemicalsData.map((it) => {
            return {
              ...data,
              chemicalId: it.chemicalId,
              id: it.id,
              amount: it.stockNum,
            }
          })

          callback && callback(dataArr)
        }
      })
    },
    handlePutStorageOk() {
      this.formDataFormat(async (data) => {
        this.$refs.putStorageRef.openModel(data)
      })
    },

    handleShipmentOk() {
      // eslint-disable-next-line ts/no-this-alias
      const that = this
      this.formDataFormat(async (data) => {
        window.$oAntdConfirm({
          title: '是否将已选化学品直接领用出库？',
          content:
            '领用出库后，已选化学品将自动在系统中完成入库、出库记录且出库数量等于入库数量，不需要审批。',
          async onOk() {
            let idArr = []
            that.spinning = true
            const res1 = await window.$oAjax.post(
              'rest/chemical/inventory/out/save',
              data,
              {
                headers: {
                  'content-type': 'application/json',
                },
              },
            )
            that.spinning = false
            if (res1.code == 20000) {
              idArr = res1.data
            }
            else {
              window.$oAntdMessage.warning(res1.message)
              return
            }

            that.spinning = true
            const res = await window.$oAjax.post(
              'rest/chemical/inventory/out/outbound',
              idArr,
              {
                headers: {
                  'content-type': 'application/json',
                },
              },
            )
            that.spinning = false
            if (res.code === 20000) {
              window.$oAntdMessage.success('操作成功')
              that.visible = false
              that.callback()
            }
            else {
              window.$oAntdMessage.warning(res.message)
            }
          },
          onCancel() {},
        })
      })
    },
    handleSaveOk() {
      this.formDataFormat(async (data) => {
        this.spinning = true
        const res = await window.$oAjax.post(
          'rest/chemical/inventory/out/save',
          data,
          {
            headers: {
              'content-type': 'application/json',
            },
          },
        )
        this.spinning = false
        if (res.code === 20000) {
          window.$oAntdMessage.success('操作成功')
          this.visible = false
          this.callback()
        }
        else {
          window.$oAntdMessage.warning(res.message)
        }
      })
    },
    async putStorageCallBack(d) {
      this.spinning = true
      this.$refs.putStorageRef.closeModel()
      const res = await window.$oAjax.post(
        'rest/chemical/solution/submitInventory',
        d,
        {
          headers: {
            'content-type': 'application/json',
          },
        },
      )
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

    getPerson(idsPerson, acceptData) {
      if (this.selPersonType == 1) {
        this.selReceivePerson = acceptData
      }
      else if (this.selPersonType == 2) {
        this.selStockPerson = acceptData
      }
    },

    getChemicalsData(row) {
      const d = row.map((it) => {
        it.stockNum = 1
        this.selChemicalsData.forEach((tit) => {
          if (tit.chemicalId == it.id) {
            it.stockNum = tit.stockNum
          }
        })
        it.chemicalId = it.id
        it.id = ''
        return JSON.parse(JSON.stringify(it))
      })

      this.selChemicalsData = d
    },
    async getChemicalsDet(id) {
      const res = await window.$oAjax.get(`/rest/chemical/category/${id}`)
      if (res.code === 20000) {
        if (res.data.blends) {
          this.chemicalsMingle = res.data.blends.map((it) => {
            it.id = ''
            return it
          })
        }
        else {
          this.chemicalsMingle = []
        }
      }
    },
    onChemicalsRemove(row) {
      this.selChemicalsData.forEach((it, index) => {
        if (row.chemicalId == it.chemicalId) {
          this.selChemicalsData.splice(index, 1)
        }
      })
    },

    // handleFileChange({ file, fileList }) {
    //
    //   this.fileList = fileList;
    //   let idArr = [];
    //   fileList.forEach((item) => {
    //     if (item.status == "done") {
    //       if (item.response.success) {
    //         idArr.push(item.response.obj[0].id);
    //       } else {
    //         item.status = "error";
    //       }
    //     }
    //   });
    //   this.attachmentIds = idArr.join(",");
    // },
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
</style>
