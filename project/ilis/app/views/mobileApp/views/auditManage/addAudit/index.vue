<template>
  <div class="add-audit">
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)" />
    </van-sticky>
    <div style="padding-bottom: 100px">
      <van-field
        v-model="selBussinessTypeItem.businessName"
        readonly
        required
        label="流程类型"
        placeholder="请选择流程类型"
      >
        <template #button>
          <van-button type="primary" size="small" plain @click="openBussinessType">
            选择
          </van-button>
        </template>
      </van-field>

      <template v-for="(item, i) in formLayout" :key="i">
        <van-field
          v-if="item.type.name === 'boolean'"
          readonly
          name="radio"
          :label="item.name"
        >
          <template #input>
            <van-radio-group v-model="item.value" direction="horizontal">
              <van-radio :name="1">
                是
              </van-radio>
              <van-radio :name="0">
                否
              </van-radio>
            </van-radio-group>
          </template>
        </van-field>
        <van-field
          v-else-if="item.type.name === 'date'"
          v-model="item.value"
          readonly
          name="datetimePicker"
          :label="item.name"
          :required="item.required"
          :placeholder="`点击选择${item.name}`"
          @click="showPicker = true"
        >
          <template #right-icon>
            <van-icon
              v-if="item.value"
              name="clear"
              @click="
                () => {
                  item.value = ''
                  formLayout[i] = item
                }
              "
            />
          </template>
          <template #button>
            <van-button type="primary" size="small" plain @click="chooseDate(i)">
              选择
            </van-button>
          </template>
        </van-field>
        <van-field
          v-else-if="item.type.name === 'long'"
          v-model="item.value"
          :label="item.name"
          :required="item.required"
          type="number"
          :placeholder="`请填写${item.name}`"
        />
        <van-field
          v-else-if="item.type.name === 'string' && item.id === 'copyTo'"
          v-model="item.value"
          readonly
          :label="item.name"
          :required="item.required"
          :placeholder="`请选择${item.name}`"
        >
          <template #right-icon>
            <van-icon
              v-if="item.value"
              name="clear"
              @click="
                () => {
                  item.value = ''
                }
              "
            />
          </template>
          <template #button>
            <van-button
              type="primary"
              size="small"
              plain
              @click="choosePerson(i, true)"
            >
              选择
            </van-button>
          </template>
        </van-field>
        <van-field
          v-else
          v-model="item.value"
          :label="item.name"
          :required="item.required"
          :placeholder="`请填写${item.name}`"
        />
      </template>

      <template v-if="selBussinessType">
        <p class="field-group">
          流程人员
        </p>
        <template
          v-for="(item, i) in presetAuditers"
          :key="item.activitiNodeId"
        >
          <van-field
            v-model="item.presetUserRealName"
            readonly
            :label="item.processTaskName"
            placeholder="请选择请选择人员"
          >
            <template #right-icon>
              <van-icon
                v-if="item.presetUserRealName"
                name="clear"
                @click="
                  () => {
                    item.presetUserId = ''
                    item.presetUsername = ''
                    item.presetUserRealName = ''
                  }
                "
              />
            </template>
            <template #button>
              <van-button
                type="primary"
                size="small"
                plain
                @click="choosePerson(i)"
              >
                选择
              </van-button>
            </template>
          </van-field>
        </template>
      </template>
    </div>
    <div class="footer-btn">
      <van-button type="primary" block @click="save">
        确定
      </van-button>
      <van-button block @click="$router.go(-1)">
        取消
      </van-button>
    </div>

    <van-popup
      v-model:show="popupVisible"
      position="bottom"
      :style="{ height: '80%' }"
    >
      <div class="process-wrap">
        <p class="process-title">
          选择流程类型
        </p>
        <div class="process-list">
          <van-radio-group
            v-model="selBussinessType"
            @change="chooseProcess"
          >
            <van-radio
              v-for="(item, index) in bussinessTypeDatas"
              :key="index"
              :name="item.businessType"
            >
              {{ item.businessName }}
            </van-radio>
          </van-radio-group>
        </div>
      </div>
    </van-popup>

    <van-calendar
      v-model:show="showCalendar"
      color="#1989fa"
      @confirm="confirmDate"
    />

    <SelectPerson
      v-model:value="personVisible"
      :sel-type="selType"
      @selected-ok="confirmPerson"
    />
  </div>
</template>

