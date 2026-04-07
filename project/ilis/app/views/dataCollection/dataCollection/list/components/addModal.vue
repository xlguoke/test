<!-- eslint-disable vue/require-v-for-key -->
<template>
  <div>
    <ht-modal
      :title="modalType === 'add' ? '新增' : '编辑'"
      :open="visible"
      :mask-closable="false"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <div>
        <a-spin :spinning="spinning">
          <div class="spin-content">
            <a-form ref="formRef" :model="data">
              <a-form-item
                label="主题名称"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 17 }"
                :rules="[{ required: true, message: '主题名称为必填项！' }]"
                name="themeName"
              >
                <a-input
                  v-model:value="data.themeName"
                  placeholder="请输入主题名称"
                />
              </a-form-item>
              <a-form-item
                label="主题类型"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 17 }"
                :rules="[{ required: true, message: '主题类型为必选项！' }]"
                name="themeType"
              >
                <a-select
                  v-model:value="data.themeType"
                  placeholder="请选择主题类型"
                >
                  <a-select-option
                    v-for="(item, index) in type"
                    :key="index"
                    :value="item.typename"
                  >
                    {{ item.typename }}
                  </a-select-option>
                </a-select>
              </a-form-item>
              <a-form-item
                label="启动日期"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 17 }"
                :rules="[{ required: true, message: '启动日期为必选项！' }]"
                name="startDate"
              >
                <a-date-picker
                  v-model:value="data.startDate"
                  style="width: 100%"
                  value-format="YYYY-MM-DD"
                />
              </a-form-item>
              <a-form-item
                label="部门负责人"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 17 }"
              >
                <div layout="inline">
                  <span v-for="item of personDatas.personType1">{{ item.name }};
                  </span>
                  <a-button
                    style="float: right"
                    @click="
                      setPersonnels(
                        'checkbox',
                        'personType1',
                        '请选择部门负责人',
                      )
                    "
                  >
                    选择
                  </a-button>
                </div>
              </a-form-item>
              <a-form-item
                label="参与人"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 17 }"
              >
                <div layout="inline">
                  <span v-for="item of personDatas.personType2">{{ item.name }};
                  </span>
                  <a-button
                    style="float: right"
                    @click="
                      setPersonnels('checkbox', 'personType2', '请选择参与人')
                    "
                  >
                    选择
                  </a-button>
                </div>
              </a-form-item>
              <a-form-item
                label="主题简介"
                :label-col="{ span: 5 }"
                :wrapper-col="{ span: 17 }"
              >
                <a-input
                  v-model:value="data.themeIntroduction"
                  placeholder="请输入主题简介"
                />
              </a-form-item>
              <FormLayout
                v-if="data && formLayoutData.length > 0"
                :data-source="formLayoutData"
                :form-layout="formLayout"
                :data="data"
              />
            </a-form>
          </div>
        </a-spin>
      </div>
    </ht-modal>

    <TableTreePersonnel ref="TableTreePersonnel" :callback="getPerson" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { formatTime } from '~/providers/common/utils'
import TableTreePersonnel from '~/providers/components/tableTreePersonnel.vue'
import FormLayout from './formLayout.vue'

