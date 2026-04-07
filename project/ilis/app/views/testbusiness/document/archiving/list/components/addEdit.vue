<template>
  <div>
    <ht-modal
      :title="isDetail ? '查看详情' : editId ? '编辑归档' : '新增归档'"
      :open="visible"
      centered
      :mask-closable="false"
      class="hitek-add-modal"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <a-spin :spinning="spinning">
        <div class="spin-content">
          <a-form ref="formRef" :model="formState" :rules="rules">
            <a-form-item
              label="归档名称"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
              name="name"
            >
              <a-input
                v-model:value="formState.name"
                :disabled="isDetail"
                placeholder="请输入"
              />
            </a-form-item>
            <a-form-item
              label="部门"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
              name="departs"
            >
              <a-row :gutter="15">
                <a-col :span="18">
                  <a-input
                    v-model:value="formState.departs"
                    :disabled="true"
                    :class="{ readonlyCls: !isDetail }"
                  />
                </a-col>
                <a-col :span="6" style="text-align: right">
                  <a-button
                    :disabled="isDetail"
                    style="float: right"
                    @click="setOrg('checkbox', 'departs', '请选择部门')"
                  >
                    选择
                  </a-button>
                </a-col>
              </a-row>
            </a-form-item>
            <a-form-item
              label="负责人"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
              name="personType1"
            >
              <a-row :gutter="15">
                <a-col :span="18">
                  <a-input
                    v-model:value="formState.personType1"
                    :disabled="true"
                    :class="{ readonlyCls: !isDetail }"
                  />
                </a-col>
                <a-col :span="6" style="text-align: right">
                  <a-button
                    :disabled="isDetail"
                    style="float: right"
                    @click="
                      setPersonnels('checkbox', 'personType1', '请选择负责人')
                    "
                  >
                    选择
                  </a-button>
                </a-col>
              </a-row>
            </a-form-item>
            <a-form-item
              label="参与人"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
              name="personType2"
            >
              <a-row :gutter="15">
                <a-col :span="18">
                  <a-input
                    v-model:value="formState.personType2"
                    :disabled="true"
                    :class="{ readonlyCls: !isDetail }"
                  />
                </a-col>
                <a-col :span="6" style="text-align: right">
                  <a-button
                    :disabled="isDetail"
                    style="float: right"
                    @click="
                      setPersonnels('checkbox', 'personType2', '请选择参与人')
                    "
                  >
                    选择
                  </a-button>
                </a-col>
              </a-row>
            </a-form-item>
            <a-form-item
              label="关联委托单位"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
              name="consignUnit"
            >
              <a-row :gutter="15">
                <a-col :span="18">
                  <a-input
                    v-model:value="formState.consignUnit"
                    :disabled="true"
                    :class="{ readonlyCls: !isDetail }"
                  />
                </a-col>
                <a-col :span="6" style="text-align: right">
                  <a-button
                    :disabled="isDetail"
                    style="float: right"
                    @click="setEquip('radio', 'consignUnit')"
                  >
                    选择
                  </a-button>
                </a-col>
              </a-row>
            </a-form-item>
            <a-form-item
              label="关联工程项目"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
              name="project"
            >
              <a-row :gutter="15">
                <a-col :span="18">
                  <a-input
                    v-model:value="formState.project"
                    :disabled="true"
                    :class="{ readonlyCls: !isDetail }"
                  />
                </a-col>
                <a-col :span="6" style="text-align: right">
                  <a-button
                    :disabled="isDetail"
                    style="float: right"
                    @click="setEquip('checkbox', 'project')"
                  >
                    选择
                  </a-button>
                </a-col>
              </a-row>
            </a-form-item>
            <a-form-item
              label="简介"
              :label-col="labelCol"
              :wrapper-col="wrapperCol"
              name="intro"
            >
              <a-textarea
                v-model:value="formState.intro"
                :disabled="isDetail"
                placeholder="请输入"
              />
            </a-form-item>
          </a-form>
        </div>
      </a-spin>
      <AddOrg ref="AddOrg" :callback="getOrg" />
      <TableTreePersonnel ref="TableTreePersonnel" :callback="getPerson" />
      <SelRelation ref="SelRelation" :callback="getEquip" />
    </ht-modal>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import AddOrg from '~/providers/components/orgList.vue'