<script>
import {
  showLoadingToast,
  showNotify,
} from 'vant'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import SelectPerson from '~/views/mobileApp/components/selectPerson.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'

export default {
  components: {
    SelectPerson,
    MobileTitleBar,
  },
  beforeRouteLeave(to, from, next) {
    if (
      (to.name === 'auditManage' || to.name === 'auditDetail')
      && this.isSave
    ) {
      const pageState = useAppPageStateStore().getPage(to.name)
      pageState.scrollTop = 0
      pageState.resetPage = true
    }
    next()
  },
  data() {
    return {
      showCalendar: false,
      popupVisible: false,
      personVisible: false,
      chooseType: '',
      searchPerson: '',
      bussinessTypeDatas: [],
      selBussinessTypeItem: {},
      businessKey: '',
      selBussinessType: '',
      formLayout: [],
      presetAuditers: [],
      eidtFormInd: -1, // 当前编辑的动态表单下标
      editPersonInd: -1, // 当前编辑的流程人员下标
      selectPersons: [],
      isStartForm: false, // 是否为动态表单中的选择人员
      selType: 'radio',
      isSave: false,
    }
  },
  created() {
    this.getDetailData()
  },
  methods: {
    // 获取详情数据
    async getDetailData() {
      const id = this.$route.query.id
      if (!id)
        return
      const res = await mRequest.get(`${api.auditProcess.detail}/${id}`)
      if (res.code !== 20000) {
        showNotify({ type: 'danger', message: res.message || '获取详情失败' })
        return
      }
      const forms = res.data.formProperties
        ? JSON.parse(res.data.formProperties)
        : {}
      const presetAuditers = res.data.presetAuditers
        ? JSON.parse(res.data.presetAuditers)
        : []
      this.formLayout = res.data.startFormProperties.filter((d) => {
        d.value = forms[d.id] || ''
        return d.readable
      })
      this.businessKey = res.data.businessKey
      this.selBussinessType = res.data.processTypeId
      this.selBussinessTypeItem = {
        businessName: res.data.processName,
        businessType: res.data.processTypeId,
      }
      this.getProcessNode(res.data.processTypeId, presetAuditers)
    },
    openBussinessType() {
      this.popupVisible = true
      this.getBussinessType()
    },
    // 获取流程类型
    getBussinessType() {
      if (this.bussinessTypeDatas.length > 0)
        return

      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      mRequest
        .get(`${api.auditProcess.getRelations}?processType=common`)
        .then((res) => {
          if (res.code && res.code !== 20010) {
            this.bussinessTypeDatas = res.data
          }
          else {
            showNotify({
              type: 'danger',
              message: res.message || '获取流程类型失败',
            })
          }
        })
        .catch((err) => {
          showNotify({
            type: 'danger',
            message: err.message || '获取流程类型失败',
          })
        })
        .finally(() => {
          toast.close()
        })
    },
    // 选择流程类型
    chooseProcess(e) {
      const item = this.bussinessTypeDatas.find(d => d.businessType === e)
      this.selBussinessTypeItem = item
      this.popupVisible = false
      this.getStartFrom(e)
    },
    // 取消选择
    cancelProcess() {
      this.popupVisible = false
      this.selBussinessType = ''
    },
    // 获取动态表单
    getStartFrom(e) {
      if (!e) {
        this.formLayout = []
        this.presetAuditers = []
        return
      }

      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      mRequest
        .get(`${api.auditProcess.getProcessFormUrl}?auditTypeId=${e}`)
        .then((res) => {
          if (res.code === 20000) {
            const list = res.data.filter(d => d.readable)
            this.formLayout = list
          }
          else {
            showNotify({
              type: 'error',
              message: res.message || '获取表单失败',
            })
          }
        })
        .catch((err) => {
          showNotify({
            type: 'error',
            message: err.message || '获取表单失败',
          })
        })
        .finally(() => {
          toast.close()
        })
      this.getProcessNode(e)
    },
    // 获取审核节点
    getProcessNode(typeId, values) {
      mRequest
        .get(
          `${api.auditProcess.getProcessUserUrl}?auditTypeId=${typeId}`,
        )
        .then((res) => {
          if (res.code === 20000) {
            const list = res.data || []
            if (values) {
              for (let i = 0; i < list.length; i++) {
                const item = list[i]
                const findItem = values.find(
                  d => d.activitiNodeId === item.activitiNodeId,
                )
                if (!findItem)
                  continue
                list[i] = {
                  ...item,
                  ...findItem,
                }
              }
            }
            this.presetAuditers = list.map(item => ({
              ...item,
              presetUserId: '',
              presetUsername: '',
              presetUserRealName: '',
            }))
          }
          else {
            showNotify({
              type: 'error',
              message: res.message || '获取审核节点失败',
            })
          }
        })
        .catch((err) => {
          showNotify({
            type: 'error',
            message: err.message || '获取审核节点失败',
          })
        })
    },
    // 选择日期
    chooseDate(ind) {
      this.eidtFormInd = ind
      this.showCalendar = true
    },
    // 确认选择日期
    confirmDate(date) {
      this.showCalendar = false
      const val = date ? formatDate(date, 'YYYY-MM-DD') : ''
      const item = this.formLayout[this.eidtFormInd]
      item.value = val
      this.formLayout[this.eidtFormInd] = item
    },
    // 选择流程人员
    choosePerson(ind, type) {
      this.editPersonInd = ind
      this.personVisible = true
      this.selType = type ? 'checkbox' : 'radio'
      this.isStartForm = type || false
    },
    confirmPerson(data) {
      if (this.isStartForm) {
        const item = this.formLayout[this.editPersonInd]
        item.value = data.map(d => d.account).join(',')
        this.formLayout[this.editPersonInd] = item
        return
      }

      if (data.length === 0) {
        this.presetAuditers[this.editPersonInd].presetUserId = ''
        this.presetAuditers[this.editPersonInd].presetUsername = ''
        this.presetAuditers[this.editPersonInd].presetUserRealName = ''
      }
      else {
        const personObj = data[0]
        this.presetAuditers[this.editPersonInd].presetUserId = personObj.id
        this.presetAuditers[this.editPersonInd].presetUsername = personObj.account
        this.presetAuditers[this.editPersonInd].presetUserRealName = personObj.name
      }
    },
    // 保存
    save() {
      if (!this.selBussinessType) {
        showNotify({ type: 'warning', message: '请选择流程类型' })
        return
      }
      const formProperties = {}
      for (let i = 0; i < this.formLayout.length; i++) {
        const item = this.formLayout[i]
        if (item.required && !item.value) {
          showNotify({ type: 'warning', message: `${item.name}不能为空` })
          return
        }
        formProperties[item.id] = item.value || ''
      }
      const data = {
        businessType: this.selBussinessType,
        businessKey: this.businessKey,
        formProperties,
        presetAuditers: this.presetAuditers,
      }

      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      mRequest({
        url: api.auditProcess.submit,
        method: 'post',
        data,
        dataType: 'json',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      })
        .then((res) => {
          if (res.code === 20000) {
            showNotify({ type: 'success', message: '提交成功' })
            this.isSave = true
            this.$router.go(-1)
          }
          else {
            showNotify({
              type: 'danger',
              message: res.message || '发起审批失败',
            })
          }
        })
        .catch((err) => {
          showNotify({
            type: 'danger',
            message: err.message || '发起审批失败',
          })
        })
        .finally(() => {
          toast.close()
        })
    },
  },
}
</script>

<style lang="less" scoped>
.field-group {
  padding: 0 10px;
  line-height: 40px;
  background-color: #f5f5f5;
}
.dot-required::before {
  content: '*';
  color: red;
  display: inline-block;
  line-height: 30px;
}
:deep(.van-cell) {
  .van-cell__title {
    flex: initial;
    width: 6.2em;
  }
  .van-cell__value {
    text-align: left;
  }
}
.footer-btn {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  z-index: 100;
  button {
    flex: 1;
  }
}
.process-wrap {
  height: 100%;
  display: flex;
  flex-direction: column;
  .process-title {
    text-align: center;
    line-height: 40px;
    font-size: 16px;
    border-bottom: 1px solid #f8f8f8;
  }
  .process-list {
    padding: 15px;
    flex: 1;
    overflow: auto;
    .van-radio {
      height: 40px;
      border-bottom: 1px dashed #f5f5f5;
    }
  }
  .process-handle {
    display: flex;
    padding: 5px;
    border-top: 1px solid #f8f8f8;
    button {
      flex: 1;
      margin: 0 5px;
    }
  }
}
.van-field__body {
  .van-field__button,
  .van-button {
    height: 24px;
  }
  .van-button {
    display: block;
  }
}
</style>
