<template>
  <div>
    <ht-modal
      v-model:open="_value"
      :title="modalTitle"
      :mask-closable="false"
      :width="modalWidth"
      :centered="true"
      @ok="handleSubmit"
      @cancel="cancelModal"
    >
      <a-spin :spinning="spinning">
        <div class="spin-content coordinate">
          <div
            class="coordinate-left"
            :style="{
              width: `${containerConfig.width}px`,
              height: `${containerConfig.height}px`,
            }"
          >
            <img
              v-if="sealStampFilePath"
              ref="sealImg"
              :src="sealStampFilePath"
              :style="{
                width: `${dataObj.viewWidth}px`,
                height: `${dataObj.viewHeight}px`,
                left: `${dataObj.viewLocationX}px`,
                top: `${dataObj.viewLocationY}px`,
              }"
            />
          </div>
          <div class="coordinate-right">
            <div class="coordinate-form">
              <div class="coordinate-form-item">
                <label>宽：</label>
                <a-input-number
                  v-model:value="dataObj.width"
                  :min="0"
                  :max="9999"
                  @change="setImgSize('width')"
                />
              </div>
              <div class="coordinate-form-lock">
                <LockFilled
                  v-if="imgLockRatio"
                  @click="onSwitchLock(false)"
                />
                <UnlockFilled
                  v-else
                  @click="onSwitchLock(true)"
                />
              </div>
              <div class="coordinate-form-item">
                <label>高：</label>
                <a-input-number
                  v-model:value="dataObj.height"
                  :min="0"
                  :max="9999"
                  @change="setImgSize('height')"
                />
              </div>
            </div>
            <p style="color: red; margin: 8px 0">
              注意：电子签章长宽为固定值，如需调整请联系管理员
            </p>
            <div class="coordinate-form">
              <div class="coordinate-form-item">
                <label>X：</label>
                <a-input-number
                  v-model:value="dataObj.locationX"
                  :min="0"
                  :max="Math.floor(PDF_WIDTH - dataObj.width)"
                  @change="setImgPosition('locationX')"
                />
              </div>
              <div class="coordinate-form-lock"></div>
              <div class="coordinate-form-item">
                <label>Y：</label>
                <a-input-number
                  v-model:value="dataObj.locationY"
                  :min="0"
                  :max="Math.floor(PDF_HEIGHT - dataObj.height)"
                  @change="setImgPosition('locationY')"
                />
              </div>
            </div>
            <p style="color: red; margin: 8px 0">
              注意：坐标原点为左下角；图片原点为左下角
            </p>
            <ComHeader style="margin-top: 16px">
              坐标设置
            </ComHeader>
            <div style="margin-top: 16px">
              <a-checkbox
                v-model:checked="dataObj.autoSort"
                @change="onChangeAutoSort"
              >
                印章横向位置随其他印章依次排序
              </a-checkbox>
            </div>
            <div
              v-if="dataObj.autoSort"
              class="coordinate-form"
              style="margin-top: 16px"
            >
              <div class="coordinate-form-item">
                <label style="width: 60px">偏移值：</label>
                <a-input-number
                  v-model:value="dataObj.offset"
                  :min="-9999"
                  :max="9999"
                />
              </div>
            </div>
            <div style="margin-top: 16px">
              <a-checkbox
                v-model:checked="dataObj.followText"
                @change="onChangeFollowText"
              >
                印章纵向位置跟随页面内容
              </a-checkbox>
            </div>
            <div
              v-if="dataObj.followText"
              class="coordinate-form"
              style="margin-top: 16px"
            >
              <div class="coordinate-form-item">
                <label style="width: 60px">偏移值：</label>
                <a-input-number
                  v-model:value="dataObj.offset"
                  :min="-9999"
                  :max="9999"
                />
              </div>
            </div>
          </div>
        </div>
      </a-spin>
    </ht-modal>
  </div>
</template>

<script>
import { LockFilled, UnlockFilled } from '@ant-design/icons-vue'
import ComHeader from '~/providers/components/comHeader/index.vue'
import { SealService } from '~/providers/providers/services/common-body-seal'
import { $emit } from '~/providers/transformUtils/gogocodeTransfer'

const sealService = new SealService()

