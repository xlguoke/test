<template>
  <div class="samplesSelect-wrap">
    <van-sticky>
      <MobileTitleBar title="现场取样" left-arrow @click-left="$router.go(-1)">
      </MobileTitleBar>
    </van-sticky>
    <div class="samplesSelect-content">
      <div v-if="cacheList.length > 0" class="samplesSelect-cache">
        <div v-for="(item, index) in cacheList" :key="index">
          <van-icon
            name="delete-o"
            size="24"
            style="float: right"
            color="red"
            @click="deleteCache"
          />
          <van-icon
            name="edit"
            size="24"
            color="#154bd0"
            style="float: right; margin-right: 8px"
            @click="
              samplesSelect(item.parent, undefined, item, undefined, true)
            "
          />
          上次未提交：{{ item.sampleDisplayName }}
        </div>
      </div>

      <div
        v-for="(item, index) in samplesSelectList"
        :key="index"
        class="samplesSelect-box"
      >
        <div class="samplesSelect-title">
          {{ item.name }}
        </div>
        <ul v-if="item.children" class="samplesSelect-list">
          <li
            v-for="(row, rowIndex) in item.children"
            :key="rowIndex"
            class="samplesSelect-item"
            :class="{ active: activeValue === row.id }"
            @click.stop="samplesSelect(item, index, row, rowIndex)"
          >
            <div class="samplesSelect-icon" :style="{ background: row.color }">
              {{ firstStr(row.sampleDisplayName) }}
            </div>
            <div class="samplesSelect-name">
              {{ row.sampleDisplayName }}
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { mapWritableState } from 'pinia'
import {
  showConfirmDialog,
  showDialog,
} from 'vant'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import { api } from '~/views/mobileApp/provides/api/api'
import { mRequest } from '~/views/mobileApp/provides/utils/mRequest'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'
import { useSampleStore } from '~/views/mobileApp/store/useSampleStore'

