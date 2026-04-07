<template>
  <div class="standardCuringStorage-wrap">
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)">
        <template #right>
          <span @click.stop="$router.push({ name: 'standardCuringDelivery' })">出入库记录
          </span>
        </template>
      </MobileTitleBar>
    </van-sticky>
    <div class="standardCuringStorage-content">
      <div class="standardCuringStorage-box">
        <FormItemDate
          v-model:value="sampleStorage.date"
          required
          label="入库日期："
          placeholder="请选择入库日期"
        />

        <FormItemInput
          v-if="switchSel === false && type === 0"
          v-model:value="sampleStorage.site"
          required
          label="存放位置："
          placeholder="请输入存放位置"
        >
          <template #button>
            <van-button size="small" type="primary" @click="switchSelClick">
              选择位置
            </van-button>
          </template>
        </FormItemInput>

        <FormItemInput
          v-if="switchSel && type === 0"
          v-model:value="selGroupValue"
          is-link
          required
          readonly
          label="存放分组"
          placeholder="请选择存放分组"
          @click="openSelGroupBox"
        />

        <FormItemSelect
          v-if="switchSel && type === 0"
          v-model:value="sampleStorage.siteId"
          required
          label="存放位置"
          placeholder="请选择存放位置"
          :options="locationList"
          @select="(item) => {
            sampleStorage.site = `${selGroupValue}/${item.sn}`
          }"
        />

        <FormItemInput
          v-model:value="sampleStorage.user"
          required
          :label="type === 0 ? '入库人' : '领件人'"
          placeholder="请输入"
        />
      </div>

      <div class="standardCuringStorage-list-wrap">
        <div class="standardCuringStorage-list">
          <div
            v-for="item in list"
            :key="item.id"
            class="standardCuringStorage-box"
          >
            <div class="standardCuringStorage-boxHeader">
              <van-row :gutter="10" type="flex" align="center">
                <van-col>
                  <van-checkbox
                    v-model="item.checked"
                    @click="allCheckChange(item)"
                  ></van-checkbox>
                </van-col>
                <van-col span="16">
                  <div class="textOverflow" style="font-weight: bold">
                    {{ item.testObjectName }}
                  </div>
                  <div
                    class="textOverflow"
                    style="color: gray; font-size: 13px"
                  >
                    {{ item.testObjectSn }}
                  </div>
                  <div v-if="type === 1" style="color: gray; font-size: 13px">
                    存放位置：{{ item.saveSite }}
                  </div>
                </van-col>

                <van-col
                  v-if="type !== 0"
                  span="5"
                  @click="queryPoint(item.periods)"
                >
                  <van-button
                    icon="location-o"
                    plain
                    hairline
                    size="mini"
                    type="primary"
                  >
                    查找
                  </van-button>
                </van-col>
              </van-row>
            </div>
            <div class="standardCuringStorage-boxBody">
              <template
                v-for="(period, periodIndex) in item.periods"
                :key="period.id"
              >
                <van-checkbox
                  v-model="period.checked"
                  @change="
                    (val) => {
                      periodCheck(val, item)
                    }
                  "
                >
                  <div class="standardCuringStorage-period">
                    <div class="textOverflow" style="width: 45%">
                      <span v-if="period.periodCode">{{
                        period.periodCode
                      }}</span>
                      <span
                        v-else-if="
                          !period.periodCode && String(period.sourceFrom) === '1'
                        "
                      >[委托方制件]试件{{ periodIndex + 1 }}</span>
                      <span v-else>试件{{ periodIndex + 1 }}</span>
                    </div>
                    <div class="textOverflow" style="width: 35%">
                      {{ period.formingDate }}
                    </div>
                    <div class="textOverflow" style="width: 20%">
                      <span v-if="period.days">{{ period.days }}天</span>
                    </div>
                  </div>
                </van-checkbox>
              </template>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="scan-box">
      <div class="scan-wrap">
        <van-icon
          class="scan-icon"
          color="#fff"
          size="40"
          name="scan"
          @click.stop="onScan"
        />
      </div>
      <div class="scan-tip">
        扫码添加入库样品
      </div>
    </div>
    <div class="standardCuringStorage-btn">
      <van-button block type="primary" @click="onSubmit">
        <span v-if="type === 0">确认入库</span>
        <span v-else>确认出库</span>
      </van-button>
    </div>

    <van-popup
      v-model:show="siteVisible"
      position="bottom"
      :style="{ height: '40%' }"
    >
      <van-picker
        title="标题"
        show-toolbar
        :columns="actions"
        @confirm="onSiteConfirm"
        @cancel="siteVisible = false"
      />
    </van-popup>

    <van-popup v-model:show="selGroupShow" round position="bottom">
      <van-cascader
        v-model:value="cascaderValue"
        title="请选择存放位置分组"
        :options="treeGroup"
        :field-names="fieldNames"
        @close="selGroupShow = false"
        @change="onChangeSel"
      />
    </van-popup>

    <van-overlay :show="maskLoading" z-index="99999">
      <div
        class="wrapper"
        style="
          text-align: center;
          margin-top: 330px;
          color: #fff;
          font-size: 17px;
        "
      >
        <van-loading />
        <p>呼叫中...</p>
      </div>
    </van-overlay>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import qs from 'qs'
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import FormItemInput from '~/views/mobileApp/components/MobileFormItem/FormItemInput.vue'
import FormItemSelect from '~/views/mobileApp/components/MobileFormItem/FormItemSelect.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { qrCodeScanTool } from '~/views/mobileApp/provides/modules/qr-code-scan-tool'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'
import { useSampleStore } from '~/views/mobileApp/store/useSampleStore'