import TableTreePersonnel from '~/providers/components/tableTreePersonnel.vue'
import SelRelation from './selRelation.vue'

export default {
  components: {
    AddOrg,
    TableTreePersonnel,
    SelRelation,
  },
  props: ['callback'],
  data() {
    return {
      spinning: false,
      formLaydeparts: 'horizontal',
      labelCol: { span: 5 },
      wrapperCol: { span: 16 },
      dayjs,
      visible: false,
      eqVisible: false,
      isDetail: false,
      editId: '',
      groupId: '',
      relation: { consignUnit: [], project: [] },
      cloneRelation: { consignUnit: [], project: [] },
      personDatas: {
        personType2: [],
        personType1: [],
      },
      clonePersonDatas: {
        personType2: [],
        personType1: [],
      },
      orgDatas: { departs: [{ id: '', name: '' }] },
      cloneOrgDatas: { departs: [{ id: '', name: '' }] },
      formState: {},
      rules: {
        name: [{ required: true, message: '归档名称不能为空!' }],
        departs: [{ required: true, message: '部门不能为空!' }],
        personType1: [{ required: true, message: '负责人不能为空!' }],
        personType2: [{ required: true, message: '参与人不能为空!' }],
      },
    }
  },
  methods: {
    setEquip(type, ids) {
      const acceptData = this.relation[ids].map(item => ({ ...item }))
      let getIdArr = []
      if (ids === 'consignUnit') {
        // 委托单位
        if (this.relation.project.length === 1) {
          getIdArr = this.relation.project.map(item => item.id)
        }
      }
      else if (ids === 'project') {
        // 工程项目
        getIdArr = this.relation.consignUnit.map(item => item.id)
      }
      this.$refs.SelRelation.showModal(
        type,
        ids,
        acceptData,
        getIdArr.join(','),
      )
    },
    getEquip(ids, acceptData) {
      this.relation[ids] = acceptData.map(item => ({
        id: item.id,
        name: item.name,
      }))
      this.formState[ids] = this.relation[ids].length > 0
        ? this.getArrStr(this.relation[ids])
        : ''
    },
    // 期间核查计划 取消
    cancelModal() {
      this.eqVisible = false
    },
    // 部门
    setOrg(type, idsOrg, title) {
      const acceptData = this.orgDatas[idsOrg]
      this.$refs.AddOrg.showModal(type, idsOrg, acceptData, title)
    },
    getOrg(idsOrg, acceptData) {
      this.orgDatas[idsOrg] = acceptData.map(item => ({
        id: item.id,
        name: item.name,
      }))
      this.formState.departs = this.orgDatas.departs.length > 0
        ? this.getArrStr(this.orgDatas.departs)
        : ''
    },
    showModal(groupId, editId, isDetail) {
      this.groupId = groupId
      this.visible = true
      this.isDetail = isDetail
      if (editId) {
        this.editId = editId
        this.spinning = true
        window.$oAjax({
          method: 'get',
          url: window.$oApi.archiving.getById,
          params: { id: editId },
        }).then((res) => {
          if (res.code === 20000) {
            this.formState = res.data

            if (this.formState.departs.length > 0) {
              this.orgDatas.departs = this.formState.departs.map(item => ({
                id: item.departId,
                name: item.departName,
              }))
            }

            // eslint-disable-next-line array-callback-return
            this.formState.persons.map((item) => {
              if (item.personType === '1') {
                this.personDatas.personType1.push({
                  id: item.personId,
                  name: item.personName,
                })
              }
              else {
                this.personDatas.personType2.push({
                  id: item.personId,
                  name: item.personName,
                })
              }
            })

            if (this.formState.projects.length > 0) {
              this.relation.project = this.formState.projects.map(item => ({
                id: item.consignProjectId,
                name: item.consignProjectName,
              }))
            }

            if (this.formState.consignUnitId) {
              this.relation.consignUnit = [
                {
                  id: this.formState.consignUnitId,
                  name: this.formState.consignUnitName,
                },
              ]
            }

            this.formState.departs = this.orgDatas.departs.length > 0
              ? this.getArrStr(this.orgDatas.departs)
              : ''

            this.formState.personType1 = this.personDatas.personType1.length > 0
              ? this.getArrStr(this.personDatas.personType1)
              : ''

            this.formState.personType2 = this.personDatas.personType2.length > 0
              ? this.getArrStr(this.personDatas.personType2)
              : ''

            this.formState.consignUnit = this.relation.consignUnit.length > 0
              ? this.getArrStr(this.relation.consignUnit)
              : ''

            this.formState.project = this.relation.project.length > 0
              ? this.getArrStr(this.relation.project)
              : ''
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            this.formState = {}
          }
          this.spinning = false
        })
      }
    },
    getPerson(idsPerson, acceptData) {
      this.personDatas[idsPerson] = acceptData.map(item => ({
        id: item.id,
        name: item.name,
      }))
      this.formState[idsPerson] = this.personDatas[idsPerson].length > 0
        ? this.getArrStr(this.personDatas[idsPerson])
        : ''
    },
    getArrStr(arr) {
      const nameArr = arr.map(item => item.name)
      return nameArr.join(';')
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
    dataRequired() {
      return true
    },
    handleOk() {
      this.$refs.formRef.validateFields().then(() => {
        const fieldsValue = this.formState
        const data = {
          name: fieldsValue.name,
          intro: fieldsValue.intro,
          groupId: this.groupId,
          persons: [],
        }
        if (fieldsValue.departs) {
          data.departs = this.orgDatas.departs.map(item => ({
            departId: item.id,
            departName: item.name,
          }))
        }
        if (fieldsValue.personType1) {
          // eslint-disable-next-line array-callback-return
          this.personDatas.personType1.map((item) => {
            data.persons.push({
              personId: item.id,
              personName: item.name,
              personType: '1',
            })
          })
        }
        if (fieldsValue.personType2) {
          // eslint-disable-next-line array-callback-return
          this.personDatas.personType2.map((item) => {
            data.persons.push({
              personId: item.id,
              personName: item.name,
              personType: '2',
            })
          })
        }
        if (fieldsValue.consignUnit) {
          data.consignUnitId = this.relation.consignUnit[0].id
          data.consignUnitName = this.relation.consignUnit[0].name
        }
        if (fieldsValue.project) {
          data.projects = this.relation.project.map(item => ({
            consignProjectId: item.id,
            consignProjectName: item.name,
          }))
        }

        if (this.formState.id) {
          data.id = this.formState.id
        }

        if (this.dataRequired(data)) {
          this.spinning = true
          window.$oAjax({
            method: 'POST',
            url: window.$oApi.archiving.saveDocument,
            data,
            headers: {
              'content-type': 'application/json',
            },
          }).then((res) => {
            if (res.code === 20000) {
              window.$oAntdMessage.success('操作成功')
              this.handleCancel()
              this.callback()
            }
            else {
              window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            }
            this.spinning = false
          })
        }
      })
    },
    handleCancel() {
      this.personDatas = JSON.parse(JSON.stringify(this.clonePersonDatas))
      this.orgDatas = JSON.parse(JSON.stringify(this.cloneOrgDatas))
      this.relation = JSON.parse(JSON.stringify(this.cloneRelation))
      this.editId = ''
      this.formState = {}
      this.visible = false
    },
  },
}
</script>

<style></style>
