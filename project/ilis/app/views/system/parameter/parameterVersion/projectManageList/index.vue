<template>
  <div class="projectManageList parameterVersion">
    <div class="projectManageList-btn">
      <a-button :disabled="loading" size="large" type="primary" @click="add">
        新增
      </a-button>
    </div>
    <a-table
      :columns="columns"
      :row-class-name="rowClassName"
      :data-source="data"
      bordered
      :pagination="false"
      :loading="loading"
      row-key="id"
      :custom-row="customRow"
    >
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.dataIndex === 'versionName'">
          <div>
            <a-input
              v-if="record.editable"
              style="margin: -5px 0"
              :value="text"
              @change="
                (e) => handleChange(e.target.value, record.id, 'versionName')
              "
            />
            <template v-else>
              {{ text }}
            </template>
          </div>
        </template>

        <template v-if="column.dataIndex === 'isEnable'">
          <span>
            <!-- <span v-if="record.editable"></span> -->
            <!-- <a-switch v-else @change="isEnableFun(record)" checkedChildren="已启用" unCheckedChildren="未启用" :checked="isEnable=='1'?true:false" /> -->
            <a-switch
              checked-children="已启用"
              un-checked-children="未启用"
              :checked="text == '1' ? true : false"
              @change="isEnableFun(record)"
            />
          </span>
        </template>

        <template v-if="column.dataIndex === 'operation'">
          <div class="editable-row-operations">
            <template v-if="record.editable">
              <a @click="() => save(record)">保存</a>
              <a-popconfirm
                title="确定要取消吗?"
                @confirm="() => cancel(record.id)"
              >
                <a>取消</a>
              </a-popconfirm>
            </template>
            <template v-else>
              <a @click="(e) => editModal(record.id)">编辑</a>
              <a @click="(e) => copy(record.id)">复制版本</a>
            </template>
          </div>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import sseRequestProgress from '~/components/sseRequestProgress'

const columns = [
  {
    title: '版本名称',
    dataIndex: 'versionName',
    width: '30%',
    scopedSlots: { customRender: 'versionName' },
  },
  {
    title: '创建时间',
    dataIndex: 'createDate',
    width: '15%',
  },
  {
    title: '是否启用',
    dataIndex: 'isEnable',
    width: '15%',
    scopedSlots: { customRender: 'isEnable' },
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: '10%',
    scopedSlots: { customRender: 'operation' },
  },
]

export default {
  components: {},
  data() {
    return {
      data: [],
      cacheData: [],
      count: 0,
      columns,
      selectedRowKeys: [],
      selectedRows: [],
      isAdd: false,
      page: 1,
      size: 9999,
      isEdit: false,
      loading: false,
      copyId: '', // 复制版本id
      customRow: (record) => {
        return {
          onClick: () => {
            this.selectedRowKeys = [record.id]
            this.selectedRows = [record]
          },
        }
      },
    }
  },
  computed: {},
  created() {
    this.getData()
  },
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getData() {
      const { page, size } = this
      this.loading = true
      window.$oRest
        .get(window.$oApi.parameterVersion.getData, {
          params: {
            page,
            size,
          },
        })
        .then((res) => {
          this.loading = false
          if (res && res.obj) {
            this.data = res.obj
            this.count = this.data.length
            this.cacheData = this.data.map(item => ({ ...item }))

            this.copyId && this.editModal(this.copyId)
          }
        })
    },
    // 新增
    add() {
      if (this.data.find(item => item.editable)) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先完成当前新增或编辑'))
        return
      }

      const newData = {
        id: this.count,
        versionName: ``,
        createDate: dayjs(new Date()).format('YYYY-MM-DD HH:mm:ss'),
        isEnable: 0,
      }
      if (newData) {
        newData.editable = true
        this.data = [...this.data, newData]
      }

      window.$oNextTick(() => {
        window.scrollTo({
          top: document.body.clientHeight,
          behavior: 'smooth',
        })
      })
    },
    // 修改版本名称
    handleChange(value, id, column) {
      const newData = [...this.data]
      const target = newData.filter(item => id === item.id)[0]
      if (target) {
        target[column] = value
        this.data = newData
      }
    },
    // 保存
    save(record) {
      // eslint-disable-next-line ts/no-unused-expressions
      this.copyId ? (this.copyId = '') : ''
      const data = {
        versionName: record.versionName,
      }
      if (this.isEdit) {
        data.id = record.id
        this.isEdit = false
      }
      this.loading = true
      window.$oAjax({
        method: 'POST',
        url: window.$oApi.parameterVersion.addUpdate,
        data: JSON.stringify({ ...data }),
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'content-type': 'application/json',
        },
      })
        .then((res) => {
          if (res.success) {
            this.getData()
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
          this.loading = false
        })
        .catch(() => {
          this.loading = false
        })
    },
    // 取消
    cancel(id) {
      if (this.copyId) {
        // 复制取消
        window.$oAjax({
          method: 'get',
          url: window.$oApi.parameterVersion.delete,
          params: { id: this.copyId },
          // headers: {
          //   "X-Requested-With": "XMLHttpRequest",
          //   "content-type":"application/json"
          // }
        }).then((res) => {
          if (res.success) {
            this.copyId = ''
            this.getData()
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
        })
      }
      else {
        if (this.isEdit) {
          // 编辑取消
          this.isEdit = false
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
        else {
          // 新增取消
          const newData = [...this.data]
          this.data = newData.filter(item => item.id !== id)
        }
      }
    },
    // 编辑弹窗
    editModal(id) {
      if (this.data.find(item => item.editable)) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先完成当前新增或编辑'))
        return
      }

      this.isEdit = true
      const newData = [...this.data]
      const target = newData.filter(item => id === item.id)[0]
      if (target) {
        target.editable = true
        this.data = newData
      }

      if (this.copyId) {
        setTimeout(() => {
          window.scrollTo({
            top: document.body.clientHeight,
            behavior: 'smooth',
          })
        }, 500)
      }
    },
    // 是否启用
    isEnableFun(record) {
      if (record.isEnable === '1') {
        return
      }
      window.$oAjax({
        method: 'get',
        url: window.$oApi.parameterVersion.enableVersion,
        params: { id: record.id },
      }).then((res) => {
        if (res.success) {
          window.$oAntdMessage.success('操作成功')
          this.getData()
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
      })
    },
    // 复制版本tab
    async copy(id) {
      sseRequestProgress.show({
        api: `${window.$oApi.parameterVersion.copyVersion}?id=${id}`,
        method: 'post',
        onComplete: (res) => {
          window.$oAntdModal.success({
            title: '复制版本结果',
            content: `复制成功, 请编辑或取消复制完成的版本信息`,
          })
          this.copyId = res
          this.getData()
        },
      })
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>
