<template>
  <div style="padding-bottom: 40px">
    <van-sticky>
      <MobileTitleBar
        class="left-title"
        :title="title"
        left-arrow
        @click-left="$router.go(-1)"
      ></MobileTitleBar>
    </van-sticky>

    <SubTitle>送检基本信息</SubTitle>
    <van-form :readonly="readonly" label-width="130">
      <van-cell-group>
        <van-field
          v-model="formData.batchNumber"
          label="送检批号"
          type="textarea"
          :placeholder="placeholder('请输入')"
          rows="1"
          autosize
          required
          input-align="right"
        />
        <van-field
          v-model="formData.unit"
          label="检校单位"
          type="textarea"
          :placeholder="placeholder('请输入')"
          rows="1"
          autosize
          required
          input-align="right"
        />

        <FormItemDate
          v-model:value="formData.sendTime"
          label="送检日期"
          required
          :readonly="readonly"
        />

        <FormItemDate
          v-model:value="formData.planRetrieveTime"
          label="计划取回日期"
          :readonly="readonly"
        />

        <van-field
          v-model="formData.remark"
          label="备注说明"
          type="textarea"
          :placeholder="placeholder('请输入')"
          rows="1"
          autosize
          input-align="right"
        />
        <van-field
          v-model="formData.status"
          label="送检状态"
          readonly
          input-align="right"
        >
          <template #input>
            <span :style="{ color: statusMap[formData.status || '10'].color }">
              {{ statusMap[formData.status || '10'].label }}
            </span>
          </template>
        </van-field>
      </van-cell-group>
    </van-form>

    <SubTitle style="margin-top: 16px">
      送检设备信息
    </SubTitle>

    <div v-if="!readonly" class="add-btn-wrap">
      <van-button
        size="small"
        plain
        icon="plus"
        type="primary"
        @click="
          () => {
            $refs.selectEqByPlanRef.open()
          }
        "
      >
        引用检校设备
      </van-button>
      <van-button
        size="small"
        plain
        icon="plus"
        type="primary"
        @click="selectEquipmentVisible = true"
      >
        添加设备
      </van-button>
    </div>

    <div class="device-list">
      <van-checkbox-group v-model="checked">
        <div v-for="item in deviceList" :key="item.id" class="device-list-item">
          <div style="padding: 16px 0; text-align: right">
            <van-checkbox
              v-if="readonly"
              :name="item.id"
              shape="square"
              style="padding-left: 16px"
              :disabled="item.status !== 'CREATE'"
            >
              选择
            </van-checkbox>
          </div>
          <van-swipe-cell :disabled="readonly">
            <van-cell-group>
              <van-field
                v-model="item.equipmentSn"
                label="设备编号"
                type="textarea"
                rows="1"
                autosize
                input-align="right"
              />
              <van-field
                v-model="item.name"
                label="设备名称"
                type="textarea"
                rows="1"
                autosize
                input-align="right"
              />
              <van-field
                v-model="item.checkItemName"
                label="项目/参数"
                input-align="right"
                :is-link="!readonly"
                readonly
                @click="
                  () => {
                    if (!readonly) {
                      $refs.selectCheckItemsRef.open(item.equipmentId)
                    }
                  }
                "
              />
              <van-field
                v-model="item.checkReference"
                label="检校依据"
                input-align="right"
                :placeholder="placeholder('请输入')"
                :readonly="readonly"
              />
              <van-field
                v-model="item.testSpecifications"
                label="试验规范"
                input-align="right"
                :placeholder="placeholder('请输入')"
                :readonly="readonly"
              />
              <van-field
                v-model="item.remark"
                label="备注"
                input-align="right"
                :placeholder="placeholder('请输入')"
                :readonly="readonly"
              />
              <van-field
                v-if="readonly"
                :value="item.status === 'CREATE' ? '待取回' : '已取回'"
                label="状态"
                input-align="right"
                :readonly="readonly"
              />
            </van-cell-group>

            <template #right>
              <van-button
                square
                type="danger"
                text="删除"
                style="height: 100%"
                @click="handleRemove(item)"
              />
            </template>
          </van-swipe-cell>
        </div>
      </van-checkbox-group>
      <van-empty v-if="!deviceList.length" description="暂无设备"></van-empty>
    </div>

    <ActionBar>
      <van-button
        v-if="!readonly"
        type="primary"
        @click="handleSave"
      >
        保存
      </van-button>

      <van-button
        v-if="readonly"
        type="primary"
        @click="handleComplete"
      >
        确认取回
      </van-button>
    </ActionBar>

    <SelectEquipment
      v-model:value="selectEquipmentVisible"
      :is-multiple="true"
      :show-sub-eq="true"
      :filter="[
        'quickQryParam',
        'eqDepartId',
        'eqLaboratoryName',
        'nextCheckDate',
      ]"
      :init-selected="[]"
      @selected-ok="getEquipment"
    />

    <!-- 选择检校项目 -->
    <SelectCheckItems ref="selectCheckItemsRef" @select="onSelectCheckItem" />

    <!-- 根据检校计划选择设备 -->
    <SelectEqByPlan ref="selectEqByPlanRef" @select="getEquipment" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { showConfirmDialog, showDialog } from 'vant'
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import ActionBar from '~/views/mobileApp/components/MobileUI/ActionBar.vue'
import SubTitle from '~/views/mobileApp/components/MobileUI/SubTitle.vue'
import SelectEquipment from '~/views/mobileApp/components/selectEquipment.vue'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import SelectCheckItems from './component/SelectCheckItems.vue'
import SelectEqByPlan from './component/SelectEqByPlan.vue'

