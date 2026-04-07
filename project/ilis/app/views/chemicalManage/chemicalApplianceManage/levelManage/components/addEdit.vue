<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <a-form ref="formRef" style="width: 520px" :model="dataObj">
          <a-form-item
            label="申请人"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
            :rules="[{ required: true, message: `申请人不能为空!` }]"
            name="applicant"
          >
            <a-row :gutter="15">
              <a-col :span="18" style="font-size: 12px">
                <a-input
                  v-model:value="dataObj.applicant"
                  :disabled="true"
                  :class="{ readonlyCls: !isDetail }"
                  placeholder="请选择"
                />
              </a-col>
              <a-col :span="6" style="text-align: right">
                <a-button
                  :disabled="isDetail"
                  style="float: right"
                  @click="setPersonnels('radio', 'applicant', '请选择申请人')"
                >
                  选择
                </a-button>
              </a-col>
            </a-row>
          </a-form-item>

          <a-form-item
            label="总金额"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
            :rules="[{ required: true, message: `金额不能为空!` }]"
            name="budget"
          >
            <a-input-number
              v-model:value="dataObj.budget"
              :min="0"
              :disabled="isDetail"
              placeholder="请填写金额"
              style="width: 100%"
            />
          </a-form-item>
          <a-form-item
            label="申请说明"
            :label-col="{ span: 5 }"
            :wrapper-col="{ span: 17 }"
            name="applyExplain"
          >
            <a-input
              v-model:value="dataObj.applyExplain"
              :disabled="isDetail"
              placeholder="请填写申请说明"
            />
          </a-form-item>
        </a-form>
        <div>
          <div v-if="!isDetail" style="padding: 10px 0">
            <a-button type="primary" @click="handleAdd">
              新增
            </a-button>
          </div>
          <a-table
            :columns="columns"
            :data-source="dataSource"
            :pagination="false"
            bordered
            rowkey="id"
            :row-class-name="rowClassName"
            :scroll="{ x: tableX }"
          >
            <template #bodyCell="{ column, record, text }">
              <template v-if="colArr.includes(column.dataIndex)">
                <div>
                  <template
                    v-if="record[`${column.dataIndex}_obj`] && record[`${column.dataIndex}_obj`].disabled"
                  >
                    {{ text }}
                  </template>
                  <template v-else>
                    <div v-if="record.editable">
                      <span
                        v-if="
                          (record[`${column.dataIndex}_obj`]
                            && record[`${column.dataIndex}_obj`].type == 'inputNumber')
                            || column.dataIndex === 'price'
                            || column.dataIndex === 'amount'
                        "
                      >
                        <a-input-number
                          :value="text"
                          :min="0"
                          @change="(e) => handleChange(e, record.id, column.dataIndex)"
                        />
                      </span>
                      <span
                        v-else-if="
                          record[`${column.dataIndex}_obj`]
                            && record[`${column.dataIndex}_obj`].type == 'radio'
                        "
                      >
                        <a-radio-group
                          :value="text"
                          :name="column.dataIndex"
                          @change="
                            (e) =>
                              handleChange(
                                e.target.value,
                                record.id,
                                column.dataIndex,
                                'radio',
                              )
                          "
                        >
                          <a-radio
                            v-for="(comItem, index) in record[`${column.dataIndex}_obj`].data"
                            :key="index"
                            :value="comItem.name"
                          >
                            {{ comItem.name }}</a-radio>
                        </a-radio-group>
                      </span>
                      <span
                        v-else-if="
                          record[`${column.dataIndex}_obj`]
                            && record[`${column.dataIndex}_obj`].type == 'select'
                        "
                      >
                        <a-select
                          style="width: 100%"
                          :value="text"
                          @change="(e) => handleChange(e, record.id, column.dataIndex)"
                        >
                          <a-select-option
                            v-for="(comItem, index) in record[`${column.dataIndex}_obj`].data"
                            :key="index"
                            :value="comItem.name"
                          >
                            {{ comItem.name }}
                          </a-select-option>
                        </a-select>
                      </span>
                      <span
                        v-else-if="
                          record[`${column.dataIndex}_obj`]
                            && record[`${column.dataIndex}_obj`].type == 'date'
                        "
                      >
                        <a-date-picker
                          :value="text"
                          style="width: 100%"
                          format="YYYY-MM-DD"
                          value-format="YYYY-MM-DD"
                          @change="(e) => handleChange(e, record.id, column.dataIndex, 'date')"
                        />
                      </span>
                      <a-input
                        v-else
                        :value="text"
                        @change="
                          (e) => handleChange(e.target.value, record.id, column.dataIndex)
                        "
                      />
                    </div>
                    <template v-else>
                      {{ text }}
                    </template>
                  </template>
                </div>
              </template>
              <template v-if="column.dataIndex === 'depart'">
                <div>
                  <span style="display: inline-block; line-height: 16px; float: left">{{ text }}</span>
                  <PlusCircleOutlined
                    v-if="!isDetail"
                    style="padding-left: 5px"
                    title="选择"
                    @click="setOrg(text, record.id, 'depart')"
                  />
                </div>
              </template>
              <template v-if="column.dataIndex === 'operation'">
                <div class="editable-row-operations">
                  <template v-if="record.editable">
                    <a @click="() => onSave(record.id)">保存</a>
                    <a-popconfirm
                      title="确定要取消吗?"
                      @confirm="() => onCancel(record.id)"
                    >
                      <a>取消</a>
                    </a-popconfirm>
                  </template>
                  <template v-else>
                    <a @click="() => onEdit(record.id)">编辑</a>
                    <a-popconfirm
                      title="确定要删除吗?"
                      @confirm="() => onDelete(record.id)"
                    >
                      <a>删除</a>
                    </a-popconfirm>
                  </template>
                </div>
              </template>
            </template>
          </a-table>
        </div>
      </div>
    </a-spin>
    <AddOrg ref="AddOrg" :callback="getOrg" />
    <TableTreePersonnel ref="TableTreePersonnel" :callback="getPerson" />
  </div>
