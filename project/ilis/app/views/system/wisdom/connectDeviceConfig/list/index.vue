<template>
  <div>
    <!-- 查询页面 -->
    <a-form
      layout="inline"
      :model="formInline"
      class="formDom"
      @submit.prevent="handleSubmit"
    >
      <a-form-item>
        <a-input
          v-model:value.trim="formInline.q"
          placeholder="请输入智能装置名称,智能装置ID"
          title="请输入智能装置名称,智能装置ID"
          style="width: 200px"
          @press-enter.prevent="handleSubmit"
        >
        </a-input>
      </a-form-item>
      <a-form-item>
        <a-input
          v-model:value.trim="formInline.descr"
          type="text"
          placeholder="请输入备注"
        >
        </a-input>
      </a-form-item>
      <a-form-item>
        <a-select
          v-model:value="formInline.type"
          placeholder="设备类型"
          style="width: 120px"
          @change="handleChooseChange"
        >
          <a-select-option
            v-for="item in deviceData"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-input
          v-model:value.trim="formInline.eqsnOrName"
          type="text"
          placeholder="请输入关联设备编号,关联设备名称"
          title="请输入关联设备ID,关联设备名称"
          style="width: 220px"
        >
        </a-input>
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">
          查询
        </a-button>
        <a-button style="margin-left: 10px" @click="handleReset">
          重置
        </a-button>
      </a-form-item>
    </a-form>
    <!-- 操作 -->
    <div class="my-2">
      <a-button type="primary" @click="add">
        新增
      </a-button>
      <a-button danger @click="handleDelete">
        批量删除
      </a-button>
      <a-button @click="handlePrint">
        批量导入
      </a-button>
      <a-button @click="handleUpdate">
        手动更新标签
      </a-button>
    </div>
    <!-- 表格 -->
    <div>
      <a-table
        :columns="columns"
        bordered
        :data-source="tableData"
        :loading="loading"
        :row-selection="rowSelection"
        row-key="id"
        :pagination="{
          total,
          pageSize: formInline.size,
          current: formInline.page,
          pageSizeOptions: ['10', '20', '30', '50'],
          showTotal: (total) =>
            `${
              formInline.page === 1
                ? 1
                : (formInline.page - 1) * formInline.size + 1
            }-${
              formInline.size * formInline.page < total
                ? formInline.size * formInline.page
                : total
            } 共 ${total} 条`,
          showQuickJumper: true,
          showSizeChanger: true,
        }"
        @change="handleChange"
      >
        <template #bodyCell="{ column, record }">
          <a-space v-if="column.dataIndex === 'action'" :size="0">
            <a-button
              type="link"
              size="small"
              @click="edit(record)"
            >
              编辑
            </a-button>
            <a-button
              type="link"
              size="small"
              danger
              @click="deleteDevice(record)"
            >
              删除
            </a-button>
            <a-button
              type="link"
              size="small"
              @click="handleLog(record)"
            >
              日志
            </a-button>
          </a-space>
          <template v-if="column.dataIndex === 'active'">
            <a-switch :checked="record.active" @change="changStatus(record)" />
          </template>
          <template v-if="column.dataIndex === 'type'">
            <div v-if="record.type === 'EXHIBIT'">
              墨水屏
            </div>
            <div v-if="record.type === 'CONTROLLER'">
              智能空开
            </div>
            <div v-if="record.type === 'MEASURE'">
              量具设备
            </div>
          </template>
        </template>
      </a-table>
    </div>
    <AddEditModel ref="AddEditModel" @update="update"></AddEditModel>
    <FileModel ref="fileModel" @update="update"></FileModel>
    <Log ref="log"></Log>
  </div>
</template>

<script>
import Log from '~/providers/components/logsDevice.vue'
import { deleteData, getByIdActivity, getList, updateLabel } from '../api'
import AddEditModel from './components/addEditModal.vue'
import fileModel from './components/fileModel.vue'