export default {
  components: {
    ComHeader,
    LockFilled,
    UnlockFilled,
  },
  props: ['value', 'versionData', 'seal', 'locationType'],
  emits: ['update:value', 'on-save'],
  data() {
    return {
      spinning: false,
      dataObj: {},
      imgLockRatio: null,
    }
  },
  computed: {
    _value() {
      return this.value
    },
    modalWidth() {
      if (this.locationType === 'horizontal') {
        return '880px'
      }
      else {
        return '720px'
      }
    },
    modalTitle() {
      const { locationType, seal } = this
      const title = []

      if (locationType === 'horizontal') {
        title.push('横向坐标')
      }
      else {
        title.push('纵向坐标')
      }

      if (seal && seal.name) {
        title.push(`（${seal.name}）`)
      }

      return title.join('')
    },
    PDF_WIDTH() {
      if (this.locationType === 'horizontal') {
        return 842
      }
      else {
        return 595
      }
    },
    PDF_HEIGHT() {
      if (this.locationType === 'horizontal') {
        return 595
      }
      else {
        return 842
      }
    },
    sealStampFilePath() {
      if (this.versionData) {
        return this.versionData.sealStampFilePath
      }
      else {
        return null
      }
    },
    sealZoomRatio() {
      const { containerConfig, locationType } = this

      if (locationType === 'horizontal') {
        return containerConfig.width / this.PDF_WIDTH
      }
      else {
        return containerConfig.height / this.PDF_HEIGHT
      }
    },
    containerConfig() {
      if (this.locationType === 'horizontal') {
        return {
          width: 520,
          height: 367,
        }
      }
      else {
        return {
          height: 520,
          width: 367,
        }
      }
    },
    location() {
      const { versionData, locationType } = this

      if (versionData) {
        if (locationType === 'horizontal') {
          return versionData.horizontalLocation
        }
        else {
          return versionData.verticalLocation
        }
      }
      else {
        return {}
      }
    },
    maxX() {
      return Math.ceil(this.containerConfig.width - this.dataObj.viewWidth)
    },
    maxY() {
      return Math.ceil(this.containerConfig.height - this.dataObj.viewHeight)
    },
  },
  watch: {
    value(val) {
      if (val === true) {
        const { containerConfig } = this
        const dataObj = { ...this.location }
        dataObj.viewWidth = dataObj.width * this.sealZoomRatio
        dataObj.viewHeight = dataObj.height * this.sealZoomRatio
        dataObj.viewLocationX = dataObj.locationX * this.sealZoomRatio
        dataObj.viewLocationY
          = containerConfig.height
            - (dataObj.height + dataObj.locationY) * this.sealZoomRatio
        this.dataObj = dataObj
        this.imgLockRatio = null

        window.$oNextTick(() => {
          this.bindDrag()
        })
      }
    },
  },
  methods: {
    onSwitchLock(lock) {
      const { dataObj } = this

      if (lock === true) {
        this.imgLockRatio = dataObj.width / dataObj.height
      }
      else {
        this.imgLockRatio = null
      }
    },
    onChangeAutoSort() {
      if (this.dataObj.autoSort === true) {
        this.dataObj.followText = false
      }
    },
    onChangeFollowText() {
      if (this.dataObj.followText === true) {
        this.dataObj.autoSort = false
      }
    },
    setImgSize(type) {
      const { dataObj, sealZoomRatio, imgLockRatio } = this

      if (imgLockRatio) {
        if (type === 'width') {
          this.dataObj.height = Math.floor(dataObj.width / imgLockRatio)
        }

        if (type === 'height') {
          this.dataObj.width = Math.floor(dataObj.height * imgLockRatio)
        }
      }

      this.dataObj.viewWidth = dataObj.width * sealZoomRatio
      this.dataObj.viewHeight = dataObj.height * sealZoomRatio
    },
    setImgPosition(key) {
      const { dataObj, sealZoomRatio, containerConfig } = this

      if (key === 'locationX') {
        this.dataObj.viewLocationX = dataObj.locationX * sealZoomRatio
      }
      else {
        this.dataObj.viewLocationY
          = containerConfig.height
            - (dataObj.height + dataObj.locationY) * this.sealZoomRatio
      }
    },
    bindDrag() {
      const el = this.$refs.sealImg

      el.onmousedown = (e) => {
        e.stopPropagation()
        e.preventDefault()

        const { sealZoomRatio, containerConfig } = this

        const startX = e.clientX - el.offsetLeft
        const startY = e.clientY - el.offsetTop
        const maxX = this.maxX
        const maxY = this.maxY

        document.onmousemove = (e) => {
          let endX = e.clientX - startX
          let endY = e.clientY - startY

          if (endX <= 0) {
            endX = 0
          }

          if (endY <= 0) {
            endY = 0
          }

          if (endX >= maxX) {
            endX = maxX
          }

          if (endY >= maxY) {
            endY = maxY
          }

          this.dataObj.viewLocationX = Math.floor(endX)
          this.dataObj.viewLocationY = Math.floor(endY)
          this.dataObj.locationX = Math.ceil(
            this.dataObj.viewLocationX / sealZoomRatio,
          )
          this.dataObj.locationY = Math.ceil(
            (containerConfig.height
              - this.dataObj.viewLocationY
              - this.dataObj.viewHeight)
            / sealZoomRatio,
          )

          // 矫正最大值
          if (this.dataObj.locationX > this.PDF_WIDTH - this.dataObj.width) {
            this.dataObj.locationX = this.PDF_WIDTH - this.dataObj.width
          }

          if (this.dataObj.locationY > this.PDF_HEIGHT - this.dataObj.height) {
            this.dataObj.locationY = this.PDF_HEIGHT - this.dataObj.height
          }
        }

        document.onmouseup = () => {
          document.onmousemove = null
          document.onmouseup = null
        }
      }
    },
    cancelModal() {
      $emit(this, 'update:value', false)
    },
    async handleSubmit() {
      this.spinning = true

      const formData = { ...this.dataObj }

      const res = await sealService.updateSealLocation(formData).finally(() => {
        this.spinning = false
      })

      if (res.code !== 20010) {
        this.cancelModal()
        $emit(this, 'on-save')
      }
    },
  },
}
</script>

<style lang="less" scoped>
.coordinate {
  display: flex;
  .coordinate-left {
    width: 520px;
    height: 367px;
    border: solid 1px #e2e2e2;
    position: relative;

    img {
      max-width: 100%;
      max-height: 100%;
      position: absolute;
    }
  }

  .coordinate-right {
    flex: 1;
    padding-left: 16px;
  }

  .coordinate-form {
    display: flex;
    align-items: center;

    .coordinate-form-lock {
      width: 24px;

      i {
        font-size: 16px;
        vertical-align: middle;
      }
    }

    .coordinate-form-item {
      flex: 1;
      display: flex;
      align-items: center;

      .ant-input-number {
        width: 80px;
      }

      label {
        display: inline-block;
        width: 38px;
        text-align: right;

        &::before {
          content: '*';
          color: red;
          margin-right: 2px;
        }
      }
    }
  }
}
</style>
