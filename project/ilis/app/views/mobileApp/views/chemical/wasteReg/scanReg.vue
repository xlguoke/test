<template>
  <div>
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)"></MobileTitleBar>
    </van-sticky>
    <van-cell-group style="padding-bottom: 64px">
      <van-field
        v-model="recordData.laboratoryName"
        label="功能室"
        placeholder="请选择功能室"
        input-align="right"
        is-link
        readonly
        required
        @click="selectLabVisible = true"
      />
      <van-field
        v-model="recordData.typeName"
        label="废物类型"
        placeholder="请选择废物类型"
        input-align="right"
        is-link
        readonly
        required
        @click="selectTypeVisible = true"
      />
      <van-field
        v-model="data.hazardousIngredientsName"
        label="有害成分"
        placeholder="请选择有害成分"
        input-align="right"
        is-link
        readonly
        required
        @click="selectHazardousIngredientsVisible = true"
      />
      <van-field
        v-model="data.quantity"
        label="数量"
        placeholder="请输入数量"
        input-align="right"
        required
      />
      <van-field
        v-model="data.unit"
        label="单位"
        input-align="right"
        placeholder="请选择单位"
        is-link
        readonly
        required
        :disabled="!!recordData.id"
        @click="
          () => {
            if (!recordData.id) {
              selectUnitVisible = true
            }
          }
        "
      />
      <van-field
        v-model="data.launchUserName"
        label="投放人"
        placeholder="请选择"
        input-align="right"
        is-link
        readonly
        required
        @click="selectPersonVisible = true"
      />

      <FormItemDate
        v-model:value="data.launchDate"
        label="投放时间"
        placeholder="请输入"
        required
      />

      <!-- 自定义表单 -->
      <template v-for="(item, index) in customFields" :key="index">
        <van-field
          v-if="item.columnType === 'input'"
          v-model="item.columnValue"
          :label="item.columnName"
          placeholder="请输入"
          input-align="right"
        >
        </van-field>

        <van-field
          v-if="item.columnType === 'inputNumber'"
          v-model="item.columnValue"
          type="digit"
          :label="item.columnName"
          placeholder="请输入"
          input-align="right"
        >
        </van-field>

        <template v-if="item.columnType === 'date'">
          <FormItemDate
            :key="`${index}d`"
            v-model:value="item.columnValue"
            name="datetimePicker"
            :label="item.columnName"
            placeholder="点击选择时间"
          />
        </template>

        <template
          v-if="
            item.columnType === 'select' || item.columnType === 'selectUpdate'
          "
        >
          <van-field
            :key="`${index}d`"
            v-model="item.columnValue"
            :readonly="item.columnType === 'select'"
            clickable
            :label="item.columnName"
            placeholder="点击选择"
            input-align="right"
            @click-right-icon="
              item.columnType === 'selectUpdate' && (item.showPicker = true)
            "
            @click="item.columnType === 'select' && (item.showPicker = true)"
          >
            <template #right-icon>
              <van-icon name="arrow" />
            </template>
          </van-field>
          <van-popup
            :key="`${index}t`"
            v-model:show="item.showPicker"
            position="bottom"
          >
            <van-picker
              show-toolbar
              :columns="item.option"
              @confirm="
                ({ selectedOptions }) => {
                  item.showPicker = false
                  item.columnValue = selectedOptions[0]
                }
              "
              @cancel="item.showPicker = false"
            />
          </van-popup>
        </template>

        <van-field
          v-if="item.columnType === 'textarea'"
          v-model="item.columnValue"
          rows="1"
          type="textarea"
          input-align="right"
          :label="item.columnName"
          placeholder="请输入"
        >
        </van-field>

        <van-field
          v-if="item.columnType === 'radio'"
          name="radio"
          input-align="right"
          :label="item.columnName"
        >
          <template #input>
            <van-radio-group
              v-model="item.columnValue"
              direction="horizontal"
            >
              <van-radio
                v-for="citem in item.option"
                :key="citem"
                :name="citem"
              >
                {{ citem }}
              </van-radio>
            </van-radio-group>
          </template>
        </van-field>
      </template>
    </van-cell-group>

    <div style="position: fixed; bottom: 0; left: 0; right: 0">
      <van-button type="primary" block @click="onSave">
        完成登记
      </van-button>
    </div>

    <!-- 功能室 -->
    <SelectLab v-model:value="selectLabVisible" @selected-ok="onSelectLab" />

    <!-- 投放人 -->
    <SelectPerson
      v-model:value="selectPersonVisible"
      @selected-ok="onSelectPerson"
    />

    <!-- 废物类型 -->
    <van-action-sheet
      v-model:show="selectTypeVisible"
      :round="false"
      :actions="typeOptions"
      cancel-text="取消"
      close-on-click-action
      @select="onSelectType"
    />

    <!-- 有害成分 -->
    <van-action-sheet
      v-model:show="selectHazardousIngredientsVisible"
      :round="false"
      :actions="hazardousIngredientsOptions"
      cancel-text="取消"
      close-on-click-action
      @select="onSelectHazardousIngredients"
    />

    <!-- 单位 -->
    <van-action-sheet
      v-model:show="selectUnitVisible"
      :round="false"
      :actions="unitOptions"
      cancel-text="取消"
      close-on-click-action
      @select="onSelectUnit"
    />
  </div>
