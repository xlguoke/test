<!-- eslint-disable vue/require-v-for-key -->
<template>
  <div>
    <a-table
      :columns="columns"
      :data-source="data"
      bordered
      :pagination="false"
      :row-class-name="rowClassName"
      row-key="id"
    >
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.dataIndex === 'isRecovered'">
          <span>
            <span v-if="record.editable">
              {{ record.isRecovered ? '已修正' : '未修正' }}
            </span>
            <a-switch
              v-else
              :checked="record.isRecovered"
              checked-children="已修正"
              un-checked-children="未修正"
              @change="amend(record)"
            />
          </span>
        </template>
        <template v-if="column.dataIndex === 'description'">
          <div>
            <a-input
              v-if="record.editable"
              style="margin: -5px 0"
              :value="text"
              @change="
                (e) => handleChange(e.target.value, record.id, 'description')
              "
            />
            <template v-else>
              {{ text }}
            </template>
          </div>
        </template>
        <template v-if="column.dataIndex === 'severity'">
          <div>
            <div v-if="record.editable">
              <a-select
                style="width: 100%"
                :value="text"
                @change="(e) => handleSelectChange(e, record.id, 'severity')"
              >
                <a-select-option
                  v-for="(option, index) in typeLists"
                  :key="index"
                  :value="option.typename"
                >
                  {{ option.typename }}
                </a-select-option>
              </a-select>
            </div>
            <template v-else>
              {{ text }}
            </template>
          </div>
        </template>
        <template v-if="column.dataIndex === 'processProblemFileVos'">
          <div>
            <div v-for="item in text">
              <span v-if="isImg(item.name)">
                <img :src="item.url" style="width: 56px; height: 56px" />
              </span>
              <span v-else>
                {{ item.name }}
              </span>
            </div>
            <a-button v-if="record.editable" @click="upload(record)">
              上传文件
            </a-button>
          </div>
        </template>
        <template v-if="column.dataIndex === 'operation'">
          <div class="editable-row-operations">
            <template v-if="record.editable">
              <a @click="() => save(record)">保存</a>
              <a-popconfirm
                title="确定取消吗?"
                @confirm="() => cancel(record.id)"
              >
                <a>取消</a>
              </a-popconfirm>
            </template>
            <template v-else>
              <a @click="() => edit(record)">编辑</a>
              <a @click="() => deleteData(record)">删除</a>
            </template>
          </div>
        </template>
      </template>
    </a-table>
    <a-button style="margin-top: 10px" @click="add">
      新增
    </a-button>
    <UploadComponent
      ref="UploadComponent"
      :max="5"
      :uploadcall="uploadcall"
      :file-lists="fileLists"
      :multiple="true"
    />
  </div>
</template>

<script>
import qs from 'qs'
import UploadComponent from '~/providers/components/uploadComponent.vue'

