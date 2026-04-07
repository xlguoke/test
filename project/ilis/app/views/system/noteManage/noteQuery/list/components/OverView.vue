<template>
  <div>
    <h3 class="ht-page-title">
      短信概览
    </h3>
    <div class="content-box">
      <a-alert
        message="仅支持所属地为中国大陆手机号码，不支持国际/港澳台手机号码接收短信！"
        type="info"
        show-icon
      />
      <a-spin :spinning="loading">
        <ul class="note-overview">
          <li class="item">
            <h2 class="item-title">
              短信已发送
            </h2>
            <div class="item-icon">
              <img
                style="width: 72%"
                :src="imgNote"
                alt="短信已发送"
              />
            </div>
            <div class="item-num">
              <span>{{ dataObj.sentAmount || 0 }}</span>
              条
            </div>
          </li>
          <li class="item">
            <h2 class="item-title">
              短信剩余量
            </h2>
            <div class="item-icon">
              <img
                style="width: 74%"
                :src="imgRemainder"
                alt="短信剩余量"
              />
            </div>
            <div class="item-num">
              <span
                :class="dataObj.balance <= dataObj.warningAmount ? 'red' : ''"
              >{{ dataObj.balance }}</span>
              条
            </div>
            <div class="item-handle">
              <a-button type="link" @click="recharge">
                充值
              </a-button>
            </div>
          </li>
          <li class="item">
            <h2 class="item-title">
              短信预警值

              <a-tooltip placement="bottom">
                <template #title>
                  当短信余量小于（等于）您设置的预警值时，
                  系统会发送短信提醒到设置的接收电话
                </template>
                <QuestionCircleOutlined />
              </a-tooltip>
            </h2>
            <div class="item-icon">
              <img
                :src="imgWarning"
                alt="短信预警值"
              />
            </div>
            <div class="item-num">
              <span>{{ dataObj.warningAmount || 0 }}</span>
              条
            </div>
            <div class="item-handle">
              <a-button type="link" @click="setWarning">
                设置
              </a-button>
            </div>
          </li>
        </ul>
      </a-spin>
      <a-alert
        v-if="dataObj.balance === 0"
        message="短信余量为0，为保证短信通知功能的正常使用，请尽快完成充值！"
        type="error"
        show-icon
      />
    </div>

    <ht-modal
      v-model:open="visible"
      title="短信余量预警设置"
      :mask-closable="false"
      :keyboard="false"
      width="420px"
      @cancel="closeVisible"
    >
      <div style="padding: 0 15px; max-height: 70vh; overflow-y: auto">
        <a-alert
          message="当短信余量小于（等于）您设置的预警值时，系统会发送短信提醒到设置的接收电话！"
          type="info"
          show-icon
        />
        <br />
        <a-form
          ref="formRef"
          :label-col="{ span: 6 }"
          :wrapper-col="{ span: 16 }"
          :model="dataObj"
        >
          <a-form-item
            label="预警余量"
            :rules="[
              { required: true, message: '请输入预警余量' },
              { validator: validNum, message: '预警余量值不能低于500' },
            ]"
            name="num"
          >
            <a-input-number
              v-model:value="dataObj.num"
              :max="999999999"
              :precision="0"
              style="width: 100%"
              placeholder="请输入预警余量"
            />
          </a-form-item>

          <a-form-item
            v-for="(d, i) in phoneArr"
            :key="d"
            label="接收电话"
            :class="i > 0 ? 'phone-form-item' : ''"
            :rules="[
              { required: true, message: '请输入接收电话' },
              {
                validator: (rule, value, callback) =>
                  validPhone(rule, value, callback, d),
              },
            ]"
            :name="`phone-${d}`"
          >
            <div class="form-item-flex">
              <a-input-number
                v-model:value="dataObj[`phone-${d}`]"
                placeholder="请输入接收电话"
              />
              <PlusSquareFilled v-if="i === 0" class="add-form-item" @click="phoneArr.push(++fKey)" />
              <DeleteOutlined v-else class="del-form-item" @click="removePhone(i, d)" />
            </div>
          </a-form-item>
        </a-form>
      </div>
      <template #footer>
        <div class="clearfix">
          <a-button @click="closeVisible">
            关闭
          </a-button>
          <a-button type="primary" :loading="setLoading" @click="okBtn">
            确定
          </a-button>
        </div>
      </template>
    </ht-modal>
  </div>
</template>

<script>
import { DeleteOutlined, PlusSquareFilled, QuestionCircleOutlined } from '@ant-design/icons-vue'

