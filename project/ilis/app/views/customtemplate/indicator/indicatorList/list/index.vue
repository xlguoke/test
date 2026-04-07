<template>
  <div class="standardList hitek-height-full">
    <a-spin class="hitek-height-full" :spinning="spinning">
      <a-layout class="hitek-height-full">
        <a-layout>
          <a-layout-sider
            width="300"
            :style="{
              overflow: 'auto',
              padding: '10px',
              height: '100vh',
              position: 'fixed',
              left: 0,
              background: '#fff',
            }"
          >
            <a-tree
              v-if="treeData.length > 0"
              :replace-fields="replaceFields"
              :tree-data="treeData"
              :default-expand-all="true"
              @select="onSelect"
            >
              <template #title="item">
                <p
                  class="tree-title"
                  :title="`${item.name.length > 15 ? item.name : ''}`"
                >
                  {{ item.name }}
                </p>
                <ul class="tree-item-handle" @click.stop="() => {}">
                  <li title="新增子级" @click="addTreeItem(item)">
                    <PlusOutlined />
                  </li>
                  <a-dropdown v-if="item.parentId" :trigger="['click']">
                    <template #overlay>
                      <a-menu @click="(e) => handleMenuClick(item, e.key)">
                        <a-menu-item key="1">
                          编辑
                        </a-menu-item>
                        <a-menu-item key="2">
                          移动
                        </a-menu-item>
                        <a-menu-item key="3">
                          复制
                        </a-menu-item>
                        <a-menu-item key="4">
                          删除
                        </a-menu-item>
                      </a-menu>
                    </template>
                    <li class="more"></li>
                  </a-dropdown>
                </ul>
              </template>
            </a-tree>
          </a-layout-sider>

          <a-layout style="margin-left: 300px; padding: 0px 10px">
            <a-layout-content
              :style="{
                background: '#fff',
                padding: '10px',
                margin: 0,
                minHeight: '280px',
                overflow: 'initial',
              }"
            >
              <a-alert
                show-icon
                message="指标为父级指标，通常无需录入数据，无需设置录入规则"
                type="success"
                close-text="关闭"
              />
              <div style="margin: 8px 0px">
                <a-button
                  type="primary"
                  :disabled="disabledBtns"
                  @click="addRow"
                >
                  新增
                </a-button>
                <a-button class="toolBtn-bar" @click="editSelRow">
                  批量修改
                </a-button>
                <a-button class="toolBtn-bar" type="primary" @click="batchSave">
                  批量保存
                </a-button>
                <a-popconfirm
                  title="确认删除所选数据?"
                  ok-text="确定"
                  cancel-text="取消"
                  @confirm="delSelRow()"
                >
                  <a-button class="toolBtn-bar">
                    批量删除
                  </a-button>
                </a-popconfirm>
                <a-button class="toolBtn-bar" @click="copyRows">
                  复制
                </a-button>
                <a-button class="toolBtn-bar" @click="attmentManage">
                  附件管理
                </a-button>
                <a-button class="toolBtn-bar" @click="settingStandard">
                  设置评定标准
                </a-button>
                <div style="float: right">
                  评定标准：
                  <a-select
                    v-model:value="queryStandard"
                    allow-clear
                    style="width: 220px"
                    placeholder="请选择评定标准"
                    @change="changeQueryStandard"
                  >
                    <a-select-option
                      v-for="(d, i) in standardDatas"
                      :key="i"
                      :value="d"
                    >
                      {{ d }}
                    </a-select-option>
                  </a-select>
                </div>
              </div>

              <a-table
                :row-selection="rowSelection"
                :columns="columns"
                :scroll="{ x: 1400 }"
                :data-source="tabledata"
                :pagination="false"
                row-key="id"
              >
                <template #headerCell="{ column }">
                  <template v-if="column.dataIndex === 'name'">
                    <span class="td-required">检测指标名称</span>
                  </template>

                  <template v-if="column.dataIndex === 'code'">
                    <!-- <span class="td-required">指标编码</span> -->
                    指标编码
                  </template>
                </template>
                <template #bodyCell="{ column, record, text, index }">
                  <template v-if="column.dataIndex === 'sort'">
                    <a-input
                      v-if="record.edit"
                      v-model:value="record.sort"
                      placeholder="请输入排序"
                    />
                    <span v-else>{{ text }}</span>
                  </template>

                  <template v-if="column.dataIndex === 'standardPublishCode'">
                    <span
                      v-if="record.edit"
                      style="color: #2872d3; cursor: pointer"
                      @click="editRowStandard(index)"
                    >
                      <span v-if="!record.standardName && !text">请选择评定标准</span>
                      <span v-else>{{ record.standardName || '' }} {{ text }}</span>
                    </span>
                    <span v-else>{{ record.standardName || '' }} {{ text }}</span>
                  </template>

                  <template v-if="column.dataIndex === 'code'">
                    <a-input
                      v-if="record.edit"
                      v-model:value="record.code"
                      placeholder="请输入指标编码"
                    />
                    <span v-else>{{ text }}</span>
                  </template>

                  <template v-if="column.dataIndex === 'name'">
                    <a-input
                      v-if="record.edit"
                      v-model:value="record.name"
                      placeholder="请输入指标名称"
                    />
                    <span v-else>{{ text }}</span>
                  </template>

                  <template v-if="column.dataIndex === 'technology'">
                    <a-input
                      v-if="record.edit && record.display"
                      v-model:value="record.technicalRequirements"
                      placeholder="请输入技术要求说明"
                    />
                    <span v-else>{{ text }}</span>
                  </template>

                  <template v-if="column.dataIndex === 'entryInstructions'">
                    <a-input
                      v-if="record.edit && record.display"
                      v-model:value="record.entryInstructions"
                      placeholder="请输入填写说明"
                    />
                    <span v-else>{{ text }}</span>
                  </template>

                  <template v-if="column.dataIndex === 'expression'">
                    <a-mentions
                      v-if="record.edit && record.display"
                      v-model:value="record.expression"
                      readonly
                      placeholder="点击设置公式"
                      @click="openFormula(record, index)"
                    ></a-mentions>
                    <span v-else>{{ text }}</span>
                  </template>

                  <template v-if="column.dataIndex === 'detectionValueType'">
                    <a-select
                      v-if="record.edit && record.display"
                      v-model:value="record.detectionValueType"
                      style="width: 100px"
                    >
                      <a-select-option
                        v-for="item in detectionTypeList"
                        :key="item.code"
                        :value="item.code"
                      >
                        {{ item.label }}
                      </a-select-option>
                    </a-select>
                    <span v-else>{{ detection[text] }}</span>
                  </template>

                  <template v-if="column.dataIndex === 'conclusionType'">
                    <a-select
                      v-if="record.edit && record.display"
                      v-model:value="record.conclusionType"
                      style="width: 100px"
                    >
                      <a-select-option
                        v-for="item in conclusionTypeList"
                        :key="item.code"
                        :value="item.code"
                      >
                        {{ item.label }}
                      </a-select-option>
                    </a-select>
                    <span v-else>{{ conclusion[text] }}</span>
                  </template>

                  <template v-if="column.dataIndex === 'handleFun'">
                    <a-button v-if="record.edit" type="link" @click="saveRow(record)">
                      保存
                    </a-button>
                    <a-button
                      v-if="record.edit && record.id"
                      type="link"
                      style="color: gray"
                      @click="
                        () => {
                          cancelSaveRow(record)
                          record.edit = false
                        }
                      "
                    >
                      取消
                    </a-button>
                    <a-button
                      v-if="!record.edit && record.id"
                      type="link"
                      @click="editRow(record)"
                    >
                      编辑
                    </a-button>
                    <a-popconfirm
                      title="确认删除这条数据?"
                      ok-text="确定"
                      cancel-text="取消"
                      @confirm="delRow(record, index)"
                    >
                      <a-button type="link" style="color: red">
                        删除
                      </a-button>
                    </a-popconfirm>
                  </template>
                </template>

                <!-- <template slot="enable" slot-scope="val,row">
                    <a-select v-model="row.enableInput" v-if="row.edit" style="width: 80px"
                      @change="(a) => enableEvent(a, row)">
                      <a-select-option v-for="item in enableList" :key="item.code" :value="item.code">
                        {{ item.label }}
                      </a-select-option>
                    </a-select>
                    <span v-else> {{ enable[val] }}</span>
                  </template> -->
              </a-table>
              <!-- <consignCustomProperty></consignCustomProperty> -->
            </a-layout-content>
          </a-layout>
        </a-layout>
      </a-layout>
    </a-spin>

    <ht-modal
      v-model:open="setFormulaVisible"
      width="550px"
      title="判定公式编辑"
      :closable="false"
      :mask-closable="false"
    >
      <template #footer>
        <div style="height: 30px">
          <a-button key="cancel" type="default" @click="handleCancel">
            取消
          </a-button>
          <a-button key="submit" type="primary" @click="handleOk">
            确定
          </a-button>
        </div>
      </template>
      <div v-if="tabledata[editFormulaIndex]">
        <div
          v-for="(item, index) in tabledata[editFormulaIndex].expressions"
          :key="index"
          class="formula_item"
        >
          <span>条件{{ index + 1 }}：</span>
          <a-select
            v-model:value="item.operator"
            :value="item.operator"
            style="width: 120px"
          >
            <a-select-option
              v-for="item2 in operatorType"
              :key="item2.code"
              :value="item2.code"
            >
              {{ item2.label }}
            </a-select-option>
          </a-select>
          <a-input
            v-model:value="item.judgeValue"
            style="width: 220px; margin: 0 10px"
            :type="item.operator !== 'ct' ? 'number' : 'text'"
            :placeholder="item.operator != 'ct' ? '请输入判定数值' : '0,0,0,0'"
          />
          <a-button type="link" @click="removeFormula(index)">
            移除
          </a-button>
        </div>
        <div style="text-align: right">
          <a-button type="link" @click="addFormula">
            添加条件
          </a-button>
        </div>
      </div>
    </ht-modal>

    <!-- 编辑节点 -->
    <ht-modal
      :title="editTitle"
      :open="treeVisible"
      width="550px"
      :closable="false"
      :mask-closable="false"
    >
      <a-form
        ref="formRef"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 16 }"
        style="height: 200px"
        :model="formState"
      >
        <a-form-item
          label="节点名称"
          :rules="[{ required: true, message: '请输入节点名称' }]"
          name="name"
        >
          <a-input
            v-model:value="formState.name"
            placeholder="请输入节点名称"
          ></a-input>
        </a-form-item>
        <a-form-item label="节点编码">
          <a-input
            v-model:value="formState.code"
            placeholder="请输入节点编码"
          ></a-input>
        </a-form-item>
        <a-form-item
          label="节点类型"
          :rules="[{ required: true, message: '请选择节点类型' }]"
          name="type"
        >
          <a-radio-group
            v-model:value="formState.type"
            :disabled="disabledType"
          >
            <a-radio value="item">
              检测项目
            </a-radio>
            <a-radio value="require">
              技术要求
            </a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="排序号">
          <a-input-number
            v-model:value="formState.sort"
            style="width: 100%"
            placeholder="请输入排序号"
          ></a-input-number>
        </a-form-item>
      </a-form>
      <template #footer>
        <a-button @click="treeVisible = false">
          取消
        </a-button>
        <a-button type="primary" @click="saveTreeItem">
          确定
        </a-button>
      </template>
    </ht-modal>

    <!-- 移动节点 -->
    <ht-modal
      :open="moveVisible"
      :title="`移动【${editTreeNode.name}】至：`"
      width="500px"
      :closable="false"
      :mask-closable="false"
      @cancel="moveVisible = false"
      @ok="confirmMove"
    >
      <a-tree
        v-if="moveTreeData.length"
        :replace-fields="replaceFields"
        :tree-data="moveTreeData"
        :default-expand-all="true"
        @select="onSelectMove"
      ></a-tree>
    </ht-modal>

    <!-- 附件管理 -->
    <UploadFileModal ref="uploadRef" @upload-sucess="uploadSucess" />

    <!-- 评定标准 -->
    <ht-modal
      title="设置评定标准"
      :open="standardVisible"
      width="70%"
      centered
      :closable="false"
      :mask-closable="false"
      :body-style="{ padding: 0 }"
      @cancel="standardVisible = false"
      @ok="getStandard"
    >
      <iframe
        style="width: 100%; height: 450px"
        name="importStandard"
        :src="`${rootUrl}/baseStandardNewController.do?goImportStandards&selType=radio`"
        frameborder="0"
      ></iframe>
    </ht-modal>
  </div>
