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
                label="当次使用量"
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

            <li class="required_row">
              <a-form-item
                label="溶液编号"
                :label-col="{ span: 8 }"
                :wrapper-col="{ span: 16 }"
              >
                <div style="display: flex; justify-content: space-between">
                  <a-input
                    v-model:value="taskFormat"
                    placeholder="请选择"
                    readonly
                    style="width: 80%"
                  />

                  <a-button :disabled="isDetail" @click="selTaskFun()">
                    选择
                  </a-button>
                </div>
              </a-form-item>
            </li>

            <li>
              <a-form-item
                label="溶液名称"
                :label-col="{ span: 8 }"
                :wrapper-col="{ span: 16 }"
              >
                <a-input
                  v-model:value="taskFormatName"
                  placeholder="请输入"
                  readonly
                  style="width: 100%"
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

    <SelLiquor ref="selLiquorRef" @callback="getLiquor" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { rootUrl } from '~/providers/configs/rootUrl'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'
import selLiquor from './selLiquor.vue'

export default {
  components: { SelLiquor: selLiquor },
  props: ['callback'],
  emits: ['callbackFun'],
  data() {
    return {
      selLiquor: [],
      selTaskData: [],
      taskVisible: false,
      taskVisibleUrl: `${rootUrl}/reportCreateController.do?goRelationTaskChoosePage`,
      parentData: {},
      selPersonData: [],
      addEditTitle: '新增',
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
  computed: {
    // 计算属性的 getter
    taskFormat() {
      const nameArr = this.selLiquor.map((it) => {
        return it.sn
      })
      return nameArr.join()
    },

    taskFormatName() {
      const nameArr = this.selLiquor.map((it) => {
        return it.name
      })
      return nameArr.join()
    },
  },
  created() {
    this.init()
  },
  methods: {
    init() {},
    closeModel() {
      this.visible = false
    },
    // 获取关联任务
    getTask() {
      const data = document
        .getElementById('taskVisible')
        .contentWindow
        .$('#dataGrid')
        .datagrid('getSelections')
      this.taskVisible = false

      this.selTaskData = data
    },
    selTaskFun() {
      this.$refs.selLiquorRef.showModal()
    },
    cancelModal() {
      this.eqVisible = false
      this.taskVisible = false
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
    getLiquor(data) {
      this.selLiquor = data
    },
    clearForm() {
      this.formData = {}
      this.selLiquor = []
    },
    handleOk() {
      // eslint-disable-next-line ts/no-this-alias
      const that = this
      that.formDataFormat(async (data) => {
        if (!this.selLiquor.length) {
          window.$oAntdMessage.warning('请选择溶液')
          return
        }
        const d = { ...data }
        const kArr = []
        const idArr = []
        const nameArr = []
        this.selLiquor.forEach((it) => {
          kArr.push(it.sn)
          idArr.push(it.id)
          nameArr.push(it.name)
        })
        d.solutionIds = idArr.join()
        d.solutionSns = kArr.join()
        d.solutionNames = nameArr.join()
        d.chemicalInventoryOutId = this.parentData.id

        const res = await window.$oAjax.post(
          'rest/chemical/inventoryOutRecord/save',
          d,
          {
            headers: {
              'content-type': 'application/json',
            },
          },
        )
        if (res.code === 20000) {
          window.$oAntdMessage.success('操作成功')
          this.visible = false
          // this.callback();
        }
        else {
          window.$oAntdMessage.warning(res.message)
        }
        $emit(that, 'callbackFun')
        // that.callback({ ...data });
      })
    },

    handleCancel() {
      this.visible = false
    },
    formDataFormat(callback) {
      this.$refs.formRef.validateFields().then(() => {
        const data = { ...this.formData }

        if (callback) {
          callback(data)
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
/* .hitek-add-modal .ant-modal-body {
  height: 100px !important;
} */
.ant-collapse > .ant-collapse-item > .ant-collapse-header {
  line-height: 15px !important;
}
</style>
