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
                label="返还数量"
                :label-col="{ span: 8 }"
                :wrapper-col="{ span: 16 }"
                name="amount"
                :rules="[{ required: true, message: `请输入` }]"
              >
                <a-input-number
                  v-model:value="formData.amount"
                  style="width: 100%"
                  placeholder="请输入"
                />
              </a-form-item>
            </li>

            <li>
              <a-form-item
                label="返还日期"
                :label-col="{ span: 8 }"
                :wrapper-col="{ span: 16 }"
                name="putawayDate"
                :rules="[{ required: true, message: `请选择` }]"
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
                label="备注"
                :label-col="{ span: 8 }"
                :wrapper-col="{ span: 16 }"
              >
                <a-input
                  v-model:value="formData.remark"
                  :disabled="isDetail"
                  placeholder="请输入"
                />
              </a-form-item>
            </li>
          </ul>
        </a-form>
      </a-spin>
    </ht-modal>
  </div>
</template>

<script>
import dayjs from 'dayjs'

export default {
  components: {},
  props: ['callback'],
  data() {
    return {
      parentData: {},
      selPersonData: [],
      addEditTitle: '返还入库',
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
      that.formDataFormat((data) => {
        that.callback({ ...data })
      })
    },

    handleCancel() {
      this.visible = false
    },
    formDataFormat(callback) {
      this.$refs.formRef.validateFields().then(() => {
        if (callback) {
          callback({ ...this.formData })
        }
      })
    },

    // handleShipmentOk() {
    //   this.formDataFormat(async (data) => {
    //     let res = await window.$oAjax.post(
    //       "rest/chemical/solution/passInventory",
    //       data,
    //       {
    //         headers: {
    //           "content-type": "application/json",
    //         },
    //       }
    //     );
    //     if (res.code === 20000) {
    //       window.$oAntdMessage.success("操作成功");
    //       this.visible = false;
    //       this.callback();
    //     } else {
    //       window.$oAntdMessage.warning(res.message);
    //     }
    //   });
    // },

    // handleSaveOk() {
    //   this.formDataFormat(async (data) => {
    //     let res = await window.$oAjax.post("rest/chemical/solution/save", data, {
    //       headers: {
    //         "content-type": "application/json",
    //       },
    //     });
    //     if (res.code === 20000) {
    //       window.$oAntdMessage.success("操作成功");
    //       this.visible = false;
    //       this.callback();
    //     } else {
    //       window.$oAntdMessage.warning(res.message);
    //     }
    //   });
    // },

    // getPerson(idsPerson, acceptData) {
    //   this.selPersonData = acceptData;
    //
    // },
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
