<!-- eslint-disable vue/eqeqeq -->
<!-- eslint-disable vue/valid-v-model -->
<template>
  <div class="sampleSubcontract">
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <a-form ref="formRef" style="width: 520px" :model="dataObj">
          <div class="hitek-form-layout">
            <div class="hitek-form-layout-label">
              <span class="hitek-form-layout-required">*</span>分包单位
            </div>
            <div class="hitek-form-layout-con">
              <a-form-item
                :rules="[{ required: true, message: `请选择分包单位` }]"
                name="unitName"
              >
                <div style="display: flex">
                  <a-input
                    v-model:value="dataObj.unitName"
                    style="flex: 1"
                    :disabled="true"
                    :class="{ readonlyCls: !isDetail }"
                    placeholder="请选择"
                  />
                  <a-button
                    :disabled="isDetail"
                    style="margin-left: 15px"
                    @click="setUnitSubcontract"
                  >
                    选择
                  </a-button>
                </div>
              </a-form-item>
            </div>
          </div>
          <div class="hitek-form-layout">
            <div class="hitek-form-layout-label">
              经办人
            </div>
            <div class="hitek-form-layout-con">
              <a-form-item>
                <a-input
                  v-model:value="dataObj.operator"
                  :disabled="isDetail"
                  placeholder="请输入经办人"
                  style="width: 100%"
                />
              </a-form-item>
            </div>
          </div>
          <div class="hitek-form-layout">
            <div class="hitek-form-layout-label">
              <span class="hitek-form-layout-required">*</span>分包日期
            </div>
            <div class="hitek-form-layout-con">
              <a-form-item
                :rules="[{ required: true, message: `请选择分包日期` }]"
                name="upkeepTime"
              >
                <a-date-picker
                  v-model:value="dataObj.upkeepTime"
                  value-format="YYYY-MM-DD"
                  style="width: 100%"
                  :disabled="isDetail"
                />
              </a-form-item>
            </div>
          </div>
          <div class="hitek-form-layout">
            <div class="hitek-form-layout-label">
              备注
            </div>
            <div class="hitek-form-layout-con">
              <a-form-item>
                <a-input
                  v-model:value="dataObj.applyExplain"
                  :disabled="isDetail"
                  placeholder="请填写备注"
                />
              </a-form-item>
            </div>
          </div>
        </a-form>
        <div>
          <div class="sampleSubcontract-title">
            样品列表：
          </div>
          <a-table
            :columns="columns"
            :data-source="dataSource"
            :pagination="false"
            bordered
            row-key="id"
            :row-class-name="rowClassName"
          >
            <template #bodyCell="{ column, record, text }">
              <template
                v-if="[
                  'amountAll',
                  'saveAmount',
                  'disposeWay',
                  'saveDayLimit',
                  'saveSite',
                  'saveReason',
                ].includes(column.dataIndex)"
              >
                <div>
                  <div v-if="record.editable">
                    <template v-if="column.dataIndex === 'disposeWay'">
                      <p v-if="record.sampleNum == record.amountAll">
                        不处理
                      </p>
                      <a-select
                        v-else
                        v-model:value="record.disposeWay"
                        :disabled="
                          isDetail
                            || record.sampleRoomSave
                            || (record.amountAll || '') == record.sampleNum
                        "
                        style="width: 100%"
                      >
                        <a-select-option value="sampleRoomSave">
                          收样处留样
                        </a-select-option>
                        <a-select-option value="NONE">
                          不处理
                        </a-select-option>
                      </a-select>
                    </template>

                    <template v-if="column.dataIndex === 'saveDayLimit'">
                      <p v-if="record.disposeWay !== 'sampleRoomSave' || record.sampleNum == record.amountAll"></p>
                      <a-input-number
                        v-else
                        v-model:value="record.saveDayLimit"
                        style="width: 100%"
                        :min="0"
                        :disabled="
                          isDetail
                            || record.sampleRoomSave
                            || (record.amountAll || '') == record.sampleNum
                            || record.disposeWay !== 'sampleRoomSave'
                        "
                      />
                    </template>

                    <template v-if="column.dataIndex === 'saveSite'">
                      <p v-if="record.disposeWay !== 'sampleRoomSave' || record.sampleNum == record.amountAll"></p>
                      <a-input
                        v-else
                        v-model:value="record.saveSite"
                        :disabled="
                          isDetail
                            || record.sampleRoomSave
                            || (record.amountAll || '') == record.sampleNum
                            || record.disposeWay !== 'sampleRoomSave'
                        "
                      />
                    </template>

                    <template v-if="column.dataIndex === 'saveReason'">
                      <p v-if="record.disposeWay !== 'sampleRoomSave' || record.sampleNum == record.amountAll"></p>
                      <a-input
                        v-else
                        v-model:value="record.saveReason"
                        :disabled="
                          isDetail
                            || record.sampleRoomSave
                            || (record.amountAll || '') == record.sampleNum
                            || record.disposeWay !== 'sampleRoomSave'
                        "
                      />
                    </template>

                    <template v-if="column.dataIndex === 'saveAmount'">
                      <p v-if="record.sampleNum == record.amountAll"></p>
                      <a-input
                        v-else
                        v-model:value="record.saveAmount"
                        :disabled="
                          isDetail
                            || record.sampleRoomSave
                            || (record.amountAll || '') == record.sampleNum
                        "
                      />
                    </template>

                    <a-input
                      v-if="column.dataIndex === 'amountAll'"
                      v-model:value="record.amountAll"
                      :value="text"
                      :disabled="isDetail"
                    />
                  </div>
                  <template v-else>
                    {{ text }}
                  </template>
                </div>
              </template>
            </template>
          </a-table>
        </div>
        <!-- <a-button @click="GetResult2()">保存</a-button> -->
      </div>
    </a-spin>

    <ht-modal
      title="选择分包单位"
      centered
      :open="visibleUnit"
      :mask-closable="false"
      width="80%"
      @cancel="handleCancelUnit"
    >
      <SelUnitSubcontract ref="SelUnitSubcontract" />
      <template #footer>
        <div>
          <a-button @click="handleCancelUnit">
            取消
          </a-button>
          <a-button type="primary" @click="handleOkUnit">
            确定
          </a-button>
          <div style="clear: both"></div>
        </div>
      </template>
    </ht-modal>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import qs from 'qs'
