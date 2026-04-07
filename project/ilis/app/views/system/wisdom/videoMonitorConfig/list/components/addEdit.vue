<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <a-form auto-complete="off">
          <template v-for="(item, index) in dataArr" :key="index">
            <div v-if="dataArr.length" class="middle-box">
              <div class="hitek-form-layout">
                <div class="hitek-form-layout-label hitek-form-lable">
                  对接方式
                </div>
                <div class="hitek-form-layout-con">
                  <a-form-item>
                    <a-select
                      v-model:value="item.equType"
                      :disabled="!!item.id && (`${item.id}`).length > 13"
                      placeholder="请选择"
                      @change="(e) => changeEqVendor(e, index)"
                    >
                      <a-select-option
                        v-for="d in typeLists"
                        :key="d.typecode"
                        :value="d.typecode"
                      >
                        {{ d.typename }}
                      </a-select-option>
                    </a-select>
                  </a-form-item>
                </div>
              </div>

              <div class="hitek-form-layout">
                <div class="hitek-form-layout-label">
                  供应商名称
                </div>
                <div class="hitek-form-layout-con">
                  <a-form-item>
                    <a-input
                      :disabled="isDetail"
                      placeholder="请输入"
                      :value="item.supplierName"
                      @change="
                        (e) =>
                          handleChange(e.target.value, item.id, 'supplierName')
                      "
                    />
                  </a-form-item>
                </div>
              </div>

              <div class="hitek-form-layout">
                <div class="hitek-form-layout-label hitek-form-lable">
                  设备名称
                </div>
                <div class="hitek-form-layout-con">
                  <a-form-item>
                    <a-input
                      :disabled="isDetail"
                      placeholder="请输入"
                      :value="item.equName"
                      @change="
                        (e) => handleChange(e.target.value, item.id, 'equName')
                      "
                    />
                  </a-form-item>
                </div>
              </div>

              <div class="hitek-form-layout">
                <div class="hitek-form-layout-label hitek-form-lable">
                  接口地址
                </div>
                <div class="hitek-form-layout-con">
                  <a-form-item>
                    <a-input
                      :disabled="isDetail"
                      placeholder="请输入"
                      :value="item.interfaceUrl"
                      @change="
                        (e) =>
                          handleChange(e.target.value, item.id, 'interfaceUrl')
                      "
                    />
                  </a-form-item>
                </div>
              </div>

              <template v-if="item.params">
                <div
                  v-for="par in sortpar[item.equType]"
                  :key="par"
                  class="hitek-form-layout"
                >
                  <div
                    :class="
                      ['appsecret', 'appkey', 'deviceid', 'channelid'].includes(
                        par.toLowerCase(),
                      )
                        ? 'hitek-form-layout-label hitek-form-lable'
                        : 'hitek-form-layout-label'
                    "
                  >
                    {{ par }}
                  </div>
                  <div class="hitek-form-layout-con">
                    <a-form-item>
                      <a-input-password
                        v-if="par === 'password'"
                        :disabled="isDetail"
                        auto-complete="new-password"
                        placeholder="请输入"
                        :value="item.params[par]"
                        @change="
                          (e) =>
                            handleChange(e.target.value, item.id, par, 'params')
                        "
                      />
                      <a-input
                        v-else
                        :disabled="isDetail"
                        auto-complete="off"
                        :placeholder="
                          (par.toLowerCase() === 'appsecret'
                            || par.toLowerCase() === 'appkey')
                            && !item.uid
                            ? '需要更新,请输入'
                            : '请输入'
                        "
                        :value="item.params[par]"
                        @change="
                          (e) =>
                            handleChange(e.target.value, item.id, par, 'params')
                        "
                      />
                    </a-form-item>
                  </div>
                </div>
              </template>

              <div class="hitek-form-layout">
                <a-button
                  type="primary"
                  :disabled="item.uid ? true : false"
                  @click="playItem(item.id)"
                >
                  调试
                </a-button>
                <a-popconfirm
                  title="确定要删除?"
                  @confirm="deleteItem(item.id, item.uid)"
                >
                  <a-button>
                    删除
                  </a-button>
                </a-popconfirm>
              </div>
            </div>
          </template>
          <div class="add-box">
            <a @click="handleAdd"><PlusCircleOutlined title="添加" /></a>
          </div>
        </a-form>
        <VideoModal ref="Video" />
      </div>
    </a-spin>
  </div>
</template>

