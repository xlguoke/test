<template>
  <div class="equipmentDetail">
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)" />
    </van-sticky>

    <div class="equipmentDetail-name">
      {{ equipmentData.name }}
      <van-tag>{{ equipmentData.status }}</van-tag>
    </div>

    <van-collapse v-model="activeNames">
      <van-collapse-item title="基础信息" name="0" icon="label-o">
        <div class="equipmentDetail-baseInfo">
          <van-field
            v-for="(item, index) in chosenColumns"
            :key="index"
            v-model="equipmentData[item.columnKey]"
            label-width="6em"
            readonly
            rows="1"
            autosize
            :label="item.columnName"
            type="textarea"
          />
        </div>
      </van-collapse-item>
      <van-collapse-item
        title="调拨信息"
        name="1"
        icon-prefix="iconfont"
        icon="maintainRecord"
      >
        <div v-if="allotList.length > 0" class="equipmentDetail-list">
          <div
            v-for="item in allotList"
            :key="item.id"
            class="equipmentDetail-list-box"
          >
            <div class="equipmentDetail-list-boxBody">
              <div>
                <div>申请日期：</div>
                <div class="textOverflow" style="flex: 1">
                  {{ formatDate(item.createDate, 'YYYY-MM-DD') }}
                </div>
              </div>
              <div style="padding-top: 4px">
                <div>申请人：</div>
                <div style="flex: 1" class="textOverflow">
                  {{ item.createName }}
                </div>
              </div>
              <div style="padding-top: 4px">
                <div>调出部门：</div>
                <div style="flex: 1" class="textOverflow">
                  {{ item.outOrg }}
                </div>
              </div>
              <div style="padding-top: 4px">
                <div>调入部门：</div>
                <div style="flex: 1" class="textOverflow">
                  {{ item.inOrg }}
                </div>
              </div>
              <div style="padding-top: 4px">
                <div>调拨日期：</div>
                <div style="flex: 1" class="textOverflow">
                  {{ formatDate(item.allotTime, 'YYYY-MM-DD') }}
                </div>
              </div>
              <div style="padding-top: 4px">
                <div>调拨说明：</div>
                <div style="flex: 1" class="textOverflow">
                  {{ item.allotExplain }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <van-empty
            class="equipmentDetail-notData"
            :image="noDataPng"
            description="暂无数据"
          />
        </div>
      </van-collapse-item>
      <van-collapse-item title="附件信息" name="2" icon="description">
        <CommonUploadView :id="id" ref="commonUploadView" type="ASSET">
        </CommonUploadView>
      </van-collapse-item>
    </van-collapse>

    <!-- 查看PDF -->
    <MobileCheckPDF ref="mobileCheckPDFRef" />
  </div>
</template>

<script>
import dayjs from 'dayjs'
import { showConfirmDialog, showLoadingToast } from 'vant'
import CommonUploadView from '~/views/mobileApp/components/commonUploadView.vue'
import MobileCheckPDF from '~/views/mobileApp/components/MobileCheckPDF.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { appConfig } from '~/views/mobileApp/provides/config/appConfig'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'

export default {
  name: 'assetDetail',
  components: {
    CommonUploadView,
    MobileTitleBar,
    MobileCheckPDF,
  },
  beforeRouteEnter(to, from, next) {
    if (
      from.name === 'menuPage'
      || from.name === 'home'
      || from.name === 'equipmentInventoryDetail'
    ) {
      const pageState = useAppPageStateStore().getPage('assetDetail')
      pageState.scrollTop = 0
      pageState.resetPage = true
    }

    next()
  },
  beforeRouteLeave(to, from, next) {
    if (from.name === 'assetDetail') {
      const pageState = useAppPageStateStore().getPage('assetDetail')
      pageState.scrollTop = document.documentElement.scrollTop || 0
    }
    next()
  },
  data() {
    return {
      noDataPng: new URL(`~/views/mobileApp/assets/notData.png`, import.meta.url).href,
      formatDate,
      id: undefined,
      equipmentData: {},
      activeNames: ['0'],
      // 设备附件
      eqFilesList: [],
      // 调拨信息
      allotList: [],
      chosenColumns: [],
    }
  },
  computed: {
    fileIconBgColor() {
      return appConfig.fileIconBgColor
    },
  },
  async activated() {
    const pageState = useAppPageStateStore().getPage('assetDetail')
    const { scrollTop, resetPage, reloadUseRcord } = pageState

    window.scrollTo(0, scrollTop || 0)

    if (resetPage === true || resetPage === undefined || resetPage === null) {
      this.resetPage()
      pageState.resetPage = false
    }
    else if (reloadUseRcord === true) {
      pageState.reloadUseRcord = false
    }
  },
  methods: {
    async getDetailData() {
      const { data, code } = await mRequest.get(`rest/equipment/assets/barcode/${this.id}/detail`)

      if (code === 20000 && data) {
        const { eqAsset, eqAssetStatus, eqAssetType, customizeValue } = data
        eqAsset.buyDate = eqAsset.buyDate ? dayjs(eqAsset.buyDate).format('YYYY-MM-DD') : ''

        const statusItem = eqAssetStatus.find(i => i.typeCode === eqAsset.status)
        eqAsset.status = statusItem ? statusItem.typeName : ''

        const typeItem = eqAssetType.find(i => i.typeCode === eqAsset.type)
        eqAsset.type = typeItem ? typeItem.typeName : ''

        customizeValue.forEach((i) => {
          eqAsset[i.columnId] = i.columnValue
        })

        this.chosenColumns = data.chosenColumns || []
        this.equipmentData = eqAsset
      }
      else {
        showConfirmDialog({
          title: '提示',
          message: `没有查找到资产信息，请联系管理员`,
        }).then(() => {
          this.$router.go(-1)
        }).catch(() => {
          this.$router.go(-1)
        })
      }
    },
    viewPDF() {
      this.$refs.mobileCheckPDFRef.open(this.pdfSrc, this.filename)
    },
    async resetPage() {
      const { id } = this.$route.params
      this.id = id
      this.activeNames = ['0']
      const toast = showLoadingToast({
        duration: 0,
        forbidClick: true,
      })
      await this.getDetailData().finally(() => {
        toast.close()
      })
      this.getAllotList()

      this.$refs.commonUploadView && this.$refs.commonUploadView.getFileList()
    },
    async getAllotList() {
      const res = await mRequest.get('rest/equipment/assets-allot/page', {
        params: {
          id: this.id,
          page: 1,
          size: 10,
        },
      })

      if (res && res.code === 20000) {
        this.allotList = res.data.rows
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
