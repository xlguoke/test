<template>
  <div class="inspectDetail">
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$emit('closeCall')" />
    </van-sticky>
    <p style="padding: 10px; background: #e5e5e5; font-weight: 900">
      {{ keypointItem.keypoint }}
    </p>
    <van-cell-group>
      <van-field
        v-model="keypointItemData.situation"
        label="检查情况"
        type="textarea"
        placeholder="请输入检查情况"
        rows="1"
        autosize
      />

      <van-field name="uploader" label="检查附件">
        <template #input>
          <van-uploader v-model="files1" :after-read="afterRead" />
        </template>
      </van-field>

      <van-field
        v-model="questionForObject.content"
        label="问题"
        readonly
        placeholder="请选择问题"
      >
        <template #button>
          <van-button
            plain
            hairline
            size="small"
            type="primary"
            @click="questPopup = true"
          >
            选择
          </van-button>
        </template>
      </van-field>
      <van-field
        v-model="questionForObject.level"
        label="问题级别"
        readonly
        placeholder="请选择问题"
      >
      </van-field>

      <van-field
        v-if="keypointItemData.problems.length"
        name="uploader"
        label="是否需要整改"
      >
        <template #input>
          <van-switch
            v-model="questionForObject.needReform"
            size="18px"
          />
        </template>
      </van-field>

      <van-field
        v-if="keypointItemData.problems.length"
        v-model="questionForObject.reformDescription"
        label="整改情况"
        type="textarea"
        placeholder="请输入检查情况"
        rows="1"
        autosize
      />
      <van-field
        v-if="keypointItemData.problems.length"
        name="uploader"
        label="整改附件"
      >
        <template #input>
          <van-uploader v-model="files2" :after-read="afterRead" />
        </template>
      </van-field>
    </van-cell-group>

    <div style="position: fixed; width: 100%; bottom: 0px">
      <van-button
        style="background: #154bd0; color: #ffff; border-color: #154bd0"
        size="large"
        @click="saveData"
      >
        保存
      </van-button>
    </div>

    <van-popup v-model:show="questPopup" position="bottom">
      <van-picker
        title="选择问题"
        show-toolbar
        :columns="questList"
        :columns-field-names="{
          text: 'content',
        }"
        @confirm="onConfirm"
        @cancel="questPopup = false"
      />
    </van-popup>
  </div>
</template>

<script>
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { $emit } from '../../utils/gogocodeTransfer'

export default {
  components: {
    MobileTitleBar,
  },
  props: ['keypointItem'],
  emits: ['closeCall', 'saveOk'],
  data() {
    return {
      questPopup: false,
      questList: [],
      questionForObject: {},
      files1: [],
      files2: [],
      keypointItemData: {
        situation: '', // 检查情况
        problems: {
          level: '', // 问题级别
          files: [], // 整改附件
          reformDescription: '', // 整改说明
          // needReform: false, //是否需要整改
        }, // 问题对象
        files: [], // 检查附件
      },
    }
  },
  computed: {},
  watch: {
    'keypointItemData.problems': {
      handler(newVal) {
        if (newVal.length) {
          this.questionForObject = newVal[0]
          // this.questionForObject = newVal[0];
        }
      },
      deep: true, // 监控对象需要启用深度监听
      immediate: true, // 首次值绑定是否需要监控
    },
  },
  mounted() {
    // this.keypointId = this.keypointItem.id;

    this.keypointItemData = JSON.parse(JSON.stringify(this.keypointItem))
    this.files1 = this.keypointItemData.files || []
    if (
      this.keypointItemData.problems.length
      && this.keypointItemData.problems[0].files
    ) {
      this.files2 = this.keypointItemData.problems[0].files
    }

    this.getQuestionData()
  },
  methods: {
    onConfirm({ selectedOptions }) {
      const v = selectedOptions[0]
      v.reformDescription = ''
      this.files2 = []
      v.files = []
      delete v.id
      this.keypointItemData.problems = [v]
      this.questPopup = false
    },
    // 获取问题列表
    async getQuestionData() {
      const res = await mRequest({
        method: 'get',
        url: `${api.inspectManage.questionData}/${this.keypointItemData.keypointId}`,
      })
      if (res.code === 20000) {
        if (res.data.length) {
          this.questList = res.data
        }
      }
    },
    afterRead(file) {
      file.status = 'uploading'
      file.message = '上传中...'
      const formData = new FormData()
      formData.append('file', file.file)
      mRequest
        .post(api.common.upload, formData)
        .then((res) => {
          file.status = 'done'
          file.message = '上传成功'
          if (res.obj && res.obj[0]) {
            file.obj = res.obj[0]
          }
        })
        .catch((_) => {
          file.status = 'failed'
          file.message = '上传失败'
        })
    },
    saveData() {
      // this.keypointItemData.keypointId = this.keypointId;
      const data = JSON.parse(JSON.stringify(this.keypointItemData))

      if (this.files1.length) {
        data.files = this.files1.map((item) => {
          if (item.type) {
            return item
          }
          else {
            return {
              attachmentId: item.obj.id,
              name: item.obj.attachmenttitle,
              url: item.obj.realpath,
              type: 1,
            }
          }
        })
      }
      else {
        data.files = []
      }
      if (data.problems.length) {
        if (this.files2.length) {
          data.problems[0].files = this.files2.map((item) => {
            if (item.type) {
              return item
            }
            else {
              return {
                attachmentId: item.obj.id,
                name: item.obj.attachmenttitle,
                url: item.obj.realpath,
                type: 2,
              }
            }
          })
        }
        else {
          data.problems[0].files = []
        }
      }
      $emit(this, 'saveOk', data)
    },
  },
}
</script>

<style>
.van-collapse-item__content {
  padding: 0 !important;
}
</style>

<style lang="less" scoped></style>
