<template>
  <div>
    <van-sticky>
      <MobileTitleBar
        class="left-title"
        title="盘点详情"
        left-arrow
        @click-left="$router.go(-1)"
      >
      </MobileTitleBar>
    </van-sticky>
    <div class="list">
      <div class="card">
        <div class="title" style="border-bottom: 1px solid #e5e5e5">
          <div class="name">
            {{ detail.equipmentName }}
          </div>
          <div
            class="status"
            :style="{
              backgroundColor:
                statusMap[detail.status] && statusMap[detail.status].color,
            }"
          >
            {{ statusMap[detail.status] && statusMap[detail.status].label }}
          </div>
        </div>
        <van-row gutter="20">
          <van-col span="24">
            <div class="line">
              <span class="label">资产类别：</span>
              <span>{{
                typeDict.find((i) => i.typeCode === detail.type)
                  && typeDict.find((i) => i.typeCode === detail.type).typeName
              }}</span>
            </div>
          </van-col>
          <van-col span="24">
            <div class="line">
              <span class="label">资产编号：</span>
              <span>{{ detail.assetSn }}</span>
            </div>
          </van-col>
          <van-col span="24">
            <div class="line">
              <span class="label">资产品牌：</span>
              <span>{{ detail.factory }}</span>
            </div>
          </van-col>
          <van-col span="24">
            <div class="line">
              <span class="label">规格型号：</span>
              <span>{{ detail.standard }}</span>
            </div>
          </van-col>
          <van-col span="24">
            <div class="line">
              <span class="label">数量：</span>
              <span>{{ detail.quantity }}</span>
            </div>
          </van-col>
          <van-col span="24">
            <div class="line">
              <span class="label">购置日期：</span>
              <span>{{ detail.buyDate && formatDate(detail.buyDate) }}</span>
            </div>
          </van-col>
          <van-col span="24">
            <div class="line">
              <span class="label">所属部门：</span>
              <span>{{ detail.departName }}</span>
            </div>
          </van-col>
          <van-col span="24">
            <div class="line">
              <span class="label">使用地点：</span>
              <span>{{ detail.serveLocation }}</span>
            </div>
          </van-col>
          <van-col span="24">
            <div class="line">
              <span class="label">使用人：</span>
              <span>{{ detail.userName }}</span>
            </div>
          </van-col>
          <van-col span="24">
            <div class="line">
              <span class="label">使用状态：</span>
              <span>{{
                statusDict.find((i) => i.typeCode === detail.useStatus)
                  && statusDict.find((i) => i.typeCode === detail.useStatus).typeName
              }}</span>
            </div>
          </van-col>
        </van-row>
      </div>
      <van-collapse v-model="activeNames">
        <van-collapse-item title="附件信息" name="0" icon="description">
          <div v-if="assetFileList.length > 0" class="equipmentDetail-file">
            <div
              v-for="item in assetFileList"
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
                <div class="textOverflow name" style="font-size: 14px">
                  {{ item.name }}
                </div>
                <!-- <div style="padding:0 12px;height: 100%;" @click.stop="deleteFile(item)">
                    <van-icon name="delete-o" color="red" size="20px" />
                  </div> -->
              </div>
            </div>
          </div>
          <div v-else>
            <van-empty
              class="equipmentDetail-notData"
              :image="notDataPng"
              description="暂无数据"
            />
          </div>
        </van-collapse-item>
      </van-collapse>
      <div class="equipmentDetail-btn-box">
        <van-button
          v-if="detail.eqId"
          style="width: 100%"
          type="primary"
          @click.stop="
            $router.push({
              name: 'equipmentDetail',
              params: {
                id: detail.eqId,
              },
            })
          "
        >
          查看检测设备详情
        </van-button>
        <!-- <van-button
            v-else
            style="width: 100%;" type="primary" @click.stop="$router.push({
              name: 'assetDetail',
              params: {
                id: detail.assetId,
              },
            })"
          >
            查看资产设备详情
          </van-button> -->
      </div>
      <div v-if="detail.status !== '10'">
        <div style="border-radius: 4px; overflow: hidden">
          <van-field
            v-model="detail.inventoryUserName"
            label="盘点人"
            readonly
          />
          <van-field
            v-model="detail.inventoryTime"
            label="盘点时间"
            readonly
          />
          <van-field
            v-model="remark"
            label="备注"
            maxlength="50"
            @blur="handleBlur"
          />
          <van-field name="uploader" label="文件上传">
            <template #input>
              <van-uploader :after-read="afterRead" capture="camera" multiple />
            </template>
          </van-field>
        </div>
        <van-collapse v-model="activeNames">
          <van-collapse-item title="已上传文件列表" name="0" icon="description">
            <div v-if="fileList.length > 0" class="equipmentDetail-file">
              <div
                v-for="item in fileList"
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
                  <div class="textOverflow name" style="font-size: 14px">
                    {{ item.name }}
                  </div>
                  <div
                    style="padding: 0 12px; height: 100%"
                    @click.stop="deleteFile(item)"
                  >
                    <van-icon name="delete-o" color="red" size="20px" />
                  </div>
                </div>
              </div>
            </div>
            <div v-else>
              <van-empty
                class="equipmentDetail-notData"
                :image="notDataPng"
                description="暂无数据"
              />
            </div>
          </van-collapse-item>
        </van-collapse>
      </div>
    </div>

    <!-- 查看PDF -->
    <MobileCheckPDF ref="mobileCheckPDFRef" />
  </div>