export default {
  components: {
    MobileTitleBar,
    FormItemDate,
    FormItemInput,
    FormItemSelect,
  },
  beforeRouteLeave(to, from, next) {
    if (to.name === 'standardCuringPeriods') {
      this.standardCuringStorageInfo = []

      if (this.isSubmit === true) {
        const pageState = useAppPageStateStore().getPage(to.name)
        pageState.resetPage = true
      }
    }
    next()
  },
  data() {
    return {
      maskLoading: false,
      switchSel: false,
      fieldNames: {
        text: 'name',
        value: 'id',
        children: 'children',
      },
      cascaderValue: '',
      selGroupValue: '',
      selGroupShow: false,
      locationList: [],
      treeGroup: [],
      list: [],
      sampleStorage: {
        date: dayjs().format(EDateFormatType.YYYY_MM_DD),
        site: '',
        siteId: '',
      },
      actions: [],
      siteVisible: false,
      type: null,
      isSubmit: false,
    }
  },
  computed: {
    ...mapWritableState(useSampleStore, ['standardCuringStorageInfo']),
  },
  watch: {
    standardCuringStorageInfo(newVal, oldVal) {
      if (newVal.length > oldVal.length) {
        this.list.unshift({
          ...newVal[0],
        })
        this.list = JSON.parse(JSON.stringify(this.list)).map((item) => {
          const site = []
          item.periods.forEach((period) => {
            if (!site.includes(period.saveSite)) {
              site.push(period.saveSite)
            }
          })
          return {
            ...item,
            saveSite: site.join(','),
          }
        })
      }
    },
  },
  created() {
    if (this.standardCuringStorageInfo.length === 0) {
      this.$router.go(-1)
    }
    this.list = JSON.parse(JSON.stringify(this.standardCuringStorageInfo))
    this.type = Number(this.$route.params.type)
    this.getSiteListByDic()
    this.getTreeList()
  },
  methods: {
    openSelGroupBox() {
      this.selGroupShow = true
      // 样式要求添加个确定按钮，其实就是关闭弹窗
      setTimeout(() => {
        const dom = document.querySelectorAll('.van-cascader__header>i')[0]
        dom.innerHTML = '确定'
        dom.className = 'prop_font_tip'
      }, 200)
    },
    queryPoint(rows) {
      const fun = []
      const errIndex = []
      rows.forEach((item, index) => {
        if (item.saveSiteId) {
          fun.push(this.ajaxForFind(item.saveSiteId))
        }
        else {
          errIndex.push(index + 1)
        }
      })
      if (errIndex.length > 0) {
        let str = ''
        errIndex.forEach((item) => {
          str += `试件${item},`
        })
        showToast(`${str}未配置样品定位器`)
      }
      if (fun.length > 0) {
        this.maskLoading = true
        Promise.all(fun)
          .then((res) => {
            this.maskLoading = false
            if (res) {
              showDialog({ message: '呼叫成功' })
            }
          })
          .catch(() => {
            this.maskLoading = false
          })
      }
    },
    ajaxForFind(id) {
      return new Promise((resolve, reject) => {
        mRequest
          .post(
            api.samples.findSpecimen,
            qs.stringify({
              siteId: id,
            }),
          )
          .then((res) => {
            if (res.code === 20000) {
              resolve(true)
            }
            else {
              // eslint-disable-next-line prefer-promise-reject-errors
              reject(false)
              showDialog({ message: res.message || res.msg })
            }
          })
      })
    },

    async getSiteListByDic() {
      const res = await mRequest.post(
        api.common.getListByGroupId,
        qs.stringify({
          dictGroupId: '99064352841138377',
        }),
      )

      if (res && res.obj) {
        this.actions = res.obj.map(item => item.typename)
      }
    },
    onChangeSel(v) {
      const all = v.selectedOptions
      this.selGroupValue = all.map(option => option.name).join('/')
      const data = {
        groupId: all[all.length - 1].id,
      }
      mRequest
        .post(api.samples.storageLocation, qs.stringify(data))
        .then((res) => {
          if (res.code === 20000) {
            this.locationList = res.data.map(item => ({
              ...item,
              name: item.sn,
              value: item.id,
            }))

            if (res.data.length > 0) {
              this.sampleStorage.site = `${this.selGroupValue}/${res.data[0].sn}`
              this.sampleStorage.siteId = res.data[0].id
            }
            else {
              this.sampleStorage.site = ''
              this.sampleStorage.siteId = ''
            }
          }
          else {
            showDialog({ message: res.message || res.msg })
          }
        })
    },
    switchSelClick() {
      this.switchSel = true
      this.sampleStorage.siteId = ''
      this.sampleStorage.site = ''
    },
    getTreeList() {
      mRequest.post(api.samples.LocationGroup).then((res) => {
        if (res.code === 20000) {
          this.treeGroup = res.data
        }
        else {
          showDialog({ message: res.message || res.msg })
        }
      })
    },
    onSiteConfirm({ selectedOptions }) {
      this.sampleStorage.site = selectedOptions[0]
      this.siteVisible = false
    },
    // 扫码
    onScan() {
      qrCodeScanTool.scan(async (result) => {
        let url = api.samples.storagePeriodsByBarcode
        if (this.type === 0) {
          url = api.samples.waitStoragePeriodsByBarcode
        }

        const loadingToast = showLoadingToast({
          message: '数据处理中...',
          duration: 0,
          forbidClick: true,
        })

        mRequest
          .post(
            url,
            qs.stringify({
              barcode: result,
            }),
            {},
          )
          .then(async (res) => {
            if (res && res.code !== 20010) {
              const data = res.data
              let standardCuringStorageInfo = this.standardCuringStorageInfo
              if (standardCuringStorageInfo.length === 0) {
                this.standardCuringStorageInfo = [data]
                await this.$router.push({
                  name: 'standardCuringStorage',
                  params: {
                    type,
                  },
                })
              }
              else {
                standardCuringStorageInfo = JSON.parse(
                  JSON.stringify(standardCuringStorageInfo),
                )
                const flag = standardCuringStorageInfo.find(
                  item => item.id === data.id,
                )
                if (!flag) {
                  standardCuringStorageInfo.unshift({ ...data })
                  this.standardCuringStorageInfo = standardCuringStorageInfo
                }
              }
            }
            else {
              // eslint-disable-next-line no-alert
              alert(res.message || res.msg)
            }
          })
          .catch((err) => {
            // eslint-disable-next-line no-alert
            alert(JSON.stringify(err))
          })
          .finally(() => {
            loadingToast.close()
          })
      })
    },
    scanRsult(rsult) {
      if (Array.isArray(rsult)) {
        if (rsult.length) {
          this.sampleStorageList.push(rsult[0])
        }
      }
      else if (rsult instanceof Object) {
        this.sampleStorageList.push(rsult)
      }
    },
    getPeriodIds() {
      const periodIds = []

      this.list.forEach((item) => {
        item.periods.forEach((period) => {
          if (period.checked === true) {
            periodIds.push(period.id)
          }
        })
      })
      return periodIds
    },
    checkData() {
      if (!this.sampleStorage.date) {
        showToast('请选择入库时间')
        return false
      }
      if (!this.sampleStorage.site && this.type === 0) {
        showToast('请选择存放位置')
        return false
      }
      if (!this.sampleStorage.user) {
        showToast(this.type === 0 ? '请输入入库人' : '请输入领件人')
        return false
      }

      // if (!this.list.length) {
      //   showToast("请扫码添加入库样品");
      //   return false;
      // }

      const periodIds = this.getPeriodIds()
      if (periodIds.length === 0) {
        showToast('请选择试件')
        return
      }
      return true
    },
    allCheckChange(item) {
      item.periods = item.periods.map(period => ({
        ...period,
        checked: item.checked,
      }))
      this.$forceUpdate()
    },
    periodCheck(checked, item) {
      if (checked === false) {
        item.checked = false
      }
      else if (checked === true) {
        const checkedList = item.periods.filter(period => period.checked)
        if (checkedList.length === item.periods.length) {
          item.checked = true
        }
      }
      this.$forceUpdate()
    },
    onSubmit() {
      if (!this.checkData()) {
        return
      }
      const periodIds = this.getPeriodIds()

      const data = {
        periodIds: periodIds.join(','),
        site: this.sampleStorage.site,
        siteId: this.sampleStorage.siteId,
        date: this.sampleStorage.date || null,
        inOut: this.type === 0 ? 1 : 2,
        user: this.sampleStorage.user,
      }
      const toast = showLoadingToast({
        duration: 0,
        message: '提交中...',
        forbidClick: true,
      })

      mRequest
        .post(
          api.samples.periodStoragStorageInOut,
          qs.stringify(data),
          {
            // headers: {
            //   "Content-Type": "application/json; charset=UTF-8",
            // },
          },
        )
        .then((res) => {
          toast && toast.close()
          if (res && res.code !== 20010 && res.success !== false) {
            this.standardCuringStorageInfo = []
            showSuccessToast('操作成功')
            this.isSubmit = true
            this.$router.go(-1)
          }
          else {
            showDialog({ message: res.message || res.msg })
          }
        })
        .catch((_) => {
          console.warn(_)

          toast && toast.close()
        })
    },
  },
}
</script>

