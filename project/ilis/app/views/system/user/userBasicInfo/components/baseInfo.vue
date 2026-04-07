<template>
  <div class="baseInfo">
    <a-row>
      <a-col span="16">
        <a-form ref="formRef" :model="data" layout="vertical">
          <a-form-item label="账号">
            <a-input
              v-model:value="data.userName"
              :disabled="true"
              style="width: 80%"
            />
          </a-form-item>
          <a-form-item
            label="姓名"
            :rules="[{ required: true, message: '请输入姓名!' }]"
            name="realName"
          >
            <a-input
              v-model:value="data.realName"
              :disabled="true"
              style="width: 80%"
              autocomplete="off"
              placeholder="请输入姓名"
            />
          </a-form-item>
          <a-form-item
            label="手机号码"
            :rules="[
              {
                pattern: /^1(3|4|5|6|7|8|9)\d{9}$/,
                message: '请输入正确格式的手机号码！',
              },
            ]"
            name="mobilePhone"
          >
            <a-input
              v-model:value="data.mobilePhone"
              style="width: 80%"
              autocomplete="off"
              placeholder="请输入手机号码"
            />
          </a-form-item>
          <a-form-item label="办公电话">
            <a-input
              v-model:value="data.officePhone"
              style="width: 80%"
              autocomplete="off"
              placeholder="请输入办公电话"
            />
          </a-form-item>
          <a-form-item
            label="常用邮箱"
            :rules="[
              {
                pattern: /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/,
                message: '请输入正确格式的电子邮箱！',
              },
            ]"
            name="email"
          >
            <a-input
              v-model:value="data.email"
              autocomplete="off"
              style="width: 80%"
              placeholder="请输入常用邮箱"
            />
          </a-form-item>
          <a-form-item label="生日">
            <a-date-picker
              v-model:value="data.birthDay"
              style="width: 80%"
              autocomplete="off"
              value-format="YYYY-MM-DD"
              placeholder="请输入生日"
            />
          </a-form-item>
        </a-form>
        <a-button
          :loading="confirmLoading"
          style="margin-top: 10px"
          type="primary"
          @click="updateInfo"
        >
          更新信息
        </a-button>
      </a-col>
      <a-col span="6">
        <div class="baseInfo-img">
          <img v-if="data.iconUrl || iconUrl" :src="iconUrl || data.iconUrl" />
          <img v-else class="baseInfo-defaultImg" :src="defaultImg" />
        </div>
        <a-upload
          :show-upload-list="false"
          name="file"
          :action="importUrl"
          :mask-closable="false"
          @change="handleChange"
        >
          <a-button style="margin-top: 15px">
            更换头像
          </a-button>
        </a-upload>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { rootUrl } from '~/providers/configs/rootUrl'

export default {
  data() {
    return {
      data: {},
      dayjs,
      confirmLoading: false,
      importUrl: `${rootUrl}${window.$oApi.common.upload}`,
      iconUrl: '',
      defaultImg: `${rootUrl}/plug-in/assets/images/user.png`,
    }
  },
  created() {
    this.getData()
  },
  methods: {
    getData() {
      // eslint-disable-next-line unused-imports/no-unused-vars
      const { page, size, query } = this
      window.$oAjax.get(window.$oApi.userBasicInfo.getData).then((res) => {
        if (res.success) {
          const {
            id,
            userName,
            realName,
            mobilePhone,
            officePhone,
            email,
            birthDay,
            iconUrl,
          } = res.obj
          this.data = {
            id,
            userName,
            realName,
            mobilePhone,
            officePhone,
            email,
            birthDay: birthDay ? dayjs(birthDay).format('YYYY-MM-DD') : null,
            iconUrl,
          }
        }
      })
    },
    updateInfo() {
      this.$refs.formRef.validateFields().then(() => {
        this.confirmLoading = true
        const values = { ...this.data }
        values.id = this.data.id
        this.saveInfo(values)
      })
    },
    saveInfo(data, flag) {
      window.$oAjax({
        method: 'GET',
        url: window.$oApi.userBasicInfo.update,
        params: { ...data },
      }).then((res) => {
        if (res.success) {
          window.$oAntdMessage.success(res.msg || res.message)
          if (flag) {
            top.$('.nav-right-img-box img').attr('src', this.iconUrl)
            top.$('iframe[name=iframe0]')[0].contentWindow.getAccountImg()
          }
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.confirmLoading = false
      })
    },
    handleChange(info) {
      if (info.file.status !== 'uploading') { /* empty */ }
      if (info.file.status === 'done') {
        const res = info.file.response
        if (res && res.success) {
          if (res.obj && res.obj.length > 0) {
            this.iconUrl = res.obj[0].realpath
            const data = {
              ...this.data,
              birthDay: this.data.birthDay
                ? dayjs(this.data.birthDay).format('YYYY-MM-DD')
                : undefined,
              iconUrl: this.iconUrl,
            }
            this.saveInfo(data, true)
          }
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      }
      else if (info.file.status === 'error') {
        window.$oAntdModal.warning(window.$oMsgTips.info(`${info.file.name} 头像上传失败`))
      }
    },
  },
}
</script>

<style lang="less" scoped>
.baseInfo {
  .ant-form-item {
    margin-bottom: 10px;
    font-size: 12px;
  }

  .ant-form-explain {
    font-size: 12px;
    padding-top: 3px;
  }

  .baseInfo-img {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    margin-top: 25px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      max-width: 100%;
      max-height: 100%;
    }
  }

  .baseInfo-defaultImg {
    width: 100px;
    height: 100px;
  }
}
</style>