export default {
  components: {
    TableTreePersonnel,
    FormLayout,
  },
  props: ['modalType', 'callback', 'type'],
  data() {
    return {
      visible: false,
      spinning: false,
      formLayout: 'horizontal',
      data: {},
      editData: null,
      customFields: [],
      formLayoutData: [],
      formLayout: {
        labelCol: 5,
        wrapperCol: 17,
      },
      formatTime,
      dayjs,
      personDatas: {
        personType1: [],
        personType2: [],
      },
      clonePersonDatas: {
        personType1: [],
        personType2: [],
      },
    }
  },
  methods: {
    getCustomFields() {
      this.spinning = true
      window.$oAjax
        .get(window.$oApi.common.customProperties, {
          params: {
            customizeType: 'data-collection-property',
          },
        })
        .then((res) => {
          this.customFields = res.data || []
          if (
            this.editData.customizeValueEntities
            && this.editData.customizeValueEntities.length > 0
          ) {
            this.customFields = [
              ...this.customFields,
              ...this.editData.customizeValueEntities
                .filter(c => c.disabled)
                .map((c) => {
                  const copy = { ...c }
                  copy.id = c.columnId
                  return copy
                }),
            ]
          }
          const custom = this.customFields.map((item) => {
            const obj = {
              field: item.id,
              name: item.columnName,
              rules: false,
              type: item.columnType,
              option: {},
              custom: true,
              disabled: item.disabled,
            }
            if (item.columnType === 'radio') {
              obj.data = [
                { value: '是', name: '是' },
                { value: '否', name: '否' },
              ]
              obj.dataField = { value: 'value', name: 'name' }
            }
            else if (item.columnType === 'select') {
              obj.data = item.columnValue
                ? item.columnValue.split(',').map((v) => {
                    return { value: v, name: v }
                  })
                : []
              obj.dataField = { value: 'value', name: 'name' }
            }
            return obj
          })
          this.formLayoutData = this.formLayoutData
            .concat(custom)
            .map(item => ({
              ...item,
              default: this.editData[item.field] || item.default,
            }))
          this.spinning = false
        })
    },
    showModal(data) {
      this.editData = data && data.length > 0 ? data[0] : {}
      if (this.editData && this.editData.id) {
        this.getDetailData(this.editData.id)
        this.getCustomFields()
      }
      else {
        this.getCustomFields()
      }
      this.visible = true
    },
    getDetailData(id) {
      this.spinning = true
      window.$oAjax({
        method: 'get',
        url: window.$oApi.dataCollection.detail,
        params: {
          id,
        },
        headers: {
          // "X-Requested-With": "XMLHttpRequest"
          'Content-Type': 'application/json',
        },
      }).then((res) => {
        if (res && res.success) {
          this.data = res.obj
          if (this.data.startDate) {
            this.data.startDate = this.formatTime(this.data.startDate, 'YYYY-MM-DD')
          }
          this.personDatas.personType1 = res.obj.personList
            .filter(person => person.personType === '1')
            .map(person => ({
              name: person.personName,
              id: person.personId,
              personType: '1',
            }))
          this.personDatas.personType2 = res.obj.personList
            .filter(person => person.personType === '2')
            .map(person => ({
              name: person.personName,
              id: person.personId,
              personType: '2',
            }))

          if (this.editData.customizeValueEntities) {
            this.editData.customizeValueEntities.forEach((item) => {
              this.data[item.columnId] = item.columnValue
            })
          }
        }
        else {
          window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
        }
        this.spinning = false
      })
    },
    handleOk() {
      this.$refs.formRef.validateFields().then(() => {
        const url = window.$oApi.dataCollection.operation
        let data = { ...this.data }

        data.personList = []
        const values = this.personDatas
        for (const key in values) {
          if (values[key].length > 0) {
            switch (key) {
              case 'personType1':
                // eslint-disable-next-line array-callback-return
                values[key].map((item) => {
                  data.personList.push({
                    personId: item.id,
                    personName: item.name,
                    personType: 1,
                  })
                })
                break
              case 'personType2':
                // eslint-disable-next-line array-callback-return
                values[key].map((item) => {
                  data.personList.push({
                    personId: item.id,
                    personName: item.name,
                    personType: 2,
                  })
                })
                break
            }
          }
        }
        this.spinning = true
        const customizeValueEntities = []
        this.formLayoutData
          .filter(c => !c.disabled)
          // eslint-disable-next-line array-callback-return
          .map((item) => {
            // eslint-disable-next-line no-prototype-builtins
            if (data.hasOwnProperty([item.field])) {
              customizeValueEntities.push({
                columnId: item.field,
                columnValue: data[item.field],
              })
              delete data[item.field]
            }
          })
        if (this.modalType === 'edit') {
          data = {
            ...data,
            id: this.data.id,
          }
        }

        // data.customizeValueEntities = customizeValueEntities;
        if (customizeValueEntities.length > 0) {
          data.customizeValueEntities = customizeValueEntities
        }

        window.$oAjax({
          method: 'POST',
          url,
          data,
          headers: {
            // "X-Requested-With": "XMLHttpRequest"
            'Content-Type': 'application/json',
          },
        }).then((res) => {
          if (res && res.success) {
            window.$oAntdMessage.success(res.msg)
            this.handleCancel()
            this.callback()
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
          }
          this.spinning = false
        })
      })
    },
    handleCancel() {
      this.visible = false
      this.personDatas = JSON.parse(JSON.stringify(this.clonePersonDatas))
      this.data = {}
      this.editData = {}
      this.formLayoutData = []
    },
    setPersonnels(type, idsPerson, title) {
      const acceptData = this.personDatas[idsPerson]
      this.$refs.TableTreePersonnel.showModal(
        type,
        idsPerson,
        acceptData,
        title,
      )
    },
    getPerson(idsPerson, acceptData) {
      this.personDatas[idsPerson] = acceptData
    },
    getPersons(data) {
      const personData = data.map(item => ({
        name: item.name,
        id: item.value,
        personType: this.personType,
      }))

      // eslint-disable-next-line eqeqeq
      if (this.personType == 1) {
        this.personData1 = personData
      }
      else {
        this.personData2 = personData
      }
    },
  },
}
</script>

<style></style>