</template>

<script>
import { mapState } from 'pinia'
import { showImagePreview } from 'vant'
import MobileCheckPDF from '~/views/mobileApp/components/MobileCheckPDF.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { appConfig } from '~/views/mobileApp/provides/config/appConfig'
import { downloadFile } from '~/views/mobileApp/provides/utils/downloadFile'
import { formatDate } from '~/views/mobileApp/provides/utils/formatDate'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppUserStore } from '~/views/mobileApp/store/useUserStore.ts'

export default {
  components: {
    MobileTitleBar,
    MobileCheckPDF,
  },
  data() {
    return {
      notDataPng: new URL(`~/views/mobileApp/assets/notData.png`, import.meta.url).href,
      formatDate,
      detail: {},
      statusMap: {
        10: { label: '待盘点', color: '#555555' },
        20: { label: '正常', color: '#70b407' },
        30: { label: '盘点异常', color: '#d9001b' },
        40: { label: '位置异常', color: '#f59a23' },
      },
      fileList: [],
      assetFileList: [], // 资产附件
      activeNames: ['0'],
      pdfSrc: '',
      filename: '',
      qrKey: '',
      statusDict: [],
      typeDict: [],
      remark: '',
    }
  },
  computed: {
    ...mapState(useAppUserStore, ['userInfo']),
    fileIconBgColor() {
      return appConfig.fileIconBgColor
    },
  },
  async created() {
    this.getStatusDict()
    this.getTypeDict()
    await this.getDetail()
    this.remark = this.detail.remark
    this.qrKey = await this.getQrKey(this.detail.id, 'INVENTORY_REGISTER')
    this.fileList = await this.getHistoryFile(this.qrKey)
    const assetQr = await this.getQrKey(this.detail.assetId, 'ASSET')
    this.assetFileList = await this.getHistoryFile(assetQr)
  },
  methods: {
    async getDetail() {
      const { code, data } = await mRequest.get(
        api.equipmentInventory.devicePageList,
        {
          params: {
            inventoryId: this.$route.query.inventoryId,
          },
        },
      )
      if (code === 20000) {
        this.detail = data.rows.find(item => item.id === this.$route.query.id)
      }
    },
    async getStatusDict() {
      const { data, code } = await mRequest.get(
        'rest/type/getTypesByGroupCode',
        {
          params: { groupCode: 'eqAssetsStatus' },
        },
      )
      if (code === 20000) {
        this.statusDict = data
      }
    },
    async getTypeDict() {
      const { data, code } = await mRequest.get(
        'rest/type/getTypesByGroupCode',
        {
          params: { groupCode: 'eqAssets' },
        },
      )
      if (code === 20000) {
        this.typeDict = data
      }
    },
    async handleBlur() {
      await this.getDetail()
      await mRequest.post(
        api.equipmentInventory.register,
        {
          inventorId: this.$route.query.inventoryId,
          inventoryAssets: [
            {
              id: this.detail.id,
              inventoryUserId: this.detail.inventoryUserId,
              inventoryUserName: this.detail.inventoryUserName,
              inventoryTime: new Date(this.detail.inventoryTime).getTime(),
              status: this.detail.status,
              remark: this.remark,
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )
      // if (code === 20000) {
      //   showSuccessToast('保存成功')
      // }
      this.getDetail()
    },
    async afterRead(files) {
      // 处理多选上传：files可能是单个文件对象或文件数组
      const fileList = Array.isArray(files) ? files : [files]
      const businessId = this.detail.id

      // 批量上传所有文件
      const uploadPromises = fileList.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file.file)
        formData.append('businessId', businessId)
        formData.append('qrKey', this.qrKey)
        formData.append('uploadWay', 'WEBPAGE')
        formData.append('uploader', this.userInfo.userName)

        const { fail } = await mRequest.post(api.common.upload, formData)
        if (fail) {
          throw new Error('上传失败!')
        }
        return file
      })

      try {
        await Promise.all(uploadPromises)
        showSuccessToast(`成功上传 ${fileList.length} 个文件!`)
        this.fileList = await this.getHistoryFile(this.qrKey)
      }
      catch (error) {
        showFailToast(error.message || '上传失败!')
      }
    },
    async deleteFile(row) {
      showConfirmDialog({
        title: '提示',
        message: `确认删除附件: ${row.name}?`,
      })
        .then(async () => {
          // on confirm
          const { code } = await mRequest.delete(
            api.common.deleteAttachmentByKey(
              this.qrKey,
              row.attachmentId,
            ),
            {},
            {
              methods: 'delete',
            },
          )
          if (code === 20000) {
            showSuccessToast('删除成功')
            this.fileList = await this.getHistoryFile(this.qrKey)
          }
        })
        .catch(() => {
          // on cancel
        })
    },
    async getQrKey(id, type) {
      const { code, data } = await mRequest.get(
        api.common.getQrCodeLink(type),
        {
          params: {
            businessId: id,
          },
        },
      )
      if (code !== 20000) {
        return showFailToast(data.msg || data.message || '获取历史附件失败')
      }
      const qrUrl = new URL(data)
      const qrKey = qrUrl.searchParams.get('key')
      return qrKey
    },
    async getHistoryFile(qrKey) {
      const { code: fileCode, data: fileData } = await mRequest.get(
        api.common.getAttachmentByKey(qrKey),
      )
      if (fileCode !== 20000) {
        return showFailToast(
          fileData.msg || fileData.message || '获取历史附件失败',
        )
      }
      if (fileData.length) {
        fileData.forEach((item) => {
          item._fileType = this.getFileType(item.name)
        })
      }
      return fileData
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
    viewPDF() {
      this.$refs.mobileCheckPDFRef.open(this.pdfSrc, this.filename)
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
  },
}
</script>

<style lang="less" scoped>
.equipmentDetail-btn-box {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  z-index: 9;
}
.list {
  padding: 12px;
  padding-bottom: 100px;
  .card {
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
    padding: 12px;
    margin-bottom: 16px;
    background-color: #fff;
    .title {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 12px;
      margin-bottom: 12px;
      .name {
        flex: 1;
        font-weight: 700;
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .status {
        font-size: 12px !important;
        color: #fff;
        border-radius: 4px;
        padding: 0px 8px;
        background-color: #555555;
      }
    }
  }
}
.line {
  display: flex;
  align-items: center;
}
.label {
  display: inline-block;
  color: #888;
  width: 70px !important;
  white-space: nowrap;
}
.filter-row {
  .van-col {
    padding: 10px 0;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #fff;
    border-bottom: solid 1px #f5f5f5;
    color: #777;

    .iconfont {
      margin-right: 4px;
    }
  }
}
</style>

<style lang="less" scoped>
.equipmentDetail-file {
  .equipmentDetail-file-row {
    padding: 8px 0;
    background: #fff;
    border-top: 1px solid #ebedf0;
    display: flex;
    align-items: center;

    &:first-child {
      border-top: 0;
    }

    &::after {
      content: '';
      display: block;
      height: 1px;
      clear: both;
    }
  }

  .equipmentDetail-file-icon {
    float: left;
    width: 46px;
    height: 46px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    overflow: hidden;
    color: #fff;
    margin-right: 4px;
    font-size: 12px;
  }

  .equipmentDetail-file-info {
    overflow: hidden;
    padding-left: 8px;
    flex: 1;
    display: flex;
    align-items: center;
    .name {
      flex: 1;
      margin-right: 8px;
    }
  }
}
.equipmentDetail-notData {
  :deep(.van-empty__image) {
    width: 80px;
    height: auto;
  }
}
.textOverflow {
  word-break: break-all;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  width: 100%;
  flex: 1;
}
</style>
