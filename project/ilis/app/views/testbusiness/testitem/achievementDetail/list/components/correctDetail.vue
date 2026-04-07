<!-- eslint-disable vue/require-v-for-key -->
<template>
  <div>
    <a-table
      :columns="columns"
      :data-source="data"
      bordered
      :pagination="false"
      row-key="id"
      :row-class-name="rowClassName"
    >
      <template #bodyCell="{ column, record, text }">
        <template v-if="column.dataIndex === 'isRecovered'">
          <a-switch
            checked-children="已修正"
            un-checked-children="未修正"
            :checked="record.isRecovered"
          />
        </template>
        <template v-if="column.dataIndex === 'description'">
          <span>{{ text }}</span>
        </template>
        <template v-if="column.dataIndex === 'severity'">
          <span>{{ text }}</span>
        </template>
        <template v-if="column.dataIndex === 'processProblemFileVos'">
          <div v-for="fileItem in record.processProblemFileVos">
            <span v-if="isImg(fileItem.name)">
              <img :src="fileItem.fileUrl" style="width: 56px; height: 56px" />
            </span>
            <span v-else> {{ fileItem.name }} </span>
          </div>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script>
const columns = [
  {
    title: '问题描述',
    dataIndex: 'description',
    width: '15%',
  },
  {
    title: '问题类型',
    dataIndex: 'severity',
    width: '20%',
  },
  {
    title: '问题截图',
    dataIndex: 'processProblemFileVos',
    width: '15%',
  },
  {
    title: '提出人',
    dataIndex: 'createName',
    width: '10%',
  },
  {
    title: '修正情况',
    dataIndex: 'isRecovered',
    width: '15%',
  },
  {
    title: '修正人',
    dataIndex: 'amendUserName',
    width: '10%',
  },
]
export default {
  components: {},
  props: ['processInstanceId', 'changeSpinning'],
  data() {
    return {
      data: [],
      columns,
    }
  },
  watch: {},
  created() {},
  methods: {
    rowClassName(record, index) {
      let className = 'light-row'
      if (index % 2 === 1)
        className = 'dark-row'
      return className
    },
    getData(params) {
      this.changeSpinning && this.changeSpinning(true)
      window.$oAjax
        .get(window.$oApi.auditProcessRelation.auditProcessList, {
          params: {
            page: -1,
            size: -1,
            processInstanceId: params || this.processInstanceId,
          },
          headers: {
            'X-Requested-With': 'XMLHttpRequest',
          },
        })
        .then((res) => {
          if (res && res.data) {
            this.data = res.data
          }
          else {
            window.$oAntdModal.warning(window.$oMsgTips.info(res.message || res.msg))
          }

          this.changeSpinning && this.changeSpinning(false)
        })
        .catch((err) => {
          window.$oAntdModal.warning(window.$oMsgTips.info(err))

          this.changeSpinning && this.changeSpinning(false)
        })
    },
    isImg(fileName) {
      // 后缀获取
      let suffix = ''
      // 获取类型结果
      let result = ''
      try {
        const flieArr = fileName.split('.')
        suffix = flieArr[flieArr.length - 1]
      }
      // eslint-disable-next-line unused-imports/no-unused-vars
      catch (err) {
        suffix = ''
      }
      // fileName无后缀返回 false
      if (!suffix) {
        return false
      }
      suffix = suffix.toLocaleLowerCase()
      // 图片格式
      const imglist = ['png', 'jpg', 'jpeg', 'bmp', 'gif']
      // 进行图片匹配
      result = imglist.find(item => item === suffix)
      if (result) {
        // return 'image';
        return true
      }
      else {
        return false
      }
    },
  },
}
</script>

<style scoped></style>
