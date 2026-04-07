<template>
  <div>
    <div class="preViewPdf">
      <div class="preViewPdf-wrap">
        <iframe
          id="pdfPreview"
          style="width: 100%; height: 100%"
          src=""
          frameborder="0"
        ></iframe>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Viewport',
  metaInfo: {
    meta: [
      {
        ele: null,
        name: 'viewport',
        content:
          'width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=2,user-scalable=yes',
      },
    ],
  },
  components: {},
  data() {
    return {
      src: window.decodeURIComponent(this.$route.query.src),
      filename: window.decodeURIComponent(this.$route.query.filename),
      htmlSrc: `/ilis2/plug-in/pdfjs-mobile/pdfjs/web/viewer.html`,
    }
  },
  mounted() {
    this.ele = document.getElementById('pdfPreview')
    top.pdfviewback = this.onCancel

    this.init()
  },
  methods: {
    init() {
      this.ele.src = `${this.htmlSrc}?file=${this.src}&filename=${this.filename}#page=1'`
    },
    onCancel() {
      this.$router.go(-1)
    },
  },
}
</script>

<style lang="less" scoped>
.preViewPdf {
  #pdfPreview {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1000;
  }
}
</style>