const columns = [
  {
    title: '智能装置ID',
    dataIndex: 'id',
  },
  {
    title: '智能装置名称',
    dataIndex: 'name',
    ellipsis: true,
  },
  {
    title: 'MAC地址',
    dataIndex: 'mac',
    ellipsis: true,
  },
  {
    title: '设备类型',
    dataIndex: 'type',
  },
  {
    title: '备注',
    dataIndex: 'descr',
    ellipsis: true,
  },
  {
    title: '关联设备编号',
    dataIndex: 'eqsn',
  },
  {
    title: '关联设备名称',
    dataIndex: 'equipment',
    ellipsis: true,
  },
  {
    title: '所属功能室',
    dataIndex: 'laboratoryName',
    ellipsis: true,
  },
  {
    title: '是否启用',
    dataIndex: 'active',
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 150,
  },
]
let ant_input_suffix
export default {
  components: {
    AddEditModel,
    FileModel: fileModel,
    Log,
  },
  data() {
    return {
      formInline: {
        page: 1,
        size: 10,
        q: '',
        descr: '',
        type: undefined,
        eqsnOrName: '',
      },
      columns,
      tableData: [],
      total: 0,
      selectedRowKeys: [],
      seledtRow: [],
      loading: false,
      deviceData: [
        {
          value: 'CONTROLLER',
          label: '智能空开',
        },
        {
          value: 'EXHIBIT',
          label: '墨水屏',
        },
        {
          value: 'MEASURE',
          label: '量具设备',
        },
        {
          value: 'COLLECT_MAIN',
          label: '主设备',
        },
      ],
    }
  },
  computed: {
    rowSelection() {
      return {
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selectedRowKeys, seledtRow) => {
          this.selectedRowKeys = selectedRowKeys
          this.seledtRow = seledtRow
        },
      }
    },
  },
  mounted() {
    this.getData()
    const dom = document.getElementsByClassName('formDom')
    if (dom) {
      ant_input_suffix = document.getElementsByClassName('ant-input-suffix')
      if (ant_input_suffix && ant_input_suffix.length) {
        for (let i = 0; i < ant_input_suffix.length; i++) {
          ant_input_suffix[i].addEventListener(
            'click',
            this.handleSubmit,
            false,
          )
        }
      }
    }
  },
  unmounted() {
    if (ant_input_suffix && ant_input_suffix.length) {
      for (let i = 0; i < ant_input_suffix.length; i++) {
        ant_input_suffix[i].removeEventListener(
          'click',
          this.handleSubmit,
          false,
        )
      }
    }
  },
  methods: {
    add() {
      this.$refs.AddEditModel.showModel()
    },
    edit(row) {
      this.$refs.AddEditModel.showModel(row)
    },
    deleteDevice(row) {
      if (!row.id) {
        return
      }
      // eslint-disable-next-line ts/no-this-alias
      const that = this
      window.$oAntdConfirm({
        title: '提示',
        content: '确定要删除吗?',
        onOk: async () => {
          try {
            const result = await deleteData(row.id)
            if (result.status === 204) {
              window.$oAntdMessage.success('删除成功')
              that.getData()
            }
            else {
              window.$oAntdMessage.error('删除失败')
            }
          }
          // eslint-disable-next-line unused-imports/no-unused-vars
          catch (e) {
            window.$oAntdMessage.error('删除失败')
          }
        },
      })
    },
    handleDelete() {
      if (!this.selectedRowKeys.length) {
        window.$oAntdMessage.warning('请选择要删除的设备')
        return
      }
      // eslint-disable-next-line ts/no-this-alias
      const that = this
      window.$oAntdConfirm({
        title: '提示',
        content: '确定要删除吗?',
        onOk: () => {
          const data = []
          for (let i = 0; i < that.selectedRowKeys.length; i++) {
            data.push(deleteData(that.selectedRowKeys[i]))
          }
          Promise.all(data)
            .then(() => {
              window.$oAntdMessage.success('删除成功')
              that.getData()
            })
            .catch(() => {
              window.$oAntdMessage.error('删除失败')
            })
        },
      })
    },
    handlePrint() {
      this.$refs.fileModel.showModel()
    },
    handleSubmit() {
      this.formInline.page = 1
      this.getData()
    },
    update() {
      this.formInline.page = 1
      this.getData()
    },
    // 获取数据
    async getData() {
      this.selectedRowKeys = []
      this.seledtRow = []
      this.loading = true
      try {
        const resultData = await getList(this.formInline)
        if (resultData.status === 200) {
          this.tableData = resultData.data.rows || []
          this.total = resultData.data.count || 0
        }
        else {
          window.$oAntdMessage.error('获取失败')
        }
      }
      catch (e) {
        window.$oAntdMessage.error(e.msg || '获取失败')
      }
      finally {
        this.loading = false
      }
    },
    // 分页函数
    handleChange(page) {
      this.formInline.page = page.current
      this.formInline.size = page.pageSize
      this.getData()
    },
    // 手动更新标签
    handleUpdate() {
      if (this.seledtRow && !this.seledtRow.length) {
        return window.$oAntdModal.warning(window.$oMsgTips.info('请选择至少一条数据!'))
      }
      // 停用的墨水瓶不能进行手动更新
      if (this.seledtRow && this.seledtRow.length) {
        for (let i = 0; i < this.seledtRow.length; i++) {
          if (
            this.seledtRow[i].type === 'CONTROLLER'
            || !this.seledtRow[i].active
          ) {
            window.$oAntdModal.warning(
              window.$oMsgTips.info(
                '选择数据有误,只能选择设备类型为墨水屏的设备,且不能够被停用',
              ),
            )
            return
          }
        }
      }
      // eslint-disable-next-line ts/no-this-alias
      const that = this
      const h = that.$createElement
      window.$oAntdModal.warning({
        title: '提示',
        content: h('div', {}, [
          h(
            'span',
            '此操作会根据设备的检校状态将标签设置为不同的标签颜色（红色为检校过期的颜色，否则为正常黑白色标签)。更新情况可以直接',
          ),
          h(
            'span',
            {
              style: {
                color: '#1890ff',
                cursor: 'pointer',
              },
            },
            '查看墨水屏更新记录。',
          ),
        ]),
        okText: '确认',
        async onOk() {
          try {
            let idData = []
            let ids = ''
            if (that.seledtRow && that.seledtRow.length) {
              idData = that.seledtRow.map(item => item.id)
              ids = idData.join(',')
            }
            const result = await updateLabel(ids)
            if (result.data.code === 20000) {
              window.$oAntdMessage.success('操作成功')
              that.getData()
            }
          }
          catch (e) {
            window.$oAntdMessage.error(e.data.message || '更新失败')
          }
        },
      })
      // 判断类型
      // this.$refs.updateMode.showModel(this.seledtRow)
    },
    handleLog(row) {
      this.$refs.log.showModal(row.id, '29')
    },
    handleReset() {
      this.formInline = {
        page: 1,
        size: 10,
        q: '',
        descr: '',
        type: undefined,
        eqsnOrName: '',
      }
      this.getData()
    },
    async changStatus(text) {
      const result = await getByIdActivity(text.id)
      if (result.status === 200) {
        window.$oAntdMessage.success('操作成功')
        this.getData()
      }
      else {
        window.$oAntdMessage.error('操作成功')
      }
    },
    handleChooseChange() {
      this.handleSubmit()
    },
  },
}
</script>

<style lang="less">
@import './index.less';
.action {
  margin: 20px 0;
}
</style>
