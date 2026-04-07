<template>
  <div class="equipmentDetail">
    <van-sticky>
      <MobileTitleBar left-arrow @click-left="$router.go(-1)" />
    </van-sticky>

    <div class="equipmentDetail-name">
      {{ equipmentData.name }}
      <span class="equipmentDetail-name-tag">{{ equipmentData.status }}</span>
    </div>

    <van-collapse v-model="activeNames">
      <van-collapse-item title="基础信息" name="0" icon="label-o">
        <div class="equipmentDetail-baseInfo">
          <van-field
            v-for="(item, index) in baseInfo"
            :key="index"
            v-model="equipmentData[item.field]"
            label-width="6em"
            readonly
            rows="1"
            autosize
            :label="item.name"
            type="textarea"
          />
        </div>
      </van-collapse-item>
      <van-collapse-item title="附件档案" name="1" icon="description">
        <div v-if="eqFilesList.length > 0" class="equipmentDetail-file">
          <div
            v-for="item in eqFilesList"
            :key="item.id"
            class="equipmentDetail-file-row"
            @click="handleFile(item)"
          >
            <div
              class="equipmentDetail-file-icon"
              :style="`background: ${fileIconBgColor[item._fileType]}`"
            >
              {{ item._fileType }}
            </div>
            <div class="equipmentDetail-file-info">
              <div class="textOverflow" style="font-size: 14px">
                {{ item.name }}
              </div>
              <div style="font-size: 12px">
                {{ folderObj[item.folderId] || '' }}
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <van-empty description="暂无数据" />
        </div>
      </van-collapse-item>
      <van-collapse-item
        title="使用记录"
        name="2"
        icon-prefix="iconfont"
        icon="useRecord"
      >
        <div v-if="useRecordList.length > 0" class="equipmentDetail-list">
          <div
            v-for="item in useRecordList"
            :key="item.id"
            class="equipmentDetail-list-box"
          >
            <div
              class="equipmentDetail-list-boxHeader textOverflow"
              style="font-weight: bold"
            >
              {{ item.userName }}
            </div>
            <div class="equipmentDetail-list-boxBody">
              <div>
                <div>使用时间：</div>
                <div style="flex: 1">
                  <div v-if="item.startUseTime && item.endUseTime">
                    <div>{{ item.startUseTime }} ~</div>
                    <div>{{ item.endUseTime }}</div>
                  </div>
                  <div v-else-if="item.startUseTime && !item.endUseTime">
                    <div>
                      {{ item.startUseTime }} ~
                      <span style="color: #ccc">[未填写]</span>
                    </div>
                  </div>
                  <div v-else-if="!item.startUseTime && item.endUseTime">
                    <div>
                      <span style="color: #ccc">[未填写]</span> ~
                      {{ item.endUseTime }}
                    </div>
                  </div>
                  <div v-else></div>
                </div>
              </div>
              <div style="padding-top: 4px">
                <div>样品编号：</div>
                <div style="flex: 1" class="textOverflow">
                  {{ item.testObjectCode }}
                </div>
              </div>
              <div style="padding-top: 4px">
                <div>任务编号：</div>
                <div style="flex: 1" class="textOverflow">
                  {{ item.testTaskCode }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <van-empty description="暂无数据" />
        </div>
      </van-collapse-item>
      <van-collapse-item
        title="检校记录"
        name="3"
        icon-prefix="iconfont"
        icon="calibrationRecord"
      >
        <div v-if="eqEqCheckList.length > 0" class="equipmentDetail-list">
          <div
            v-for="item in eqEqCheckList"
            :key="item.id"
            class="equipmentDetail-list-box"
          >
            <div
              class="equipmentDetail-list-boxHeader textOverflow"
              style="font-weight: bold"
            >
              {{ item.checkType }}
            </div>
            <div class="equipmentDetail-list-boxBody">
              <div>
                <div>实际检校时间：</div>
                <div style="flex: 1" class="textOverflow">
                  {{
                    item.checkTime
                      ? formatDate(item.checkTime, 'YYYY-MM-DD')
                      : ''
                  }}
                </div>
              </div>
              <div style="padding-top: 4px">
                <div>有效期：</div>
                <div style="flex: 1" class="textOverflow">
                  {{
                    item.validityDate
                      ? formatDate(item.validityDate, 'YYYY-MM-DD')
                      : ''
                  }}
                </div>
              </div>
              <div style="padding-top: 4px">
                <div>检校单位：</div>
                <div style="flex: 1" class="textOverflow">
                  {{ item.departname }}
                </div>
              </div>
              <div style="padding-top: 4px">
                <div>确认人：</div>
                <div style="flex: 1" class="textOverflow">
                  {{ item.confirmerName }}
                </div>
              </div>
              <div style="padding-top: 4px">
                <div>确认时间：</div>
                <div style="flex: 1" class="textOverflow">
                  {{
                    item.confirmTime
                      ? formatDate(item.confirmTime, 'YYYY-MM-DD')
                      : ''
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <van-empty description="暂无数据" />
        </div>
      </van-collapse-item>
      <van-collapse-item
        title="期间核查记录"
        name="4"
        icon-prefix="iconfont"
        icon="checkRecord"
      >
        <div v-if="eqInspectList.length > 0" class="equipmentDetail-list">
          <div
            v-for="item in eqInspectList"
            :key="item.id"
            class="equipmentDetail-list-box"
          >
            <div
              class="equipmentDetail-list-boxHeader textOverflow"
              style="font-weight: bold"
            >
              {{ item.inspectContent }}
            </div>
            <div class="equipmentDetail-list-boxBody">
              <div>
                <div>核查人员：</div>
                <div class="textOverflow" style="flex: 1">
                  {{ item.personName }}
                </div>
              </div>
              <div style="padding-top: 4px">
                <div>核查时间：</div>
                <div style="flex: 1" class="textOverflow">
                  {{
                    item.inspectTime
                      ? formatDate(item.inspectTime, 'YYYY-MM-DD')
                      : ''
                  }}
                </div>
              </div>
              <div style="padding-top: 4px">
                <div>核查结果及评价：</div>
                <div style="flex: 1" class="textOverflow">
                  {{ item.inspectResult }}
                </div>
              </div>
              <div style="padding-top: 4px">
                <div>评价人：</div>
                <div style="flex: 1" class="textOverflow">
                  {{ item.testTaskCode }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <van-empty description="暂无数据" />
        </div>
      </van-collapse-item>
      <van-collapse-item
        title="保养记录"
        name="5"
        icon-prefix="iconfont"
        icon="maintainRecord"
      >
        <div v-if="eqUpkeepList.length > 0" class="equipmentDetail-list">
          <div
            v-for="item in eqUpkeepList"
            :key="item.id"
            class="equipmentDetail-list-box"
          >
            <div
              class="equipmentDetail-list-boxHeader textOverflow"
              style="font-weight: bold"
            >
              {{ item.upkeepDepart }}
            </div>
            <div class="equipmentDetail-list-boxBody">
              <div>
                <div>保养人：</div>
                <div class="textOverflow" style="flex: 1">
                  {{ item.upkeepPerson }}
                </div>
              </div>
              <div style="padding-top: 4px">
                <div>保养时间：</div>
                <div style="flex: 1" class="textOverflow">
                  {{
                    item.upkeepTime
                      ? formatDate(item.upkeepTime, 'YYYY-MM-DD')
                      : ''
                  }}
                </div>
              </div>
              <div style="padding-top: 4px">
                <div>保养措施：</div>
                <div style="flex: 1" class="textOverflow">
                  {{ item.upkeepWay }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <van-empty description="暂无数据" />
        </div>
      </van-collapse-item>
      <van-collapse-item
        title="维修记录"
        name="6"
        icon-prefix="iconfont"
        icon="repairRecord"
      >
        <div v-if="eqRepairList.length > 0" class="equipmentDetail-list">
          <div
            v-for="item in eqRepairList"
            :key="item.id"
            class="equipmentDetail-list-box"
          >
            <div class="equipmentDetail-list-boxHeader textOverflow">
              <van-row type="flex" justify="space-between" align="middle">
                <van-col span="18" style="font-weight: bold">
                  {{ item.phenomenon }}
                </van-col>
                <van-col span="6" style="text-align: right">
                  <a
                    v-if="!eqRepairDetail[item.id]"
                    href="javascript:;"
                    @click="eqRepairMore(item.id)"
                  >查看更多</a>
                </van-col>
              </van-row>
            </div>
            <div class="equipmentDetail-list-boxBody">
              <div>
                <div>申请时间：</div>
                <div style="flex: 1" class="textOverflow">
                  {{ formatDate(item.createDate, 'YYYY-MM-DD') }}
                </div>
              </div>
              <div
                v-for="(detail, detailIndex) in eqRepairDetail[item.id] || []"
                :key="detailIndex"
              >
                <div>{{ detail.name }}：</div>
                <div style="flex: 1" class="textOverflow">
                  {{ detail.value }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <van-empty description="暂无数据" />
        </div>
      </van-collapse-item>
      <van-collapse-item
        title="调拨信息"
        name="7"
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
                  {{
                    item.createDate && formatDate(item.createDate, 'YYYY-MM-DD')
                  }}
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
                  {{
                    item.allotTime && formatDate(item.allotTime, 'YYYY-MM-DD')
                  }}
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
          <van-empty description="暂无数据" />
        </div>
      </van-collapse-item>
      <van-collapse-item
        title="更多设备信息"
        name="8"
        icon-prefix="iconfont"
        icon="more"
      >
        <div class="equipmentDetail-baseInfo">
          <van-field
            v-for="(item, index) in moreInfo"
            :key="index"
            v-model="equipmentData[item.field]"
            label-width="6em"
            readonly
            rows="1"
            autosize
            :label="item.name"
            type="textarea"
          />
        </div>
      </van-collapse-item>
    </van-collapse>

    <div class="equipmentDetail-btns">
      <van-button
        v-if="equipmentUseBtn"
        block
        type="primary"
        @click="toUseRegister"
      >
        设备使用登记
      </van-button>
      <van-button
        v-if="equipmentGoOutBtn"
        block
        type="primary"
        @click="toGooutPage"
      >
        设备外出管理
      </van-button>
    </div>

    <SelectUseRecord
      :id="id"
      v-model:value="selectUseRecordVisible"
      :list="useListBySelect"
    />

    <!-- 查看PDF -->
    <MobileCheckPDF ref="mobileCheckPDFRef" />
  </div>
</template>

<script>
import qs from 'qs'
import {
  showConfirmDialog,
  showImagePreview,
  showLoadingToast,
} from 'vant'
import { usePermissionStore } from '~/store/permissionStore'
import MobileCheckPDF from '~/views/mobileApp/components/MobileCheckPDF.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { appConfig } from '~/views/mobileApp/provides/config/appConfig'
import { downloadFile } from '~/views/mobileApp/provides/utils/downloadFile'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'
import SelectUseRecord from '../components/selectUseRecord.vue'

export default {
  name: 'equipmentDetail',
  components: {
    SelectUseRecord,
    MobileTitleBar,
    MobileCheckPDF,
  },
  beforeRouteEnter(to, from, next) {
    if (
      from.name === 'equipment'
      || from.name === 'menuPage'
      || from.name === 'home'
      || from.name === 'equipmentGoOut'
      || from.name === 'equipmentInventoryDetail'
    ) {
      const pageState = useAppPageStateStore().getPage('equipmentDetail')
      pageState.scrollTop = 0
      pageState.resetPage = true
    }

    next()
  },
  beforeRouteLeave(to, from, next) {
    if (from.name === 'equipmentDetail') {
      const pageState = useAppPageStateStore().getPage('equipmentDetail')
      pageState.scrollTop = document.documentElement.scrollTop || 0
    }
    next()
  },
  data() {
    return {
      formatDate,
      id: undefined,
      equipmentData: {},
      activeNames: ['0'],
      selectUseRecordVisible: false,
      baseInfo: [
        { name: '设备编号', field: 'equipmentSn' },
        { name: '档案编号', field: 'archiveSn' },
        { name: '资产编号', field: 'assetSn' },
        { name: '规格型号', field: 'standard' },
        { name: '量程', field: 'eqRange' },
        { name: '精度', field: 'accuracy' },
        { name: '检校类型', field: 'checkType' },
        { name: '检校周期', field: 'checkPeriod' },
        { name: '前次检校时间', field: 'preCheckDate' },
        { name: '下次检校时间', field: 'nextCheckDate' },
        { name: '检校单位', field: 'checkUnit' },
      ],
      moreInfo: [
        { name: '检测管理编号', field: 'testManageSn' },
        { name: '部门保管人', field: 'keeperName' },
        { name: '使用人', field: 'userName' },
        { name: '单位管理员', field: 'managerName' },
        { name: '所属单位', field: 'unitName' },
        { name: '所属部门', field: 'departName' },
        { name: '存放位置', field: 'storageSite' },
        { name: '外形尺寸', field: 'size' },
        { name: '供应商', field: 'supplierName' },
        { name: '供应商电话', field: 'supplierTel' },
        { name: '购置日期', field: 'buyDate' },
        { name: '出厂编号', field: 'factorySn' },
        { name: '生产厂家', field: 'factory' },
        { name: '功率', field: 'power' },
        { name: '数量', field: 'quantity' },
        { name: '净值', field: 'netValue' },
        { name: '出厂价', field: 'factoryPrice' },
        { name: '安装费', field: 'installFee' },
        { name: '折旧费', field: 'depreciationFee' },
        { name: '复杂系数(机)', field: 'coefficientMachine' },
        { name: '复杂系数(电)', field: 'coefficientElectronic' },
        { name: '复杂系数(热)', field: 'coefficientHot' },
      ],
      // 使用记录
      useRecordList: [],
      // 维修记录
      eqRepairList: [],
      eqRepairDetail: {},
      // 期间核查记录
      eqInspectList: [],
      // 保养记录
      eqUpkeepList: [],
      // 检校记录
      eqEqCheckList: [],
      // 设备附件
      eqFilesList: [],
      // 调拨信息
      allotList: [],
      folderObj: {},
      useListBySelect: [],
      pdfSrc: '',
      filename: '',
      equipmentGoOutBtn: false, // 设备外出管理按钮权限
      equipmentUseBtn: false, // 设备使用登记按钮权限
    }
  },
  computed: {
    fileIconBgColor() {
      return appConfig.fileIconBgColor
    },
  },
  activated() {
    const pageState = useAppPageStateStore().getPage('equipmentDetail')
    const { scrollTop, resetPage, reloadUseRcord } = pageState

    window.scrollTo(0, scrollTop || 0)

    if (resetPage === true || resetPage === undefined || resetPage === null) {
      this.resetPage()
      pageState.resetPage = false
    }
    else if (reloadUseRcord === true) {
      this.getUseRecord()
      pageState.reloadUseRcord = false
    }

    this.checkBtnPermission()
  },
  methods: {
    // 获取按钮权限
    checkBtnPermission() {
      const { hasPermission } = usePermissionStore()

      // 设备外出管理按钮
      this.equipmentGoOutBtn = hasPermission('mobile_equipmentGoOutDetail')
      // 设备使用登记按钮
      this.equipmentUseBtn = hasPermission('mobile_equipmentUseRegister')
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
      this.getUseRecord()
      this.getEqInspect()
      this.getEqUpkeep()
      this.getEqRepair()
      this.getEqCheck()
      this.getEqFilesFolder()
      this.getEqFiles()
      this.getAllotList()
    },
    handleFile(row) {
      if (
        row._fileType === 'JPG'
        || row._fileType === 'JPEG'
        || row._fileType === 'PNG'
      ) {
        showImagePreview([row.url])
      }
      else if (row._fileType === 'PDF') {
        this.pdfSrc = row.url
        this.filename = row.name
        this.viewPDF()
      }
      else {
        downloadFile(row.url, row.name)
      }
    },
    async getDetailData() {
      const res = await mRequest.post(
        api.equipment.detail,
        qs.stringify({
          id: this.id,
        }),
      )

      if (res && res.success && res.obj) {
        const data = res.obj
        data.departName = res.attributes.departName

        if (data.checkPeriod) {
          data.checkPeriod = `${data.checkPeriod}${data.checkPeriodUnit}`
        }
        else {
          data.checkPeriod = ''
        }
        data.preCheckDate = data.preCheckDate
          ? formatDate(data.preCheckDate, 'YYYY-MM-DD')
          : ''
        data.nextCheckDate = data.nextCheckDate
          ? formatDate(data.nextCheckDate, 'YYYY-MM-DD')
          : ''
        data.buyDate = data.buyDate
          ? formatDate(data.buyDate, 'YYYY-MM-DD')
          : ''

        this.equipmentData = res.obj
      }
      else {
        showConfirmDialog({
          title: '提示',
          message: `没有查找到设备信息，请联系管理员`,
        }).then(() => {
          this.$router.go(-1)
        }).catch(() => {
          this.$router.go(-1)
        })
      }
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
    // 设备使用记录
    async getUseRecord() {
      const res = await mRequest.post(
        api.equipment.useRecord,
        qs.stringify({
          equipmentId: this.id,
          page: 1,
          size: 10,
        }),
      )

      if (res && res.code === 20000) {
        this.useRecordList = res.data.rows
      }
    },
    // 期间核查记录
    async getEqInspect() {
      const res = await mRequest.post(
        api.equipment.eqInspect,
        qs.stringify({
          equipmentId: this.id,
          page: 1,
          rows: 10,
        }),
      )

      if (res && res.rows) {
        this.eqInspectList = res.rows
      }
    },
    // 保养记录
    async getEqUpkeep() {
      const res = await mRequest.post(
        api.equipment.eqUpkeep,
        qs.stringify({
          equipmentId: this.id,
          page: 1,
          rows: 10,
        }),
      )

      if (res && res.rows) {
        this.eqUpkeepList = res.rows
      }
    },
    // 检校记录
    async getEqCheck() {
      const res = await mRequest.post(
        api.equipment.eqCheck,
        qs.stringify({
          equipmentId: this.id,
          page: 1,
          rows: 10,
        }),
      )

      if (res && res.rows) {
        this.eqEqCheckList = res.rows
      }
    },
    // 维修记录
    async getEqRepair() {
      const res = await mRequest.post(
        api.equipment.eqRepair,
        qs.stringify({
          equipmentId: this.id,
          page: 1,
          size: 10,
        }),
      )

      if (res && res.rows) {
        this.eqRepairList = res.rows
      }
    },
    // 设备目录
    async getEqFilesFolder() {
      const res = await mRequest.post(
        api.equipment.eqFilesFolder,
        qs.stringify({
          mainEntityId: this.id,
        }),
      )

      const tree = res.rows
      this.formatFolder(tree)
    },
    // 设备附件
    async getEqFiles() {
      const res = await mRequest.post(
        api.equipment.eqFiles,
        qs.stringify({
          mainEntityId: this.id,
        }),
      )

      if (res && res.obj) {
        this.eqFilesList = res.obj.map(item => ({
          ...item,
          _fileType: this.getFileType(item.name),
        }))
      }
    },
    // 获取附件的后缀名
    getFileType(name) {
      if (name) {
        const arr = name.split('.')
        const type = arr[arr.length - 1].toLocaleUpperCase()
        return type
      }
      else {
        return 'other'
      }
    },
    // 获取附件目录对象
    formatFolder(tree) {
      if (Array.isArray(tree) && tree.length > 0) {
        for (let i = 0; i < tree.length; i++) {
          this.folderObj[tree[i].id] = tree[i].name
          if (tree[i].children && tree[i].children.length > 0) {
            this.formatFolder(tree[i].children)
          }
        }
      }
      else {
        return []
      }
    },
    // 查看更多使用记录
    async eqRepairMore(repairId) {
      const res = await mRequest.post(
        api.equipment.useRecordDetail,
        qs.stringify({
          repairId,
        }),
      )

      if (res.success) {
        const data = res.obj
        data.repairDetailVo = data.repairDetailVo || {}
        data.repairVerifyVo = data.repairVerifyVo || {}

        this.eqRepairDetail = {
          [repairId]: [
            { name: '承修人', value: data.repairDetailVo.repairMan },
            { name: '承修单位', value: data.repairDetailVo.repairUnit },
            { name: '费用合计', value: data.repairDetailVo.totalFee },
            { name: '检验人', value: data.repairVerifyVo.personName },
            {
              name: '检验时间',
              value: data.repairVerifyVo.verifyTime
                ? formatDate(data.repairVerifyVo.verifyTime, 'YYYY-MM-DD')
                : '',
            },
            { name: '修复程度检验', value: data.repairVerifyVo.content },
          ],
        }
      }
    },
    // 设备使用
    toUseRegister() {
      // 特殊处理：
      // 如果该设备有填写了开始使用时间，没填写结束使用时间的数据，则在进入设备使用登记界面前进行提示，“当前设备有未登记结束使用时间的记录，是否继续登记？”选项为“继续登记，新增记录”
      // 如果只有一条，则直接进入该条的编辑；如果有多条，则弹出选择，选择项显示为“任务编号，记录编号”

      const list = this.useRecordList.filter(
        item => item.startUseTime && !item.endUseTime,
      )

      if (list.length > 0) {
        if (list.length === 1) {
          showConfirmDialog({
            title: '提示',
            message: '当前设备有未登记结束使用时间的记录，是否继续登记？',
            cancelButtonText: '继续登记',
            confirmButtonText: '新增记录',
            confirmButtonColor: '#333',
            cancelButtonColor: '#333',
          })
            .then(() => {
              this.$router.push({
                name: 'equipmentUseRecord',
                query: { id: this.id },
              })
            })
            .catch(() => {
              this.$router.push({
                name: 'equipmentUseRecord',
                query: { id: this.id, useid: list[0].id },
              })
            })
        }
        else {
          showConfirmDialog({
            title: '提示',
            message: '当前设备有未登记结束使用时间的记录，是否继续登记？',
            cancelButtonText: '继续登记',
            confirmButtonText: '新增记录',
            confirmButtonColor: '#333',
            cancelButtonColor: '#333',
          })
            .then(() => {
              this.$router.push({
                name: 'equipmentUseRecord',
                query: { id: this.id },
              })
            })
            .catch(() => {
              this.useListBySelect = list
              this.selectUseRecordVisible = true
            })
        }
      }
      else {
        this.$router.push({
          name: 'equipmentUseRecord',
          query: { id: this.id },
        })
      }
    },
    // 设备外出管理
    toGooutPage() {
      this.$router.push({
        name: 'equipmentGoOutDetail',
        params: { id: this.id },
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
