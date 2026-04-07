<template>
  <div>
    <a-drawer
      title="高级查询"
      placement="left"
      :closable="true"
      :open="visible"
      :width="620"
      @close="closeModel"
    >
      <div class="flex flex-col h-full">
        <div class="flex-1 overflow-y-auto p-4">
          <a-form :label-col="{ style: 'width: 100px' }" :wrapper-col="{ style: 'flex: 1' }">
            <a-form-item label="入库状态">
              <a-select
                v-model:value="queryForm.inventoryStatus"
                allow-clear
                placeholder="请选择状态"
              >
                <a-select-option
                  v-for="item in statusList"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="化学名称">
              <div class="flex gap-2">
                <a-input
                  v-model:value="queryForm.categoryName"
                  disabled
                  placeholder="请选择化学名称"
                ></a-input>
                <a-button @click="chooseChemical">
                  选择
                </a-button>
              </div>
            </a-form-item>
            <a-form-item label="管理级别">
              <a-select
                v-model:value="queryForm.manageLevelId"
                allow-clear
                placeholder="请选择管理级别"
              >
                <a-select-option
                  v-for="item in levelDatas"
                  :key="item.id"
                  :value="item.id"
                >
                  {{ item.displayName }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="用途">
              <a-input
                v-model:value="queryForm.effect"
                placeholder="请输入用途"
              />
            </a-form-item>
            <a-form-item label="化学品来源">
              <a-input
                v-model:value="queryForm.sourceFrom"
                placeholder="请输入化学品来源"
              />
            </a-form-item>
            <a-form-item label="计量单位">
              <a-select
                v-model:value="queryForm.unit"
                allow-clear
                placeholder="请选择计量单位"
              >
                <a-select-option
                  v-for="item in unitDatas"
                  :key="item"
                  :value="item"
                >
                  {{ item }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <a-form-item label="生产日期">
              <div class="flex items-center gap-2">
                <a-date-picker
                  v-model:value="queryForm.productionDateStart"
                  class="flex-1"
                  value-format="YYYY-MM-DD"
                />
                -
                <a-date-picker
                  v-model:value="queryForm.productionDateEnd"
                  class="flex-1"
                  value-format="YYYY-MM-DD"
                />
              </div>
            </a-form-item>
            <a-form-item label="失效日期">
              <div class="flex items-center gap-2">
                <a-date-picker
                  v-model:value="queryForm.invalidDateStart"
                  class="flex-1"
                  value-format="YYYY-MM-DD"
                />
                -
                <a-date-picker
                  v-model:value="queryForm.invalidDateEnd"
                  class="flex-1"
                  value-format="YYYY-MM-DD"
                />
              </div>
            </a-form-item>
            <a-form-item label="入库日期">
              <div class="flex items-center gap-2">
                <a-date-picker
                  v-model:value="queryForm.putawayDateStart"
                  class="flex-1"
                  value-format="YYYY-MM-DD"
                />
                -
                <a-date-picker
                  v-model:value="queryForm.putawayDateEnd"
                  class="flex-1"
                  value-format="YYYY-MM-DD"
                />
              </div>
            </a-form-item>
            <a-form-item label="更换容器存储">
              <a-select
                v-model:value="queryForm.allowChangeContainer"
                placeholder="请选择"
              >
                <a-select-option :value="1">
                  是
                </a-select-option>
                <a-select-option :value="0">
                  否
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-form>
        </div>

        <div class="p-4 text-right border-t">
          <a-button type="primary" @click="queryData">
            查询
          </a-button>
          <a-button @click="clearForm">
            清空条件
          </a-button>
        </div>
      </div>
    </a-drawer>

    <SelChemicals ref="selChemicalsRef" :callback="getChemicalsData" />
  </div>
</template>

<script>
import { getLevelAll } from '~/providers/api/chemicals'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'
import SelChemicals from '../../components/selChemicals.vue'

export default {
  components: {
    SelChemicals,
  },
  emits: ['ok'],
  data() {
    return {
      visible: false,
      currentField: '',
      statusList: [
        {
          label: '创建中',
          value: '创建中',
        },
        {
          label: '已入库',
          value: '已入库',
        },
      ],
      levelDatas: [],
      unitDatas: ['g', 'kg', 'L', 'mL'],
      checkTypeList: [],
      codeTypeList: [],
      departmentData: [],
      qualificationList: [],
      selChemicalsData: [],
      queryForm: {
        inventoryStatus: undefined,
        categoryName: '',
        manageLevel: undefined,
        effect: '',
        sourceFrom: '',
        unit: undefined,
        productionDateStart: '',
        productionDateEnd: '',
        invalidDateStart: '',
        invalidDateEnd: '',
        putawayDateStart: '',
        putawayDateEnd: '',
        allowChangeContainer: 1,
      },
      defaultForm: {},
    }
  },
  async created() {
    this.defaultForm = JSON.parse(JSON.stringify(this.queryForm))
    this.getLevelList()
  },
  methods: {
    closeModel() {
      this.visible = false
    },
    showModal() {
      this.visible = true
    },
    queryData() {
      const query = { ...this.queryForm }
      $emit(this, 'ok', query)
      this.closeModel()
    },
    clearForm() {
      this.queryForm = { ...this.defaultForm }
    },
    // 选择化学品
    chooseChemical() {
      this.$refs.selChemicalsRef.showModal(
        'radio',
        this.selChemicalsData.map((it) => {
          return it.blendCategoryId
        }),
        this.selChemicalsData,
      )
    },
    // 选择化学品回调
    getChemicalsData(data) {
      const item = data.length > 0 ? data[0] : {}
      this.queryForm.categoryName = item.name || ''
    },
    // 获取管理级别列表
    getLevelList() {
      getLevelAll().then((res) => {
        if (!res.code === 20000)
          return
        this.levelDatas = res.data.filter(d => d.enabled)
      })
    },
  },
}
</script>
