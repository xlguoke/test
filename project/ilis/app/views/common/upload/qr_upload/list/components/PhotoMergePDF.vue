<template>
  <div class="h5-page-wrap">
    <a-spin class="m-spinning" :spinning="loading" :tip="spinTip"></a-spin>
    <header class="m-header">
      <LeftOutlined class="route-back" @click="$router.back()" />
      照片管理
    </header>

    <div ref="mContent" class="m-content">
      <p class="m-hint">
        提示：长按照片并拖动可以调整照片排序喔~
      </p>
      <!-- 打开相机 -->
      <input
        ref="cameraEle"
        type="file"
        capture="camera"
        :accept="accept"
        multiple="multiple"
        style="display: none"
        @change="handlePhotoChange"
      />
      <!-- 打开相册 -->
      <input
        ref="photoAlbumEle"
        type="file"
        :accept="accept"
        multiple="multiple"
        style="display: none"
        @change="handlePhotoChange"
      />
      <!-- 无数据 -->
      <div v-if="photos.length === 0" class="no-data">
        <img :src="importImage('h5-no-data.svg')" class="inline-block mb-2" />
        <p>
          暂无照片信息，您可以
          <span class="m-link" @click="$refs.cameraEle.click()">拍照</span>
          或从
          <span class="m-link" @click="$refs.photoAlbumEle.click()">相册导入</span>
        </p>
      </div>
      <!-- 照片列表 -->
      <ul v-else class="photo-list clearfix">
        <li
          v-for="(photo, index) in photos"
          :key="photo.key"
          :data-index="index + 1"
          class="photo-item"
        >
          <img
            :src="photo.url"
            @touchstart="touchstart($event, index)"
            @touchmove.prevent="touchmove($event)"
            @touchend="touchend"
            @touchcancel="touchend"
          />

          <p class="photo-del" @click.stop="photos.splice(index, 1)">
            <DeleteOutlined />
          </p>
        </li>
        <li
          v-show="moveInd !== -1"
          :style="`background-image: url(${moveItem.url});left: ${moveItem.pageX}px;top: ${moveItem.pageY}px;`"
          class="photo-item draggable-box"
        ></li>
      </ul>
    </div>
    <footer class="m-footer">
      <a-button @click="$refs.photoAlbumEle.click()">
        从相册导入
      </a-button>
      <a-button
        type="primary"
        :disabled="photos.length === 0"
        @click="setFileName"
      >
        合成并上传
      </a-button>
    </footer>

    <ht-modal
      v-model:open="visible"
      title="文件命名"
      width="80%"
      class="h5-page-modal"
      @cancel="visible = false"
      @ok="confirmFileName"
    >
      <div class="modal-content">
        <a-form ref="formRef" style="flex: 1" :model="formState">
          <a-form-item
            :rules="[{ required: true, message: '请输入文件名称' }]"
            name="fileName"
          >
            <a-input
              v-model:value="formState.fileName"
              allow-clear
              :max-length="20"
            />
          </a-form-item>
        </a-form>
        <span style="margin-left: 4px; margin-top: 10px">.pdf</span>
      </div>
    </ht-modal>
  </div>
</template>

<script>
import { DeleteOutlined, LeftOutlined } from '@ant-design/icons-vue'
import { jsPDF } from 'jspdf'
import { useVue2MigrationStore } from '~/store/vue2MigrationStore'

