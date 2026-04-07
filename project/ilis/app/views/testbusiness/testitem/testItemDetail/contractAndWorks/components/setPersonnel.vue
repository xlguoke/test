<!-- eslint-disable vue/require-v-for-key -->
<template>
  <div>
    <ht-modal
      v-model:open="visible"
      title="流程人员设置"
      :confirm-loading="confirmLoading"
      :mask-closable="false"
      class="testItem-setPersonnel-modal"
      @ok="handleSubmit"
    >
      <a-spin :spinning="spinning">
        <div class="spin-content" style="height: 320px">
          <a-form ref="formRef" style="margin-top: 10px" :model="data">
            <a-form-item
              label="设置工程"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 19 }"
            >
              <a-input
                v-model:value="data.name"
                class="testItem-setPersonnel-modal-input"
                :disabled="true"
              />
            </a-form-item>

            <a-form-item
              label="试验人员"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 19 }"
            >
              <div layout="inline">
                <span v-for="item of detailDatas.testPersonIds">{{ item.name }};
                </span>
                <a-button
                  style="float: right"
                  @click="
                    setPersonnels('checkbox', 'testPersonIds', '请选择试验人员')
                  "
                >
                  选择
                </a-button>
              </div>
            </a-form-item>
            <a-form-item
              label="复核人员"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 19 }"
            >
              <div layout="inline">
                <span v-for="item of detailDatas.reviewPersonIds">{{ item.name }};
                </span>
                <a-button
                  style="float: right"
                  @click="
                    setPersonnels(
                      'checkbox',
                      'reviewPersonIds',
                      '请选择复核人员',
                    )
                  "
                >
                  选择
                </a-button>
              </div>
            </a-form-item>
            <a-form-item
              label="审核人员"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 19 }"
            >
              <div layout="inline">
                <span v-for="item of detailDatas.auditPersonIds">{{ item.name }};
                </span>
                <a-button
                  style="float: right"
                  @click="
                    setPersonnels(
                      'checkbox',
                      'auditPersonIds',
                      '请选择审核人员',
                    )
                  "
                >
                  选择
                </a-button>
              </div>
            </a-form-item>
            <a-form-item
              label="签发人员"
              :label-col="{ span: 5 }"
              :wrapper-col="{ span: 19 }"
            >
              <div layout="inline">
                <span v-for="item of detailDatas.approvePersonId">{{ item.name }};
                </span>
                <a-button
                  style="float: right"
                  @click="
                    setPersonnels('radio', 'approvePersonId', '请选择签发人员')
                  "
                >
                  选择
                </a-button>
              </div>
            </a-form-item>
          </a-form>
        </div>
      </a-spin>
    </ht-modal>

    <TableTreePersonnel ref="TableTreePersonnel" :callback="getPerson" />
  </div>
</template>

<script>
// const SHOW_PARENT = TreeSelect.SHOW_PARENT;
import TableTreePersonnel from '~/providers/components/tableTreePersonnel.vue'