export default {
  components: {
    MobileTitleBar,
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
      colorArr: [
        '#C280FF',
        '#FF3399',
        '#0079FE',
        '#70B603',
        '#FFB00B',
        '#027DB4',
        '#FF5D65',
        '#7377E3',
        '#079784',
        '#FF7360',
        '#E3027B',
        '#F1880F',
        '#B66E5F',
        '#0079FE',
        '#70B603',
        '#FFB00B',
        '#EA5D6E',
        '#868096',
      ],
      samplesSelectList: [],
      activeName: '',
      activeLabel: '',
      activeId: '',
      activeValue: '',
      cacheList: [],
    }
  },
  computed: {
    ...mapWritableState(useSampleStore, ['sampleInfo']),
  },
  created() {
    // let samplesId = sessionStorage.getItem("samplesId");
    // let samplesName = sessionStorage.getItem("samplesName");
    // let samplesValue = sessionStorage.getItem("samplesValue");
    // let samplesLabel = sessionStorage.getItem("samplesLabel");
    const query = this.$route.query
    const samplesName = query.name ? query.name : ''
    const samplesLabel = query.label ? query.label : ''
    const samplesId = query.id ? query.id : ''
    const samplesValue = query.value ? query.value : ''
    this.activeName = samplesName || ''
    this.activeLabel = samplesLabel || ''
    this.activeId = samplesId || ''
    this.activeValue = samplesValue || ''
    this.getSampleCategoryList()
    this.getCacheData()
  },
  methods: {
    firstStr(val) {
      switch (val) {
        case undefined:
        case null:
        case 'undefined':
        case 'null':
        case '':
          return ''
        case '...':
        case '。。。':
          return '...'
        default: {
          const str = typeof val === 'string' ? val : JSON.stringify(val)
          const arr = str.split('')
          return arr[0]
        }
      }
    },
    getCacheData() {
      let extractedSampleCacheData = localStorage.getItem(
        'extractedSampleCacheData',
      )

      if (extractedSampleCacheData) {
        try {
          extractedSampleCacheData = JSON.parse(extractedSampleCacheData)
          const categorySampleInfo = extractedSampleCacheData.categorySampleInfo
          this.cacheList = [
            {
              ...categorySampleInfo,
            },
          ]
        }
        catch (e) {
          console.warn(e)
          this.cacheList = []
        }
      }
      else {
        this.cacheList = []
      }
    },
    deleteCache() {
      showConfirmDialog({
        title: '提示',
        message: '确认删除缓存的填写数据？',
      }).then(() => {
        localStorage.removeItem('extractedSampleCacheData')
        this.getCacheData()
      })
    },
    // 读取缓存
    loadDataByCache() {
      let extractedSampleCacheData = localStorage.getItem(
        'extractedSampleCacheData',
      )
      if (extractedSampleCacheData) {
        try {
          extractedSampleCacheData = JSON.parse(extractedSampleCacheData)
          const {
            fieldSampling,
            bidSection,
            categorySampleInfo,
            witnessInfo,
            barcodeIdList,
            otherInfos,
            specificationList,
            sampleNum_num,
            sampleNum_unit,
            delegatesNum_num,
            delegatesNum_unit,
            attachmentsList,
            proofsList,
            witnessList,
            buildWitnessList,
            perjectInfo,
          } = extractedSampleCacheData

          this.sampleInfo = {
            fieldSampling,
            bidSection,
            categorySampleInfo,
            witnessInfo,
            barcodeIdList,
            otherInfos,
            specificationList,
            sampleNum_num,
            sampleNum_unit,
            delegatesNum_num,
            delegatesNum_unit,
            attachmentsList,
            proofsList,
            witnessList,
            buildWitnessList,
            perjectInfo,
          }
          sessionStorage.setItem('otherInfosCache', JSON.stringify(otherInfos))
        }
        catch (e) {
          console.warn(e)
          showDialog({ message: '缓存数据出错，系统无法载入上次填写的数据' })
        }
      }
    },
    samplesSelect(item, index, row, rowIndex, isCache) {
      const arr = [
        this.activeName,
        this.activeLabel,
        this.activeId,
        this.activeValue,
      ]
      const samplesObj = {
        ...row,
        categoryName: item.name,
        categoryId: item.id,
        sampleCategoryId: row.id,
        parent: {
          id: item.id,
          isDeleted: item.isDeleted,
          name: item.name,
          orderNum: item.orderNum,
        },
      }

      sessionStorage.setItem('samplesRow', JSON.stringify(samplesObj))

      if (isCache) {
        this.loadDataByCache()
      }

      if (!isCache && !arr.some(i => i)) {
        this.sampleInfo = {}
      }

      if (arr.some(i => i)) {
        this.$router.go(-1)
        this.$router.replace({
          name: 'fieldSampling',
          query: {
            id: item.id,
            name: item.name,
            value: row.id,
            label: row.sampleDisplayNmae || row.sampleName,
          },
        })
      }
      else {
        this.$router.push({
          name: 'fieldSampling',
          query: {
            id: item.id,
            name: item.name,
            value: row.id,
            label: row.sampleDisplayNmae || row.sampleName,
          },
        })
      }
    },
    getSampleCategoryList() {
      this.samplesSelectList = []
      const toast = showLoadingToast({
        duration: 0,
        message: '加载中...',
        forbidClick: true,
      })
      mRequest
        .get(api.samples.sampleCategoryTree)
        .then((res) => {
          toast && toast.close()
          if (res.code === 20000) {
            const arr = res.data ? res.data : []
            let start = 0
            arr.forEach((item) => {
              item.children && item.children.forEach((i) => {
                // console.log(start);
                i.color = this.colorArr[start % this.colorArr.length]
                start += 1
              })
            })
            this.samplesSelectList = arr
            // let allArr = [];
            // this.samplesSelectList = arr.map((i) => {
            //   i.list = [];
            //   allArr.push(this.getCategorySysSampleList(i));
            //   return i;
            // });
            // Promise.all(allArr)
            //   .then((r) => {
            //     console.log(this.samplesSelectList);
            //     toast && toast.close();
            //   })
            //   .catch((_) => {
            //     toast && toast.close();
            //   });
          }
          else {
            toast && toast.close()
            showDialog({ message: '获取信息失败！' })
          }
        })
        .catch((_) => {
          console.warn(_)
        })
    },
    async getCategorySysSampleList(row) {
      await mRequest
        .get(api.samples.categorySysSampleList, {
          params: {
            categoryId: row.id,
          },
        })
        .then((res) => {
          if (res.code === 20000) {
            row.list = res.data ? res.data : []
            return true
          }
          else {
            showDialog({ message: '获取信息失败！' })
            return false
          }
        })
        .catch((_) => {
          return false
        })
    },
  },
}
</script>

<style lang="less" scoped>
@import url('./index.less');
</style>
