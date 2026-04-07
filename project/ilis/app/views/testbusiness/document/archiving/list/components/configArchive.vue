<template>
  <div class="archiving hitek-height-full">
    <ht-modal
      title="档案结构模板"
      centered
      :open="visible"
      width="90%"
      class="hitek-add-modal"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-spin :spinning="spinning" class="hitek-height-full">
        <div class="spin-content hitek-height-full">
          <div>
            <a-row :gutter="20" type="flex">
              <a-col width="420">
                <StructuralTemplate
                  ref="StructuralTemplate"
                  :callback="getData"
                />
              </a-col>
              <a-col style="flex: 1">
                <a-table
                  :columns="columns"
                  :data-source="data"
                  bordered
                  :pagination="false"
                  :row-class-name="rowClassName"
                  row-key="id"
                >
                  <template #bodyCell="{ column, record, text }">
                    <template v-if="column.dataIndex === 'name'">
                      <div>
                        <a-input
                          v-if="record.editable"
                          :value="text"
                          @change="
                            (e) => handleChange(e.target.value, record.id, 'name')
                          "
                        />
                        <template v-else>
                          {{ text }}
                        </template>
                      </div>
                    </template>
                    <template v-if="column.dataIndex === 'cycleType'">
                      <div>
                        <a-select
                          v-if="record.editable"
                          style="width: 100%"
                          :value="text ? text : '2'"
                          placeholder="请选择"
                          @change="
                            (e) => handleSelectChange(e, record.id, 'cycleType')
                          "
                        >
                          <a-select-option value="1">
                            仅需归档一次
                          </a-select-option>
                          <a-select-option value="2">
                            按周期归档
                          </a-select-option>
                          <a-select-option value="3">
                            随时归档
                          </a-select-option>
                        </a-select>
                        <template v-else>
                          {{ dictObj[text] || '' }}
                        </template>
                      </div>
                    </template>
                    <template v-if="column.dataIndex === 'cycle'">
                      <div v-if="record.cycleType === '2'">
                        <div v-if="record.editable">
                          <a-row>
                            <a-col :span="12">
                              <a-input-number
                                style="width: 100%"
                                type="number"
                                :value="text ? text : ''"
                                @change="
                                  (e) => numberChange(e, record.id, 'cycle')
                                "
                              />
                            </a-col>
                            <a-col :span="12">
                              <a-select
                                style="width: 100%"
                                :value="record.cycleUnit ? record.cycleUnit : 'M'"
                                @change="
                                  (e) =>
                                    handleSelectChange(e, record.id, 'cycleUnit')
                                "
                              >
                                <a-select-option value="Y">
                                  年
                                </a-select-option>
                                <a-select-option value="M">
                                  月
                                </a-select-option>
                                <a-select-option value="W">
                                  周
                                </a-select-option>
                                <a-select-option value="D">
                                  日
                                </a-select-option>
                              </a-select>
                            </a-col>
                          </a-row>
                        </div>
                        <template v-else>
                          {{ text || '' }}
                          {{ unitObj[record.cycleUnit] || '' }}
                        </template>
                      </div>
                    </template>
                    <template v-if="column.dataIndex === 'operation'">
                      <div class="editable-row-operations">
                        <template v-if="record.editable">
                          <a @click="(e) => save(record)">保存</a>
                          <a-popconfirm
                            title="确定取消吗?"
                            @confirm="() => cancel(record.id)"
                          >
                            <a>取消</a>
                          </a-popconfirm>
                        </template>
                        <template v-else>
                          <a
                            :disabled="editId !== ''"
                            @click="(e) => edit(record.id)"
                          >编辑</a>
                          <a @click="(e) => deleteData(record)">删除</a>
                        </template>
                      </div>
                    </template>
                  </template>
                </a-table>
                <a-button
                  v-if="templateFolderId ? true : false"

                  style="margin-top: 10px"
                  @click="addRow"
                >
                  新增
                </a-button>
              </a-col>
            </a-row>
          </div>
        </div>
      </a-spin>
    </ht-modal>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import qs from 'qs'
import StructuralTemplate from '~/providers/components/archive/structuralTemplate.vue'