const columns = [
  {
    title: '问题描述',
    dataIndex: 'description',
    width: '15%',
  },
  {
    title: '问题类型',
    dataIndex: 'severity',
    width: '20%',
  },
  {
    title: '问题截图',
    dataIndex: 'processProblemFileVos',
    width: '15%',
  },
  {
    title: '提出人',
    dataIndex: 'createName',
    width: '10%',
  },
  {
    title: '修正情况',
    dataIndex: 'isRecovered',
    width: '15%',
  },
  {
    title: '修正人',
    dataIndex: 'recoverUser',
    width: '10%',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: '25%',
  },
]
export default {
  components: {
    UploadComponent,
  },
  props: ['processInstanceId', 'businessType', 'businessId', 'changeSpinning'],
  data() {
    return {
      data: [],
      cacheData: [],
      fileLists: [],
      typeLists: [],
      columns,
      isAdd: true,
      editId: '',
      rowId: '',
    }
  },
  watch: {},
  created() {},
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getTypeData(dictGroupId) {
      window.$oAjax({
        method: 'POST',
        url: window.$oApi.common.getDictionaryData,
        params: {
          dictGroupId,
        },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res && res.success) {
          this.typeLists = res.obj
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
    getData(params) {
      // eslint-disable-next-line ts/no-unused-expressions
      params ? (this.editId = '') : ''

      this.changeSpinning && this.changeSpinning(true)
      window.$oAjax
        .get(window.$oApi.auditProcessRelation.auditProcessList, {
          params: {
            page: -1,
            size: -1,
            processInstanceId: params || this.processInstanceId,
          },
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          if (res && res.data) {
            this.data = res.data.map(item => ({
              ...item,
              processProblemFileVos: item.processProblemFileVos.map(
                fileitem => ({
                  ...fileitem,
                  uid: fileitem.systemAttachmentId,
                  name: fileitem.name,
                  status: 'done',
                  url: fileitem.fileUrl,
                }),
              ),
            }))
            this.cacheData = this.data.map(item => ({ ...item }))

            this.changeSpinning && this.changeSpinning(false)
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.message || res.msg))

            this.changeSpinning && this.changeSpinning(false)
          }
        })
    },
    // 新增
    add() {
      if (this.editId != '') {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先完成当前编辑或新增!'))
        return
      }
      const id = new Date().getTime()
      this.isAdd = true
      this.data.push({
        description: '',
        severity: '',
        processProblemFileVos: [],
        id,
        editable: true,
      })
      this.editId = id
    },
    // 删除
    deleteData(record) {
      window.$oAntdConfirm({
        title: '删除',
        content: `确认删除 ${record.description} 吗？`,
        okText: '确认',
        cancelText: '取消',
        mask: false,
        onOk: () => {
          window.$oAjax({
            method: 'get',
            url: window.$oApi.auditProcessRelation.auditProcessDel,
            params: { problemId: record.id },
          }).then((res) => {
            if (res.code && res.code !== 20010) {
              window.$oAntdMessage.success('删除成功')
              this.getData()
            }
            else {
              window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            }
          })
        },
      })
    },
    handleChange(value, id, column) {
      const newData = [...this.data]
      const target = newData.filter(item => id === item.id)[0]
      if (target) {
        target[column] = value
        this.data = newData
      }
    },
    handleSelectChange(value, id, column) {
      const newData = [...this.data]
      const target = newData.filter(item => id === item.id)[0]
      if (target) {
        target[column] = value
        this.data = newData
      }
    },
    edit(record) {
      const id = record.id
      this.isAdd = false
      const newData = [...this.data]
      const target = newData.filter(item => id === item.id)[0]
      this.editId = id
      if (target) {
        target.editable = true
        this.data = newData
      }
    },
    save(record) {
      const method = 'POST'
      const data = {
        description: record.description,
        severity: record.severity,
        systemFileId: record.processProblemFileVos
          .map(item => item.uid)
          .join(','),
        processInstanceId: this.processInstanceId,
        businessType: this.businessType, // 业务类型
        businessId: this.businessId, // 业务id
      }
      if (this.isAdd === false) {
        data.id = record.id
      }
      window.$oAjax({
        method,
        url: window.$oApi.auditProcessRelation.auditProcessSave,
        data: qs.stringify({ ...data }),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res.code && res.code !== 20010) {
          window.$oAntdMessage.success('操作成功')
          this.editId = ''
          this.getData()
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.confirmLoading = false
      })
    },
    cancel(id) {
      if (this.isAdd === true) {
        this.data = this.data.filter(item => item.id != id)
      }
      else {
        const newData = [...this.data]
        const target = newData.filter(item => id === item.id)[0]
        if (target) {
          Object.assign(
            target,
            this.cacheData.filter(item => id === item.id)[0],
          )
          delete target.editable
          this.data = newData
        }
      }
      this.editId = ''
    },
    selectType() {
      if (this.needScroll == '1') {
        top.document.body.scrollTo({
          top: top.screen.height,
          behavior: 'smooth',
        })
      }
      this.$refs.QuestionType.showModal()
    },
    amend(record) {
      let url
      if (record.isRecovered) {
        url = window.$oApi.auditProcessRelation.disAmend
      }
      else {
        url = window.$oApi.auditProcessRelation.amend
      }

      window.$oAjax({
        method: 'get',
        url,
        params: { problemId: record.id },
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      }).then((res) => {
        if (res.code && res.code !== 20010) {
          window.$oAntdMessage.success('操作成功')
          this.getData()
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
    upload(record) {
      this.fileLists = record.processProblemFileVos.map(item => ({
        uid: item.uid,
        name: item.name,
        status: 'done',
        url: item.url,
      }))
      this.rowId = record.id

      this.$refs.UploadComponent.showModal()
    },
    uploadcall(res) {
      // 绑定指定行的数据
      const values = res.map(item => ({
        uid: item.id || item.uid,
        name: item.attachmenttitle || item.name,
        status: 'done',
        url: item.realpath || item.url,
      }))
      const newData = [...this.data]
      const target = newData.filter(item => this.rowId === item.id)[0]

      if (target) {
        target.processProblemFileVos = values
        this.data = newData
      }
    },
    isImg(fileName) {
      // 后缀获取
      let suffix = ''
      // 获取类型结果
      let result = ''
      try {
        const flieArr = fileName.split('.')
        suffix = flieArr[flieArr.length - 1]
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (err) {
        suffix = ''
      }
      // fileName无后缀返回 false
      if (!suffix) {
        return false
      }
      suffix = suffix.toLocaleLowerCase()
      // 图片格式
      const imglist = ['png', 'jpg', 'jpeg', 'bmp', 'gif']
      // 进行图片匹配
      result = imglist.find(item => item === suffix)
      if (result) {
        // return 'image';
        return true
      }
      else {
        return false
      }
    },
  },
}
</script>

<style scoped></style>