</template>

<script>
import { mapState } from 'pinia'
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import SelectLab from '~/views/mobileApp/components/selectLab.vue'
import SelectPerson from '~/views/mobileApp/components/selectPerson.vue'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppUserStore } from '~/views/mobileApp/store/useUserStore.ts'

export default {
  components: {
    FormItemDate,
    SelectPerson,
    SelectLab,
    MobileTitleBar,
  },
  data() {
    const { userInfo } = useAppUserStore

    return {
      formatDate,
      currentDate: new Date(),
      selectLabVisible: false,
      selectPersonVisible: false,
      selectTypeVisible: false,
      selectUnitVisible: false,
      selectHazardousIngredientsVisible: false,
      hazardousIngredientsOptions: [],
      unitOptions: [],
      typeOptions: [],
      customFields: [],
      recordData: {
        id: null,
        laboratoryId: null,
        laboratoryName: null,
        type: null,
        typeName: null,
      },
      data: {
        launchUserId: userInfo.userId,
        launchUserName: userInfo.realName,
        hazardousIngredients: '',
        hazardousIngredientsName: '',
        launchDate: formatDate(new Date(), 'YYYY-MM-DD'),
        quantity: '',
        unit: '',
      },
    }
  },
  computed: {
    ...mapState(useAppUserStore, ['userInfo']),
  },
  async created() {
    const toast = showLoadingToast({
      duration: 0,
      message: '加载中...',
      forbidClick: true,
    })

    await this.getTypeOptions()
    await this.getHazardousIngredientsOptions()
    await this.getQRCodeData()
    this.getCustomFields()
    this.getUnitOptions()

    toast.close()
  },
  methods: {
    async getQRCodeData() {
      const query = this.$route.query
      const res = await mRequest(`/rest/chemical/waste/barcode/${query.id}`)

      if (this.userInfo.unitCode !== res.data.unitCode) {
        this.$router.go(-1)
        setTimeout(() => {
          showDialog({ message: '非本单位化学废物登记二维码，无法登记！' })
        }, 200)
        return
      }

      const value = JSON.parse(res.data.value)

      this.recordData.laboratoryId = value.laboratoryId
      this.recordData.laboratoryName = value.laboratoryName
      this.recordData.type = value.type
      this.recordData.typeName = value.typeName
      this.data.hazardousIngredients = value.hazardousIngredients
      this.data.hazardousIngredientsName = value.hazardousIngredientsName

      if (value.laboratoryId && value.type) {
        this.checkExistRecord()
      }
    },
    async checkExistRecord() {
      const { type, laboratoryId } = this.recordData

      if (!type || !laboratoryId) {
        this.recordData.id = null
        return
      }

      const res = await mRequest('/rest/chemical/waste/page', {
        params: {
          page: 1,
          size: 10,
          status: 'CREATE',
          type,
          laboratoryId,
        },
      })

      const data = res.data.rows
      if (data.length > 0) {
        const row = data[0]
        this.recordData.id = row.id
        this.data.unit = row.unit
      }
      else {
        this.recordData.id = null
      }
    },
    async onSave() {
      if (
        !this.recordData.laboratoryId
        || !this.recordData.type
        || !this.data.hazardousIngredients
        || !this.data.quantity
        || !this.data.unit
        || !this.data.launchUserId
        || !this.data.launchDate
      ) {
        showDialog({ message: '请填写必填项！' })
        return
      }

      let res

      const toast = showLoadingToast({
        duration: 0,
        message: '保存中...',
        forbidClick: true,
      })

      if (this.recordData.id) {
        res = await mRequest
          .post(
            `/rest/chemical/waste/reg/${this.recordData.id}`,
            JSON.stringify({
              ...this.data,
              customizeValueStr: JSON.stringify(
                this.customFields.map(i => ({
                  columnId: i.columnId,
                  columnValue: i.columnValue,
                  columnName: i.columnName,
                })),
              ),
            }),
            {
              headers: {
                'Content-Type': 'application/json',
              },
            },
          )
          .finally(() => {
            toast.close()
          })
      }
      else {
        res = await mRequest
          .post(
            `/rest/chemical/waste/reg`,
            JSON.stringify({
              ...this.data,
              laboratoryId: this.recordData.laboratoryId,
              type: this.recordData.type,
              customizeValueStr: JSON.stringify(
                this.customFields.map(i => ({
                  columnId: i.columnId,
                  columnValue: i.columnValue,
                  columnName: i.columnName,
                })),
              ),
            }),
            {
              headers: {
                'Content-Type': 'application/json',
              },
            },
          )
          .finally(() => {
            toast.close()
          })
      }

      if (res.code !== 20010) {
        showConfirmDialog({
          title: '提示',
          message: '已完成登记！',
          confirmButtonText: '继续登记',
          cancelButtonText: '返回首页',
        })
          .then(async () => {
            window.location.reload()
          })
          .catch(() => {
            this.$router.go(-1)
          })
      }
    },
    async getCustomFields() {
      const res = await mRequest('/rest/common/custom-properties', {
        params: { customizeType: 'chemicalWasteMaterial' },
      })

      const data = res.data
      data.forEach((item) => {
        item.columnId = item.id
        item.id = null
        if (['select', 'selectUpdate', 'date'].includes(item.columnType)) {
          item.showPicker = false
        }
        if (['select', 'selectUpdate', 'radio'].includes(item.columnType)) {
          if (item.columnValue) {
            item.option = item.columnValue.split(',')
          }
        }

        if (item.defaultValue) {
          item.columnValue = item.defaultValue
        }
      })

      this.customFields = data
    },
    async getUnitOptions() {
      const res = await mRequest('/rest/dictionaryController.do?getListByGroupId', {
        params: { dictGroupId: 'chemical_measurement_unit_id' },
      })

      this.unitOptions = res.obj.map(i => ({
        name: i.typename,
        value: i.typecode,
      }))
    },
    async getTypeOptions() {
      const res = await mRequest('/rest/type/getTypesByGroupCode', {
        params: { groupCode: 'chemicalWasteMaterialType' },
      })

      this.typeOptions = res.data.map(i => ({
        name: i.typeName,
        value: i.typeCode,
      }))
    },
    async getHazardousIngredientsOptions() {
      const res = await mRequest('/rest/type/getTypesByGroupCode', {
        params: { groupCode: 'chemicalHazardousIngredients' },
      })

      this.hazardousIngredientsOptions = res.data.map(i => ({
        name: i.typeName,
        value: i.typeCode,
      }))
    },
    onSelectLab(rows) {
      const [row] = rows
      this.recordData.laboratoryId = row.id
      this.recordData.laboratoryName = row.name

      this.checkExistRecord()
    },
    onSelectPerson(rows) {
      const [row] = rows

      this.data.launchUserId = row.id
      this.data.launchUserName = row.name
    },
    onSelectType(data) {
      this.recordData.type = data.value
      this.recordData.typeName = data.name

      this.checkExistRecord()
    },
    onSelectHazardousIngredients(data) {
      this.data.hazardousIngredients = data.value
      this.data.hazardousIngredientsName = data.name
    },
    onSelectUnit(data) {
      this.data.unit = data.name
    },
  },
}
</script>
