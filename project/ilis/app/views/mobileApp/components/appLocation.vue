<template>
  <div @click.stop="getAddress">
    <template v-if="loading">
      <div
        class="flex items-center van-loading van-loading--spinner van-button__loading"
      >
        地点定位中
        <van-loading type="spinner" color="#1989fa" class="ml-2" />
      </div>
    </template>
    <template v-else>
      {{ address }}<van-icon size="18" class-prefix="iconfont" name="dingwei" />
    </template>
  </div>
</template>

<script>
import { InAndroid } from '../provides/utils/referrer'

export default {
  props: {
    value: {
      type: [Array, String, Number, Boolean],
      default: null,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:value'],
  data() {
    return {
      address: '',
      loading: false,
    }
  },
  computed: {},
  watch: {
    value(val) {
      this.address = val
    },
  },
  mounted() {
    // 扩展API加载完毕后调用onPlusReady回调函数
    document.addEventListener('plusready', () => {}, false)
    if (this.value) {
      this.address = this.value
    }
    else {
      this.getAddress()
    }
  },
  methods: {
    getLocation() {
      // eslint-disable-next-line ts/no-this-alias
      const that = this
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            // alert("成功获取您的地理信息");
            // 获取经度维度信息
            // coords属性
            const latitude = position.coords.latitude
            const longitude = position.coords.longitude
            that.geoToAddress(longitude, latitude)
          },
          () => {
            this.getLatlng()
          },
        )
      }
      else {
        this.getLatlng()
      }
    },
    getLatlng() {
      // eslint-disable-next-line ts/no-this-alias
      const that = this
      const geolocation = new BMap.Geolocation()
      geolocation.getCurrentPosition(
        function (r) {
          if (this.getStatus() === BMAP_STATUS_SUCCESS) {
            const mylng = r.point.lng // 经度
            const mylat = r.point.lat // 纬度
            // let gpsPoint = new BMap.Point(mylng, mylng);
            // new BMap.Convertor().translate([gpsPoint], 3, 5, (point) => {
            //   that.geoToAddress(point.points[0].lng, point.points[0].lat);
            // });
            that.geoToAddress(mylng, mylat)
          }
          else {
            that.loading = false
            that.address = '地点定位失败'
            that.$emit('update:value', that.address)
            // eslint-disable-next-line no-alert
            alert(`failed${this.getStatus()}`)
          }
        },
        { enableHighAccuracy: true },
      )
    },
    getAddress() {
      if (this.disabled) {
        return
      }
      this.loading = true
      if (InAndroid) {
        // eslint-disable-next-line ts/no-this-alias
        const that = this
        plus.geolocation.getCurrentPosition(
          (p) => {
            const gpsPoint = new BMap.Point(
              p.coords.longitude,
              p.coords.latitude,
            )
            new BMap.Convertor().translate([gpsPoint], 3, 5, (point) => {
              that.geoToAddress(point.points[0].lng, point.points[0].lat)
            })
          },
          (e) => {
            that.loading = false
            that.address = '地点定位失败'
            that.$emit('update:value', that.address)
            let str = ''
            const strArr = ['No', 'location', 'providers', 'availble']
            if (strArr.filter(i => e.message.includes(i)).length > 2) {
              str = '：请打开手机定位'
            }
            // eslint-disable-next-line no-alert
            alert(`地点定位失败${str}`)
          },
        )
      }
      else {
        this.getLocation()
      }
    },
    geoToAddress(lng, lat) {
      // eslint-disable-next-line ts/no-this-alias
      const that = this
      const point = new BMap.Point(lng, lat)
      const geoc = new BMap.Geocoder()
      geoc.getLocation(point, (rs) => {
        const address = rs.address
        const business = rs.business ? rs.business.split(',').join('') : ''
        const addComp = rs.addressComponents
        const arr = [
          addComp.province,
          addComp.city,
          addComp.district,
          addComp.street,
          addComp.streetNumber,
        ]
        let str = ''
        if (address && business) {
          str = address + business
        }
        else {
          str = arr.filter(i => i).join('')
        }
        that.loading = false
        that.address = str
        that.$emit('update:value', that.address)
      })
    },
  },
}
</script>