export default {
  components: {
    DeleteOutlined,
    PlusSquareFilled,
    QuestionCircleOutlined,
  },
  data() {
    const reg = /^1\d{10}$/
    const validPhone = (rule, value, callback, fkey) => {
      if (value && !reg.test(value))
        return callback(new Error('电话格式错误'))
      if (value) {
        const _form = { ...this.dataObj }
        for (const k in _form) {
          if (k === `phone-${fkey}`)
            continue
          if (_form[k] == value)
            return callback(new Error('电话号码重复'))
        }
      }
      callback()
    }
    const validNum = (rule, value, callback) => {
      if (value && value < 500)
        return callback(new Error(rule.message))
      callback()
    }
    return {
      imgNote: new URL('~/assets/img/img-note.svg', import.meta.url),
      imgRemainder: new URL('~/assets/img/img-remainder.svg', import.meta.url),
      imgWarning: new URL('~/assets/img/img-warning.svg', import.meta.url),
      fKey: 1,
      fsStaticPath: window.$fsStaticPath,
      loading: false,
      setLoading: false,
      visible: false,
      validPhone,
      validNum,
      phoneArr: [this.fKey],
      dataObj: {
        sentAmount: 0,
        balance: 0,
        warningAmount: 500,
        warningPhones: [],
      },
      dfPhoneVal: {},
    }
  },
  created() {
    this.getData()
  },
  methods: {
    getData() {
      this.loading = true
      window.$oAjax
        .get('/rest/sms/balance/overview')
        .then((res) => {
          this.loading = false
          if (res.code !== 20000) {
            window.$oErrorAlert(res.message)
            return
          }
          this.dataObj = res.data
        })
        .catch((err) => {
          this.loading = false
          window.$oErrorAlert(err.message)
        })
    },
    recharge() {
      window.$oAntdModal.warning({
        title: '短信余量充值！',
        content: '系统暂不支持短信自助充值，请您联系技术支持人员或客服。',
        okText: '确定',
        centered: true,
      })
    },
    setWarning() {
      const { warningPhones } = this.dataObj
      const _form = {}
      this.visible = true
      this.fKey = 1
      this.phoneArr = []
      if (!warningPhones || warningPhones.length === 0) {
        this.phoneArr = [this.fKey]
        _form[`phone-${this.fKey}`] = ''
      }
      else {
        for (let i = 0; i < warningPhones.length; i++) {
          const d = warningPhones[i]
          this.fKey++
          this.phoneArr.push(this.fKey)
          _form[`phone-${this.fKey}`] = d
        }
      }
      this.dfPhoneVal = { ..._form }
    },
    okBtn() {
      this.$refs.formRef.validateFields().then(() => {
        const val = { ...this.dataObj }
        const phones = []
        for (const k in val) {
          if (k.includes('phone-')) {
            phones.push(`${val[k]}`)
          }
        }
        this.setLoading = true
        window.$oAjax
          .post(
            '/rest/sms/balance/modify-warning',
            {
              warningAmount: val.num,
              warningPhones: phones,
              balance: this.dataObj.balance || 0,
              sentAmount: this.dataObj.sentAmount || 0,
            },
            {
              headers: {
                'Content-Type': 'application/json;utf-8',
              },
            },
          )
          .then((res) => {
            this.setLoading = false
            if (res.code === 20000) {
              window.$oAntdMessage.success('设置成功')
              this.closeVisible()
              this.getData()
            }
            else {
              window.$oErrorAlert(res.message)
            }
          })
          .catch((err) => {
            this.setLoading = false
            window.$oErrorAlert(err.message)
          })
      })
    },
    closeVisible() {
      this.visible = false
      this.dataObj = {
        sentAmount: 0,
        balance: 0,
        warningAmount: 500,
        warningPhones: [],
      }
      this.phoneArr = ['']
    },
    removePhone(ind, k) {
      const _form = { ...this.dataObj }
      delete _form[`phone-${k}`]
      this.dataObj = { ..._form }
      this.phoneArr.splice(ind, 1)
      this.dataObj = {
        sentAmount: 0,
        balance: 0,
        warningAmount: 500,
        warningPhones: [],
      }
      this.dfPhoneVal = { ..._form }
    },
  },
}
</script>

<style lang="less" scoped>
.note-overview {
  margin-top: 15px;
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  & > .item {
    padding: 20px 8px 15px;
    width: 30%;
    background-color: var(--colorBgContainer);
    box-shadow: 2px 0 6px rgba(1, 1, 1, 0.1);
    border-radius: 4px;
    text-align: center;
    .item-title {
      font-weight: 600;
      font-size: 16px;
      .anticon-question-circle {
        color: var(--colorPrimary);
        font-size: 14px;
        cursor: pointer;
      }
    }
    .item-icon {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 24px auto;
      width: 70px;
      height: 70px;
      border-radius: 50%;
      border: 1px solid #f5f5f5;
      box-shadow: inset 0 3px 5px rgba(1, 1, 1, 0.2);
      img {
        display: block;
        width: 76%;
        height: 76%;
      }
    }
    .item-num > span {
      font-size: 20px;
      line-height: 20px;
      &.red {
        color: var(--colorError);
      }
    }
    .item-handle {
      margin-top: 10px;
      .ant-btn {
        font-size: 14px;
      }
    }
  }
}
.form-item-flex {
  display: flex;
  align-items: center;
  margin-right: -24px;
  .ant-input-number {
    flex: 1;
  }
  .add-form-item,
  .del-form-item {
    margin-left: 8px;
    font-size: 16px;
    color: var(--colorPrimary);
    cursor: pointer;
    &:hover {
      opacity: 0.8;
    }
  }
  .del-form-item {
    color: var(--colorError);
  }
}
:deep(.ant-form-item) {
  margin-bottom: 20px;
  .ant-form-explain {
    position: absolute;
    font-size: 12px;
  }
}
.phone-form-item {
  :deep(label.ant-form-item-required) {
    display: none;
  }
}
</style>
