<template>
  <div class="archiving hitek-height-full">
    <ht-modal
      title="资料项"
      centered
      :open="visible"
      width="90%"
      class="hitek-add-modal"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-spin :spinning="spinning" class="hitek-height-full">
        <div class="spin-content hitek-height-full">
          <div style="height: 400px; overflow: hidden; overflow-y: auto">
            <a-row :gutter="15">
              <a-col :span="6" width="420">
                <DetailFolder ref="DetailFolder" :callback="getData" />
              </a-col>
              <a-col :span="18" :style="{}">
                <div
                  style="color: #333; padding-bottom: 10px; line-height: 18px"
                >
                  <strong>说明：</strong>
                  <p>
                    1.仅需归档一次的资料项，在有归档记录后，该项会自动被标记为已归档；
                  </p>
                  <p>2.随时归档的资料项，不会显示是否已归档的标记；</p>
                  <p>
                    3.按周期归档的资料项，系统会根据首次要求归档日期、归档截止日期及归档频率自动生成归档时间节点；
                  </p>
                  <p>
                    4.按周期归档的资料项，按每个归档时间节点归档资料，有归档记录后该周期自动被标记为已归档。
                  </p>
                </div>
                <a-table
                  :columns="columns"
                  :data-source="data"
                  bordered
                  :pagination="false"
                  row-key="id"
                  :row-class-name="rowClassName"
                >
                  <template #bodyCell="{ column, record, text }">
                    <template v-if="column.dataIndex === 'name'">
                      <div>
                        <a-input v-model:value="record.name" placeholder="必填" />
                      </div>
                    </template>
                    <template v-if="column.dataIndex === 'cycleType'">
                      <div>
                        <a-select
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
                      </div>
                    </template>
                    <template v-if="column.dataIndex === 'cycleTimeStart'">
                      <div v-if="record.cycleType === '2'">
                        <a-date-picker
                          :value="text ? dayjs(new Date(text)) : undefined"
                          placeholder="日期必选"
                          @change="
                            (e) => handleChange(e, record.id, 'cycleTimeStart')
                          "
                        />
                      </div>
                    </template>
                    <template v-if="column.dataIndex === 'cycleTimeEnd'">
                      <div v-if="record.cycleType === '2'">
                        <a-date-picker
                          :value="text ? dayjs(new Date(text)) : undefined"
                          placeholder="日期必选"
                          @change="
                            (e) => handleChange(e, record.id, 'cycleTimeEnd')
                          "
                        />
                      </div>
                    </template>
                    <template v-if="column.dataIndex === 'cycle'">
                      <div v-if="record.cycleType === '2'">
                        <div>
                          <a-row :gutter="8">
                            <a-col :span="12">
                              <a-input-number
                                style="width: 100%"
                                type="number"
                                :value="text ? text : ''"
                                placeholder="必填"
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
                      </div>
                    </template>
                    <template v-if="column.dataIndex === 'operation'">
                      <div class="editable-row-operations">
                        <a @click="(e) => deleteData(record)">删除</a>
                      </div>
                    </template>
                  </template>
                </a-table>
                <a-button
                  v-if="detailFolderId ? true : false"
                  style="margin-top: 10px"
                  @click="addRow(undefined)"
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
import { notification } from 'ant-design-vue'
import dayjs from 'dayjs'
import DetailFolder from '~/providers/components/archive/detailFolder.vue'

