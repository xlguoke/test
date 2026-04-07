<template>
  <div>
    <ht-modal
      v-if="uploadVisible"
      v-model:open="uploadVisible"
      :title="isAdd ? '新增' : '编辑'"
      centered
      :mask-closable="false"
      :confirm-loading="confirmLoading"
      width="600px"
      class="otherAchievement-uploadModal"
      @ok="handleSubmit"
    >
      <a-form ref="formRef" :model="data">
        <a-row>
          <a-col span="24">
            <a-form-item
              label="菜单名称"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 15 }"
              name="functionName"
              :rules="[{ required: true, message: '请输入菜单名称' }]"
            >
              <a-input
                v-model:value="data.functionName"
                :disabled="isDisabled"
                placeholder="请输入"
              />
            </a-form-item>
          </a-col>
          <a-col span="24">
            <a-form-item
              label="菜单类型"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 15 }"
            >
              <a-select
                v-model:value="menuType"
                placeholder="请选择"
                @change="changeType"
              >
                <a-select-option value="1">
                  分类导航
                </a-select-option>
                <a-select-option value="2">
                  平台应用
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col v-if="menuType != 1" span="24">
            <a-form-item
              label="父级菜单"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 15 }"
              name="_parentId"
              :rules="[{ required: true, message: '请选择' }]"
            >
              <a-select
                v-model:value="data._parentId"
                placeholder="请选择"
              >
                <a-select-option
                  v-for="item in menusArr"
                  :key="item.id"
                  :value="item.id"
                >
                  {{ item.functionName }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col v-if="menuType != 1" span="24">
            <a-form-item
              label="看板地址"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 15 }"
              name="boardUrl"
              :rules="[{ required: true, message: '请输入' }]"
            >
              <a-input
                v-model:value="data.boardUrl"
                :disabled="isDisabled"
                placeholder="请输入"
              />
            </a-form-item>
          </a-col>
          <a-col v-if="menuType != 1" span="24">
            <a-form-item
              label="菜单地址"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 15 }"
              name="functionUrl"
              :rules="[{ required: true, message: '请输入' }]"
            >
              <a-input
                v-model:value="data.functionUrl"
                :disabled="isDisabled"
                placeholder="请输入"
              />
            </a-form-item>
          </a-col>
          <a-col span="24">
            <a-form-item
              label="菜单顺序"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 15 }"
              name="functionOrder"
              :rules="[{ required: true, message: '请输入' }]"
            >
              <a-input-number
                v-model:value="data.functionOrder"
                :disabled="isDisabled"
                style="width: 100%"
                placeholder="请输入"
              />
            </a-form-item>
          </a-col>

          <a-col v-if="menuType != 1" span="24">
            <a-form-item
              label="公钥"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 15 }"
              name="publicKey"
              :rules="[{ required: true, message: '请输入' }]"
            >
              <a-input
                v-model:value="data.publicKey"
                :disabled="isDisabled"
                placeholder="请输入"
              />
            </a-form-item>
          </a-col>

          <a-col v-if="menuType != 1" span="24">
            <a-form-item
              label="私钥"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 15 }"
              name="privateKey"
              :rules="[{ required: true, message: '请输入' }]"
            >
              <a-input
                v-model:value="data.privateKey"
                :disabled="isDisabled"
                placeholder="请输入"
              />
            </a-form-item>
          </a-col>
          <a-col v-if="menuType != 1" span="24">
            <a-form-item
              label="应用说明"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 15 }"
              name="functionExplain"
              :rules="[{ required: true, message: '请输入' }]"
            >
              <a-textarea
                v-model:value="data.functionExplain"
                :disabled="isDisabled"
                placeholder="请输入"
              />
            </a-form-item>
          </a-col>
          <a-col v-if="menuType != 1" span="24">
            <a-form-item
              label="图标"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 15 }"
            >
              <a-upload
                :multiple="true"
                list-type="picture-card"
                :action="uploadUrl"
                :show-upload-list="false"
                accept="image/jpg,image/png"
                @change="handleFileChange"
              >
                <img
                  v-if="fileData.realpath"
                  :src="fileData.realpath"
                  alt="file"
                />
                <div v-else>
                  <LoadingOutlined v-if="loading" />
                  <PlusOutlined v-else />
                  <div class="ant-upload-text">
                    上传图标
                  </div>
                </div>
              </a-upload>
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </ht-modal>
  </div>
</template>

<script>
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import qs from 'qs'
import { rootUrl } from '~/providers/configs/rootUrl'

export default {
  components: {
    LoadingOutlined,
    PlusOutlined,
  },
  props: ['callback', 'id'],
  data() {
    return {
      loading: false,
      menusArr: [],
      menuType: '1', // 1：tab分类导航  2应用层级
      fileData: {},
      uploadUrl: `${rootUrl}/uploadController.do?upload`,
      isDisabled: false,
      uploadVisible: false,
      confirmLoading: false,

      fileLists: [],
      isAdd: true,
      data: {},
      id: '',
    }
  },
  async created() {},
  methods: {
    handleFileChange({ file }) {
      if (file.status === 'uploading') {
        this.loading = true
        return
      }
      if (file.status === 'done') {
        this.fileData = file.response.obj[0]
        this.loading = false
      }
    },

    showModal(data) {
      if (data) {
        this.isAdd = false
        this.data = data

        data.iconUrl
          ? (this.fileData.realpath = data.iconUrl)
          : (this.fileData = {})
        // eslint-disable-next-line vue/no-mutating-props
        this.id = data.id
      }
      else {
        this.data = {}
        this.isAdd = true
        this.fileData = {}
        // eslint-disable-next-line vue/no-mutating-props
        this.id = ''
      }

      data && data.functionUrl ? (this.menuType = '2') : (this.menuType = '1')

      this.uploadVisible = true
    },

    cancelModal() {
      this.data = {}
      this.uploadVisible = false
    },
    changeType() {

    },
    handleSubmit() {
      this.$refs.formRef.validateFields().then(() => {
        this.confirmLoading = true

        const values = { ...this.data }

        if (values._parentId) {
          values['TSFunction.id'] = values._parentId
        }
        else {
          values['TSFunction.id'] = '4028b22987922a8401879318e8710116'
        }

        const data = {
          ...values,
          platform: '1',
          functionType: '10',
          functionLevel: '1',
          iconUrl: this.fileData.realpath,
          id: this.id,
        }
        window.$oAjax({
          method: 'POST',
          url: `functionController.do?saveFunction`,
          data: qs.stringify(data),
        }).then(
          (res) => {
            if (res.success) {
              this.cancelModal()
              message.success('添加成功')
              this.callback()
            }
            else {
              message.error(res.message || res.msg)
            }
            this.confirmLoading = false
          },
          () => {
            this.confirmLoading = false
          },
        )
      })
    },

    // uploadcall(res) {
    //   this.fileLists = res.map(item => ({
    //     uid: item.id,
    //     name: item.attachmenttitle,
    //     status: 'done',
    //     url: item.realpath,
    //   }));
    // }
  },
}
</script>
