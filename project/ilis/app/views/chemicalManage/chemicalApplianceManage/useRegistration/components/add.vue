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
        <a-form
          ref="formRef"
          style="width: 100%"
          :model="formData"
          :label-col="{ style: 'width: 85px' }"
          :wrapper-col="{ style: 'flex: 1' }"
        >
          <a-form-item
            label="当次使用量"
            name="amount"
            :rules="[{ required: true, message: `请输入` }]"
          >
            <a-input-number
              v-model:value="formData.amount"
              style="width: 100%"
              :min="0"
              placeholder="请输入"
            />
          </a-form-item>

          <a-form-item
            label="关联任务"
            required
          >
            <a-flex>
              <a-input
                v-model:value="taskFormat"
                placeholder="请选择"
                readonly
                style="width: 80%"
                class="mr-2"
              />
              <a-button :disabled="isDetail" @click="selTaskFun()">
                选择
              </a-button>
            </a-flex>
          </a-form-item>
          <a-form-item
            label="备注"
          >
            <a-input
              v-model:value="formData.remark"
              :disabled="isDetail"
              placeholder="请输入"
            />
          </a-form-item>
        </a-form>
      </a-spin>
    </ht-modal>

    <!-- <ht-modal
        title="选择关联任务"
        centered
        :open="taskVisible"
        width="60%"
        :zIndex="999999"
        @cancel="cancelModal"
        @ok="getTask"
      >
        <iframe
          v-if="taskVisible"
          id="taskVisible"
          style="border:0;"
          width="100%"
          height="400px"
          :src="taskVisibleUrl"
        ></iframe>
      </ht-modal> -->

    <SelTask ref="selTaskRef" @callback="getTask" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { rootUrl } from '~/providers/configs/rootUrl'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'
import selTask from '../../components/selTask.vue'

export default {
  components: {
    SelTask: selTask,
  },
  props: ['callback'],
  emits: ['callbackFun'],
  data() {
    return {
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
      const nameArr = this.selTaskData.map((it) => {
        return it.testTaskCode
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
    getTask(data) {
      // let data = document
      //   .getElementById("taskVisible")
      //   .contentWindow.$("#dataGrid")
      //   .datagrid("getSelections");
      // this.taskVisible = false;

      // this.selTaskData = data;
      this.selTaskData = data
    },
    selTaskFun() {
      this.$refs.selTaskRef.showModal('', this.selTaskData)
      // this.taskVisible = true;
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
    clearForm() {
      this.formData = {}
      this.selTaskData = []
      this.fileList = []
      this.activeKey = [1, 2, 3]
    },
    handleOk() {
      // eslint-disable-next-line ts/no-this-alias
      const that = this
      that.formDataFormat(async (data) => {
        if (!this.selTaskData.length) {
          window.$oAntdMessage.warning('请选择关联任务')
          return
        }

        const d = { ...data }
        const kArr = []
        const idArr = []
        this.selTaskData.forEach((it) => {
          kArr.push(it.testTaskCode)
          idArr.push(it.id)
        })

        d.testTaskIds = idArr.join()
        d.testTaskCodes = kArr.join()
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
