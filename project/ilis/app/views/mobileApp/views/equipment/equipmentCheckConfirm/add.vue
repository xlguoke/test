<template>
  <div>
    <van-sticky>
      <MobileTitleBar
        class="left-title"
        :title="title"
        left-arrow
        @click-left="$router.go(-1)"
      >
      </MobileTitleBar>
    </van-sticky>
    <SubTitle>
      <template #right>
        <div
          v-if="isAdd"
          style="
            color: #154bd0;
            display: flex;
            align-items: center;
            cursor: pointer;
          "
          @click="
            $route.query.byCheckSend
              ? $router.go(-1)
              : (selectEquipmentVisible = true)
          "
        >
          <van-icon name="plus" />
          <span>重选设备</span>
        </div>
      </template>
      设备信息
    </SubTitle>
    <div class="card">
      <div class="title">
        {{ selDevice.name }}
      </div>
      <div>设备编号：{{ selDevice.equipmentSn }}</div>
      <div>规格型号：{{ selDevice.standard }}</div>
    </div>
    <SubTitle>证书信息</SubTitle>
    <van-form ref="formData" :model="formData" :disabled="isReadonly">
      <van-cell-group insert>
        <FormItemInput
          v-model:value="formData.certificateSn"
          required
          name="certificateSn"
          label="证书编号"
          placeholder="请输入"
          :rules="[{ required: true, message: '请输入证书编号' }]"
        />

        <FormItemInput
          v-model:value="formData.checkUnit"
          required
          name="checkUnit"
          label="检校单位"
          placeholder="请输入"
          :rules="[{ required: true, message: '请输入检校单位' }]"
        />

        <FormItemRadio
          v-model:value="formData.checkType"
          required
          name="checkType"
          label="检校类型"
          :rules="[{ required: true, message: '请选择检校类型' }]"
          :options="typeDict.map(i => ({
            label: i.typeName,
            value: i.typeCode,
          }))"
        />

        <FormItemDate
          v-model:value="formData.checkTime"
          name="checkTime"
          required
          label="检校日期"
          placeholder="请选择"
          :rules="[{ required: true, message: '请选择检校日期' }]"
        />

        <FormItemDate
          v-model:value="formData.validityDate"
          name="validityDate"
          required
          label="有效期"
          placeholder="请选择"
          :rules="[{ required: true, message: '请选择有效期' }]"
        />

        <FormItemInput
          v-model:value="formData.gist"
          required
          name="gist"
          label="检校依据"
          placeholder="请输入"
          :rules="[{ required: true, message: '请输入检校依据' }]"
        />

        <FormItemInput
          v-model:value="formData.verdict"
          name="verdict"
          label="检校依据"
          placeholder="请输入"
        />

        <FormItemInput
          v-model:value="formData.remark"
          name="remark"
          label="检校备注"
          placeholder="请输入"
        />

        <van-field
          v-model="formData.checkFile"
          name="checkFile"
          label="证书文件"
          placeholder="请输入"
          input-align="right"
        >
          <template #input>
            <UploadWithQrKey
              v-if="render"
              v-model:value="formData.checkFile"
              :disabled="isReadonly"
              :business-id="formData.id"
              accept="*"
              business-type="EQ_CHECK_FILE"
            ></UploadWithQrKey>
          </template>
        </van-field>

        <van-field
          v-model="formData.checkFile"
          name="checkFile"
          label="证书文件"
          placeholder="请输入"
          input-align="right"
        >
          <template #input>
            <UploadWithQrKey
              v-if="render"
              v-model:value="formData.otherFile"
              :disabled="isReadonly"
              :business-id="formData.id"
              accept="*"
              business-type="EQ_CHECK_OTHER_FILE"
            ></UploadWithQrKey>
          </template>
        </van-field>
      </van-cell-group>
    </van-form>
    <div style="height: 100px"></div>
    <div v-if="!isReadonly" class="footer">
      <van-button type="primary" style="flex: 1" @click="submit">
        确认
      </van-button>
      <van-button style="flex: 1" @click="$router.back()">
        取消
      </van-button>
    </div>

    <!-- 选择设备组件 -->
    <SelectEquipment
      v-model:value="selectEquipmentVisible"
      :is-multiple="true"
      @selected-ok="getDevice"
    />
  </div>