export default {
  components: {
    ActionBar,
    FormItemDate,
    SelectEquipment,
    SubTitle,
    SelectCheckItems,
    SelectEqByPlan,
    MobileTitleBar,
  },
  data() {
    return {
      selectEquipmentVisible: false,
      deviceList: [],
      formData: {
        batchNumber: '',
        unit: '',
        sendTime: undefined,
        planRetrieveTime: undefined,
        remark: '',
        status: '10',
      },
      statusMap: {
        10: { label: '待送检', color: '#bfbfbf' },
        20: { label: '审批中', color: '#bfbfbf' },
        30: { label: '待送检', color: '#bfbfbf' },
        40: { label: '已送检', color: '#00a854' },
        50: { label: '已检校', color: '#00a854' },
      },
      checked: [],
    }
  },
  computed: {
    id() {
      return this.$route.query.id
    },
    /** # 状态： 1：新增 2：编辑 3：详情 */
    status() {
      return this.$route.query.status
    },
    title() {
      switch (this.status) {
        case '2':
          return '编辑送检登记'
        case '3':
          return '查看送检登记'
        default:
          return '新增送检登记'
      }
    },
    readonly() {
      return this.status === '3'
    },
  },
  watch: {},
  async created() {
    if (this.status === '2' || this.status === '3') {
      this.getDetail()
      this.getEqList()
    }
  },
  mounted() {
    window.scrollTo(0, 0)
  },
  methods: {
    onSelectCheckItem(rows, equipmentId) {
      const index = this.deviceList.findIndex(
        i => i.equipmentId === equipmentId,
      )
      if (index !== -1) {
        this.deviceList[index].checkItemName = rows.map(i => i.name).join(',')
        this.deviceList[index].checkItemId = rows.map(i => i.id).join(',')
      }
    },
    placeholder(val) {
      return !this.readonly ? val : ''
    },
    async getDetail() {
      const toastLoading = showLoadingToast({
        forbidClick: true,
        duration: 0,
      })
      const { obj, code, msg, message } = await mRequest
        .get(`/rest/checkSendController.do?getById`, {
          params: { sendId: this.id },
        })
        .finally(() => {
          toastLoading.close()
        })

      if (code !== 20010) {
        this.formData = {
          batchNumber: obj.batchNumber,
          unit: obj.unit,
          sendTime: obj.sendTime ? dayjs(obj.sendTime).format('YYYY-MM-DD') : undefined,
          planRetrieveTime: obj.planRetrieveTime ? dayjs(obj.planRetrieveTime).format('YYYY-MM-DD') : undefined,
          remark: obj.remark,
          status: obj.status,
        }
      }
      else {
        showDialog({ message: msg || message || '获取详情失败' })
      }
    },
    async getEqList() {
      const { rows, code, msg, message } = await mRequest.get(
        `/rest/checkSendController.do?datagridSendDetail`,
        {
          params: { sendId: this.id },
        },
      )

      if (code !== 20010) {
        this.deviceList = rows
      }
      else {
        showDialog({ message: msg || message || '获取详情失败' })
      }
    },
    async handleSave() {
      if (!this.deviceList || !this.deviceList.length) {
        showFailToast('请选择送检设备！')
        return
      }

      if (!this.formData.batchNumber) {
        showFailToast('请输入送检批号！')
        return
      }
      if (!this.formData.unit) {
        showFailToast('请输入检校单位')
        return
      }
      if (!this.formData.sendTime) {
        showFailToast('请选择送检日期！')
        return
      }

      const params = {
        ...this.formData,
        id: this.id,
        sendDetailStr: JSON.stringify(this.deviceList),
      }

      const formData = new FormData()
      Object.keys(params).forEach((key) => {
        if (params[key] !== undefined && params[key] !== null) {
          formData.append(key, params[key])
        }
      })

      const toastLoading = showLoadingToast({
        forbidClick: true,
        duration: 0,
      })
      const { code, msg } = await mRequest
        .post('/rest/checkSendController.do?save', formData)
        .finally(() => {
          toastLoading.close()
        })

      if (code !== 20010) {
        showSuccessToast('保存成功！')
        this.$router.go(-1)
      }
      else {
        showDialog({ message: msg })
        return Promise.reject(msg)
      }
    },
    async getEquipment(rows) {
      const addArr = []

      const toastLoading = showLoadingToast({
        forbidClick: true,
        duration: 0,
      })
      for (let i = 0; i < rows.length; i++) {
        const item = rows[i]
        const hasSame = this.deviceList.some(i => i.id === item.id)

        if (hasSame) {
          continue
        }

        const res = await mRequest
          .get(`/checkItemController.do?datagrid&objId=${item.id}&rows=100`)
          .catch(() => {})
        const data = res || {}

        addArr.push({
          id: item.id,
          equipmentId: item.id,
          equipmentSn: item.equipmentSn,
          name: item.name,
          standard: item.standard,
          departName: item.departName,
          checkItemName: (data.rows || []).map(item => item.name).join(','),
          checkItemId: (data.rows || []).map(item => item.id).join(','),
          checkReference: '',
          testSpecifications: '',
          remark: item.remark,
        })
      }

      toastLoading.close()

      this.deviceList.unshift(...addArr)
    },
    handleRemove(row) {
      this.deviceList = this.deviceList.filter(item => item.id !== row.id)
    },
    handleComplete() {
      if (!this.checked.length) {
        showDialog({
          title: '提示',
          message: '请先选择需要取回的设备',
        })
        return
      }

      showConfirmDialog({
        title: '提示',
        message: '确定要取回吗？',
      }).then(async () => {
        const toastLoading = showLoadingToast({
          forbidClick: true,
          duration: 0,
        })
        const res = await mRequest
          .put(
            '/rest/checkSendController/complete',
            {
              ids: this.checked.join(','),
            },
            {
              headers: {
                'content-type': 'application/json',
              },
            },
          )
          .finally(() => {
            toastLoading.close()
          })

        if (res.code !== 20010) {
          showSuccessToast('操作成功')
          this.checked = []
          this.getEqList()
        }
      })
    },
  },
}
</script>

<style lang="less" scoped>
:deep(.van-tag--default) {
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #e2e2e2;
}
.add-btn-wrap {
  padding: 16px;
  padding-bottom: 0;
  display: flex;
  gap: 8px;
}
.switch-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #0066ec;
}
.audit-status {
  > div {
    padding: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    color: #fff;
    background-color: #154bd0;
    font-size: 16px;
  }
}
.device-list {
  padding: 12px 16px;
  .device-list-item {
    background: #fff;
    border-radius: 4px;
    margin-bottom: 16px;
    box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
  }
}
</style>
