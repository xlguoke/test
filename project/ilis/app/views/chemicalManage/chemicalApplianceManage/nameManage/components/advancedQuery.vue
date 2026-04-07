<!-- eslint-disable vue/valid-v-for -->
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
      <div class="form_box">
        <p class="query_row">
          <span class="label">管理级别：</span>
          <a-select
            v-model:value="queryForm.manageLevelId"
            style="width: 405px"
          >
            <a-select-option value="">
              全部
            </a-select-option>

            <template v-for="item in levelList">
              <a-select-option
                v-if="item.enabled"
                :value="item.id"
                :data="item"
              >
                {{ item.displayName }}
              </a-select-option>
            </template>
          </a-select>
        </p>

        <p class="query_row">
          <span class="label">化学品特性：</span>
          <a-select v-model:value="queryForm.feature" style="width: 405px">
            <a-select-option
              v-for="item in featureType"
              :key="item.id"
              :value="item.id"
            >
              {{ item.typename }}
            </a-select-option>
          </a-select>
        </p>

        <p class="query_row">
          <span class="label">所属类别：</span>
          <a-select v-model:value="queryForm.chemicalType" style="width: 405px">
            <a-select-option value="">
              全部
            </a-select-option>
            <a-select-option value="化学试剂">
              化学试剂
            </a-select-option>
            <a-select-option value="化学溶液">
              化学溶液
            </a-select-option>
          </a-select>
        </p>

        <p class="query_row">
          <span class="label">化学品类型：</span>
          <a-select v-model:value="queryForm.safetyType" style="width: 405px">
            <a-select-option
              v-for="item in safetyTypeList"
              :key="item.id"
              :value="item.id"
            >
              {{ item.typename }}
            </a-select-option>
          </a-select>
        </p>

        <p class="query_row">
          <span class="label">有效期：</span>
          <a-input-number
            v-model:value="queryForm.validityStart"
            style="width: 195px"
            value-format="YYYY-MM-DD"
          />
          -
          <a-input-number
            v-model:value="queryForm.validityEnd"
            style="width: 195px"
            value-format="YYYY-MM-DD"
          />
        </p>

        <p class="query_row">
          <span class="label">是否自配：</span>
          <a-radio-group v-model:value="queryForm.autonomousConfect">
            <a-radio value="">
              全部
            </a-radio>
            <a-radio :value="true">
              是
            </a-radio>
            <a-radio :value="false">
              否
            </a-radio>
          </a-radio-group>
        </p>

        <p class="query_row">
          <span class="label">是否关联掺配信息：</span>
          <a-radio-group v-model:value="queryForm.blended">
            <a-radio value="">
              全部
            </a-radio>
            <a-radio :value="true">
              是
            </a-radio>
            <a-radio :value="false">
              否
            </a-radio>
          </a-radio-group>
        </p>
      </div>
      <div
        :style="{
          position: 'absolute',
          right: 0,
          bottom: 0,
          width: '100%',
          borderTop: '1px solid var(--colorSplit)',
          padding: '10px 16px',
          backgroundColor: 'var(--colorBgContainer)',
          textAlign: 'right',
          zIndex: 1,
        }"
      >
        <a-button type="primary" @click="queryData">
          查询
        </a-button>
        <a-button :style="{ marginRight: '8px' }" @click="clearForm">
          清空条件
        </a-button>
      </div>
    </a-drawer>
  </div>
</template>

<script>
import qs from 'qs'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

export default {
  components: {},
  emits: ['ok'],
  data() {
    return {
      levelList: [],
      featureType: [],
      safetyTypeList: [],

      visible: false,
      queryForm: {
        manageLevelId: '',
        feature: '',
        chemicalType: '',
        safetyType: '',
        validityStart: '',
        validityEnd: '',
        autonomousConfect: '',
        blended: '',
      },

      defaultForm: {
        manageLevelId: '',
        feature: '',
        chemicalType: '',
        safetyType: '',
        validityStart: '',
        validityEnd: '',
        autonomousConfect: '',
        blended: '',
      },
    }
  },
  async created() {
    // this.defaultForm = JSON.parse(JSON.stringify(this.queryForm));

    this.getLevelList()

    this.dictionary('chemical_feature_id').then((res) => {
      this.featureType = res.obj.map((it) => {
        return {
          typename: it.typename,
          id: it.typename,
        }
      })
      this.featureType.unshift({ typename: '全部', id: '' })
    })

    this.dictionary('chemical_safety_type_id').then((res) => {
      this.safetyTypeList = res.obj.map((it) => {
        return {
          typename: it.typename,
          id: it.typename,
        }
      })
      this.safetyTypeList.unshift({ typename: '全部', id: '' })
    })
  },
  methods: {
    async dictionary(type) {
      const res = await window.$oAjax.post(
        window.$oApi.common.getDictionaryData,
        qs.stringify({
          dictGroupId: type,
        }),
      )
      return res
    },
    async getLevelList() {
      window.$oAjax
        .get(`/rest/chemical/level/all`, {
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          if (res.code == '20000') {
            this.levelList = res.data
          }
        })
    },

    closeModel() {
      this.visible = false
    },
    queryData() {
      $emit(this, 'ok', this.queryForm)
      this.visible = false
    },

    clearForm() {
      this.queryForm = { ...this.defaultForm }
    },

    showModal() {
      this.visible = true
    },
  },
}
</script>

<style lang="less">
.form_box {
  margin-bottom: 60px;
}
.query_row {
  margin: 10px 0;
  .label {
    width: 170px;
    display: inline-block;
    text-align: right;
  }
}
.sel_person_wrap {
  border: 1px solid var(--colorBorder);
  padding: 3px;
  display: inline-block;
  border-radius: 5px;
  width: 356px;
  overflow: hidden;
  vertical-align: middle;
  min-height: 30px;
  white-space: nowrap;
}
</style>

<style>
.ant-drawer-body {
  padding: 0 !important;
}
</style>