</template>

<script>
import { PlusOutlined } from '@ant-design/icons-vue'
import { getQueryVariable } from '~/providers/common/utils'
import UploadFileModal from '~/providers/components/uploadFileModal/index.vue'
import { rootUrl } from '~/providers/configs/rootUrl'

const columns = [
  {
    title: '排序',
    dataIndex: 'sort',
    key: 'sort',
    width: 60,
  },
  {
    title: '评定标准',
    dataIndex: 'standardPublishCode',
    key: 'standardPublishCode',
    width: 150,
  },
  {
    dataIndex: 'code',
    key: 'code',
    width: 100,
  },
  {
    dataIndex: 'name',
    key: 'name',
    width: 150,
  },
  // {
  //   title: "技术要求说明",
  //   width: 140,
  //   dataIndex: "technicalRequirements",
  //   key: "technicalRequirements",
  //   scopedSlots: { customRender: "technology" }
  // },
  {
    title: '填写说明',
    width: 140,
    dataIndex: 'entryInstructions',
    key: 'entryInstructions',
  },
  {
    title: '判定公式',
    width: 160,
    dataIndex: 'expression',
    expression: 'expression',
  },
  {
    title: '检测值类型',
    dataIndex: 'detectionValueType',
    key: 'detectionValueType',
    width: 130,
  },
  {
    title: '单项结论',
    dataIndex: 'conclusionType',
    key: 'conclusionType',
    width: 110,
  },
  {
    title: '操作',
    width: 160,
    fixed: 'right',
    dataIndex: 'handleFun',
  },
]

