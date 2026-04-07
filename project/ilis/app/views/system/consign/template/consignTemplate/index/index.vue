<!-- eslint-disable vue/no-template-shadow -->
<template>
  <div class="consignInfoConfig">
    <div class="consignInfoConfig-btn">
      <a-row>
        <a-col span="12">
          <a-button
            v-if="!editLayout"
            :disabled="spinning"
            type="primary"
            @click="saveData"
          >
            保存默认值
          </a-button>
          <a-button
            v-if="!editLayout"
            :disabled="spinning"
            class="toolBtn-bar"
            @click="resetData"
          >
            还原为上一次保存的默认值
          </a-button>
          <a-button
            v-if="!editLayout"
            :disabled="spinning"
            class="toolBtn-bar"
            danger
            @click="clearData"
          >
            清空
          </a-button>
          <a-button
            v-if="editLayout"
            :disabled="
              spinning || (!isChangeConsign && !isChangeSynthesisConsign)
            "
            type="primary"
            @click="saveLayout"
          >
            保存布局
          </a-button>

          <a-button
            v-if="editLayout"
            :disabled="spinning"
            class="toolBtn-bar"
            @click="resetLayout()"
          >
            初始化全部布局设置
          </a-button>
        </a-col>
        <a-col span="12" align="right">
          <a-button
            :disabled="spinning"
            class="toolBtn-bar"
            :type="editLayout ? 'default' : 'primary'"
            @click="changeLayout"
          >
            {{ editLayout ? '取消布局调整' : '布局调整' }}
          </a-button>
        </a-col>
      </a-row>
    </div>
    <div class="text-[#ff5722] pb-2 text-sm">
      {{
        editLayout
          ? '注：附件以下的内容将在委托页面“更多委托信息”中展示；此界面配置后，本单位所有账号的委托界面均会更新！'
          : '标注蓝色的项可设置默认值，委托表单与综合试验表单共用一套默认值'
      }}
    </div>
    <a-spin :spinning="spinning" tip="数据处理中···">
      <template #indicator>
        <LoadingOutlined style="font-size: 24px" spin />
      </template>

      <div class="consignInfoConfig-wrap">
        <a-form :model="data">
          <a-tabs :active-key="activeKey" @change="changeTab">
            <a-tab-pane
              v-for="layoutItem in layoutArr"
              :key="layoutItem.key"
              :tab="layoutItem.tab"
            >
              <div v-if="editLayout">
                <a-button
                  v-if="layoutItem.key === 'consign'"
                  :disabled="spinning"
                  class="toolBtn-bar"
                  @click="resetLayout('consign')"
                >
                  初始化委托表单布局设置
                </a-button>
                <a-button
                  v-if="layoutItem.key === 'synthesisConsign'"
                  :disabled="spinning"
                  class="toolBtn-bar"
                  @click="resetLayout('synthesisConsign')"
                >
                  初始化综合试验表单布局设置
                </a-button>
                <a-popover
                  v-if="layoutItem.hideField && layoutItem.hideField.length > 0"
                  title="已隐藏的填写项"
                  placement="bottom"
                >
                  <template #content>
                    <p style="color: rgb(255, 87, 34); font-size: 12px">
                      可点击填写项重新加入到表单布局中，加入的填写项会默认出现在“附件”上方
                    </p>
                    <div style="max-height: 160px; overflow-y: auto">
                      <div
                        v-for="(field, fieldIndex) in layoutItem.hideField"
                        :key="fieldIndex"
                        style="
                          border: solid 1px #e2e2e2;
                          background: #f5f5f5;
                          margin: 8px 0;
                          padding: 5px;
                          font-size: 12px;
                          cursor: pointer;
                        "
                        @click="selectHideField(field)"
                      >
                        {{ field.replace('：', '') }}
                      </div>
                    </div>
                  </template>
                  <a-button
                    v-if="
                      layoutItem.hideField && layoutItem.hideField.length > 0
                    "

                    class="toolBtn-bar"
                    type="primary"
                  >
                    显示隐藏的填写项
                  </a-button>
                </a-popover>
              </div>
              <GridLayout
                v-model:layout="layoutItem.layout"
                :col-num="colNum"
                :row-height="34"
                :is-draggable="editLayout"
                :is-resizable="editLayout"
                :is-mirrored="false"
                :vertical-compact="true"
                :margin="editLayout ? [8, 8] : [2, 2]"
                :use-css-transforms="true"
              >
                <GridItem
                  v-for="item in layoutItem.layout"
                  :key="item.i"
                  :x="item.x"
                  :y="item.y"
                  :w="item.w"
                  :h="item.h"
                  :i="item.i"
                  :min-w="1"
                  :max-w="4"
                  :min-h="1"
                  :max-h="1"
                  :is-draggable="item.isDraggable"
                  :is-resizable="item.isResizable"
                  @resized="resizedEvent(layoutItem.key)"
                  @moved="movedEvent(layoutItem.key)"
                >
                  <a-row
                    type="flex"
                    align="middle"
                    class="consignInfoConfig-row"
                  >
                    <a-col
                      class="consignInfoConfig-label"
                      :style="`background: ${
                        item.label === '资质类型：'
                        || item.label === '检测形式：'
                        || item.label === '编号类别：'
                        || item.label === '检测类别：'
                        || item.label === '样品来源：'
                        || item.label === '报告份数：'
                        || item.label === '报告发放方式：'
                        || consignCustom.find(i => `${i.attributeName}：` === item.label && i.columnType === 'input') ? '#d7f1fd' : ''
                      }`"
                    >
                      <span
                        title="隐藏此填写项"
                        class="consignInfoConfig-labelSetting"
                        @click="hideFormItem(item)"
                      >
                        <EyeInvisibleOutlined />
                      </span>
                      <span
                        title="勾选设置必填项"
                        class="consignInfoConfig-labelSetting"
                      >
                        <a-checkbox
                          v-model:checked="item.required"
                          :disabled="item.prohibitedRequired"
                          @change="onRequiredChange(item)"
                        ></a-checkbox>
                      </span>
                      <div
                        style="
                          overflow: hidden;
                          text-overflow: ellipsis;
                          white-space: nowrap;
                        "
                        :title="item.label"
                      >
                        {{ item.label }}
                      </div>
                    </a-col>
                    <a-col
                      v-if="item.label === '资质类型：'"
                      class="consignInfoConfig-value"
                    >
                      <a-form-item>
                        <a-select
                          v-model:value="data.qualificationTypeId"
                          :disabled="editLayout"
                          placeholder="请选择"
                        >
                          <a-select-option
                            v-for="item in qualifications"
                            :key="item.id"
                            :value="item.id"
                          >
                            {{ item.name }}
                          </a-select-option>
                        </a-select>
                      </a-form-item>
                    </a-col>
                    <a-col
                      v-else-if="item.label === '检测形式：'"
                      class="consignInfoConfig-value"
                    >
                      <a-form-item>
                        <a-select
                          v-model:value="data.testType"
                          :disabled="editLayout"
                          placeholder="请选择"
                        >
                          <a-select-option value="1">
                            初检
                          </a-select-option>
                          <a-select-option value="2">
                            复检
                          </a-select-option>
                          <a-select-option value="3">
                            整改后检测
                          </a-select-option>
                        </a-select>
                      </a-form-item>
                    </a-col>
                    <a-col
                      v-else-if="item.label === '编号类别：'"
                      class="consignInfoConfig-value"
                    >
                      <a-form-item>
                        <a-select
                          v-model:value="data.snTypeId"
                          :disabled="editLayout"
                          placeholder="请选择"
                        >
                          <a-select-option
                            v-for="item in snCategory"
                            :key="item.id"
                            :value="item.id"
                          >
                            {{ item.name }}
                          </a-select-option>
                        </a-select>
                      </a-form-item>
                    </a-col>
                    <a-col
                      v-else-if="item.label === '检测类别：'"
                      class="consignInfoConfig-value"
                    >
                      <a-form-item>
                        <a-select
                          v-model:value="data.checkTypeId"
                          :disabled="editLayout"
                          placeholder="请选择"
                        >
                          <a-select-option
                            v-for="item in checkType"
                            :key="item.id"
                            :value="item.id"
                          >
                            {{ item.name }}
                          </a-select-option>
                        </a-select>
                      </a-form-item>
                    </a-col>
                    <a-col
                      v-else-if="item.label === '样品来源：'"
                      class="consignInfoConfig-value"
                    >
                      <a-form-item>
                        <a-select
                          v-model:value="data.sampleSource"
                          placeholder="请选择"
                          :disabled="editLayout"
                          @change="changeSampleSource"
                        >
                          <a-select-option
                            v-for="item in sampleSource"
                            :key="item.typename"
                            :value="item.typename"
                          >
                            {{ item.typename }}
                          </a-select-option>
                        </a-select>
                      </a-form-item>
                    </a-col>
                    <a-col
                      v-else-if="item.label === '报告份数：'"
                      class="consignInfoConfig-value"
                    >
                      <a-form-item>
                        <a-input-number
                          v-model:value="data.reportPrintNum"
                          :min="0"
                          placeholder="请填写"
                          style="width: 100%"
                          :controls="false"
                          :disabled="editLayout"
                        />
                      </a-form-item>
                    </a-col>
                    <a-col
                      v-else-if="item.label === '报告发放方式：'"
                      class="consignInfoConfig-value"
                    >
                      <a-form-item>
                        <a-select
                          v-model:value="data.reportHandOverType"
                          :disabled="editLayout"
                          placeholder="请选择"
                        >
                          <a-select-option value="1">
                            自取
                          </a-select-option>
                          <a-select-option value="3">
                            邮寄
                          </a-select-option>
                          <a-select-option value="4">
                            传真
                          </a-select-option>
                        </a-select>
                      </a-form-item>
                    </a-col>
                    <a-col
                      v-else-if="consignCustom.find(i => `${i.attributeName}：` === item.label && i.columnType === 'input')"
                      class="consignInfoConfig-value"
                    >
                      <a-form-item>
                        <a-input
                          v-model:value="
                            data[
                              consignCustom.find(
                                (i) => `${i.attributeName}：` === item.label,
                              ).id
                            ]
                          "
                          :disabled="editLayout"
                          placeholder="请填写"
                        />
                      </a-form-item>
                    </a-col>
                    <a-col v-else class="consignInfoConfig-value">
                      <div></div>
                    </a-col>
                  </a-row>
                </GridItem>
              </GridLayout>
            </a-tab-pane>
          </a-tabs>
        </a-form>
      </div>
    </a-spin>
    <iframe
      ref="consignIframe"
      :src="`${rootUrl}/consignController.do?goEdit&getLayoutOriginDom=1`"
      hidden
    ></iframe>
  </div>
</template>

<script>
import { EyeInvisibleOutlined, LoadingOutlined } from '@ant-design/icons-vue'
import { GridItem, GridLayout } from 'grid-layout-plus'
import qs from 'qs'
import { rootUrl } from '~/providers/configs/rootUrl'
import api from '../api'

let trDoms = null

export default {
  components: {
    GridLayout,
    GridItem,
    EyeInvisibleOutlined,
    LoadingOutlined,
  },
  data() {
    return {
      rootUrl,
      spinning: false,
      data: {},
      qualifications: [],
      snCategory: [],
      checkType: [],
      consignCustom: [],
      sampleSource: [],
      cacheData: {},
      defaultQualificationTypeId: undefined,
      defaultSnTypeId: undefined,
      cacheLayoutData: [],
      layoutData: [],
      editLayout: false,
      colNum: 4,
      // 保存的配置数据
      originConfig: [],
      // 委托界面当前所有填写项label
      allLabels: [],
      activeKey: 'consign',
      layoutArr: [],
      isChangeConsign: false,
      isChangeSynthesisConsign: false,
    }
  },
  async mounted() {
    this.spinning = true
    const consignIframe = this.$refs.consignIframe
    if (consignIframe) {
      consignIframe.onload = async () => {
        trDoms = consignIframe.contentWindow.$('#consignInfoTable tr')
        this.allLabels = consignIframe.contentWindow.getLayoutAllLabel()
        await this.getLayoutConfig()
        await this.getQualifications()
        await this.getSnCategoryUser()
        await this.getCheckType()
        await this.getConsignCustom()
        await this.getSampleSource()
        await this.getData()

        await this.init()
      }
    }
    else {
      this.spinning = false
    }
  },
  methods: {
    formatLayoutData(data, type) {
      let configData = []

      let fields = []
      if (type === 'consign') {
        fields = ['单位工程：', '约定检测日期：']
      }
      else if (type === 'synthesisConsign') {
        fields = ['预委托编号：']
      }

      // 没计入布局中的新增项
      const otherLabels = [...this.allLabels].filter(
        item => !fields.includes(item),
      )

      if (data && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
          const row = data[i]
          for (let j = 0; j < row.length; j++) {
            const col = row[j]
            if (col.label && otherLabels.includes(col.label)) {
              // col.required=false;
              otherLabels.splice(otherLabels.indexOf(col.label), 1)
              configData.push({ ...col })
            }
          }
        }

        if (otherLabels.length > 0) {
          const insertIndex = configData.findIndex(
            item => item.label === '附件：',
          )
          otherLabels.reverse()
          const y = configData[insertIndex].y

          for (let i = 0; i < otherLabels.length; i++) {
            configData.splice(
              insertIndex,
              0,
              this.getConfigBySingleDom({
                x: 0,
                y: y + i,
                w: 4,
                h: 1,
                label: otherLabels[i],
              }),
            )
          }

          for (let i = insertIndex + 1; i < configData.length; i++) {
            configData[i].y += otherLabels.length
          }
        }
      }
      else {
        configData = this.getLayoutConfigByDom(trDoms, type)
      }

      // configData = this.clearClearDom(configData);

      // 以附件为分割线
      configData = configData.map((item) => {
        const _obj = { ...item }
        if (item.label === '附件：') {
          _obj.isResizable = false
          _obj.w = 4
        }
        return _obj
      })

      configData = configData.map((item, i) => ({ ...item, i }))

      return configData
    },
    initLayoutConfig(data) {
      const layoutArr = []
      const config = data || this.originConfig
      const consignLayout = config.find(i => i.key === 'consign')
      layoutArr.push({
        tab: '委托表单',
        key: 'consign',
        layout: this.formatLayoutData(
          consignLayout ? consignLayout.layout : [],
          'consign',
        ),
        hideField: consignLayout ? consignLayout.hideField || [] : [],
      })

      const synthesisConsign = config.find(i => i.key === 'synthesisConsign')
      layoutArr.push({
        tab: '综合试验表单',
        key: 'synthesisConsign',
        layout: this.formatLayoutData(
          synthesisConsign ? synthesisConsign.layout : [],
          'synthesisConsign',
        ),
        hideField: synthesisConsign ? synthesisConsign.hideField || [] : [],
      })

      return layoutArr
    },
    init() {
      let layoutArr = []

      try {
        layoutArr = this.initLayoutConfig()
      }
      catch (err) {
        console.error(err)
        layoutArr = this.initLayoutConfig([])
      }
      // 最终渲染数据，在这里对数据做一些处理
      for (let i = 0; i < layoutArr.length; i++) {
        const layout = layoutArr[i].layout
        for (let j = 0; j < layout.length; j++) {
          // 这些选项默认必填，并且不允许修改
          if (
            '委托单位：,工程项目：,委托人电话： ,委托人：,委托日期：'.includes(
              layout[j].label,
            )
          ) {
            layout[j].prohibitedRequired = true // 设置不允许修改
            layout[j].required = true // 设置选中
          }
          else {
            layout[j].prohibitedRequired = false
            layout[j].required = layout[j].required || false
          }
        }
      }
      this.cacheLayoutData = JSON.parse(JSON.stringify(layoutArr))

      this.layoutArr = layoutArr

      window.$oNextTick(() => {
        this.spinning = false
      })
    },
    // 选择隐藏的字段 将隐藏的字段插入到布局中
    selectHideField(field) {
      const layoutObj = this.layoutArr.find(item => item.key === this.activeKey)

      const insertIndex = layoutObj.layout.findIndex(
        item => item.label === '附件：',
      )
      const y = layoutObj.layout[insertIndex].y
      layoutObj.layout.splice(
        insertIndex,
        0,
        this.getConfigBySingleDom({
          i: layoutObj.layout[insertIndex].i,
          x: 0,
          y,
          w: 4,
          h: 1,
          isDraggable: true,
          isResizable: true,
          label: field,
        }),
      )

      for (let i = insertIndex + 1; i < layoutObj.layout.length; i++) {
        layoutObj.layout[i].y += 1
        layoutObj.layout[i].i += 1
      }

      // 从布局信息中移除此项
      layoutObj.hideField = layoutObj.hideField.filter(item => item !== field)

      if (layoutObj.key === 'consign') {
        this.isChangeConsign = true
      }
      else if (layoutObj.key === 'synthesisConsign') {
        this.isChangeSynthesisConsign = true
      }
    },
    onRequiredChange() {
      const layoutObj = this.layoutArr.find(item => item.key === this.activeKey)
      //
      if (layoutObj.key === 'consign') {
        this.isChangeConsign = true
      }
      else if (layoutObj.key === 'synthesisConsign') {
        this.isChangeSynthesisConsign = true
      }
    },
    // 点击右键，打开菜单
    hideFormItem(row) {
      window.$oAntdConfirm({
        title: '提示',
        content: '确定隐藏此填写项吗？',
        onOk: () => {
          const layoutObj = this.layoutArr.find(
            item => item.key === this.activeKey,
          )
          // 从布局信息中移除此项
          layoutObj.layout = layoutObj.layout.filter(
            item => item.label !== row.label,
          )
          // 将此字段加入隐藏对象中
          layoutObj.hideField.push(row.label)

          if (layoutObj.key === 'consign') {
            this.isChangeConsign = true
          }
          else if (layoutObj.key === 'synthesisConsign') {
            this.isChangeSynthesisConsign = true
          }
        },
      })
    },
    changeTab(index) {
      this.activeKey = index

      // 影响性能，但解决切换之后布局不对，需要重新渲染
      window.$oNextTick(() => {
        this.layoutArr = JSON.parse(JSON.stringify(this.layoutArr))
      })
    },
    getConfigBySingleDom(config) {
      const _config = { ...config }
      const td = trDoms
        .find(`.td-label label:contains(${_config.label})`)
        .parent()
      return {
        ..._config,
        tdAttributes: this.getTdAttributes(td),
      }
    },
    // 根据dom元素生成配置
    getLayoutConfigByDom(trs, type) {
      const configs = []
      let index = 0

      let fields = []
      if (type === 'consign') {
        fields = ['单位工程：', '约定检测日期：']
      }
      else if (type === 'synthesisConsign') {
        fields = ['预委托编号：']
      }

      for (let i = 0; i < trs.length; i++) {
        const tds = trs.eq(i).find('.td-label')

        let x = 0
        for (let j = 0; j < tds.length; j++) {
          const w = 2
          const _x = x

          const tdLabel = tds.eq(j).find('label').text()
          if (tdLabel && fields.includes(tdLabel)) {
            continue
          }

          if (tdLabel) {
            const _obj = {
              i: index++,
              h: 1,
              w,
              x: _x,
              y: i,
              label: tdLabel,
              tdAttributes: this.getTdAttributes(tds.eq(j)),
            }

            if (_obj.tdAttributes.includes('_customAttributes-label')) {
              _obj.w = 4
            }

            configs.push(_obj)
          }
          x = x + w
        }
      }
      return configs
    },
    // 获取表格的属性
    getTdAttributes(ele) {
      let str = ''
      if (ele.attr('class')) {
        str += `class='${ele.attr('class')}'`
      }
      if (ele.attr('style')) {
        str += ` style='${ele.attr('style')}'`
      }

      return str
    },
    // 调整布局
    changeLayout() {
      this.editLayout = !this.editLayout
      if (this.editLayout === false) {
        this.layoutArr = JSON.parse(JSON.stringify(this.cacheLayoutData))
      }
    },
    // 获取布局配置
    async getLayoutConfig() {
      const res = await window.$oAjax.get(api.getLayout)
      const { code, data } = res
      if (code === 20000) {
        this.originConfig = data
      }
      else {
        window.$oAntdModal.warning(
          window.$oMsgTips.info(res.message || res.msg || '布局信息获取失败'),
        )
      }
    },
    // 还原为初始布局
    async resetLayout(type) {
      if (type === 'consign') {
        this.isChangeConsign = true
      }
      else if (type === 'synthesisConsign') {
        this.isChangeSynthesisConsign = true
      }
      else {
        this.isChangeSynthesisConsign = true
        this.isChangeConsign = true
      }

      if (type) {
        let configData = this.getLayoutConfigByDom(trDoms, type)
        configData = configData.map((item) => {
          const _obj = { ...item }
          if (item.label === '附件：') {
            _obj.isResizable = false
            _obj.w = 4
          }
          return _obj
        })

        for (let i = 0; i < this.layoutArr.length; i++) {
          if (type === this.layoutArr[i].key) {
            this.layoutArr[i].layout = configData
            this.layoutArr[i].hideField = []
          }
        }
      }
      else {
        for (let i = 0; i < this.layoutArr.length; i++) {
          let configData = this.getLayoutConfigByDom(
            trDoms,
            this.layoutArr[i].key,
          )
          configData = configData.map((item) => {
            const _obj = { ...item }
            if (item.label === '附件：') {
              _obj.isResizable = false
              _obj.w = 4
            }
            return _obj
          })

          this.layoutArr[i].layout = configData
          this.layoutArr[i].hideField = []
        }
      }
      for (let i = 0; i < this.layoutArr.length; i++) {
        const layout = this.layoutArr[i].layout
        for (let j = 0; j < layout.length; j++) {
          // 这些选项默认必填，并且不允许修改

          if (
            '委托单位：,工程项目：,委托人电话： ,委托人：,委托日期：'.includes(
              layout[j].label,
            )
          ) {
            layout[j].prohibitedRequired = true // 设置不允许修改
            layout[j].required = true // 设置
          }
          else {
            layout[j].prohibitedRequired = false
            layout[j].required = layout[j].required || false
          }
        }
      }
    },
    formatSaveData(layoutData) {
      if (Array.isArray(layoutData) && layoutData.length > 0) {
        const data = []
        let row = 0
        let isHidden = false

        while (row !== false) {
          let layout = layoutData.filter(item => item.y === row)
          if (layout && layout.length > 0) {
            layout = layout.sort((a, b) => a.x - b.x)
            const _data = []

            let boxX = 0
            while (boxX < 4) {
              if (layout.find(i => i.x === boxX)) {
                const _layout = layout.find(i => i.x === boxX)
                const _obj = {
                  label: _layout.label,
                  w: _layout.w,
                  x: _layout.x,
                  y: _layout.y,
                  h: 1,
                  tdAttributes: _layout.tdAttributes,
                  class: _layout.class,
                }
                if (isHidden) {
                  _obj.isHidden = true
                }
                else if (_layout.label === '附件：') {
                  isHidden = true
                }
                _obj.required = _layout.required
                _data.push(_obj)
                boxX += _layout.w
              }
              else {
                _data.push({})
                boxX++
              }
            }
            data.push(_data)
            row++
          }
          else {
            row = false
          }
        }

        return data
      }
      else {
        return []
      }
    },
    resizedEvent(type) {
      if (type === 'consign') {
        this.isChangeConsign = true
      }
      else if (type === 'synthesisConsign') {
        this.isChangeSynthesisConsign = true
      }
    },
    movedEvent(type) {
      if (type === 'consign') {
        this.isChangeConsign = true
      }
      else if (type === 'synthesisConsign') {
        this.isChangeSynthesisConsign = true
      }
    },
    async saveLayout() {
      let data = JSON.parse(JSON.stringify(this.layoutArr))
      data = data.map(item => ({
        ...item,
        layout: this.formatSaveData(item.layout),
      }))

      let layoutChangeState = null
      if (
        this.isChangeConsign === true
        && this.isChangeSynthesisConsign === true
      ) {
        layoutChangeState = 1
      }
      else if (
        this.isChangeConsign === true
        && this.isChangeSynthesisConsign === false
      ) {
        layoutChangeState = 2
      }
      else if (
        this.isChangeConsign === false
        && this.isChangeSynthesisConsign === true
      ) {
        layoutChangeState = 3
      }

      this.spinning = true
      const res = await window.$oAjax.post(api.saveLayout, data, {
        headers: {
          'content-type': 'application/json',
        },
      })

      this.spinning = false
      if (res && res.code === 20000) {
        this.editLayout = false

        if (layoutChangeState) {
          const iframes = top.document.querySelectorAll('.J_iframe')
          for (let i = 0; i < iframes.length; i++) {
            const iframe = iframes[i]
            const dataId = iframe.getAttribute('data-id')
            if (
              dataId && dataId.includes('consignController.do?goEdit')
            ) {
              iframes[i].contentWindow.layoutChangeState = layoutChangeState
            }
          }
        }

        // 更新项目localStorage缓存
        top.localStorage.setItem(
          'consignLayoutConfig',
          JSON.stringify(data || []),
        )

        this.isChangeConsign = false
        this.isChangeSynthesisConsign = false
        window.$oAntdMessage.success('表单界面保存成功')
      }
      else {
        window.$oAntdModal.warning(
          window.$oMsgTips.info(res.message || res.msg || '表单界面保存失败'),
        )
      }
    },
    async getQualifications() {
      window.$oAjax.get(api.getQualifications).then((res) => {
        this.qualifications = res.data
        if (this.qualifications.find(item => item.defaultFlag)) {
          this.defaultQualificationTypeId = this.qualifications.find(
            item => item.defaultFlag,
          ).id
        }
      })
    },
    async getSnCategoryUser() {
      window.$oAjax.get(api.getSnCategoryUser).then((res) => {
        this.snCategory = res.obj
        if (this.snCategory.find(item => item.isDefault === 'Y')) {
          this.defaultSnTypeId = this.snCategory.find(
            item => item.isDefault === 'Y',
          ).id
        }
      })
    },
    async getCheckType() {
      window.$oAjax.get(api.getCheckType).then((res) => {
        res.push({
          name: '自动设置默认值',
          id: '',
        })
        this.checkType = res
      })
    },
    async getConsignCustom() {
      window.$oAjax
        .get(
          api.getConsignCustom,
          qs.stringify({
            page: 1,
            rows: 10000,
          }),
        )
        .then((res) => {
          this.consignCustom = res.data.map(item => ({
            ...item,
            attributeName: item.columnName.substr(1),
          }))
        })
    },
    async getSampleSource() {
      const formData = new FormData()
      formData.append('page', 1)
      formData.append('rows', 10)

      window.$oAjax
        .post(api.getSampleSource, formData, {
          params: {
            typegroupid: '6856cc70-e05a-11ea-87d0-0242ac13',
            field: 'id,typename,typecode,sourceFrom,orderNumber,',
          },
        })
        .then((res) => {
          this.sampleSource = res.rows
        })
    },
    changeSampleSource(value) {
      this.data.sampleSourceCode = this.sampleSource.find(
        item => item.typename === value,
      ).typecode
    },
    async saveData() {
      this.spinning = true
      const res = await window.$oAjax.post(api.saveConfig, this.data, {
        headers: {
          'content-type': 'application/json',
        },
      })

      this.spinning = false
      if (res && res.code === 20000) {
        window.$oAntdMessage.success('默认值保存成功')
        this.cacheData = {
          ...this.data,
          qualificationTypeId:
            this.data.qualificationTypeId || this.defaultQualificationTypeId,
          snTypeId: this.data.snTypeId || this.defaultSnTypeId,
        }
      }
      else {
        window.$oAntdModal.warning(
          window.$oMsgTips.info(res.message || res.msg || '默认值保存失败'),
        )
      }
    },
    resetData() {
      this.data = JSON.parse(JSON.stringify(this.cacheData))
    },
    clearData() {
      this.data = {}
    },
    async getData() {
      // eslint-disable-next-line unused-imports/no-unused-vars
      const { page, size, projectName } = this

      const res = await window.$oAjax.get(api.getConfig)
      if (res && res.code === 20000) {
        if (res.data) {
          this.data = {
            ...res.data,
            qualificationTypeId:
              res.data.qualificationTypeId || this.defaultQualificationTypeId,
            snTypeId: res.data.snTypeId || this.defaultSnTypeId,
          }
          this.cacheData = {
            ...res.data,
            qualificationTypeId:
              res.data.qualificationTypeId || this.defaultQualificationTypeId,
            snTypeId: res.data.snTypeId || this.defaultSnTypeId,
          }
          // this.data.qualificationTypeId =
          //   this.defaultQualificationTypeId || this.data.qualificationTypeId;
          // this.data.snTypeId = this.defaultSnTypeId || this.data.snTypeId;
        }
        else {
          this.data = {}
        }
      }
      else {
        window.$oAntdModal.warning(
          window.$oMsgTips.info(res.message || res.msg || '默认值数据获取失败'),
        )
      }
    },
  },
}
</script>

<style lang="less" scoped>
.vue-grid-item {
  background: #fff;
  border: solid 1px #e2e2e2;
}
@import './index.less';
</style>
