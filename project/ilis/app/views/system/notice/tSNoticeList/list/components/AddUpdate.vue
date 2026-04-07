<!-- eslint-disable vue/no-unused-refs -->
<template>
  <ht-modal
    :title="title"
    :open="visible"
    :mask-closable="false"
    :keyboard="false"
    :body-style="{
      'height': 'calc(100vh - 240px)',
      'overflow-y': 'scroll',
    }"
    width="70%"
    @cancel="handleCancel"
    @ok="onSubmit"
  >
    <a-spin :spinning="spinning">
      <a-form
        ref="ruleForm"
        :model="form"
        :rules="rules"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <a-form-item ref="name" label="标题" name="noticeTitle">
          <a-input
            v-model:value="form.noticeTitle"
            placeholder="请输入标题,做多50字"
            allow-clear
            :max-length="50"
          />
        </a-form-item>
        <a-form-item label="内容" name="noticeContent">
          <WangEditor v-model:value="form.noticeContent"></WangEditor>
        </a-form-item>
        <a-form-item label="类型:" required name="noticeType">
          <a-radio-group v-model:value="form.noticeType">
            <a-radio value="2">
              公告
            </a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="授权级别:" name="noticeLevel">
          <a-radio-group v-model:value="form.noticeLevel">
            <a-radio value="1">
              全员
            </a-radio>
            <a-radio value="2">
              角色授权
            </a-radio>
            <a-radio value="3">
              用户授权
            </a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          v-if="form.noticeLevel == '2'"
          label="角色授权"
          name="roleIds"
        >
          <a-select
            v-model:value="form.roleIds"
            style="width: 100%"
            mode="multiple"
            allow-clear
            show-search
            :filter-option="filterOption"
          >
            <a-select-option
              v-for="item in roleListData"
              :key="item.id"
              :value="item.id"
            >
              {{ item.roleName }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item
          v-if="form.noticeLevel == '3'"
          label="用户授权"
          name="userIds"
        >
          <a-select
            v-model:value="form.userIds"
            style="width: 100%"
            mode="multiple"
            allow-clear
            show-search
            :filter-option="filterOption1"
          >
            <a-select-option
              v-for="item in userListData"
              :key="item.id"
              :value="item.id"
            >
              {{ `${item.realName}-` + `(${item.userName})` }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="是否必读" name="mustRead">
          <a-radio-group v-model:value="form.mustRead">
            <a-radio :value="true">
              是
            </a-radio>
            <a-radio :value="false">
              否
            </a-radio>
          </a-radio-group>
          <span>
            设为必读后，当前账号未阅读此通知公告的，在登录后会自动弹出阅读，并在最小阅读时长后方可关闭</span>
        </a-form-item>
        <a-form-item
          v-if="form.mustRead == true"
          label="必读期限"
          name="mustReadDeadline"
        >
          <a-date-picker
            v-model:value="form.mustReadDeadline"
            style="width: 60%"
            placeholder="请选择时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
            show-time
          />
          <span> 在此期限内登录系统自动弹出公告</span>
        </a-form-item>
        <a-form-item
          v-if="form.mustRead == true"
          label="最小阅读时长"
          name="minReadingTime"
        >
          <a-input-number
            v-model:value="form.minReadingTime"
            style="width: 60%"
            placeholder="请输入0-100之内的数字"
            :min="1"
            :max="100"
          />
          <span> 自动弹出的公告，必须阅读x秒后才可以关闭</span>
        </a-form-item>
        <a-form-item label="阅读期限" name="noticeTerm">
          <a-date-picker
            v-model:value="form.noticeTerm"
            style="width: 60%"
            placeholder="请选择时间"
            value-format="YYYY-MM-DD HH:mm:ss"
            format="YYYY-MM-DD HH:mm:ss"
            show-time
          />
        </a-form-item>
        <a-form-item label="附件">
          <a-button type="primary" @click="handleFile">
            上传文件
          </a-button>
          <ul v-if="filelist && filelist.length" class="file-list">
            <li
              v-for="(item, index) in filelist"
              :key="index"
              class="file-item"
            >
              <span class="file-name" :title="item.annexName">{{
                item.annexName
              }}</span>
              <p
                class="download-icon"
                @click="getFileBlob(item.annexUrl, item.annexName)"
              >
                <DownloadOutlined />
              </p>
            </li>
          </ul>
        </a-form-item>
      </a-form>
    </a-spin>
    <FileUpload ref="FileUpload" @upload-sucess="uploadSucess"></FileUpload>
  </ht-modal>
</template>

<script>
import { DownloadOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'
import { downloadFile } from '~/providers/common/utils'
import FileUpload from '~/providers/components/uploadFileModalTemp/index.vue'
import WangEditor from '~/providers/components/wangEditor/WangEditor.vue'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'
import { datagridRole, doAdd, getdetail, userName } from '../../api/list'

export default {
  components: {
    WangEditor,
    FileUpload,
    DownloadOutlined,
  },
  emits: ['update'],
  data() {
    return {
      visible: false,
      spinning: false,
      title: '新增',
      content: [],
      id: '',
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
      other: '',
      form: {
        noticeTitle: '', // 公告标题标题
        noticeContent: '', // 公告内容
        noticeType: '2',
        noticeLevel: '1',
        roleIds: [],
        userIds: [],
        mustRead: false, // 是否必读
        minReadingTime: '20',
        mustReadDeadline: undefined,
        noticeTerm: undefined, // 阅读期限
      },
      rules: {
        noticeTitle: [
          { required: true, message: '请输入标题', trigger: 'blur' },
        ],
        noticeContent: [
          { required: true, message: '请输入内容', trigger: 'blur' },
        ],
        noticeLevel: [{ required: true, message: '请选择', trigger: 'change' }],
        roleIds: [{ required: true, message: '请选择', trigger: 'change' }],
        userIds: [{ required: true, message: '请选择', trigger: 'change' }],
        mustRead: [{ required: true, message: '请选择', trigger: 'change' }],
        noticeTerm: [
          { required: true, message: '请选择阅读期限', trigger: 'change' },
        ],
        minReadingTime: [
          { required: true, message: '请输入最小阅读时长', trigger: 'blur' },
        ],
        mustReadDeadline: [
          { required: true, message: '请选择必读期限', trigger: 'change' },
        ],
      },
      roleListData: [],
      userListData: [],
      filelist: [],
      editorKey: '',
    }
  },
  methods: {
    async showModal(id) {
      this.visible = true
      this.spinning = true
      if (id) {
        this.id = id
        this.title = '编辑'
        await this.getData(id)
      }
      else {
        this.id = ''
      }
      window.$oNextTick(() => {
        this.editorKey = Date.now()
      })
      // 获取角色
      await this.getDatagridRole()
      await this.getuserName()
      this.spinning = false
    },
    async getDatagridRole() {
      const resultData = await datagridRole()
      this.roleListData = resultData.rows || []
    },
    // 获取用户
    async getuserName() {
      const resultData = await userName({
        page: 1,
      })
      this.userListData = resultData.rows || []
    },
    async getData(id) {
      const result = await getdetail(id)
      if (result.code == 20000) {
        this.form = result.data || {}
        // 处理角色
        if (result.data.roleIds && result.data.roleIds.length) {
          this.form.roleIds = result.data.roleIds
        }
        else {
          this.form.roleIds = []
        }
        // 处理用户
        if (result.data.userIds && result.data.userIds.length) {
          this.form.userIds = result.data.userIds
        }
        else {
          this.form.userIds = []
        }
        // 验证阅读期限是否you时分秒
        if (this.form.noticeTerm) {
          const dateFormat = 'YYYY-MM-DD HH:mm:ss'
          const isValidDate = dayjs(
            this.form.noticeTerm,
            dateFormat,
            true,
          ).isValid()
          dayjs(this.form.noticeTerm).format(dateFormat)
          if (!isValidDate) {
            this.form.noticeTerm = dayjs(this.form.noticeTerm).format(
              dateFormat,
            )
          }
        }
        // 处理文件数据
        if (result.data.attaches && result.data.attaches.length) {
          this.filelist = result.data.attaches.map((item) => {
            return {
              annexName: item.attachmenttitle,
              id: item.id,
              status: 2,
              uid: item.id,
              annexUrl: item.realpath,
            }
          })
          this.$refs.FileUpload.setFileData(this.filelist)
        }
        // 回显文件数据
      }
      else {
        window.$oAntdMessage.error('获取数据失败')
      }
    },
    handleCancel() {
      $emit(this, 'update', false)
      this.form = {
        noticeTitle: '', // 公告标题标题
        noticeContent: '', // 公告内容
        noticeType: '2',
        noticeLevel: '1',
        roleIds: [],
        userIds: [],
        mustRead: false, // 是否必读
        minReadingTime: '20',
        mustReadDeadline: undefined,
        noticeTerm: undefined, // 阅读期限
      }
    },
    onSubmit() {
      this.$refs.ruleForm.validate().then(async () => {
        // 整理数据
        const {
          noticeTitle,
          noticeContent,
          noticeType,
          noticeLevel,
          roleIds,
          userIds,
          mustRead,
          mustReadDeadline,
          minReadingTime,
          noticeTerm,
          createTime,
        } = this.form
        const body = {
          noticeTitle,
          noticeContent,
          noticeType,
          noticeLevel,
          mustRead,
        }
        // 处理角色
        if (roleIds && roleIds.length && noticeLevel == '2') {
          body.roleIds = roleIds
        }
        else {
          delete body.roleIds
        }
        // 处理用户
        if (userIds && userIds.length && noticeLevel == '3') {
          body.userIds = userIds
        }
        else {
          delete body.userIds
        }
        // 是必读有期限，最小阅读时长
        if (mustRead) {
          body.minReadingTime = minReadingTime
          if (mustReadDeadline) {
            body.mustReadDeadline = mustReadDeadline
          }
        }
        else {
          body.minReadingTime = ''
          body.mustReadDeadline = ''
        }
        if (noticeTerm) {
          body.noticeTerm = noticeTerm
        }
        else {
          body.noticeTerm = ''
        }
        // 处理文件
        if (this.filelist && this.filelist.length) {
          const attachIdsArr = []
          // eslint-disable-next-line array-callback-return
          this.filelist.map((item) => {
            if (item.id) {
              attachIdsArr.push(item.id)
            }
          })
          body.attachIds = attachIdsArr
        }
        // 修改
        try {
          let result
          if (this.id) {
            body.createTime = createTime
            body.id = this.id
            result = await doAdd(body)
          }
          else {
            result = await doAdd(body)
          }

          if (result.code === 20000) {
            window.$oAntdMessage.success('发布成功')
            $emit(this, 'update', true)
          }
          else {
            window.$oAntdMessage.error('发布失败')
          }
        }
        // eslint-disable-next-line unused-imports/no-unused-vars
        catch (e) {
          window.$oAntdMessage.error('发布失败')
        }
      })
    },
    resetForm() {
      this.$refs.ruleForm.resetFields()
    },
    filterOption1(input, option) {
      return (
        option.componentOptions.children[0].text
          .toLowerCase()
          .includes(input.toLowerCase())
      )
    },
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text
          .toLowerCase()
          .includes(input.toLowerCase())
      )
    },
    handleFile() {
      this.$refs.FileUpload.openModal()
    },
    // 文件上传成功的回调
    uploadSucess(tables) {
      if (tables && tables.length) {
        this.filelist = tables.filter(item => item.status == 2) || []
      }
    },
    // 获取文件流
    getFileBlob(url, name) {
      window.$oAjax({
        url,
        method: 'get',
        responseType: 'blob',
      }).then((res) => {
        const blob = new Blob([res])
        const url = window.URL.createObjectURL(blob)
        downloadFile(url, name)
      })
    },
  },
}
</script>

<style lang="less" scoped>
.wechatNotice-table tr td {
  word-wrap: break-word;
  word-break: break-all;
}
.file-list {
  margin-top: 10px;
  .file-item {
    display: inline-flex;
    align-items: center;
    padding-left: 8px;
    margin-top: 4px;
    margin-right: 8px;
    border: 1px solid #dcdcdc;
    border-radius: 4px;
    .file-name {
      flex: 1;
      max-width: 300px;
      min-width: 100px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .download-icon {
      width: 50px;
      border-left: 1px solid #dcdcdc;
      text-align: center;
      font-size: 18px;
      color: #1890ff;
      cursor: pointer;
      &:hover {
        opacity: 0.8;
      }
    }
  }
}
</style>
