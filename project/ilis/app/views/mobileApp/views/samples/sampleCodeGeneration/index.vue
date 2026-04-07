<template>
  <div class="sampleCodeGeneration">
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)" />
    </van-sticky>

    <div>
      <van-form>
        <van-field label-width="6em" autosize label="编号类别">
          <template #input>
            <VSelect
              v-model:value="snCategoryName"
              :columns="snCategoryList"
              placeholder="请选择"
            ></VSelect>
          </template>
        </van-field>
        <template v-for="(item, index) in fields" :key="index">
          <van-field
            v-if="item.type === 'TermTestType'"
            v-model="item.valueShow"
            label-width="6em"
            :label="item.name"
            readonly
            @click="testTypePickerVisible = true"
          ></van-field>
          <van-field
            v-else-if="item.options && item.options.length > 0"
            label-width="6em"
            :label="item.name"
          >
            <template #input>
              <VSelect
                v-model:value="item.valueShow"
                :columns="item.columns"
                placeholder="请选择"
                @confirm="
                  (val, valIndex) => {
                    onConfirm(item, valIndex)
                  }
                "
              ></VSelect>
            </template>
          </van-field>
          <van-field
            v-else
            v-model="item.valueShow"
            autosize
            rows="1"
            type="textarea"
            label-width="6em"
            :label="item.name"
            disabled
          />
        </template>
      </van-form>
    </div>

    <div class="sampleCodeGeneration-input">
      <div class="sampleCodeGeneration-input-title">
        样品编号
      </div>
      <van-row :gutter="15">
        <van-col span="18">
          <input
            v-model="testObjectSn"
            placeholder="请点击右方的生成编号或输入编号"
          />
        </van-col>
        <van-col span="6">
          <van-button
            :loading="loading"
            block
            size="small"
            type="primary"
            :disabled="fields.length === 0"
            @click="createSampleCode"
          >
            生成编号
          </van-button>
        </van-col>
      </van-row>
    </div>

    <div class="sampleCodeGeneration-btns">
      <van-row>
        <van-col span="12">
          <van-button block square @click="onCancel">
            取消
          </van-button>
        </van-col>
        <van-col span="12">
          <van-button block type="primary" square @click="nextStep">
            继续
          </van-button>
        </van-col>
      </van-row>
    </div>

    <van-popup v-model:show="testTypePickerVisible" position="bottom">
      <van-tree-select
        :items="testTypeColumns"
        :main-active-index="selectIndex"
        :max="1"
        @click-nav="onClickNav"
        @click-item="onClickItem"
      />
    </van-popup>
  </div>
</template>

<script>
import { mapState, mapWritableState } from 'pinia'
import {
  showConfirmDialog,
  showDialog,
  showLoadingToast,
} from 'vant'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import VSelect from '~/views/mobileApp/components/select.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useSampleStore } from '~/views/mobileApp/store/useSampleStore'
import { useAppUserStore } from '~/views/mobileApp/store/useUserStore.ts'

