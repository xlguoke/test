<template>
  <div>
    <van-loading v-if="!dataURL" type="spinner" />
    <img v-if="dataURL" :src="dataURL" />
    <div v-else ref="sjkjc" class="sjkjc">
      <div class="sjkjc-wrap">
        <div class="sjkjc-title">
          样品标识
        </div>
        <table class="sjkjc-table">
          <tbody>
            <tr>
              <td class="sjkjc-table-label" style="padding-top: 0">
                样品名称：
              </td>
              <td
                class="sjkjc-table-val sjkjc-table-val-title"
                colspan="3"
                style="padding-top: 0"
              >
                <span>{{ dataSource['样品名称'] }}</span>
              </td>
            </tr>
            <tr>
              <td class="sjkjc-table-label">
                样品编号：
              </td>
              <td class="sjkjc-table-val">
                <span>{{ dataSource['样品编号'] }}</span>
              </td>
              <td class="sjkjc-table-code" colspan="2" rowspan="3">
                <div ref="qrCode"></div>
              </td>
            </tr>
            <tr>
              <td class="sjkjc-table-label">
                规格型号：
              </td>
              <td class="sjkjc-table-val">
                <span>{{ dataSource['规格型号'] }}</span>
              </td>
            </tr>
            <tr>
              <td class="sjkjc-table-label">
                收样日期：
              </td>
              <td class="sjkjc-table-val">
                <span>{{ dataSource['收样日期'] }}</span>
              </td>
            </tr>
            <tr>
              <td colspan="4">
                <div>
                  <span
                    :class="`sjkjc-table-checkbox ${
                      dataSource['样品状态'] === '待检' ? 'active' : ''
                    }`"
                  ></span>待检
                  <span
                    :class="`sjkjc-table-checkbox ${
                      dataSource['样品状态'] === '在检' ? 'active' : ''
                    }`"
                    style="margin-left: 15px"
                  ></span>在检
                </div>
                <div>
                  <span
                    :class="`sjkjc-table-checkbox ${
                      dataSource['样品状态'] === '已检' ? 'active' : ''
                    }`"
                  ></span>已检
                  <span
                    :class="`sjkjc-table-checkbox ${
                      dataSource['样品状态'] === '留样' ? 'active' : ''
                    }`"
                    style="margin-left: 15px"
                  ></span>留样
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import QRCode from 'qrcodejs2'

export default {
  props: ['dataSource'],
  data() {
    return {
      dataURL: null,
      imageData: null,
      canvas: null,
      sampleStatus: ['待检', '在检', '已检', '留样'],
    }
  },

  watch: {
    dataSource: {
      handler(obj) {
        if (obj && obj.isRender === true) {
          this.init()
        }
      },
      deep: true,
    },
  },

  mounted() {
    if (this.dataSource && this.dataSource.isRender === true) {
      this.init()
    }
  },

  methods: {
    async init() {
      await this.getQRCode(this.dataSource['样品标签二维码'])
      this.getDataURLByHtml()
    },
    getDataURLByHtml() {
      const ele = this.$refs.sjkjc
      html2canvas(ele, {
        width: ele.clientWidth,
        height: ele.clientHeight,
        scrollY: 0,
        scrollX: 0,
        useCORS: true,
      }).then((canvas) => {
        const width = canvas.width
        const height = canvas.height
        const ctx = canvas.getContext('2d')
        this.imageData = ctx.getImageData(0, 0, width, height)
        this.dataURL = canvas.toDataURL('image/png')
      })
    },
    getDataURL() {
      return this.dataURL
    },
    getImageData() {
      return this.imageData
    },
    async getQRCode(text) {
      await new QRCode(this.$refs.qrCode, {
        width: 140,
        height: 140,
        colorDark: '#000000',
        colorLight: '#ffffff',
        text,
      })
    },
  },
}
</script>

<style lang="less" scoped>
.sjkjc {
  padding: 4px;
  box-sizing: border-box;
  width: 320px;
  height: 228px;
  background: #fff;
  position: fixed;
  bottom: -10000px;
  left: -10000px;
  .sjkjc-wrap {
    border: solid 1px #666;
    padding: 4px;
    color: #000;
    height: 100%;
  }

  .sjkjc-title {
    text-align: center;
    padding-bottom: 4px;
    font-size: 18px;
  }

  .sjkjc-table {
    height: 150px;
    font-size: 13px;

    td {
      padding-top: 10px;
      font-family: '宋体';

      div,
      span {
        font-family: '宋体';
      }
    }

    .sjkjc-table-label {
      white-space: nowrap;
      width: 20%;
      font-size: 13px;
      vertical-align: bottom;
    }

    .sjkjc-table-val {
      line-height: 12px;
      width: 30%;
      vertical-align: middle;
      position: relative;
      font-size: 12px;
      word-break: break-all;
      left: -5px;

      &::after {
        content: '';
        display: block;
        position: absolute;
        bottom: 2px;
        left: 0;
        height: 1px;
        background: #000;
        width: 98%;
        z-index: 10;
      }

      span {
        position: absolute;
        bottom: 5px;
        transform: scale(0.75);
        line-height: 3.2vw;
        left: -8px;
        display: inline-block;
        width: 100%;
      }
    }

    .sjkjc-table-val-title {
      font-size: 13px;

      span {
        transform: scale(1);
        left: 0;
      }
    }

    .sjkjc-table-code {
      vertical-align: bottom;
      position: relative;

      div {
        position: absolute;
        left: 0;
        top: 8px;
      }

      img {
        width: 140px;
        height: 140px;
      }
    }

    .sjkjc-table-checkbox {
      width: 12px;
      height: 12px;
      display: inline-block;
      border: solid 1px #000;
      vertical-align: middle;
      margin-bottom: 4px;
      margin-right: 3px;
      position: relative;

      &.active {
        &::after {
          content: '√';
          position: absolute;
          top: 0;
          left: -2px;
          line-height: 12px;
          font-size: 14px;
        }
      }
    }
  }
}
</style>