const columns = [
  {
    title: '归档资料项',
    dataIndex: 'name',
    width: '25%',
  },
  {
    title: '归档类型',
    dataIndex: 'cycleType',
    width: '30%',
  },
  {
    title: '默认归档频率',
    dataIndex: 'cycle',
    width: '25%',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: '20%',
  },
]
export default {
  name: 'List',
  components: {
    StructuralTemplate,
    // AddEdit,
  },
  data() {
    return {
      columns,
      dayjs,
      spinning: false,
      visible: false,
      typeId: '',
      dictObj: { 1: '仅需归档一次', 2: '按周期归档', 3: '随时归档' },
      unitObj: { Y: '年', M: '月', W: '周', D: '日' },
      data: [],
      cacheData: [],
      isAdd: true,
      editId: '',
      templateFolderId: '',
    }
  },
  computed: {},
  created() {},
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    showModal() {
      this.visible = true
    },
    handleOk() {
      if (this.editId) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请保存数据'))
      }
      else {
        this.handleCancel()
      }
    },
    handleCancel() {
      this.templateFolderId = ''
      this.data = []
      this.$refs.StructuralTemplate.handleCancel()
      this.editId = ''
      this.visible = false
    },
    isNumber(value) {
      // eslint-disable-next-line regexp/no-super-linear-backtracking
      const reg = /^\d+(?=\.?\d+$|$)/
      if (value && !reg.test(value)) {
        return false
      }
      return true
    },
    numberChange(value, id, column) {
      // eslint-disable-next-line ts/no-this-alias
      const self = this
      if (!this.isNumber(value)) {
        // this.handleChange('', id, column)
        setTimeout(() => {
          self.handleChange('', id, column)
          window.$oAntdMessage.error('请输入正整数')
        }, 0)
      }
      else {
        this.handleChange(value, id, column)
      }
    },
    getData(templateFolderId) {
      if (templateFolderId) {
        this.templateFolderId = templateFolderId
        this.data = []
        this.cacheData = []
      }
      this.spinning = true
      window.$oAjax({
        url: window.$oApi.archiving.listItem,
        params: {
          folderId: this.templateFolderId,
        },
      }).then((res) => {
        if (res.code === 20000) {
          this.data = res.data
          this.cacheData = this.data.map(item => ({ ...item }))
        }
        else {
          // eslint-disable-next-line ts/no-unused-expressions
          res.success === false
            ? window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            : ''
        }
        this.spinning = false
      })
    },
    addRow() {
      if (this.editId != '') {
        window.$oAntdModal.warning(window.$oMsgTips.info('请先完成当前编辑或新增!'))
        return
      }
      this.editId = new Date().getTime()
      this.isAdd = true
      this.data.push({
        templateFolderId: this.templateFolderId,
        name: '',
        cycleType: '2',
        cycle: '',
        cycleUnit: 'M',
        id: this.editId,
        editable: true,
      })
    },
    // 删除
    deleteData(record) {
      window.$oAntdConfirm({
        title: '删除',
        content: `确认删除吗？`,
        okText: '确认',
        mask: false,
        cancelText: '取消',
        onOk: () => {
          window.$oAjax({
            url: window.$oApi.archiving.delItem,
            params: { id: record.id },
          }).then((res) => {
            if (res.code && res.code !== 20010) {
              window.$oAntdMessage.success('删除成功')
              this.editId = ''
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
      this.handleChange(value, id, column)
    },
    edit(id) {
      this.isAdd = false
      const newData = [...this.data]
      const target = newData.filter(item => id === item.id)[0]
      this.editId = id
      if (target) {
        target.editable = true
        this.data = newData
      }
    },
    dataRequired(data) {
      if (!data.name) {
        window.$oAntdModal.warning(window.$oMsgTips.info('请输入归档资料项'))
        return false
      }
      if (data.cycleType === '2') {
        if (!data.cycle) {
          window.$oAntdModal.warning(window.$oMsgTips.info('请输入默认归档频率'))
          return false
        }
      }
      return true
    },
    save(record) {
      const data = {
        templateFolderId: this.templateFolderId,
        name: record.name,
        cycleType: record.cycleType,
      }
      if (record.cycleType === '2') {
        data.cycle = record.cycle
        data.cycleUnit = record.cycleUnit
      }
      if (this.isAdd === false) {
        data.id = record.id
      }
      if (this.dataRequired(data)) {
        this.spinning = true
        window.$oAjax({
          method: 'POST',
          url: window.$oApi.archiving.saveItem,
          data: qs.stringify(data),
        }).then((res) => {
          if (res.code === 20000) {
            window.$oAntdMessage.success('操作成功')
            this.editId = ''
            this.isAdd = false
            this.getData()
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            this.spinning = false
          }
        })
      }
    },
    cancel(id) {
      if (this.isAdd === true) {
        this.isAdd = false
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
  },
}
</script>

<style lang="less"></style>