export default {
  components: {
    VSelect,
    MobileTitleBar,
  },
  data() {
    return {
      formData: {},
      // 1 - 按样品打印
      // 2 - 按样品打印
      type: null,
      extractSampleId: null,
      // pageFrom为1则代表从取样台账列表进入该页面批量生成逻辑
      pageFrom: null,
      snCategoryId: null,
      snCategoryName: null,
      snCategoryList: [],
      snCategoryObj: [],
      fields: [],
      loading: false,
      testObjectSn: null,
      cahceTestObjectSn: null,
      testTypePickerVisible: false,
      testTypeColumns: [],
      selectIndex: 0,
    }
  },
  computed: {
    ...mapState(useAppUserStore, ['userInfo']),
    realName() {
      return this.userInfo.realName
    },
    userName() {
      return this.userInfo.username
    },
    ...mapWritableState(useSampleStore, ['samplingPrintList']),
  },
  watch: {
    $route(to, from) {
      if (to.name === from.name) {
        const { type, extractSampleId, pageFrom } = to.params
        this.type = type
        this.extractSampleId = extractSampleId
        this.pageFrom = Number(pageFrom)
        this.testObjectSn = null
        this.cahceTestObjectSn = null
        this.getSnTerms()
      }
    },
    snCategoryName(val) {
      if (val) {
        const item = this.snCategoryObj.find(i => i.name === val)
        this.snCategoryId = item.id
        this.getSnTerms()
      }
    },
  },
  created() {
    const { type, extractSampleId, pageFrom } = this.$route.params
    this.type = type
    this.extractSampleId = extractSampleId
    this.pageFrom = pageFrom

    this.getSnCategoryUser()
  },
  methods: {
    onClickNav(index) {
      this.selectIndex = index
    },
    onClickItem(item) {
      const { id, name } = item
      const index = this.fields.findIndex(item => item.type === 'TermTestType')
      this.fields[index].value = id
      this.fields[index].valueShow = name
      this.$forceUpdate()
      this.testTypePickerVisible = false
    },
    // 获取检测类别
    getTestTypeColumns(columns) {
      const arr = []
      for (let i = 0; i < columns.length; i++) {
        const item = columns[i]
        let children = []
        if (item.children && item.children.length > 0) {
          children = this.getTestTypeColumns(item.children)
        }

        if (item.isDefault === '1') {
          this.onClickItem(item)
        }

        arr.push({
          text: item.name,
          name: item.name,
          id: item.id,
          children,
          disabled: item.category && item.pid,
        })
      }

      return arr
    },
    // 获取编号类别
    async getSnCategoryUser() {
      try {
        const res = await mRequest.get(api.common.getSnCategoryUser)
        if (res.success === true) {
          this.snCategoryObj = res.obj
          this.snCategoryList = res.obj.map(item => item.name)

          // 从缓存中读取是否有编号类别并设为默认值
          const snCategoryId = localStorage.getItem('snCategoryId')

          // 当缓存中没有编号类别时，从列表数据中查找是否有默认字段
          if (!snCategoryId) {
            const item = res.obj.find(item => item.isDefault === 'Y')
            if (item) {
              this.snCategoryId = item.id
              this.snCategoryName = item.name
            }
          }

          if (snCategoryId) {
            const item = res.obj.find(item => item.id === snCategoryId)
            if (item) {
              this.snCategoryId = item.id
              this.snCategoryName = item.name
            }
          }
        }
        else {
          showDialog({
            message: res.msg || res.message || '请求失败，请稍后再试',
          })
        }
      }
      catch (e) {
        console.warn(e)
        showDialog({ message: '请求异常，请稍后再试' })
      }
    },
    // 获取取样样品编号格式项信息
    async getSnTerms() {
      try {
        const res = await mRequest.get(api.samples.getSnTerms, {
          params: {
            extractSampleId: this.extractSampleId,
            snCategoryId: this.snCategoryId,
          },
        })

        if (res.code === 20000) {
          this.fields = res.data.map((item) => {
            const obj = { ...item }

            // 当存在下拉选择项时，默认第一个选项
            if (obj.options && obj.options.length > 0) {
              let option = {}
              // 资质类型根据isDefault来默认
              if (obj.type === 'TermQualification') {
                option = obj.options.find(i => i.isDefault === '1')
              }
              else {
                option = obj.options[0]
              }

              if (obj.type !== 'TermTestType') {
                obj.value = option.id
                obj.valueShow = option.name
                obj.columns = obj.options.map(option => option.name)
              }
            }

            return obj
          })

          // 检测类别单独处理
          const jclb = res.data.find(item => item.type === 'TermTestType')
          if (jclb) {
            this.testTypeColumns = this.getTestTypeColumns(jclb.options)
          }
        }
        else {
          this.fields = []
          showDialog({
            message: res.msg || res.message || '请求失败，请稍后再试',
          })
        }
      }
      catch (e) {
        console.warn(e)
      }
    },
    // 生成样品编号
    async createSampleCode() {
      this.loading = true
      try {
        const res = await mRequest.post(
          api.samples.generateTestObjectSn,
          JSON.stringify({
            extractSampleId: this.extractSampleId,
            snCategoryId: this.snCategoryId,
            terms: this.fields.map(item => ({
              type: item.type,
              name: item.name,
              orderNo: item.orderNo,
              value: item.value,
              valueShow: item.valueShow,
            })),
          }),
          {
            headers: {
              'Content-Type': 'application/json',
            },
          },
        )

        if (res.code === 20000) {
          this.testObjectSn = res.data
          this.cahceTestObjectSn = res.data
        }
        else {
          showDialog({
            message: res.msg || res.message || '生成失败，请稍后再试',
          })
        }
      }
      catch (e) {
        console.warn(e)
        showDialog({ message: '生成失败，请稍后再试' })
      }

      this.loading = false
    },
    // 保存用户自定义编号
    async saveCustomSn() {
      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
        message: '样品编号保存中...',
      })
      try {
        const res = await mRequest.get(api.samples.userAppointedSn, {
          params: {
            extractSampleId: this.extractSampleId,
            testObjectSn: this.testObjectSn,
            snCategoryId: this.snCategoryId,
          },
        }).finally(() => {
          toast.close()
        })

        if (res.code !== 20000) {
          showDialog({
            message: res.msg || res.message || '编号保存失败，请稍后再试',
          })
          return false
        }
        else {
          return true
        }
      }
      catch (e) {
        console.warn(e)
        showDialog({ message: '编号保存失败，请稍后再试' })
      }
      return false
    },
    // 获取其他信息
    async getTestObjectId() {
      let testObjectId = null
      try {
        const res = await mRequest.get(
          `${api.samples.sampleOtherInfo}/${this.extractSampleId}`,
        )
        if (res.code === 20000) {
          testObjectId = res.data.testObjectId
        }
        else {
          showDialog({
            message: res.msg || res.message || '接口请求异常，请稍后再试',
          })
        }
      }
      catch (e) {
        console.warn(e)
        showDialog({ message: '接口请求异常，请稍后再试' })
      }

      return testObjectId
    },
    // 生成样品编号后，此处同步更新取样元数据中的样品编号，不更新的话会导致手动输入的样品编号在完成委托后被替换
    async updateSampleInfo() {
      try {
        const res = await mRequest.get(
          api.samples.sampleInfo + this.extractSampleId,
        )

        const formData = res.data
        const meta = JSON.parse(formData.meta || '{}')
        meta.multipleCode = this.testObjectSn
        meta.testObjectCode = this.testObjectSn
        formData.meta = JSON.stringify(meta)
        await mRequest.put(api.samples.extractSample, formData, {
          headers: {
            'content-type': 'application/json',
          },
        })
      }
      catch (e) {
        console.warn(e)
      }
    },
    // 继续下一步
    async nextStep() {
      // 判断是否有样品编号
      if (!this.testObjectSn) {
        showDialog({ message: '请输入或点击生成样品编号' })
        return
      }

      // 判断是否是自定义编号
      if (this.testObjectSn !== this.cahceTestObjectSn) {
        const result = await this.saveCustomSn()
        if (result === false) {
          return
        }
      }

      // 更新取样信息
      await this.updateSampleInfo()

      // 将本次选择的编号类别缓存到localStorage中，下次从缓存中读取加载默认值
      localStorage.setItem('snCategoryId', this.snCategoryId)

      // 由于接口没返回testObjectId，此处直接从其他信息接口中获取
      const testObjectId = await this.getTestObjectId()

      // 如果是批量打印，则判断是否继续生成下一个，当所有数据都有样品编号时，则进入打印页面
      if (this.pageFrom === 1) {
        const samplingPrintList = JSON.parse(
          JSON.stringify(this.samplingPrintList),
        )
        const index = samplingPrintList.findIndex(
          item => item.id === this.extractSampleId,
        )
        if (index >= 0) {
          samplingPrintList[index].testObjectId = testObjectId
          samplingPrintList[index].testObjectCode = this.testObjectSn
        }

        this.samplingPrintList = samplingPrintList

        const item = samplingPrintList.find(i => !i.testObjectCode)
        if (item) {
          this.$router.replace({
            name: 'sampleCodeGeneration',
            params: {
              type: this.type,
              extractSampleId: item.id,
              pageFrom: 1,
            },
          })
        }
        else {
          const testObjectIds = samplingPrintList.map(i => i.testObjectId)
          this.$router.replace({
            name: 'bluetoothPrint',
            params: {
              type: this.type,
              testObjectId: testObjectIds.join(','),
              pageFrom: 1,
            },
          })
        }
        return
      }

      this.$router.replace({
        name: 'bluetoothPrint',
        params: {
          type: this.type,
          testObjectId,
        },
      })
    },
    // 选中后赋值value
    onConfirm(row, index) {
      const item = row.options[index]
      row.value = item.id
      row.valueShow = item.name
    },
    // 退回编号
    async returnTestObjectCode(cb) {
      try {
        const res = await mRequest.get(
          `${api.samples.returnTestObjectCode}/${this.extractSampleId}`,
        )
        if (res.code === 20000) {
          cb && cb()
        }
        else {
          showDialog({
            message: res.msg || res.message || '退回编号请求异常，请联系管理员',
          })
        }
      }
      catch (e) {
        console.warn(e)
        showDialog({ message: '退回编号请求异常，请联系管理员' })
      }
    },
    // 取消询问框
    onBackConfirm(code, okCb, cancelCb) {
      showConfirmDialog({
        title: '提示',
        message: `是否使用样品编号[${code}]`,
      })
        .then(() => {
          okCb && okCb()
        })
        .catch(() => {
          cancelCb && cancelCb()
        })
    },
    // 取消
    async onCancel() {
      // 之前生成的编号
      const cahceTestObjectSn = this.cahceTestObjectSn
      // 当前输入框的编号
      const testObjectSn = this.testObjectSn

      // 情况一：存在生成的编号，并且生成的编号等于当前输入框的编号，说明是直接生成的编号，问问
      if (!!cahceTestObjectSn && cahceTestObjectSn === testObjectSn) {
        // 选择是，则直接返回，否则退回编号再返回
        this.onBackConfirm(
          testObjectSn,
          async () => {
            await this.updateSampleInfo()
            this.$router.go(-1)
          },
          async () => {
            this.returnTestObjectCode(() => {
              this.$router.go(-1)
            })
          },
        )

        return
      }

      // 情况二，存在生成的编号，存在输入框的编号，但生成的编号不等于当前输入框的编号，问问
      if (
        !!cahceTestObjectSn
        && !!testObjectSn
        && cahceTestObjectSn !== testObjectSn
      ) {
        // 选择是，则先保存自定义编号再返回，否则退回编号再返回
        this.onBackConfirm(
          testObjectSn,
          async () => {
            const result = await this.saveCustomSn()
            if (result === true) {
              await this.updateSampleInfo()
              this.$router.go(-1)
            }
          },
          async () => {
            await this.returnTestObjectCode(() => {
              this.$router.go(-1)
            })
          },
        )

        return
      }

      // 情况三，存在生成的编号，但不存在输入框的编号，不用问，直接退回
      if (!!cahceTestObjectSn && !testObjectSn) {
        await this.returnTestObjectCode(() => {
          this.$router.go(-1)
        })
        return
      }

      // 情况四：不存在生成的编号，但输入框中存在编号，说明是直接输入的自定义编号，问问
      if (!cahceTestObjectSn && testObjectSn) {
        // 选择是，则先保存自定义编号再返回，则直接返回
        this.onBackConfirm(
          testObjectSn,
          async () => {
            const result = await this.saveCustomSn()
            if (result === true) {
              await this.updateSampleInfo()
              this.$router.go(-1)
            }
          },
          async () => {
            this.$router.go(-1)
          },
        )

        return
      }

      // 情况五：不存在生成的编号，也不存在输入框编号，直接返回
      if (!cahceTestObjectSn && !testObjectSn) {
        this.$router.go(-1)
      }
    },
  },
}
</script>

<style lang="less" scoped>
:deep(.van-sidebar-item--select)::before {
  background: #154bd0;
}
.sampleCodeGeneration {
  padding-bottom: 80px;
  .sampleCodeGeneration-btns {
    width: 100%;
    position: fixed;
    bottom: 0;
    left: 0;
    height: 44px;
  }

  .sampleCodeGeneration-input {
    background: #fff;
    margin-top: 8px;
    padding: 15px;

    input {
      width: 100%;
      height: 32px;
      border: solid 1px #e2e2e2;
      padding: 0 8px;
      font-size: 13px;
    }
  }

  .sampleCodeGeneration-input-title {
    font-size: 16px;
    padding-bottom: 8px;
    font-weight: bold;
  }
}
</style>