</template>

<script>
import { showDialog } from 'vant'
import UploadWithQrKey from '~/views/mobileApp/components/form/UploadWithQrKey.vue'
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import FormItemInput from '~/views/mobileApp/components/MobileFormItem/FormItemInput.vue'
import FormItemRadio from '~/views/mobileApp/components/MobileFormItem/FormItemRadio.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import SubTitle from '~/views/mobileApp/components/MobileUI/SubTitle.vue'
import SelectEquipment from '~/views/mobileApp/components/selectEquipment.vue'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'

export default {
  components: {
    FormItemRadio,
    FormItemInput,
    FormItemDate,
    SelectEquipment,
    SubTitle,
    UploadWithQrKey,
    MobileTitleBar,
  },
  beforeRouteLeave(to, from, next) {
    const pageState = useAppPageStateStore().getPage(to.name)
    pageState.resetPage = this.isResetPage
    next()
  },
  data() {
    return {
      formData: {},
      selectEquipmentVisible: false,
      selDevice: {},
      isResetPage: false,
      typeDict: [],
      field: '',
      render: false,
    }
  },
  computed: {
    id() {
      return this.$route.params.id
    },
    isAdd() {
      return !this.id
    },
    isEdit() {
      return !!this.id && !['20', '40'].includes(this.formData.status)
    },
    isReadonly() {
      return !!this.id && ['20', '40'].includes(this.formData.status)
    },
    title() {
      if (this.isReadonly) {
        return '检校确认详情'
      }
      else if (this.isEdit) {
        return '编辑检校确认'
      }
      else {
        return '新增检校确认'
      }
    },
  },
  async created() {
    this.getTypeDict()
    this.selDevice = JSON.parse(localStorage.getItem('equipmentCheckConfirmEQ'))
    if (this.id) {
      await this.getDetail()
    }
    this.render = true
  },
  methods: {
    getDevice(data) {
      if (data && data.length) {
        this.selDevice = data[0]
      }
    },
    async submit() {
      this.isResetPage = true
      await this.$refs.formData.validate()

      const form = {
        ...this.formData,
        equipmentId: this.selDevice.id,
        checkedItemStr: JSON.stringify([]),
      }
      const formData = new FormData()
      for (const key in form) {
        formData.append(key, form[key])
      }
      showLoadingToast({
        message: '提交中...',
        forbidClick: true,
        duration: 0,
      })
      const { success, message } = await mRequest
        .post('checkController.do?saveCheck', formData)
        .finally(() => {
          closeToast()
        })
      if (!success) {
        showDialog({
          title: '提示',
          message,
        })
        return
      }
      showSuccessToast('提交成功')
      this.$router.replace({
        name: 'equipmentCheckConfirm',
      })
    },
    async getTypeDict() {
      const { data, code } = await mRequest.get(
        'rest/type/getTypesByGroupCode',
        {
          params: { groupCode: 'eq_ck_type' },
        },
      )
      if (code === 20000) {
        this.typeDict = data
      }
    },

    async getDetail() {
      showLoadingToast({
        duration: 0,
        forbidClick: true,
        message: '加载中...',
      })
      const { obj, code, message } = await mRequest
        .get('/checkController.do?getById', {
          params: { id: this.id },
        })
        .finally(() => {
          closeToast()
        })
      if (code === 20010) {
        showDialog({ message })
        return
      }
      const { equipment, check } = obj
      this.selDevice = equipment
      for (const key in check) {
        if (check[key] === null) {
          delete check[key]
          delete check.noticeTime
        }
      }
      this.formData = {
        ...check,
        checkTime: check.checkTime && formatDate(check.checkTime),
        validityDate: check.validityDate && formatDate(check.validityDate),
      }
    },
  },
}
</script>

<style lang="less" scoped>
.card {
  padding: 0 12px 12px;
  background-color: #fff;
  margin-bottom: 12px;
  border-radius: 4px;
  .title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 6px;
  }
}
.add_but {
  text-align: center;
  padding: 10px 0;
  .add_but_icon {
    font-size: 55px;
    color: #154bd0;
  }
}
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background-color: #fff;
  display: flex;
  gap: 12px;
}
:deep(.van-collapse-item__content) {
  padding: unset;
}
</style>