const columns = [
  {
    title: '归档资料项',
    dataIndex: 'name',
    width: '18%',
  },
  {
    title: '归档类型',
    dataIndex: 'cycleType',
    width: '18%',
  },
  {
    title: '首次要求归档日期',
    dataIndex: 'cycleTimeStart',
  },
  {
    title: '归档截止日期',
    dataIndex: 'cycleTimeEnd',
  },
  {
    title: '默认归档频率',
    dataIndex: 'cycle',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: 125,
  },
]
export default {
  name: 'List',
  components: {
    DetailFolder,
    // AddEdit,
  },
  props: ['callback'],
  data() {
    return {
      columns,
      dayjs,
      spinning: false,
      visible: false,
      typeId: '',
      dictObj: { 1: '仅需归档一次', 2: '按周期归档', 3: '随时归档' },
      unitObj: { Y: '年', M: '月', W: '周', D: '日' },
      saveSelectData: [],
      saveSelectId: [],
      data: [],
      treeData: [],
      detailFolderId: '',
      preId: '',
      isQuote: false,
      menuId: '',
      errorTip: [],
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
    // 获取右侧初始数据
    async getInitialData(folderId) {
      const res = await window.$oAjax({
        url: window.$oApi.archiving.listItem,
        params: {
          folderId,
        },
      })
      return res.data || []
    },
    // 获取左侧树的id集合
    async getTreeData(data) {
      const arr = []
      if (!Array.isArray(data)) {
        return arr
      }
      for (let i = 0; i < data.length; i++) {
        const obj = {
          ...data[i],
          itemVoList: await this.getInitialData(data[i].id),
        }
        let children

        if (data[i].children && data[i].children.length > 0) {
          children = await this.getTreeData(data[i].children)
        }

        children ? (obj.children = children) : delete obj.children
        arr.push(obj)
      }

      return arr
    },
    async showModal(archiveName, treeData, isQuote) {
      this.isQuote = isQuote
      this.visible = true
      window.$oNextTick(async () => {
        this.$refs.DetailFolder.showModal(archiveName, treeData, true)
        if (this.isQuote) {
          this.spinning = true
          this.treeData = await this.getTreeData(treeData)
          this.spinning = false
        }
        else {
          this.treeData = treeData
        }
      })
    },
    // 必填提示
    openNotification() {
      const tipMsg = []
      let description = ''
      for (let i = 0; i < this.errorTip.length; i++) {
        if (!tipMsg.includes(this.errorTip[i].name)) {
          tipMsg.push(this.errorTip[i].name)
          description += `${this.errorTip[i].name} `
        }
      }
      description += '中，含有必填信息。'
      notification.warning({
        message: '请完善必填信息后再提交',
        description,
        duration: 0,
        style: {
          fontSize: '12px',
        },
      })
    },
    // 处理提交数据
    formatSubmitData(treeData) {
      const arr = []
      if (!Array.isArray(treeData)) {
        return arr
      }

      for (let i = 0; i < treeData.length; i++) {
        const obj = {
          name: treeData[i].name,
          id: treeData[i].id,
          documentId: treeData[i].documentId,
        }
        let children
        const itemVoList = []
        for (let j = 0; j < treeData[i].itemVoList.length; j++) {
          const {
            name,
            cycleUnit,
            cycleType,
            cycle,
            cycleTimeEnd,
            cycleTimeStart,
          } = treeData[i].itemVoList[j]

          if (!name) {
            this.errorTip.push({
              name: treeData[i].name,
              content: '归档资料项必填',
            })
          }
          else if (
            cycleType == '2'
            && (!cycleTimeEnd || !cycleTimeStart || !cycle)
          ) {
            this.errorTip.push({
              name: treeData[i].name,
              content: '首次要求归档日期和归档截止日期必选',
            })
          }

          itemVoList.push({
            name,
            cycleUnit,
            cycleType,
            cycle,
            cycleTimeEnd: cycleTimeEnd
              ? dayjs(cycleTimeEnd).format('YYYY-MM-DD')
              : '',
            cycleTimeStart: cycleTimeStart
              ? dayjs(cycleTimeStart).format('YYYY-MM-DD')
              : '',
          })
        }

        if (treeData[i].children && treeData[i].children.length > 0) {
          children = this.formatSubmitData(treeData[i].children)
        }

        obj.itemVoList = itemVoList

        children && (obj.children = children)
        arr.push(obj)
      }

      return arr
    },
    handleOk() {
      this.errorTip = []
      const submitData = this.formatSubmitData(this.treeData)

      if (this.errorTip.length > 0) {
        this.openNotification()
        return
      }

      this.spinning = true

      let url = window.$oApi.archivingDetail.addMaterial
      if (this.isQuote) {
        url = window.$oApi.archivingDetail.getTemplate
      }
      window.$oAjax({
        method: 'POST',
        url,
        data: submitData,
        headers: { 'Content-Type': 'application/json' },
      }).then((res) => {
        if (res.code === 20000) {
          window.$oAntdMessage.success('操作成功')
          this.callback()
          this.handleCancel()
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.spinning = false
      })
    },
    handleCancel() {
      this.$refs.DetailFolder.handleCancel()
      this.detailFolderId = ''
      this.preId = ''
      this.saveSelectData = []
      this.saveSelectId = []
      this.data = []
      this.treeData = []
      this.isQuote = false
      this.visible = false
    },
    // 获取右侧数据
    getData(dataObj, treeData) {
      const data = treeData || this.treeData
      this.detailFolderId = dataObj.id
      for (let i = 0; i < data.length; i++) {
        if (data[i].id == dataObj.id) {
          this.menuId = data[i].id
          this.data = data[i].itemVoList
        }
        else {
          if (data[i].children && data[i].children.length > 0) {
            this.getData(dataObj, data[i].children)
          }
        }
      }
    },
    addRow(treeData) {
      const data = treeData || this.treeData
      for (let i = 0; i < data.length; i++) {
        if (data[i].id == this.detailFolderId) {
          data[i].itemVoList = [
            ...data[i].itemVoList,
            {
              detailFolderId: this.detailFolderId,
              name: '',
              cycleType: '2',
              cycle: '',
              cycleTimeStart: new Date(),
              cycleTimeEnd: new Date(),
              cycleUnit: 'M',
              id: new Date().getTime(),
            },
          ]
          this.data = data[i].itemVoList
        }
        else {
          if (data[i].children && data[i].children.length > 0) {
            this.addRow(data[i].children)
          }
        }
      }
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
          this.removeData(record.id)
        },
      })
    },
    // 删除数据
    removeData(id, treeData) {
      const data = treeData || this.treeData
      for (let i = 0; i < data.length; i++) {
        if (data[i].id == this.menuId) {
          data[i].itemVoList = data[i].itemVoList.filter(
            item => item.id != id,
          )
          this.data = data[i].itemVoList
          break
        }
        else {
          if (data[i].children && data[i].children.length > 0) {
            this.removeData(id, data[i].children)
          }
        }
      }
    },
    handleChange(value, id, column) {
      const newData = [...this.data]
      const target = newData.filter(item => id === item.id)[0]
      if (target) {
        target[column] = value
        if (target.cycleType !== '2') {
          target.cycleTimeStart = ''
          target.cycleTimeEnd = ''
        }
        this.data = newData
      }
    },
    handleSelectChange(value, id, column) {
      this.handleChange(value, id, column)
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
        setTimeout(() => {
          self.handleChange('', id, column)
          window.$oAntdMessage.error('请输入正整数')
        }, 0)
      }
      else {
        this.handleChange(value, id, column)
      }
    },
  },
}
</script>

<style lang="less"></style>