import { getQueryVariable } from '~/providers/common/utils'
import SelUnitSubcontract from '~/views/system/subcontract/unitSubcontract/list/index.vue'

const columns = [
  {
    title: '样品编号',
    dataIndex: 'testObjectSn',
    customRender({ text, record }) {
      return text || record.testObjectCode || ''
    },
    width: '10%',
  },
  {
    title: '样品名称',
    dataIndex: 'displayName',
    customRender({ text }) {
      return text || ''
    },
    width: '10%',
  },
  {
    title: '规格型号',
    dataIndex: 'standard',
    customRender({ text }) {
      return text || ''
    },
    width: '10%',
  },
  {
    title: '试样数量',
    dataIndex: 'tablecol',
    customRender({ record }) {
      return record.sampleNum || ''
    },
    width: '10%',
  },
  {
    title: '分包数量',
    dataIndex: 'amountAll',
    scopedSlots: { customRender: 'amountAll' },
    width: '10%',
  },
  {
    title: '余样数量',
    dataIndex: 'saveAmount',
    scopedSlots: { customRender: 'saveAmount' },
    width: '10%',
  },
  {
    title: '余样处理',
    dataIndex: 'disposeWay',
    scopedSlots: { customRender: 'disposeWay' },
    width: '10%',
  },
  {
    title: '留样期限(天)',
    dataIndex: 'saveDayLimit',
    scopedSlots: { customRender: 'saveDayLimit' },
    width: '10%',
  },
  {
    title: '留样地点',
    dataIndex: 'saveSite',
    scopedSlots: { customRender: 'saveSite' },
    width: '10%',
  },
  {
    title: '留样原因',
    dataIndex: 'saveReason',
    scopedSlots: { customRender: 'saveReason' },
    width: '10%',
  },
]
export default {
  components: {
    SelUnitSubcontract,
  },
  data() {
    return {
      spinning: false,
      isDetail: getQueryVariable('detail') === '1',
      id: getQueryVariable('id'),
      dayjs,
      dataObj: {},
      columns,
      dataSource: [],
      currentRow: null,
      visibleUnit: false,
      unitSubcontractData: [],
    }
  },
  created() {
    const userInfo = top.localStorage.getItem('userInfo')
    if (userInfo) {
      this.dataObj.operator = JSON.parse(userInfo).realName
    }

    this.getData()
  },
  mounted() {
    // 将layerOkCallback方法绑定到window下面，提供给外部调用
    window.layerOkCallback = this.okBtn
  },
  methods: {
    // 分包单位  下方显示
    setUnitSubcontract() {
      const acceptData = this.unitSubcontractData
      this.visibleUnit = true
      window.$oNextTick(() => {
        this.$refs.SelUnitSubcontract.showModal('1', acceptData)
      })
    },
    // 分包单位 回显
    handleOkUnit() {
      const acceptData = this.$refs.SelUnitSubcontract.handleOk()
      this.unitSubcontractData = acceptData.map(item => ({
        id: item.id,
        name: item.unitName,
      }))
      this.dataObj.unitName = this.unitSubcontractData[0].name
      this.visibleUnit = false
    },
    handleCancelUnit() {
      this.visibleUnit = false
    },
    async getData() {
      this.spinning = true
      const res = await window.$oAjax.get(window.$oApi.common.getTemporaryData, {
        params: {
          id: this.id,
        },
      })
      this.spinning = false

      let data = []
      if (res && res.code === 20000 && res.data) {
        try {
          const result = JSON.parse(res.data)
          data = result.data
        }
        // eslint-disable-next-line unused-imports/no-unused-vars
        catch (error) {

        }
      }

      const arr = []
      // eslint-disable-next-line array-callback-return
      data.map((item) => {
        let sampleRoomSave = false
        const iconsArr = item.icons
        if (iconsArr && iconsArr.length > 0) {
          for (let j = 0; j < iconsArr.length; j++) {
            if (iconsArr[j] === 'sampleRoomSave') {
              sampleRoomSave = true
              break
            }
          }
        }
        arr.push({
          ...item,
          editable: true,
          saveAmount: '',
          disposeWay: 'sampleRoomSave',
          saveDayLimit: '',
          saveSite: '',
          saveReason: '',
          sampleRoomSave,
        })
      })
      this.dataSource = arr
    },
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    GetResult2() {
      this.okBtn()
    },
    async okBtn(callback) {
      let values

      this.$refs.formRef.validateFields().then(async () => {
        const fieldsValue = { ...this.dataObj }
        values = {
          ...fieldsValue,
          upkeepTime: fieldsValue.upkeepTime,
          unitId: this.unitSubcontractData[0].id,
          unitName: this.unitSubcontractData[0].name,
        }

        if (values) {
          for (let i = 0; i < this.dataSource.length; i++) {
            const item = this.dataSource[i]
            if (!item.amountAll) {
              window.$oAntdModal.warning(window.$oMsgTips.info(`第${i + 1}行 分包数量不能为空`))
              return
            }
            // eslint-disable-next-line eqeqeq
            if (item.sampleNum != item.amountAll && !item.sampleRoomSave) {
              if (item.disposeWay === 'sampleRoomSave' && !item.saveDayLimit) {
                window.$oAntdModal.warning(
                  window.$oMsgTips.info(`第${i + 1}行 留样期限不能为空`),
                )
                return
              }
              if (item.disposeWay === 'sampleRoomSave' && !item.saveAmount) {
                window.$oAntdModal.warning(
                  window.$oMsgTips.info(`第${i + 1}行 余样数量不能为空`),
                )
                return
              }
            }
          }
        }

        const params = this.dataSource.map((item) => {
          const obj = {
            testObjectId: item.testObjectId,
            objectProcessId: item.objectProcessId,
            operationType: 11,
            operator: values.operator,
            receiver: values.unitName,
            receiverId: values.unitId,
            operationDate: values.upkeepTime,
            amount: item.amountAll,
            saveSite: '',
            saveDayLimit: '',
            reason: '',
            remark: values.applyExplain,
            reserveTimeUnit: 'D',
            surplusAmount: item.saveAmount,
          }
          if (item.sampleNum === item.amount) {
            delete obj.surplusAmount
          }

          if (
            item.disposeWay === 'sampleRoomSave'
            && values.sampleNum !== item.amount
          ) {
            obj.remanentSampleVo = {
              disposeWay: item.disposeWay,
              saveAmount: item.saveAmount,
              saveSite: item.saveSite,
              saveDayLimit: item.saveDayLimit,
              saveReason: item.saveReason,
            }
          }
          return obj
        })
        // 分包 operationType为11;
        const res = await window.$oAjax.post(
          window.$oApi.sample.dispose,
          qs.stringify({
            params: JSON.stringify(params),
          }),
        )

        if (res.success) {
          callback && callback(res)
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import './index.less';
</style>