let timer = null
let de = 0
export default {
  components: {
    DeleteOutlined,
    LeftOutlined,
  },
  setup() {
    const vue2MigrationStore = useVue2MigrationStore()
    return { vue2MigrationStore }
  },
  data() {
    return {
      accept: 'image/jpg, image/jpeg, image/png, image/bmp',
      types: ['jpg', 'jpeg', 'png', 'bmp'],
      loading: false,
      spinTip: '',
      visible: false,
      formState: {},
      photos: [],
      a4_size: [210, 297], // a4纸大小，单位mm
      margin: 2, // pdf中图片间隔，单位mm
      touchX: 0,
      touchY: 0,
      moveInd: -1,
      moveItem: {},
    }
  },
  created() {
    this.vue2MigrationStore.clearMergeFile()
  },
  methods: {
    importImage(filename) {
      return new URL(`/assets/img/${filename}`, import.meta.url)
    },
    // 选择文件
    async handlePhotoChange(e) {
      const files = e.target.files
      let valid = true
      this.loading = true
      this.spinTip = ''
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const type = this.fileType(file.name)
        if (!this.types.includes(type)) {
          valid = false
          continue
        }
        this.photos.push({
          file,
          type,
          url: window.URL.createObjectURL(file),
          key: Number.parseInt(Math.random() * 1000000000000000),
        })
      }
      this.loading = false
      e.target.value = ''

      if (!valid) {
        window.$oAntdMessage.warning(`只支持上传${this.accept}格式文件`)
      }
    },
    setFileName() {
      this.visible = true
      window.$oNextTick(() => {
        const d = new Date()
        const y = d.getFullYear()
        const m = d.getMonth() + 1
        const dd = d.getDate()
        const h = d.getHours()
        const mm = d.getMinutes()
        const s = d.getSeconds()
        const fileName = `${y}${m < 10 ? `0${m}` : m}${
          dd < 10 ? `0${dd}` : dd
        }${h < 10 ? `0${h}` : h}${mm < 10 ? `0${mm}` : mm}${
          s < 10 ? `0${s}` : s
        }`

        this.formState.fileName = fileName
      })
    },
    // 设置名称
    confirmFileName() {
      this.$refs.formRef.validateFields().then(() => {
        this.visible = false
        this.mergePDF(this.formState.fileName)
      })
    },
    // 将图片合并成pdf
    async mergePDF(fileName) {
      this.loading = true
      this.spinTip = '生成中，请稍后...'
      // eslint-disable-next-line new-cap
      const doc = new jsPDF('p', 'mm', this.a4_size)
      const maxW = this.a4_size[0] - this.margin * 2
      const maxH = this.a4_size[1] - this.margin * 2
      let top = this.margin
      for (let i = 0; i < this.photos.length; i++) {
        try {
          let { url, type } = this.photos[i]
          if (type === 'png') {
            url = await this.pngToJpeg(url)
          }
          const { width, height } = await this.getImgSize(url)
          let left = this.margin
          // 宽度未超出，居中显示
          if (width < maxW) {
            left = (maxW - width) / 2
          }
          // 高度超出，新增一页
          if (i > 0 && height + top > maxH) {
            doc.addPage(this.a4_size)
            top = this.margin
          }
          doc.addImage(url, type, left, top, width, height)
          top += height + this.margin
        }
        catch (err) {
          console.error(`合并文件异常`, err)
        }
      }
      try {
        const pdfName = `${fileName}.pdf`
        // 移动端保存会自动打开pdf，ios会阻断后续流程，故不保存文件
        // await doc.save(pdfName, { returnPromise: true })
        // 获取转成后的pdf文件，转为file对象
        const _blob = doc.output('blob', pdfName)
        const file = new File([_blob], pdfName, { type: _blob.type })
        if (file.size > 50 * 1024 * 1024) {
          window.$oAntdModal.error({
            title: '无法上传',
            content: `[${pdfName}]的文件大小超过限制！`,
            centered: true,
            okText: '确定',
          })
        }
        else {
          window.$oAntdMessage.success('合成成功')
          this.formState = {}
          this.photos = []
          this.vue2MigrationStore.addMergeFile(file)
          this.$router.go(-1)
        }
      }
      catch (err) {
        console.error(err)
      }
      this.loading = false
    },
    // 图片在pdf中展示的大小：最大宽高不超过A4纸宽高
    async getImgSize(url) {
      return new Promise((resolve, reject) => {
        const a4_w = this.a4_size[0] - this.margin * 2
        const a4_h = this.a4_size[1] - this.margin * 2
        const img = new Image()
        img.src = url
        img.onload = () => {
          let w = img.width
          let h = img.height
          const scale = w / h
          if (w > a4_w) {
            w = a4_w
            h = w / scale
          }
          if (h > a4_h) {
            h = a4_h
            w = h * scale
          }
          resolve({
            width: w,
            height: h,
          })
        }
        img.onerror = (error) => {
          reject(error)
        }
      })
    },
    // 文件类型
    fileType(name) {
      return name.split('.').pop().toLowerCase()
    },
    // png格式转jpg格式：该项目中，png格式图片合成后会与后一张图片融合在一起，且合成的pdf文件会很大
    async pngToJpeg(url) {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.setAttribute('crossOrigin', 'anonymous') // 允许跨域获取该图片
        img.crossOrigin = 'Anonymous'
        img.src = url
        img.onload = () => {
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')
          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0, img.width, img.height)
          const jpgUrl = canvas.toDataURL('image/jpeg')
          resolve(jpgUrl)
        }
        img.onerror = () => {
          reject(new Error('图片流异常'))
        }
      })
    },
    // file 转 base64
    async fileToBase64(file) {
      return new Promise((resolve) => {
        const reader = new FileReader()
        reader.readAsDataURL(file)
        reader.onload = () => resolve(reader.result)
        reader.onerror = error => reject(error)
      })
    },
    // 拖拽排序 start
    touchstart(e, ind) {
      const { pageX, pageY } = e.touches[0]
      this.touchX = pageX
      this.touchY = pageY
      timer = setTimeout(() => {
        this.moveInd = ind
        this.moveItem.url = this.photos[ind].url
        this.moveItem.width = e.target.clientWidth
        this.moveItem.height = e.target.clientHeight
        this.setLocation(e)
      }, 300)
      e.preventDefault()
    },
    // 拖拽排序 move
    touchmove(e) {
      const { pageX, pageY } = e.touches[0]
      if (this.touchX === pageX && this.touchY === pageY)
        return
      if (this.moveInd === -1) {
        this.clearMoveData()
        return
      }
      const now = Date.now()
      if (now - de < 1000 / 30)
        return
      de = now
      this.setLocation(e)
    },
    // 拖拽排序 end
    touchend() {
      const scrollTop = this.$refs.mContent.scrollTop
      const { pageX, pageY, width, height } = this.moveItem
      const scrollY = scrollTop + pageY
      const oldPhoto = this.photos[this.moveInd]
      const items = document.querySelectorAll('.photo-item')
      for (let i = 0; i < items.length; i++) {
        const el = items[i]
        const l = el.offsetLeft
        const t = el.offsetTop
        if (
          pageX > l
          && pageX < l + width
          && scrollY > t
          && scrollY < t + height
        ) {
          this.photos.splice(this.moveInd, 1)
          this.photos.splice(i, 0, oldPhoto)
          continue
        }
      }
      this.clearMoveData()
    },
    // 拖拽排序 定位
    setLocation(e) {
      const { pageX, pageY } = e.touches[0]
      this.moveItem.pageX = pageX
      this.moveItem.pageY = pageY
    },
    // 拖拽排序 移除拖拽效果
    clearMoveData() {
      clearTimeout(timer)
      this.isStart = false
      this.moveInd = -1
      this.moveItem = {}
    },
  },
}
</script>