export default {
  components: {
    TableTreePersonnel,
  },
  props: ['selectedRowKeys', 'callback'],
  data() {
    return {

      visible: false,
      spinning: false,
      // processPowerSpeed: 0, // 流程与权限的速度
      fristLoad: false, // 流程与权限的速度
      confirmLoading: false,
      treeData: [],
      // SHOW_PARENT,
      nameData: [],
      data: {},
      detailDatas: {
        // "principalPersonId": [{"name": "", "id": ""}], // 100
        auditPersonIds: [],
        approvePersonId: [],
        testPersonIds: [],
        reviewPersonIds: [],
      },
      staticDetailDatas: {
        // "principalPersonId": [{"name": "", "id": ""}], // 100
        auditPersonIds: [],
        approvePersonId: [],
        testPersonIds: [],
        reviewPersonIds: [],
      },
    }
  },
  created() {
    this.getPersonData()
  },
  methods: {
    getPersonData() {
      this.spinning = true
      window.$oRest({
        url: window.$oApi.common.getPersonsForChoose,
        timeout: 30 * 1000,
        method: 'POST',
      }).then((res) => {
        if (res && res.rows) {
          // let treeData = this.getTree(res.rows);
          // this.treeData = this.disabledRoot(treeData);
          this.fristLoad = true
          this.nameData = this.getName(res.rows)
          this.detailData()
        }
      })
    },
    //  获取系统控制参数 - 报告批准采用会签模式
    getBusinessParam() {
      return window.$oAjax({
        url: 'tSBusinessParamController.do?getBusinessParam&key=REPORT_MANAGE_42',
        method: 'get',
      }).then((res) => {
        return res
      })
    },
    getName(data) {
      if (!Array.isArray(data)) {
        return
      }
      let arr = []
      for (let i = 0; i < data.length; i++) {
        let arr2 = []
        if (data[i].children && data[i].children.length !== 0) {
          arr2 = this.getName(data[i].children)
          arr = arr.concat(arr2)
        }
        arr.push({
          id: data[i].id,
          name: data[i].name,
        })
      }
      return arr
    },
    async setPersonnels(type, idsPerson, title) {
      const businessParam = await this.getBusinessParam()
      if (businessParam.obj === 'Y') {
        type = 'checkbox'
      }
      const acceptData = this.detailDatas[idsPerson]
      this.$refs.TableTreePersonnel.showModal(
        type,
        idsPerson,
        acceptData,
        title,
      )
    },
    getPerson(idsPerson, acceptData) {
      this.detailDatas[idsPerson] = acceptData
    },
    onChange(value) {
      this.value = value
    },
    showModal(data) {
      this.visible = true
      this.spinning = true
      this.data = data[0]
      this.detailDatas = JSON.parse(JSON.stringify(this.staticDetailDatas))
      this.detailData()
    },
    detailData() {
      if (this.fristLoad) {
        if (this.data.auditPersonIds && this.data.auditPersonIds.length > 0) {
          for (let i = 0; i < this.data.auditPersonIds.length; i++) {
            const ids = this.data.auditPersonIds[i]
            const itemObj = {
              ...this.nameData.filter(item => item.id === ids)[0],
            }
            this.detailDatas.auditPersonIds.push({
              ...itemObj,
              personType: 110,
            })
          }
        }

        if (this.data.approvePersonId && this.data.approvePersonId.length > 0) {
          this.detailDatas.approvePersonId = this.data.approvePerson.map(
            (d, i) => {
              return {
                name: d,
                id: this.data.approvePersonId[i],
                personType: 112,
              }
            },
          )
        }

        if (this.data.testPersonIds && this.data.testPersonIds.length > 0) {
          for (let i = 0; i < this.data.testPersonIds.length; i++) {
            const ids = this.data.testPersonIds[i]
            const itemObj = {
              ...this.nameData.filter(item => item.id === ids)[0],
            }
            this.detailDatas.testPersonIds.push({ ...itemObj, personType: 110 })
          }
        }
        if (this.data.reviewPersonIds && this.data.reviewPersonIds.length > 0) {
          for (let i = 0; i < this.data.reviewPersonIds.length; i++) {
            const ids = this.data.reviewPersonIds[i]
            const itemObj = {
              ...this.nameData.filter(item => item.id === ids)[0],
            }
            this.detailDatas.reviewPersonIds.push({
              ...itemObj,
              personType: 113,
            })
          }
        }
        this.spinning = false
      }
    },
    cancelModal() {
      this.data = {}
      this.visible = false
    },
    handleSubmit() {
      this.$refs.formRef.validateFields().then(() => {
        this.confirmLoading = true
        const data = {
          person: [],
        }
        const type = `${this.data.type}`
        if (type === '-1') {
          data.contractPartId = this.data.key
        }
        else {
          data.unitProjectId = this.data.key
        }
        const values = this.detailDatas
        for (const key in values) {
          if (values[key].length > 0) {
            switch (key) {
              case 'auditPersonIds':
                // eslint-disable-next-line array-callback-return
                values[key].map((item) => {
                  data.person.push({
                    personId: item.id,
                    personName: item.name,
                    personType: 111,
                  })
                })
                break
              case 'approvePersonId':
                // eslint-disable-next-line array-callback-return
                values[key].map((item) => {
                  data.person.push({
                    personId: item.id,
                    personName: item.name,
                    personType: 112,
                  })
                })

                break
              case 'testPersonIds':
                // eslint-disable-next-line array-callback-return
                values[key].map((item) => {
                  data.person.push({
                    personId: item.id,
                    personName: item.name,
                    personType: 110,
                  })
                })
                break
              case 'reviewPersonIds':
                // eslint-disable-next-line array-callback-return
                values[key].map((item) => {
                  data.person.push({
                    personId: item.id,
                    personName: item.name,
                    personType: 113,
                  })
                })
                break
            }
          }
        }
        //
        window.$oRest({
          method: 'POST',
          url: window.$oApi.testItem.setCUPerson,
          data,
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'content-type': 'application/json',
          },
        }).then(
          (res) => {
            this.confirmLoading = false
            if (res && res.code) {
              window.$oAntdMessage.success(res.message)
              this.callback()
              this.cancelModal()
              this.data = {}
            }
            else {
              window.$oAntdModal.warning(window.$oMsgTips.info(res.msg || res.message))
            }
          },
        ).catch(() => {
          this.confirmLoading = false
        })
      })
    },
  },
}
</script>

<style></style>