<script>
import { PlusCircleOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import { getQueryVariable } from '~/providers/common/utils'
import { rootUrl } from '~/providers/configs/rootUrl'
import VideoModal from './video.vue'

export default {
  components: {
    VideoModal,
    PlusCircleOutlined,
  },
  props: ['callback'],
  data() {
    return {
      spinning: false,
      rootUrl,
      formLayout: 'horizontal',
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
      dayjs,
      statusData: [],
      isDetail: false,
      dataArr: [],
      titleName: '',
      editId: '',
      typeLists: [],
      // 用于固定排序
      sortpar: {
        WVPLabColumn: [
          'deviceId',
          'channelId',
          'loginUrl',
          'startTime',
          'endTime',
          'username',
          'password',
        ],
        HKWSLabColumn: [
          'appSecret',
          'appKey',
          'deviceSerial',
          'protocol',
          'channelNo',
        ],
        HKICLabColumn: [
          'appSecret',
          'appKey',
          'deviceSerial',
          'protocol',
        ],
      },
    }
  },
  created() {
    // ilis 跳转的详情页面
    if (getQueryVariable('detail')) {
      const id
        = getQueryVariable('businessKey') || '4028826372409ea8017240e5e926000b'
      this.showModal(id, '', true)
    }
    this.getVideoConfigFirm()
  },
  methods: {
    // 设备监控供应商
    async getVideoConfigFirm() {
      const res = await this.getDictList('laboratory_eq_vendor')
      if (res && res.code === 20000) {
        this.typeLists = res.data
      }
      else {
        window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
      }
    },
    // 修改设备监控供应商
    async changeEqVendor(e, index) {
      const dictItem = this.typeLists.find(d => d.typecode === e)
      const res = await this.getDictList(e)
      if (res && res.code === 20000) {
        const item = this.dataArr[index]
        const obj = {}
        res.data.forEach((d) => {
          obj[d.typecode] = ''
        })
        item.equVendor = dictItem.typename
        item.params = obj
        this.dataArr[index] = { ...item }
      }
      else {
        window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
      }
    },
    // 获取数据字典
    async getDictList(code) {
      return await window.$oAjax({
        method: 'POST',
        url: window.$oApi.common.getDictByCode,
        params: {
          code,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      })
    },
    showModal(editId, titleName, isDetail) {
      this.isDetail = isDetail
      this.titleName = titleName
      this.editId = editId
      if (editId) {
        this.spinning = true
        window.$oAjax({
          method: 'get',
          url: window.$oApi.videoMonitorConfig.getById,
          params: { labId: editId },
        }).then((res) => {
          if (res.code === 20000) {
            this.dataArr = res.data
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            this.dataArr = []
          }
          this.spinning = false
        })
      }
    },
    dataRequired(data) {
      for (let i = 0; i < data.length; i++) {
        if (!data[i].equName) {
          window.$oAntdModal.warning(window.$oMsgTips.info(`请输入设备名称`))
          return false
        }
        if (!data[i].interfaceUrl) {
          window.$oAntdModal.warning(window.$oMsgTips.info(`请输入接口地址`))
          return false
        }
        if (data[i].uid && data[i].params) {
          for (const key in data[i].params) {
            if (
              (key.toLowerCase() === 'appsecret'
                || key.toLowerCase() === 'appkey'
                || key.toLowerCase() === 'deviceid'
                || key.toLowerCase() === 'channelid')
              && !data[i].params[key]
            ) {
              window.$oAntdModal.warning(window.$oMsgTips.info(`请输入${key}`))
              return false
            }
          }
        }
      }
      return true
    },
    handleOk() {
      if (this.dataArr.length === 0) {
        this.spinning = true
        window.$oAjax({
          method: 'delete',
          url: `/rest/labConfig/deleteAll/${this.editId}`,
        }).then((res) => {
          this.handleSave(res)
        })
      }
      else {
        if (this.dataRequired(this.dataArr)) {
          const data = []
          // eslint-disable-next-line array-callback-return
          this.dataArr.map((item) => {
            const newObj = {
              ...item,
              labId: this.editId,
            }
            if (newObj.uid) {
              delete newObj.id
              delete newObj.uid
            }
            data.push(newObj)
          })
          this.spinning = true
          window.$oAjax({
            method: 'POST',
            url: window.$oApi.videoMonitorConfig.saveUrl,
            data,
            headers: {
              'Content-Type': 'application/json',
            },
          }).then((res) => {
            this.handleSave(res)
          })
        }
      }
    },
    handleSave(res) {
      if (res && res.code === 20000) {
        window.$oAntdMessage.success('操作成功')
        this.handleCancel()
        this.callback()
      }
      else {
        window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
      }
      this.spinning = false
    },

    handleCancel() {
      this.dataArr = []
    },
    async handleAdd() {
      this.spinning = true
      const id = new Date().getTime()
      let dictItem = this.typeLists.find(d => d.typecode === 'WVPLabColumn')
      if (!dictItem)
        dictItem = this.typeLists[0] || {}
      const newData = {
        uid: id,
        id,
        equName: '',
        interfaceUrl: '',
        appSecret: '',
        appKey: '',
        equType: dictItem.typecode,
        equVendor: dictItem.typename,
      }
      const obj = {}
      let data = []
      const res = await this.getDictList(dictItem.typecode)
      if (res.code === 20000) {
        data = res.data
      }
      // eslint-disable-next-line array-callback-return
      data.map((item) => {
        obj[item.typecode] = ''
      })
      const newObj = {
        ...newData,
        params: obj,
      }
      this.dataArr = [...this.dataArr, newObj]

      this.spinning = false
    },
    deleteItem(did) {
      const newData = [...this.dataArr]
      this.dataArr = newData.filter(item => item.id !== did)
    },
    playItem(did) {
      const newData = [...this.dataArr]
      const target = newData.filter(item => did === item.id)[0]
      if (target && target.interfaceUrl) {
        this.spinning = true
        window.$oAjax({
          method: 'get',
          url: 'rest/laboratoryController/lab/live/url',
          params: { equId: target.id },
        }).then((res) => {
          let newObj = {}
          if (res.code === 20000) {
            newObj = res.data[0]
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
          this.spinning = false
          if (newObj && newObj.url) {
            this.$refs.Video.showModal(newObj.url)
          }
        })
      }
    },
    handleChange(value, did, valueName, params) {
      const newData = [...this.dataArr]
      const target = newData.filter(item => did === item.id)[0]
      if (target) {
        if (params) {
          target[params][valueName] = value
        }
        else {
          target[valueName] = value
        }
        this.dataArr = newData
      }
    },
  },
}
</script>

<style lang="less">
.spin-content {
  .ant-form-item {
    margin-bottom: 10px;
  }

  .middle-box {
    background: #eee;
    margin-bottom: 15px;
    padding: 10px;
  }

  .hitek-form-layout {
    .hitek-form-layout-label {
      width: 120px;
    }
  }
}
</style>