<style>
.prop_font_tip {
  font-style: normal !important;
  margin-right: 20px !important;
  color: #576b95 !important;
  font-size: 15px !important;
}
</style>

<style lang="less" scoped>
.standardCuringStorage-site {
  li {
    padding: 8px 15px;
    border-top: solid 1px #e2e2e2;

    &:first-child {
      border-top: 0;
    }
  }
}

.standardCuringStorage-wrap {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;

  .standardCuringStorage-content {
    flex: 1;
    overflow: auto;

    .standardCuringStorage-box {
      width: 100%;
      background: #fff;

      .sampleStorageTag {
        border-top: 10px solid #f5f5f5;
      }
    }
  }

  .standardCuringStorage-list-wrap {
    max-height: calc(100% - 76px);
    overflow: auto;
  }

  .standardCuringStorage-list {
    padding: 15px;

    .standardCuringStorage-box {
      border: solid 1px #e2e2e2;
      background: #fff;
      border-radius: 4px;
      margin-bottom: 15px;

      &.standardCuringStorage-boxAdd {
        padding: 10px 15px;
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        color: #1989fa;
      }

      &:first-child {
        margin-top: 0;
      }

      .standardCuringStorage-boxHeader {
        border-bottom: solid 1px #e2e2e2;
        padding: 8px 15px;

        .van-col--6 {
          padding-left: 7.5px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #1989fa;
        }
      }

      .standardCuringStorage-boxBody {
        color: #888;

        :deep(.van-checkbox__label) {
          width: 100%;
        }

        .standardCuringStorage-period {
          display: flex;

          & > div {
            padding: 4px;
          }
        }

        & > div {
          border-top: solid 1px #e2e2e2;
          padding: 8px 15px;
          padding-right: 0;
          font-size: 12px;

          &:first-child {
            border-top: 0;
          }
        }
      }
    }
  }

  .scan-box {
    .scan-wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      background: #1890ff;
      border-radius: 50%;
      margin: 0 auto;
    }

    .scan-tip {
      font-size: 14px;
      line-height: 28px;
      text-align: center;
      color: #aeaeae;
    }
  }

  .standardCuringStorage-btn {
    padding: 0 10px 10px;
  }
}
</style>
