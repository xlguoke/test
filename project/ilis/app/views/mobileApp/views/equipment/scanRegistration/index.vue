<template>
  <div class="standardCuringStorage-wrap">
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)">
      </MobileTitleBar>
    </van-sticky>
    <div class="standardCuringStorage-content">
      <div class="standardCuringStorage-list-wrap">
        <div class="standardCuringStorage-list">
          <div
            v-for="(item, index) in eqList"
            :key="index"
            class="standardCuringStorage-box"
          >
            <div class="standardCuringStorage-boxHeader">
              <van-row :gutter="10" type="flex" align="center">
                <van-col span="18">
                  <div class="textOverflow" style="font-weight: bold">
                    {{ item.name }}
                  </div>
                  <div
                    class="textOverflow"
                    style="color: gray; font-size: 13px"
                  >
                    {{ item.equipmentSn }}
                  </div>
                </van-col>
                <van-col span="6">
                  <van-button
                    icon="delete-o"
                    plain
                    type="warning"
                    hairline
                    size="mini"
                    @click="removeEq(index)"
                  >
                    移除
                  </van-button>
                </van-col>
              </van-row>
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
        扫码添加设备
      </div>
    </div>
    <div class="standardCuringStorage-btn">
      <van-button block type="primary" @click="onSubmit">
        <span>下一步</span>
      </van-button>
    </div>
  </div>
</template>

<script>
import { mapWritableState } from 'pinia'
import qs from 'qs'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { qrCodeScanTool } from '~/views/mobileApp/provides/modules/qr-code-scan-tool'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useSampleStore } from '~/views/mobileApp/store/useSampleStore'

export default {
  components: {
    MobileTitleBar,
  },
  data() {
    return {
      eqList: [],
      maskLoading: false,
      switchSel: false,
      selLocationValue: '',
      fieldNames: {
        text: 'name',
        value: 'id',
        children: 'children',
      },
      cascaderValue: '',
      selGroupValue: '',
      selLocationShow: false,
      selGroupShow: false,
      locationList: [],
      treeGroup: [],
      list: [],
      sampleStorage: {
        date: new Date(),
        site: '',
      },
      actions: [],
      currentDate: new Date(),
      selectDateVisible: false,
      siteVisible: false,
      type: null,
      isSubmit: false,
    }
  },
  // watch: {
  //   $route(to, from) {},
  // },

  computed: {
    ...mapWritableState(useSampleStore, ['standardCuringStorageInfo']),
  },
  created() {
    // if (this.standardCuringStorageInfo.length == 0) {
    //   this.$router.go(-1);
    // }
    // this.list = JSON.parse(JSON.stringify(this.standardCuringStorageInfo));
    // this.type = this.$route.params.type;
    // this.getSiteListByDic();
    // this.getTreeList();
  },

  methods: {
    removeEq(index) {
      this.eqList.splice(index, 1)
    },
    onConfirm(v) {
      this.selLocationShow = false
      if (v && v.sn) {
        this.selLocationValue = v
        this.sampleStorage.site = `${this.selGroupValue}/${v.sn}`
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
            this.locationList = res.data
            if (res.data.length > 0) {
              this.selLocationValue = res.data[0]
              this.sampleStorage.site = `${this.selGroupValue}/${res.data[0].sn}`
            }
            else {
              this.sampleStorage.site = ''
              this.selLocationValue = {}
            }
          }
          else {
            showDialog({ message: res.message || res.msg })
          }
        })
    },
    switchSelClick() {
      this.switchSel = true
      this.selLocationValue = {}
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
    onSiteConfirm(val) {
      this.sampleStorage.site = val
      this.siteVisible = false
    },
    // 扫码
    onScan() {
      qrCodeScanTool.scan((r) => {
        const id = qrCodeScanTool.getParamByResult(r, 'id')

        if (!id) {
          showDialog({
            title: '提示',
            message: '无效二维码！',
          })
          return
        }

        mRequest
          .get(api.equipment.eqDet, { params: { id } })
          .then((res) => {
            if (res.code === 20000) {
              this.scanRsult(res.data)
            }
            else {
              showDialog({
                title: '提示',
                message: res.message || res.msg,
              })
            }
          })
      })
    },
    scanRsult(rsult) {
      // eslint-disable-next-line array-callback-return
      const arr = this.eqList.filter((item) => {
        if (item.id === rsult.id) {
          showDialog({
            title: '提示',
            message: '请勿重复扫描设备',
          })
          return item
        }
      })
      if (arr.length === 0) {
        this.eqList.push(rsult)
      }
    },
    // 获取取样时间
    getSelectDate(value) {
      this.sampleStorage.date = formatDate(value)
      this.selectDateVisible = false
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
      if (!this.sampleStorage.site && Number(this.type) === 0) {
        showToast('请选择存放位置')
        return false
      }
      if (!this.sampleStorage.user) {
        showToast(Number(this.type) === 0 ? '请输入入库人' : '请输入领件人')
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
      if (this.eqList.length < 1) {
        showToast('请扫描设备！')
        return
      }
      const ids = this.eqList.map((item) => {
        return item.id
      })
      this.$router.push({
        name: 'equipmentUseRecord',
        query: { id: ids.join(',') },
      })
    },
  },
}
</script>

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
