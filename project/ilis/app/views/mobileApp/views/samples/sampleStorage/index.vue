<template>
  <div class="sampleStorage-wrap">
    <van-sticky>
      <MobileTitleBar title="样品入库" left-arrow @click-left="$router.go(-1)">
        <template #right>
          <span @click.stop="$router.push({ name: 'sampleStorageRecord' })">入库记录
          </span>
        </template>
      </MobileTitleBar>
    </van-sticky>
    <div class="sampleStorage-content">
      <div class="sampleStorage-box">
        <FormItemDate
          v-model:value="sampleStorage.saveDate"
          label="入库日期："
          placeholder="请选择入库日期"
          required
        />

        <FormItemInput
          v-model:value="sampleStorage.saveSite"
          label="存放位置："
          required
        />
      </div>
      <div ref="sampleStorageWrap" class="sampleStorage-list-wrap">
        <ul ref="sampleStorage" class="sampleStorage-list">
          <li
            v-for="(item, index) in sampleStorageList"
            :key="index"
            class="sampleStorage-item"
          >
            <div class="sampleStorage-title flex items-center">
              <span class="flex-1">{{ item.testSampleDisplayName }}</span>
              <span
                class="sampleStorage-item-btn"
                @click.stop="delList(item, index)"
              >删除</span>
            </div>
            <div class="sampleStorage-item-content">
              <div class="sampleStorage-item-info">
                规格型号：{{ item.standard }}
              </div>
              <div class="sampleStorage-item-info">
                试样数量：{{ item.sampleNum }}
              </div>
              <div class="sampleStorage-item-info">
                样品编号：{{ item.testObjectSn }}
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
    <div class="scan-box">
      <div>
        <div class="scan-wrap">
          <van-icon
            class="scan-icon"
            color="#fff"
            size="40"
            name="edit"
            @click.stop="onSampleInput()"
          />
        </div>
        <div class="scan-tip">
          直接录入编码
        </div>
      </div>
      <div>
        <div class="scan-wrap">
          <van-icon
            class="scan-icon"
            color="#fff"
            size="40"
            name="scan"
            @click.stop="onScan()"
          />
        </div>
        <div class="scan-tip">
          扫码添加样品
        </div>
      </div>
      <div>
        <div class="scan-wrap">
          <van-icon
            class="scan-icon"
            color="#fff"
            size="40"
            name="scan"
            @click.stop="onScan(true)"
          />
        </div>
        <div class="scan-tip">
          连续扫码添加样品
        </div>
      </div>
    </div>
    <div class="sampleStorage-btn">
      <van-button block type="primary" @click="onSubmit">
        确认入库
      </van-button>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { mapWritableState } from 'pinia'
import qs from 'qs'
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import FormItemInput from '~/views/mobileApp/components/MobileFormItem/FormItemInput.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { qrCodeScanTool } from '~/views/mobileApp/provides/modules/qr-code-scan-tool'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'
import { useSampleStore } from '~/views/mobileApp/store/useSampleStore'