</template>

<script>
import { PlusCircleOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import qs from 'qs'
import { getQueryVariable } from '~/providers/common/utils'
import AddOrg from '~/providers/components//orgList.vue'
import TableTreePersonnel from '~/providers/components/tableTreePersonnel.vue'

// import { formatTime } from "~/providers/common/utils"

const columns = [
  {
    title: '设备名称',
    dataIndex: 'name',
  },
  {
    title: '规格型号',
    dataIndex: 'standard',
  },
  {
    title: '生产厂家',
    dataIndex: 'manufacturer',
  },
  {
    title: '申请科室',
    dataIndex: 'depart',
  },
  {
    title: '单价',
    dataIndex: 'price',
  },
  {
    title: '数量',
    dataIndex: 'amount',
  },
  {
    title: '合计',
    dataIndex: 'totalPrice',
  },
  {
    title: '原因及用途',
    dataIndex: 'reason',
  },
  {
    title: '使用规范',
    dataIndex: 'useRule',
  },
]
const columnsDetail = [
  {
    title: '操作',
    dataIndex: 'operation',
    width: 100,
    align: 'center',
    fixed: 'right',
  },
]

export default {
  components: {
    TableTreePersonnel,
    AddOrg,
    PlusCircleOutlined,
  },
  props: ['callback'],
  data() {
    return {
      spinning: false,
      isDetail: false,
      formLayout: 'horizontal',

      dayjs,
      isDisabled: false,
      personDatas: {
        applicant: [
          {
            name:
              localStorage.getItem('userInfo')
              && JSON.parse(localStorage.getItem('userInfo')).realName,
            id: localStorage.getItem('userId'),
          },
        ],
      },
      clonePersonDatas: {
        applicant: [
          {
            name:
              localStorage.getItem('userInfo')
              && JSON.parse(localStorage.getItem('userInfo')).realName,
            id: localStorage.getItem('userId'),
          },
        ],
      },
      dataObj: {
        applicant: this.personDatas.applicant[0].name,
      },
      statusData: [],
      columns: [],
      editingKey: '',
      isAdd: false,
      dataSource: [],
      cacheData: [],
      currentRow: null,
      orgData: [],
      customFields: [],
      tableX: 800,
      colArr: [
        'name',
        'standard',
        'manufacturer',
        'reason',
        'useRule',
        'price',
        'amount',
      ],
      customColArr: [],
    }
  },
  created() {
    // ilis 跳转的详情页面
    if (getQueryVariable('detail')) {
      const id
        = getQueryVariable('businessKey') || '4028826372358837017236030137001f'
      this.showModal(id, true)
    }
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getPerson(idsPerson, acceptData) {
      this.dataObj.applicant = this.personDatas.applicant[0].name
      this.personDatas[idsPerson] = acceptData
    },
    setPersonnels(type, idsPerson, title) {
      const acceptData = this.personDatas[idsPerson]
      this.$refs.TableTreePersonnel.showModal(
        type,
        idsPerson,
        acceptData,
        title,
      )
    },
    getCustomFields() {
      this.spinning = true
      window.$oAjax
        .get(window.$oApi.common.customProperties, {
          params: {
            customizeType: 'equipBuyPlanEdit',
          },
        })
        .then((res) => {
          this.customFields = res.data || []
          const colArr = []
          const custom = []
          // eslint-disable-next-line array-callback-return
          this.customFields.map((item) => {
            const obj = {
              name: item.columnName,
              title: item.columnName,
              dataIndex: item.id,
              type: item.columnType,
              option: {},
              custom: true,
              disabled: item.disabled,
              visible: item.visible,
            }
            if (item.columnType === 'radio') {
              obj.data = [
                { value: '是', name: '是' },
                { value: '否', name: '否' },
              ]
              obj.dataField = { value: 'value', name: 'name' }
            }
            else if (item.columnType === 'select') {
              obj.data = item.columnValue
                ? item.columnValue.split(',').map((v) => {
                    return { value: v, name: v }
                  })
                : []
              obj.dataField = { value: 'value', name: 'name' }
            }
            obj[`${item.id}_obj`] = {
              disabled: item.disabled,
              type: item.columnType,
              data: obj.data,
            }
            if (obj.visible) {
              custom.push(obj)
              colArr.push(item.id)
            }
          })
          this.customFields = JSON.parse(JSON.stringify(custom))
          const disabledArr = []
          this.dataSource.map((newData) => {
            const customizeValues = newData.customizeValues || this.customFields
            // eslint-disable-next-line array-callback-return
            customizeValues.map((item) => {
              if (item.disabled) {
                newData[item.columnId] = item ? item.columnValue : ''
                newData[`${item.columnId}_obj`] = {
                  disabled: item.disabled,
                  type: item.columnType,
                }
                if (!colArr.includes(item.columnId)) {
                  colArr.push(item.columnId)
                  disabledArr.push({
                    ...newData,
                    name: item.columnName,
                    title: item.columnName,
                    dataIndex: item.columnId,
                    [item.columnId]: item.columnName,
                  })
                }
              }
              else {
                // eslint-disable-next-line array-callback-return
                this.customFields.map((itemV) => {
                  if (
                    itemV.dataIndex == item.columnId
                    && !newData[item.columnId]
                  ) {
                    newData[item.columnId] = item ? item.columnValue : ''
                    newData[`${item.columnId}_obj`] = {
                      disabled: item.disabled,
                      type: itemV.type,
                      data: itemV.data,
                    }
                  }
                  else {
                    if (!newData[itemV.dataIndex]) {
                      newData[itemV.dataIndex] = ''
                      newData[`${itemV.dataIndex}_obj`] = {
                        disabled: itemV.disabled,
                        type: itemV.type,
                        data: itemV.data,
                      }
                    }
                  }
                })
              }

              const valueObj = this.customFields.find(
                itemV => itemV.dataIndex == item.columnId,
              )
              if (valueObj && valueObj.visible) {
                newData[item.columnId] = item ? item.columnValue : ''
                newData[`${item.columnId}_obj`] = {
                  disabled: item.disabled,
                  type: valueObj.type,
                  data: valueObj.data,
                }
              }
            })
            return newData
          })
          this.customColArr = colArr
          this.colArr = [...this.colArr, ...colArr]
          let newColumns = []
          if (this.isDetail) {
            // newColumns = columns.concat(this.customFields);
            newColumns = [...columns, ...disabledArr, ...this.customFields]
          }
          else {
            // newColumns = columns.concat(this.customFields).concat(columnsDetail);
            newColumns = [
              ...columns,
              ...disabledArr,
              ...this.customFields,
              ...columnsDetail,
            ]
          }
          const totalWidth = newColumns.length * 150
          this.columns = newColumns.map(item => ({
            ...item,
            width: 150,
          }))
          if (window.document.body.offsetWidth < totalWidth) {
            this.tableX = totalWidth
          }
          this.spinning = false
        })
    },
    async showModal(editId, isDetail) {
      this.spinning = true
      this.isDetail = isDetail
      if (editId) {
        await window.$oAjax({
          method: 'get',
          url: window.$oApi.equipBuyPlanList.detailById,
          params: { buyPlanId: editId },
        }).then(async (res) => {
          if (res.success) {
            this.dataObj = res.obj
            this.personDatas.applicant = [
              { id: this.dataObj.applicantId, name: this.dataObj.applicant },
            ]
            this.spinning = true
            await window.$oAjax({
              method: 'get',
              url: window.$oApi.equipBuyPlanList.detailDatagrid,
              params: { buyPlanId: editId },
            }).then((res) => {
              if (res.total > 0) {
                this.dataSource = res.rows
                this.cacheData = this.dataSource.map(item => ({ ...item }))
              }
              else {
                this.dataSource = []
                if (res && res.total !== 0) {
                  window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
                }
              }
            })
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            this.dataObj = {}
          }
        })
        await this.getCustomFields()
        this.spinning = false
      }
      else {
        await this.getCustomFields()
        this.spinning = false
      }
    },
    dataRequired() {
      if (this.editingKey) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先完成当前编辑或新增!'))
        return false
      }
      if (this.dataSource.length === 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请新增设备'))
        return false
      }
      return true
    },
    handleOk() {
      this.$refs.formRef.validateFields().then(() => {
        const data = {
          ...this.dataObj,
          applicantId:
            this.personDatas.applicant.length > 0
              ? this.personDatas.applicant[0].id
              : '',
          applicant:
            this.personDatas.applicant.length > 0
              ? this.personDatas.applicant[0].name
              : '',
        }

        if (this.dataObj.id) {
          data.id = this.dataObj.id
        }

        if (this.dataRequired(data)) {
          const newDataSource = []
          const dataSource = JSON.parse(JSON.stringify(this.dataSource))
          for (let i = 0; i < dataSource.length; i++) {
            const item = dataSource[i]
            const customValues = []
            for (const key in item) {
              if (this.customColArr.includes(key)) {
                customValues.push({
                  columnId: key,
                  columnValue: item[key],
                })
                delete item[`${key}_obj`]
                delete item[key]
              }
            }
            const customizeValues = item.customizeValues
            const newCustomizeValues = []
            const newCustomValues = []
            if (customizeValues && customizeValues.length > 0) {
              // eslint-disable-next-line array-callback-return
              customizeValues.map((item) => {
                const newObj = customValues.find(
                  itemJ => item.columnId == itemJ.columnId,
                )
                if (!newObj) {
                  // eslint-disable-next-line ts/no-unused-expressions
                  item.disabled ? '' : newCustomizeValues.push(item)
                }
                else {
                  // eslint-disable-next-line ts/no-unused-expressions
                  item.disabled
                    ? ''
                    : newCustomizeValues.push({
                        ...item,
                        ...newObj,
                      })
                }
              })
              // eslint-disable-next-line array-callback-return
              customValues.map((itemJ) => {
                const itemObj = customizeValues.find(
                  item => item.columnId == itemJ.columnId,
                )
                if (!itemObj) {
                  newCustomValues.push(itemJ)
                }
              })
              item.biddingCustomizeValueEntities = JSON.parse(
                JSON.stringify([...newCustomizeValues, ...newCustomValues]),
              )
              delete item.customizeValues
            }
            else {
              item.biddingCustomizeValueEntities = customValues
            }
            // item.biddingCustomizeValueEntities = customValues;
            newDataSource.push({ ...item })
          }
          data.planDetailStr = JSON.stringify(newDataSource)
          this.spinning = true
          window.$oAjax({
            method: 'POST',
            url: window.$oApi.equipBuyPlanList.savePlan,
            data: qs.stringify(data),
            headers: {
              'X-Requested-With': 'XMLHttpRequest',
            },
          }).then((res) => {
            if (res.success) {
              window.$oAntdMessage.success('操作成功')
              this.callback()
              this.handleCancel()
            }
            else {
              window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            }
            this.spinning = false
          })
        }
      })
    },
    handleCancel() {
      this.dataObj = {
        applicant: this.personDatas.applicant[0].name,
      }
      this.personDatas = JSON.parse(JSON.stringify(this.clonePersonDatas))
      this.dataSource = []
      this.cacheData = []
      this.orgData = []
      this.editingKey = ''
    },
    handleAdd() {
      if (this.editingKey != '') {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先完成当前编辑或新增!'))
        return
      }
      const id = new Date().getTime()
      const newData = {
        id,
        // uid: id,
        name: '',
        standard: '',
        manufacturer: '',
        depart: '',
        departId: '',
        price: '',
        amount: '',
        totalPrice: '',
        reason: '',
        useRule: '',
        editable: true,
      }
      // eslint-disable-next-line array-callback-return
      this.customFields.map((item) => {
        newData[item.dataIndex] = ''
        newData[`${item.dataIndex}_obj`] = item[`${item.dataIndex}_obj`]
      })
      this.editingKey = id
      this.isAdd = true
      this.dataSource = [...this.dataSource, newData]
      this.cacheData = this.dataSource.map(item => ({ ...item }))
    },
    handleChange(values, id, column) {
      const value = values
      const newData = [...this.dataSource]
      const target = newData.filter(item => id === item.id)[0]
      if (target) {
        target[column] = value
        this.dataSource = newData
      }
      if (column === 'price' || column === 'amount') {
        this.totalPriceCalc(id)
      }
    },
    totalPriceCalc(id) {
      const newData = [...this.dataSource]
      const target = newData.filter(item => id === item.id)[0]
      if (target && target.price && target.amount) {
        target.totalPrice = target.price * target.amount
        this.dataSource = newData
      }
    },
    onEdit(id) {
      const newData = [...this.dataSource]
      const target = newData.filter(item => id === item.id)[0]
      this.editingKey = id
      if (target) {
        target.editable = true
        this.dataSource = newData
      }
    },
    onDelete(id) {
      const newData = [...this.dataSource]
      this.dataSource = newData.filter(item => item.id !== id)
      this.cacheData = this.dataSource.map(item => ({ ...item }))
      this.editingKey = ''
    },
    onSave(id) {
      const newData = [...this.dataSource]
      const newCacheData = [...this.cacheData]
      const target = newData.filter(item => id === item.id)[0]
      if (!target.name) {
        window.$oAntdModal.warning(window.$oMsgTips.info('设备名称不能为空'))
        return
      }
      if (!target.departId) {
        window.$oAntdModal.warning(window.$oMsgTips.info('设备科室不能为空'))
        return
      }
      const targetCache = newCacheData.filter(item => id === item.id)[0]
      if (target && targetCache) {
        delete target.editable
        this.dataSource = newData
        Object.assign(targetCache, target)
        this.cacheData = newCacheData
      }
      this.editingKey = ''
      this.isAdd = false
    },
    onCancel(id) {
      const newData = [...this.dataSource]
      const target = newData.filter(item => id === item.id)[0]
      if (this.isAdd) {
        this.isAdd = false
        if (target) {
          this.dataSource = newData.filter(item => item.id !== id)
        }
      }
      else {
        if (target) {
          Object.assign(
            target,
            this.cacheData.filter(item => id === item.id)[0],
          )
          delete target.editable
          this.dataSource = newData
        }
      }
      this.editingKey = ''
    },
    setOrg(value, id, column) {
      this.currentRow = { id, column }
      this.$refs.AddOrg.showModal('radio', 'depart', this.orgData)
    },
    getOrg(ids, orgData) {
      this.orgData = orgData
      const newData = [...this.dataSource]
      const target = newData.filter(item => this.currentRow.id === item.id)[0]
      if (target) {
        target.depart = orgData[0].name
        target.departId = orgData[0].id
        this.dataSource = newData
      }
    },
  },
}
</script>

<style lang="less">
.equipmentOutgo-add-modal {
  .ant-modal-body {
    overflow-y: auto;
  }
}
</style>
