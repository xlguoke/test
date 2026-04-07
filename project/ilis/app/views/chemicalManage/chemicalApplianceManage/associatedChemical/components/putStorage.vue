<template>
  <div>
    <ht-modal
      v-if="visible"
      :title="addEditTitle"
      centered
      :open="visible"
      :mask-closable="false"
      width="500px"
      class="hitek-add-modal"
      @cancel="
        () => {
          visible = false
        }
      "
      @ok="handleOk"
    >
      <a-spin :spinning="spinning">
        <a-form ref="formRef" style="width: 100%" :model="formData">
          <ul class="form_wrap">
            <li>
              <a-form-item
                label="入库批号"
                :label-col="{ span: 8 }"
                :wrapper-col="{ span: 16 }"
                name="batchSn"
              >
                <a-input
                  v-model:value="formData.batchSn"
                  placeholder="请输入"
                />
              </a-form-item>
            </li>

            <li>
              <a-form-item
                label="入库日期"
                :label-col="{ span: 8 }"
                :wrapper-col="{ span: 16 }"
                :rules="[{ required: true, message: `请选择` }]"
                name="putawayDate"
              >
                <a-date-picker
                  v-model:value="formData.putawayDate"
                  :disabled="isDetail"
                  placeholder="请选择"
                  style="width: 100%"
                  format="YYYY-MM-DD"
                  value-format="YYYY-MM-DD"
                />
              </a-form-item>
            </li>

            <li>
              <a-form-item
                label="保管人"
                :label-col="{ span: 8 }"
                :wrapper-col="{ span: 16 }"
              >
                <div style="display: flex; justify-content: space-between">
                  <span v-for="item in selPersonData" :key="item.id">
                    {{ item.name }}
                  </span>
                  <a-button :disabled="isDetail" @click="selPersonFun()">
                    选择
                  </a-button>
                </div>
              </a-form-item>
            </li>
            <li>
              <a-form-item
                label="备注"
                :label-col="{ span: 8 }"
                :wrapper-col="{ span: 16 }"
                name="chemicalRemark"
              >
                <a-input
                  v-model:value="formData.chemicalRemark"
                  :disabled="isDetail"
                  placeholder="请输入"
                />
              </a-form-item>
            </li>
          </ul>
        </a-form>
      </a-spin>
    </ht-modal>

    <TableTreePersonnel ref="TableTreePersonnel" :callback="getPerson" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import TableTreePersonnel from '~/providers/components/tableTreePersonnel.vue'

export default {
  components: { TableTreePersonnel },
  props: ['callback'],
  data() {
    return {
      parentData: {},
      selPersonData: [],
      addEditTitle: '提交入库',
      visible: false,
      spinning: false,
      isDetail: false,
      dayjs,
      dataSource: [],
      formData: {
        categoryName: '',
        categoryId: '',
      },
    }
  },
  created() {
    this.init()
  },
  methods: {
    init() {},
    closeModel() {
      this.visible = false
    },
    async openModel(data) {
      this.parentData = data
      // this.isDetail = isDetail;
      this.clearForm()
      this.visible = true
      // if (id) {
      //   this.id = id;
      //   this.addEditTitle = "编辑";
      //   this.editType = 2;
      //   let res = await window.$oAjax.get(`/rest/chemical/solution/${id}`);
      //
      //   if (res.code === 20000) {
      //     this.formData = res.data;

      //     if (res.data.personIds) {
      //       res.data.personIds.split(",").forEach((it, index) => {
      //         this.selPersonData.push({
      //           name: res.data.personNames.split(",")[index],
      //           id: it,
      //         });
      //       });
      //     }

      //     if (res.data.solutionBlendeds && res.data.solutionBlendeds.length) {
      //       this.chemicalsMingle = res.data.solutionBlendeds;
      //     }

      //     this.selChemicalsData = [
      //       {
      //         name: res.data.categoryName,
      //         id: res.data.categoryId,
      //       },
      //     ];

      //     if (res.data.attachments.length) {
      //       this.fileList = res.data.attachments.map((it) => {
      //         return {
      //           uid: it.id,
      //           name: it.attachmenttitle,
      //           status: "done",
      //           response: {
      //             success: true,
      //             obj: [it],
      //           },
      //           url: it.realpath,
      //         };
      //       });
      //     }
      //   }
      // }
    },
    clearForm() {
      this.formData = {}
      this.selPersonData = []
      this.selManageLeve = []
      this.selChemicalsData = []
      this.fileList = []
      this.activeKey = [1, 2, 3]
    },
    handleOk() {
      // eslint-disable-next-line ts/no-this-alias
      const that = this
      if (!this.selPersonData.length) {
        window.$oAntdMessage.warning('请选择保管人！')
        return
      }
      that.formDataFormat((data) => {
        that.callback({ ...this.parentData, ...data })
      })
    },
    selPersonFun() {
      // this.$refs.TableTreePersonnel.showModal(type, idsPerson, acceptData, title);
      this.$refs.TableTreePersonnel.showModal(
        '',
        '',
        this.selPersonData,
        '选择人员',
      )
    },
    handleCancel() {
      this.visible = false
    },
    formDataFormat(callback) {
      this.$refs.formRef.validateFields().then(() => {
        const data = { ...this.formData }
        if (this.selPersonData.length) {
          const nameArr = []
          const idArr = []
          this.selPersonData.forEach((it) => {
            nameArr.push(it.name)
            idArr.push(it.id)
          })
          data.keepers = nameArr.join()
          data.keeperIds = idArr.join()
        }

        if (callback) {
          callback(data)
        }
      })
    },

    handleShipmentOk() {
      this.formDataFormat(async (data) => {
        const res = await window.$oAjax.post(
          'rest/chemical/solution/passInventory',
          data,
          {
            headers: {
              'content-type': 'application/json',
            },
          },
        )
        if (res.code === 20000) {
          window.$oAntdMessage.success('操作成功')
          this.visible = false
          this.callback()
        }
        else {
          window.$oAntdMessage.warning(res.message)
        }
      })
    },
    handleSaveOk() {
      this.formDataFormat(async (data) => {
        const res = await window.$oAjax.post('rest/chemical/solution/save', data, {
          headers: {
            'content-type': 'application/json',
          },
        })
        if (res.code === 20000) {
          window.$oAntdMessage.success('操作成功')
          this.visible = false
          this.callback()
        }
        else {
          window.$oAntdMessage.warning(res.message)
        }
      })
    },
    getPerson(idsPerson, acceptData) {
      this.selPersonData = acceptData
    },
  },
}
</script>

<style lang="less">
.form_wrap{li {
    display: inline-block;
    width: 360px;
    height: 45px;
  }}
</style>

<style>
.ant-collapse > .ant-collapse-item > .ant-collapse-header {
  line-height: 15px !important;
}
</style>
