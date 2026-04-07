<template>
  <div>
    <a-spin :spinning="spinning">
      <div class="spin-content">
        <a-form ref="formRef" :model="dataObj">
          <a-form-item
            label="图片名称"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :rules="[{ required: true, message: '图片名称不能为空!' }]"
            name="iconName"
          >
            <a-input
              v-model:value="dataObj.iconName"
              :disabled="isDetail"
              placeholder="请输入"
            />
          </a-form-item>
          <a-form-item
            label="图标类型"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
            :rules="[{ required: true, message: '图标类型不能为空!' }]"
            name="iconType"
          >
            <a-select
              v-model:value="dataObj.iconType"
              :disabled="isDetail"
              placeholder="请选择"
              @change="handleSelectChange"
            >
              <!-- <a-select-option value="1"> 系统图标 </a-select-option> -->
              <!-- <a-select-option value="2"> 菜单图标 </a-select-option> -->
              <!-- <a-select-option value="3"> 桌面图标 </a-select-option> -->
              <a-select-option
                v-for="(comItem, index) in iconTypeData"
                :key="index"
                :value="comItem.value"
              >
                {{ comItem.name }}
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item
            label="图标"
            :label-col="labelCol"
            :wrapper-col="wrapperCol"
          >
            <a-button v-if="!isDetail" @click="upload">
              上传
            </a-button>
            <div v-for="(item, index) in fileLists" :key="index">
              <a
                :href="`${rootUrl}/uploadController.do?download&accessoryId=${item.uid}`"
              >
                <img :src="item.url" style="max-width: 56px" />
              </a>
            </div>
          </a-form-item>
        </a-form>
      </div>
    </a-spin>
    <UploadComponent
      ref="UploadComponent"
      :max="1"
      :uploadcall="uploadcall"
      :file-lists="fileLists"
      :accept="accept"
    />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { getQueryVariable } from '~/providers/common/utils'
import UploadComponent from '~/providers/components/uploadComponent.vue'
import { rootUrl } from '~/providers/configs/rootUrl'

export default {
  components: {
    UploadComponent,
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
      isDetail: false,
      dataObj: {},
      iconTypeData: [
        { name: '系统图标', value: 1 },
        { name: '菜单图标', value: 2 },
        { name: '桌面图标', value: 3 },
      ],
      fileLists: [],
      accept: ' .jpg, .png , .jpeg, .gif, .bmp',
    }
  },
  created() {
    // ilis 跳转的详情页面
    if (getQueryVariable('detail')) {
      const id
        = getQueryVariable('businessKey') || '4028826372409ea8017240e5e926000b'
      this.showModal(id, true)
    }
  },
  methods: {
    handleSelectChange() {

    },
    showModal(dataObj, isDetail) {
      this.isDetail = isDetail
      if (dataObj) {
        this.dataObj = dataObj
        this.fileLists = [
          {
            uid: dataObj.attachId,
            name: `${dataObj.iconName}.${dataObj.extend}`,
            extend: dataObj.extend,
            url: dataObj.url,
          },
        ]
      }
    },
    upload() {
      this.$refs.UploadComponent.showModal()
    },
    uploadcall(res) {
      this.fileLists = res.map(item => ({
        uid: item.id || item.uid,
        name: item.attachmenttitle || item.name,
        extend: item.extend,
        url: item.realpath || item.url,
      }))
      if (res.length > 0) {
        const data = this.dataObj.iconName
        const strName = res[0].attachmenttitle.slice(
          0,
          -(res[0].extend.length + 1),
        )
        if (!data.iconName) {
          this.dataObj.iconName = strName
        }
      }
    },
    dataRequired() {
      if (this.fileLists.length == 0) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先上传文件'))
        return false
      }
      return true
    },
    handleOk() {
      this.$refs.formRef.validateFields().then(() => {
        const data = {
          ...this.dataObj,
        }
        if (this.fileLists.length > 0) {
          data.attachId = this.fileLists[0].uid
          data.url = this.fileLists[0].url
          data.extend = this.fileLists[0].extend
        }

        if (this.dataObj.id) {
          data.id = this.dataObj.id
        }

        if (this.dataRequired(data)) {
          this.spinning = true
          window.$oAjax({
            method: 'POST',
            url: window.$oApi.iconList.saveOrUpdateIcon,
            data,
            headers: {
              'Content-Type': 'application/json',
            },
          }).then((res) => {
            if (res.code === 20000) {
              window.$oAntdMessage.success('操作成功')
              this.handleCancel()
              this.callback()
            }
            else {
              if (res.success === false) {
                window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
              }
            }
            this.spinning = false
          })
        }
      })
    },
    handleCancel() {
      this.dataObj = {}
      this.fileLists = []
    },
  },
}
</script>

<style lang="less"></style>