export default {
  name: 'List',
  components: {
    UploadFileModal,
    PlusOutlined,
  },
  data() {
    return {
      rootUrl,
      spinning: true,
      disabledBtns: true,
      editTitle: '新增',
      // 参数id
      paramId: '',
      // 结论值类型
      conclusionTypeList: [],
      // 检测值类型
      detectionTypeList: [],
      // 公式运算符类型
      operatorType: [],
      // 是否需要录入
      enableList: [
        { code: 1, label: '允许' },
        { code: 0, label: '不允许' },
      ],
      enable: { 1: '允许', 0: '不允许' },
      // 临时数据，用来存储编辑行的数据
      tempData: {},
      operator: {},
      conclusion: {},
      detection: {},
      // 右侧表格数据
      tabledata: [],
      // 右侧源数据
      source: [],
      // 左侧树
      treeData: [],
      // 选中行
      selRow: [],
      // 选中tree
      selTreeRow: [],
      selectedRowKeys: [],

      // 需要添加公式的行
      editFormulaIndex: 0,
      editFormulaItem: [],
      // 正在编辑的原始数据
      editRawRows: [],
      autoExpandParent: true,
      checkedKeys: [],
      selectedKeys: [],
      columns,
      setFormulaVisible: false,
      editPayTypeBoxVb: false,
      payTypeName: '',
      isSelData: false,
      handleType: 'add',
      treeVisible: false, // 左侧树编辑弹窗
      editTreeNode: {}, // 当前编辑的树节点
      moveTreeData: [], // 移入树
      moveNodeId: '', // 移入节点id
      disabledType: false, // 禁用类型：技术要求只能添加类型为技术要求的子节点
      isAdd: true, // 区分新增节点还是编辑节点
      loadingTree: false,
      editRowInd: -1, // 右侧列表编辑行下标
      standardDatas: [],
      queryStandard: undefined,

      moveVisible: false,
      standardVisible: false,
      formState: {
        type: 'item',
      },
    }
  },
  computed: {
    rowSelection() {
      return {
        columnWidth: '80px',
        selectedRowKeys: this.selectedRowKeys,
        onChange: (selRowKey, selRow) => {
          this.selRow = selRow
          this.selectedRowKeys = selRowKey
        },
      }
    },
    replaceFields() {
      return {
        children: 'children',
        title: 'name',
        key: 'id',
      }
    },
  },
  mounted() {
    window.closeParamsEdit = () => {
      // 关闭弹窗时检查是否有在编辑的行，进行提示
      let valid = true
      for (let i = 0; i < this.tabledata.length; i++) {
        const item = this.tabledata[i]
        if (item.edit) {
          valid = false
          break
        }
      }
      return valid
    }
  },
  created() {
    this.paramId = getQueryVariable('paramId')
    Promise.all([
      this.getConclusionType(),
      this.getDetectionType(),
      this.getOperatorType(),
    ])
      .then(() => {
        this.getTreeAndList()
      })
      .catch((e) => {
        console.error(e)
      })
  },
  methods: {
    // 打开公式弹框
    openFormula(row, index) {
      this.editFormulaIndex = index
      this.editFormulaItem = JSON.parse(
        JSON.stringify(this.tabledata[this.editFormulaIndex].expressions),
      )
      this.setFormulaVisible = true
    },
    // 是否录入选择事件
    enableEvent(enable, row) {
      row.display = enable === 1
      if (enable === 0) {
        row.technicalRequirements = null
        row.entryInstructions = null
        row.expression = null
        row.detectionValueType = null
        row.conclusionType = null
      }
    },
    addFormula() {
      this.tabledata[this.editFormulaIndex].expressions.push({
        operator: '',
        judgeValue: '',
        symbol: '',
      })
    },
    editRow(row) {
      row.edit = true
      row.display = row.enableInput === 1
      this.editRawRows.push(JSON.parse(JSON.stringify(row)))
    },
    // 批量保存
    batchSave() {
      if (this.selRow.length == 0) {
        window.$oAntdMessage.warning('请至少选择一条数据')
      }
      const addData = []
      const updateData = []
      if (!this.validList())
        return false
      for (let i = 0; i < this.selRow.length; i++) {
        const item = this.selRow[i]
        if (!item.type) {
          item.type = 'require'
        }
        if (item.id) {
          updateData.push(item)
        }
        else {
          addData.push(item)
        }
      }
      this.addRowFormula(addData)
      this.updateRow(updateData)
      return true
    },
    validList() {
      let valid = true
      for (let i = 0; i < this.selRow.length; i++) {
        const item = this.selRow[i]
        if (!this.validMsg(item, true)) {
          valid = false
          break
        }
      }
      return valid
    },
    // 行校验
    validMsg(row, more) {
      // if (!row.code) {
      //   window.$oAntdMessage.warning(`请输入${more ? "选中行" : ""}指标编码`)
      //   return false
      // } else
      if (!row.name) {
        window.$oAntdMessage.warning(`请输入${more ? '选中行' : ''}指标名称`)
        return false
      }
      return true
    },
    // 保存行
    saveRow(row) {
      if (!this.validMsg(row))
        return
      if (!row.type) {
        row.type = 'require'
      }
      if (row.id) {
        this.updateRow([row])
      }
      else {
        this.addRowFormula([row])
      }
    },
    cancelSaveRow(row) {
      // eslint-disable-next-line array-callback-return
      const items = this.editRawRows.filter((item, index) => {
        if (item.id === row.id) {
          return this.editRawRows.splice(index, 1)
        }
      })
      if (items.length > 0) {
        const item = items[0]
        for (const key in row) {
          row[key] = item[key]
        }
      }
    },
    updateRow(arrData) {
      if (arrData.length == 0) {
        return
      }
      if (!this.validMsg(arrData[0]))
        return
      const key = 'load'
      window.$oAntdMessage.loading({ content: 'Loading...', key })
      window.$oAjax
        .put(`/rest/indicator/update`, arrData, {
          headers: { 'content-type': 'application/json' },
        })
        .then((res) => {
          if (Number.parseInt(res.code) === 20000) {
            this.treeVisible = false
            window.$oAntdMessage.success({ content: '保存成功', key, duration: 1 })
            this.getTreeAndList()
          }
          else {
            window.$oAntdMessage.error({ content: res.message, key, duration: 1 })
          }
        })
    },
    addRowFormula(arrData) {
      if (arrData.length == 0) {
        return
      }
      const key = 'load'
      window.$oAntdMessage.loading({ content: 'Loading...', key })
      window.$oAjax
        .post(`/rest/indicator/save`, arrData, {
          headers: { 'content-type': 'application/json' },
        })
        .then((res) => {
          if (Number.parseInt(res.code) === 20000) {
            this.treeVisible = false
            this.getTreeAndList()
            window.$oAntdMessage.success({ content: '保存成功', key, duration: 2 })
          }
          else {
            window.$oAntdMessage.error({ content: res.message, key, duration: 1 })
          }
        })
    },

    // 公式确定
    handleOk() {
      const arr = this.tabledata[this.editFormulaIndex].expressions
      // if(arr.length==0){
      //     window.$oAntdMessage.warning("至少添加一条判定公式");
      //     return
      // }
      for (const i in arr) {
        // eslint-disable-next-line no-prototype-builtins
        if (!arr.hasOwnProperty(i)) {
          return
        }
        if (!arr[i].operator || !arr[i].judgeValue) {
          window.$oAntdMessage.warning('请填写完整公式')
          return
        }
        if (arr[i].operator === 'ct') {
          const split = arr[i].judgeValue.split(',')
          if (split.length !== 4) {
            window.$oAntdMessage.warning(
              '包含关系请输入指定坐标区域a,b,c,d 以【半角逗号】分开',
            )
            return
          }
          let flag = false
          // eslint-disable-next-line array-callback-return
          split.map((v) => {
            if (
              v === null
              || v === ''
              || v === undefined
              || v === 'undefined'
              // eslint-disable-next-line regexp/no-unused-capturing-group
              || !/^-?\d*(\.\d{1,2})?$/.test(v)
            ) {
              flag = true
            }
          })

          if (flag) {
            window.$oAntdMessage.warning(
              '坐标区域不需要输入括号，并且四个值都必须是数字',
            )
            return false
          }
        }
      }

      let text = ''
      for (const i in arr) {
        let t = ''
        if (arr[i].operator === 'ct') {
          t
            = `x${
              this.operator[arr[i].operator]
            }(${
              arr[i].judgeValue
            });`
        }
        else {
          t = `x${this.operator[arr[i].operator]}${arr[i].judgeValue};`
        }
        text += t
      }
      this.tabledata[this.editFormulaIndex].expression = text
      this.editFormulaItem = []
      this.setFormulaVisible = false
    },

    handleCancel() {
      this.tabledata[this.editFormulaIndex].expressions = this.editFormulaItem
      this.editFormulaItem = []
      this.setFormulaVisible = false
    },

    // 新增一行
    addRow() {
      if (this.selTreeRow.length == 0) {
        window.$oAntdMessage.warning('请先选中左侧节点再新增')
        return
      }
      const r = {
        sort: this.tabledata.length + 1,
        edit: true,
        name: '',
        code: '',
        type: 'require',
        technicalRequirements: '',
        entryInstructions: '',
        expression: '',
        testParamId: this.paramId,
        parentId: this.selTreeRow[0],
        expressions: [
          {
            judgeValue: '',
            operator: '',
            symbol: '',
          },
        ],
        conclusionType: this.conclusionTypeList[0].code,
        detectionValueType: this.detectionTypeList[0].code,
        enableInput: 1,
        display: true,
      }

      if (this.selTreeRow.length > 0) {
        r.parentId = this.selTreeRow[0]
      }
      else {
        r.parentId = ''
      }
      this.tabledata.unshift(r)
    },
    // 删除一行
    delRow(row, index) {
      if (row.id) {
        this.deleteFun(row.id)
      }
      else {
        this.tabledata.splice(index, 1)
      }
    },
    // 批量删除
    delSelRow() {
      if (this.selRow.length == 0) {
        window.$oAntdMessage.warning('请至少选择一条数据！')
        return
      }
      if (this.selRow.some(d => !d.id)) {
        window.$oAntdMessage.warning('存在未保存的数据，不能进行批量删除')
        return
      }
      const ids = this.selectedRowKeys.join(',')
      this.deleteFun(ids)
    },
    // 删除
    deleteFun(ids) {
      this.spinning = true
      window.$oAjax
        .delete(`/rest/indicator/delete/${ids}`)
        .then((res) => {
          this.spinning = false
          if (Number.parseInt(res.code) === 20000) {
            window.$oAntdMessage.success('删除成功')
            this.getTreeAndList()
            this.selectedRowKeys = []
            this.selRow = []
          }
          else {
            window.$oAntdMessage.error(res.message)
          }
        })
        .catch(() => {
          this.spinning = false
        })
    },
    // 批量编辑
    editSelRow() {
      if (this.selRow.length == 0) {
        window.$oAntdMessage.warning('请至少选择一条数据！')
        return
      }
      this.selRow.forEach((selItem) => {
        this.tabledata.forEach((tableItem) => {
          tableItem.display = tableItem.enableInput === 1
          if (selItem.id == tableItem.id) {
            tableItem.edit = true
          }
        })
      })
    },
    // 公式删除
    removeFormula(i) {
      this.tabledata[this.editFormulaIndex].expressions.splice(i, 1)
    },
    // 选择树查找对应表格数据
    onSelect(sel) {
      this.selectedRowKeys = []
      this.selRow = []
      const treeDatas = JSON.parse(JSON.stringify(this.orignTreeData))
      if (sel.length > 0) {
        // 递归获取选中节点
        let selNode = {}
        const selId = sel[sel.length - 1]
        const fu = (arr) => {
          for (let i = 0; i < arr.length; i++) {
            const item = arr[i]
            if (item.id == selId) {
              selNode = item
              break
            }
            if (item.children && item.children.length > 0) {
              fu(item.children)
            }
          }
        }
        fu(treeDatas)
        if (!selNode || selNode.rootNode) {
          this.disabledBtns = true
        }
        else {
          this.disabledBtns = false
        }
        this.selTreeRow = sel
        const tables = []
        ;(function fu2(childs) {
          for (let j = 0; j < childs.length; j++) {
            const d = childs[j]
            if (d.enableInput) {
              d.edit = false
              d.display = true
              tables.push(d)
            }
            if (d.children && d.children.length > 0) {
              fu2(d.children)
            }
            d.children = null
          }
        })(selNode.children || [])
        this.tabledata = tables
        this.initStandardOption(tables)
      }
      else {
        this.disabledBtns = true
        this.selTreeRow = []
        this.tabledata = []
      }
    },
    // 初始化评定标准项
    initStandardOption(standards) {
      const list = []
      for (let i = 0; i < standards.length; i++) {
        const item = standards[i]
        const key = `${item.standardName || ''}${
          item.standardPublishCode || ''
        }`
        if (list.includes(key) || !key)
          continue
        list.push(key)
      }
      this.cacheTableData = JSON.parse(JSON.stringify(standards))
      this.standardDatas = list
    },
    // 评定标准筛选
    changeQueryStandard(e) {
      const list = JSON.parse(JSON.stringify(this.cacheTableData))
      if (!e) {
        this.tabledata = list
      }
      else {
        this.tabledata = list.filter((d) => {
          const key = `${d.standardName || ''}${d.standardPublishCode || ''}`
          return key === e
        })
      }
    },
    // 获取表格和树数据
    getTreeAndList() {
      this.spinning = true
      window.$oAjax
        .get(`/rest/indicator/list/${this.paramId}`)
        .then((res) => {
          if (Number.parseInt(res.code) === 20000) {
            if (res.data.length > 0) {
              res.data[0].rootNode = true
            }
            this.orignTreeData = JSON.parse(JSON.stringify(res.data))
            this.traverseTree(res.data)
            this.treeData = res.data
            this.selectedRowKeys = []
            this.selRow = []
            this.tabledata = []
            if (this.selTreeRow.length > 0) {
              this.onSelect(this.selTreeRow)
            }
          }
          else {
            window.$oAntdMessage.error(res.message)
          }
          this.spinning = false
        })
    },
    // 递归tree
    traverseTree(treeAll, parentType) {
      for (let i = 0; i < treeAll.length; i++) {
        treeAll[i].slots = { icon: 'selIcon' }
        if (parentType)
          treeAll[i].parentType = parentType
        if (treeAll[i].enableInput) {
          treeAll.splice(i, 1)
          i--
          continue
        }
        if (treeAll[i].children && treeAll[i].children.length > 0) {
          this.traverseTree(treeAll[i].children, treeAll[i].type)
        }
      }
    },
    // 获取结论类型
    getConclusionType() {
      return new Promise((resolve, reject) => {
        window.$oAjax
          .get(`/rest/indicator/conclusion-type`)
          .then((res) => {
            if (Number.parseInt(res.code) === 20000) {
              for (const i in res.data) {
                this.conclusion[res.data[i].code] = res.data[i].label
              }
              this.conclusionTypeList = res.data
              resolve(true)
            }
            else {
              // eslint-disable-next-line prefer-promise-reject-errors
              reject(false)
              window.$oAntdMessage.error(res.message)
            }
          })
      })
    },
    // 获取检测值类型
    getDetectionType() {
      return new Promise((resolve, reject) => {
        window.$oAjax
          .get(`/rest/indicator/detection-value-type`)
          .then((res) => {
            if (Number.parseInt(res.code) === 20000) {
              for (const i in res.data) {
                this.detection[res.data[i].code] = res.data[i].label
              }
              this.detectionTypeList = res.data
              resolve(true)
            }
            else {
              // eslint-disable-next-line prefer-promise-reject-errors
              reject(false)
              window.$oAntdMessage.error(res.message)
            }
          })
      })
    },
    // 获取运算符类型
    getOperatorType() {
      return new Promise((resolve, reject) => {
        window.$oAjax
          .get(`/rest/indicator/operator-type`)
          .then((res) => {
            if (Number.parseInt(res.code) === 20000) {
              this.operatorType = res.data
              for (const i in res.data) {
                this.operator[res.data[i].code] = res.data[i].symbol
              }
              resolve(true)
            }
            else {
              // eslint-disable-next-line prefer-promise-reject-errors
              reject(false)
              window.$oAntdMessage.error(res.message)
            }
          })
      })
    },
    // 复制
    copyRows() {
      if (this.selRow.length == 0) {
        window.$oAntdMessage.warning('请选择需要复制的数据')
        return
      }
      if (this.selRow.some(d => !d.id)) {
        window.$oAntdMessage.warning('存在未保存的数据，不能进行复制操作')
        return
      }
      this.copy(this.selectedRowKeys)
    },
    // 附件管理
    attmentManage() {
      this.$refs.uploadRef.openModal(this.paramId)
    },
    uploadSucess(fileList) {
      this.spinning = true
      window.$oAjax
        .post(
          `/rest/indicator/annex`,
          {
            testParamId: this.paramId,
            annex: fileList,
          },
          {
            headers: {
              'content-type': 'application/json',
            },
          },
        )
        .then((res) => {
          this.spinning = false
          if (res.code === 20000) {
            window.$oAntdMessage.success('保存成功')
            this.$refs.uploadRef.closeModal()
          }
          else {
            window.$oAntdMessage.error(res.message || '保存失败')
          }
        })
        .catch((err) => {
          this.spinning = false
          window.$oAntdMessage.error(err.message || '保存失败')
        })
    },
    // 设置评定标准
    settingStandard() {
      if (this.selRow.length === 0) {
        window.$oAntdMessage.warning('请选择需要设置评定标准的数据')
        return
      }
      if (this.selRow.some(d => !d.id)) {
        window.$oAntdMessage.warning('存在未保存的数据，不能批量设置评定标准')
        return
      }
      this.editRowInd = -1
      this.standardVisible = true
    },
    // 编辑行的评定标准
    editRowStandard(ind) {
      this.standardVisible = true
      this.editRowInd = ind
    },
    getStandard() {
      const iframeWin = window.frames.importStandard
      const data = iframeWin.returnImport()
      if (!data || data.length === 0) {
        window.$oAntdMessage.warning('请选择评定标准')
        return
      }
      const obj = data[0]
      if (this.editRowInd !== -1) {
        const item = this.tabledata[this.editRowInd]
        item.standardId = obj.standardId
        item.standardName = obj.standardName
        item.standardPublishCode = obj.publishCode
        this.tabledata[this.editRowInd] = item
        this.standardVisible = false
        return
      }
      const selRows = JSON.parse(JSON.stringify(this.selRow))
      for (let i = 0; i < selRows.length; i++) {
        const item = selRows[i]
        item.standardId = obj.standardId
        item.standardName = obj.standardName
        item.standardPublishCode = obj.publishCode
      }
      this.standardVisible = false
      this.updateRow(selRows)
    },
    // 新增子节点
    addTreeItem(treeItem) {
      this.editTreeNode = treeItem
      this.isAdd = true
      this.editTitle = '新增'
      this.formState = {}
      if (treeItem.type === 'require') {
        this.disabledType = true
        window.$oNextTick(() => {
          this.formState.type = 'require'
        })
      }
      else {
        this.disabledType = false
      }
      this.treeVisible = true
    },
    // 保存节点
    saveTreeItem() {
      this.$refs.formRef.validateFields().then(() => {
        const value = { ...this.formState }
        const { id, parentId } = this.editTreeNode
        const params = {
          ...value,
          expressions: [],
          enableInput: 0,
          parentId: this.isAdd ? id : parentId,
          testParamId: this.paramId,
        }
        if (!this.isAdd)
          params.id = id
        this.saveRow(params)
      })
    },
    handleMenuClick(treeItem, menukey) {
      this.editTreeNode = treeItem
      switch (menukey) {
        case '1':
          // 编辑
          this.isAdd = false
          this.treeVisible = true
          this.editTitle = '编辑'
          this.disabledType = false
          // eslint-disable-next-line no-case-declarations
          const checkIsPro = (datas) => {
            if (!datas || datas.length === 0)
              return
            for (let i = 0; i < datas.length; i++) {
              const d = datas[i]
              if (d.type === 'item') {
                this.disabledType = true
                return
              }
              checkIsPro(d.children)
            }
          }
          checkIsPro(treeItem.children)
          if (treeItem.parentType === 'require') {
            this.disabledType = true
          }
          window.$oNextTick(() => {
            this.formState.name = treeItem.name
            this.formState.code = treeItem.code
            this.formState.type = treeItem.type || 'item'
            this.formState.sort = treeItem.sort
          })
          break
        case '2':
          // 移动
          this.moveTreeNode()
          break
        case '3':
          // 复制
          this.copyTreeNode()
          break
        case '4':
          // 删除
          this.deleteTreeNode(treeItem)
          break
      }
    },
    // 移动节点 - 过滤当前节点
    moveTreeNode() {
      const trees = JSON.parse(JSON.stringify(this.treeData))
      const edits = this.editTreeNode
      ;(function fn(datas) {
        for (let i = 0; i < datas.length; i++) {
          const item = datas[i]
          if (edits.id === item.id) {
            datas.splice(i, 1)
            return
          }
          if (item.children && item.children.length > 0) {
            fn(item.children)
          }
        }
      })(trees)
      this.moveVisible = true
      this.moveTreeData = trees
    },
    // 选择移入节点
    onSelectMove(key) {
      if (key && key.length > 0) {
        this.moveNodeId = key[0]
      }
      else {
        this.moveNodeId = ''
      }
    },
    // 确认移入
    confirmMove() {
      if (!this.moveNodeId) {
        window.$oAntdMessage.warning('请选择节点')
        return
      }
      const parentId = this.moveNodeId
      const id = this.editTreeNode.id
      const key = 'load'
      window.$oAntdMessage.loading('', key)
      window.$oAjax
        .post(
          `/rest/indicator/move`,
          {
            parentId,
            id,
          },
          {
            headers: {
              'content-type': 'application/json',
            },
          },
        )
        .then((res) => {
          this.spinning = false
          if (res.code === 20000) {
            window.$oAntdMessage.success({ content: '移动成功', key, duration: 2 })
            this.moveVisible = false
            this.getTreeAndList()
          }
          else {
            window.$oAntdMessage.error({
              content: res.message || '移动失败',
              key,
              duration: 2,
            })
          }
        })
        .catch(() => {
          this.spinning = false
        })
    },
    // 复制节点
    copyTreeNode() {
      window.$oAntdConfirm({
        title: '是否复制该节点？',
        content: '点击确定按钮时，将复制该节点、子节点及其技术指标',
        type: 'info',
        onOk: () => {
          this.copy([this.editTreeNode.id])
        },
      })
    },
    // 复制
    copy(ids) {
      this.spinning = true
      window.$oAjax
        .post(`/rest/indicator/copy`, ids, {
          headers: {
            'content-type': 'application/json',
          },
        })
        .then((res) => {
          this.spinning = false
          if (res.code === 20000) {
            window.$oAntdMessage.success('复制成功')
            this.getTreeAndList()
          }
          else {
            window.$oAntdMessage.error(res.message || '复制失败')
          }
        })
        .catch(() => {
          this.spinning = false
        })
    },
    // 删除节点
    deleteTreeNode(row) {
      window.$oAntdConfirm({
        title: '是否删除该节点？',
        content: '点击确定按钮时，将删除该节点、子节点及其技术指标',
        type: 'warning',
        onOk: () => {
          window.$oAjax
            .delete(`/rest/indicator/delete/${row.id}`)
            .then((res) => {
              if (Number.parseInt(res.code) === 20000) {
                window.$oAntdMessage.success('删除成功')
                this.getTreeAndList()
              }
              else {
                window.$oAntdMessage.error(res.message)
              }
            })
        },
      })
    },
  },
}
</script>

<style lang="less">
@import './index.less';
</style>

<style lang="less" scoped>
.formula_item {
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin: 10px 0;
}

.td-required::before {
  content: '*';
  color: red;
  display: inline-block;
}

:deep(.ant-tree .ant-tree-treenode) {
  width: 100%;
}

:deep(.ant-tree-node-content-wrapper) {
  flex: 1;

  .ant-tree-title {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .tree-title {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  .tree-item-handle {
    display: flex;
    align-items: center;
    height: 18px;
    color: #666;

    & > li:hover {
      color: #000;
    }

    .more:hover {
      background: radial-gradient(2px 2px at 2px 8px, #000, transparent),
        radial-gradient(2px 2px at 7px 8px, #000, transparent),
        radial-gradient(2px 2px at 12px 8px, #000, transparent);
    }
  }
}

.more {
  display: inline-block;
  margin-left: 8px;
  width: 14px;
  height: 16px;
  background: radial-gradient(2px 2px at 2px 8px, #666, transparent),
    radial-gradient(2px 2px at 7px 8px, #666, transparent),
    radial-gradient(2px 2px at 12px 8px, #666, transparent);
}
</style>