<style lang="less">
.h5-page-wrap {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  font-size: 0.34rem;
  .m-spinning {
    position: absolute;
    top: 0.4rem;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: -1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    background-color: rgba(255, 255, 255, 0.5);
    &.ant-spin-spinning {
      z-index: 1000;
    }
    .ant-spin-dot {
      margin-top: -20%;
      margin-bottom: 10px;
    }
  }
  .m-header {
    position: relative;
    font-size: 0.34rem;
    text-align: center;
    color: #fff;
    background: #0066ec;
    line-height: 0.9rem;
    height: 0.9rem;
    z-index: 1000;
    .route-back {
      position: absolute;
      top: 0.3rem;
      left: 0.32rem;
    }
  }
  .m-content {
    flex: 1;
    height: 0;
    overflow-y: auto;
    .m-hint {
      padding: 0.12rem 0.2rem;
      background-color: #ffe9e9;
      font-size: 0.24rem;
    }
  }
  .m-footer {
    display: flex;
    justify-content: space-between;
    padding: 0.2rem 0.4rem;
    border-top: 1px solid #dcdcdc;
    .ant-btn {
      padding: 0.04rem 0.18rem;
      height: 0.7rem;
      font-size: 0.28rem;
      border-radius: 0.04rem;
      min-width: 28vw;

      &.ant-btn-primary:not(:disabled) {
        background-color: #0066ec;
      }

      .anticon {
        font-size: 0.3rem;
        vertical-align: middle;
      }
    }
  }
  .m-link {
    color: #0066ec;
  }
}
.no-data {
  padding-top: 20%;
  text-align: center;
  color: #999;
  user-select: none;
  font-size: 0.28rem;
  img {
    margin-bottom: 0.2rem;
    width: 40%;
    height: auto;
  }
}
.photo-list {
  padding: 10px 0 10px 4%;
  .photo-item {
    position: relative;
    display: block;
    margin: 0.1rem 2%;
    float: left;
    width: 28%;
    height: 2.2rem;
    border-radius: 0.08rem;
    overflow: hidden;
    border: 1px solid #ddd;
    // 阻止ios上长按选中内容效果
    -webkit-user-select: none;
    user-select: none;
    -webkit-touch-callout: none;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    &::before {
      content: attr(data-index);
      position: absolute;
      left: 0.1rem;
      top: 0.1rem;
      width: 0.5rem;
      line-height: 0.3rem;
      text-align: center;
      background-color: rgba(0, 0, 0, 0.5);
      color: #fff;
      font-size: 0.24rem;
      border-radius: 0.04rem;
    }
    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .photo-del {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      padding: 0.1rem 0;
      line-height: 0.2rem;
      background-color: rgba(0, 0, 0, 0.3);
      text-align: center;
      color: red;
      font-size: 0.32rem;
    }
  }
  .draggable-box {
    position: absolute;
    opacity: 0.8;
    z-index: 100;
    transform: translate(-56%, -54%);
    box-shadow: 0 0 16px 6px rgba(0, 0, 0, 0.3);
    background-color: #eee;
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
  }
}
.modal-content {
  padding: 0.2rem 0.3rem;
  display: flex;
  min-height: 2rem;
  font-size: 0.32rem;
  .ant-input {
    height: 0.6rem;
    font-size: 0.32rem !important;
  }
  .ant-form-item {
    margin-bottom: 0;
  }
  .ant-form-explain {
    margin-top: 2px;
  }
  .anticon{
    font-size: 0.18rem;
  }
}
.h5-page-modal {
  font-size: 0.32rem;
  .custom-modal-head{
    padding: 0.2rem 0.3rem;
    font-size: 0.3rem;
  }
  .anticon-close{
    font-size: 0.3rem;
  }
  .ant-modal-close{
    top: 0.24rem;
    width: 0.3rem;
    height: 0.3rem;
  }
  .ant-modal-footer{
    .ant-btn{
      padding: 0 0.24rem;
      height: 0.7rem;
      font-size: 0.28rem;
      border-radius: 0.04rem;
    }
  }
}
</style>