export default {
  components: {
    MobileTitleBar,
    FormItemInput,
    FormItemDate,
  },
  beforeRouteLeave(to, from, next) {
    if (to.name === 'samples' && this.isSubmit === true) {
      const pageState = useAppPageStateStore().getPage(to.name)
      pageState.resetPage = true
    }
    next()
  },
  data() {
    return {
      sampleStorage: {
        saveDate: dayjs().format(EDateFormatType.YYYY_MM_DD),
        saveSite: '',
      },
      sampleStorageList: [],
      showTime: false,
      labelId: null,
    }
  },
  computed: {
    ...mapWritableState(useSampleStore, ['sampleStorageInfo']),
  },
  created() {
    let saveSite = localStorage.getItem('saveSite')
    saveSite = saveSite || ''
    this.sampleStorage.saveSite = saveSite
    this.setStoreData()
    const query = this.$route.query
    this.labelId = query.labelId ? query.labelId : ''
    if (this.labelId) {
      this.getProcessObjectByLabelId(this.labelId)
    }
  },
  methods: {
    setStoreData() {
      const sampleStorageInfo = this.sampleStorageInfo

      if (sampleStorageInfo) {
        if (sampleStorageInfo.sampleStorage) {
          this.sampleStorage = sampleStorageInfo.sampleStorage
        }

        if (sampleStorageInfo.sampleStorageList) {
          this.sampleStorageList = sampleStorageInfo.sampleStorageList
        }

        this.scrollChange()
      }
    },
    scrollChange() {
      this.$nextTick().then(() => {
        const sampleStorageWrap = this.$refs.sampleStorageWrap
        const sampleStorage = this.$refs.sampleStorage
        const rect = sampleStorage.getBoundingClientRect()
        sampleStorageWrap.scrollTop = rect.height
      })
    },
    // 扫码
    onScan(enableContinuousScan) {
      this.sampleStorageInfo = {
        sampleStorage: this.sampleStorage,
        sampleStorageList: this.sampleStorageList,
      }

      const sampleStorageList = this.sampleStorageList

      qrCodeScanTool.scan(
        async (result, { scanToast }) => {
          const has = sampleStorageList.some((i) => {
            return result.includes(i.id)
          })
          if (has) {
            scanToast('列表中已经添加过该二维码')
            return
          }

          const res = await mRequest
            .get(api.samples.getProcessObjectByQrCode, {
              params: { mixCode: result },
            })
            .catch((_) => {
              // eslint-disable-next-line no-alert
              alert(JSON.stringify(_))
            })

          if (res.code === 20000) {
            const data = res.data
            if (data && data.length) {
              if (data[0].state && data[0].state === '00') {
                scanToast(
                  `${data[0].testSampleDisplayName}样品已经入库,不能重复入库`,
                )
              }
              else {
                this.scanRsult(data)
                scanToast(`${data[0].testSampleDisplayName}已添加`)
              }
            }
            else {
              scanToast('无法识别？试试直接录入编码')
            }
          }
          else {
            scanToast(res.msg || res.message)
          }
        },
        {
          enableKeepScan: !!enableContinuousScan,
        },
      )
    },
    delList(row, index) {
      this.sampleStorageList.splice(index, 1)
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
      this.scrollChange()
    },
    checkData() {
      if (!this.sampleStorage.saveDate) {
        showToast('请选择入库时间')
        return false
      }
      if (!this.sampleStorage.saveSite) {
        showToast('请输入存放地点')
        return false
      }
      if (!this.sampleStorageList.length) {
        showToast('请扫码添加入库样品')
        return false
      }
      return true
    },
    getProcessObjectByLabelId(result) {
      mRequest
        .get(api.samples.getProcessObjectByLabelId, {
          params: { labelId: result },
        })
        .then((res) => {
          // alert(JSON.stringify(res));
          if (res.success) {
            if (res.obj && res.obj.length) {
              this.sampleStorageList.push(res.obj[0])
              this.scrollChange()
            }
            else {
              showDialog({ message: res.message || res.msg })
            }
          }
          else {
            showDialog({ message: res.message || res.msg })
          }
        })
        .catch((_) => {})
    },
    onSampleInput() {
      this.$router.push({ name: 'sampleInput' })
    },
    onSubmit() {
      if (!this.checkData()) {
        return
      }
      const saveDate = this.sampleStorage.saveDate
      const data = {
        processObjectIds: this.sampleStorageList.map(i => i.id).join(','),
        saveSite: this.sampleStorage.saveSite,
        saveDate: saveDate || null,
      }
      const toast = showLoadingToast({
        duration: 0,
        message: '提交中...',
        forbidClick: true,
      })
      mRequest
        .post(api.samples.putStorage, qs.stringify(data))
        .then((res) => {
          toast && toast.close()
          if (res && res.code !== 20010) {
            this.sampleStorageInfo = {}
            showSuccessToast('操作成功')
            localStorage.setItem('saveSite', this.sampleStorage.saveSite)
            if (this.labelId) {
              this.$router.go(-3)
            }
            else {
              this.$router.go(-1)
            }
          }
          else {
            showDialog({ message: res.message || res.msg })
          }
        })
        .catch(() => {
          toast && toast.close()
        })
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
