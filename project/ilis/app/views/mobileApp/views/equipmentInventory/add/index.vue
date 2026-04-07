<template>
  <div>
    <van-sticky>
      <MobileTitleBar
        class="left-title"
        title="新增盘点单"
        left-arrow
        @click-left="$router.go(-1)"
      >
      </MobileTitleBar>
    </van-sticky>
    <van-collapse v-model="activeNames">
      <van-collapse-item title="基本信息" name="1">
        <van-field
          v-model="formData.a"
          name="validator"
          label="盘点单号"
          readonly
        />
        <van-field
          v-model="formData.b"
          name="validator"
          label="盘点单名称"
          placeholder="请输入盘点单名称"
        />
        <van-field
          v-model="formData.personsName"
          label="盘点人"
          placeholder="请选择盘点人"
          readonly
        >
          <template #button>
            <van-button @click="openSelectPerson">
              选择
            </van-button>
          </template>
        </van-field>

        <FormItemDate
          v-model:value="formData.testDate"
          label="盘点日期"
          placeholder="请选择盘点日期"
        />
      </van-collapse-item>
      <van-collapse-item title="检查内容" name="2">
        <!-- 设备列表 -->
        <div class="device_list">
          <van-cell
            v-for="item in selDevice"
            :key="item.id"
            is-link
            @click="
              $router.push({
                name: 'equipmentDetail',
                params: {
                  id: item.id,
                },
              })
            "
          >
            <template #title>
              <div style="font-weight: 600">
                {{ item.name }}
              </div>
              <div>
                {{ item.archiveSn }}
              </div>
            </template>
          </van-cell>
        </div>

        <div class="add_but">
          <van-icon
            class="add_but_icon"
            name="add"
            @click="selectEquipmentVisible = true"
          />
        </div>
      </van-collapse-item>
    </van-collapse>
    <div class="footer">
      <van-button type="primary" style="flex: 1" @click="submit">
        确认
      </van-button>
      <van-button style="flex: 1" @click="$router.back()">
        取消
      </van-button>
    </div>

    <!-- 选择人员组件 -->
    <SelectPerson
      ref="SelectPerson"
      v-model:value="selectPersonVisible"
      @selected-ok="getPerson"
    />
    <!-- 选择设备组件 -->
    <SelectEquipment
      v-model:value="selectEquipmentVisible"
      :is-multiple="true"
      @selected-ok="getDevice"
    />
  </div>
</template>

<script>
import FormItemDate from '~/views/mobileApp/components/MobileFormItem/FormItemDate.vue'
import MobileTitleBar from '~/views/mobileApp/components/MobileTitleBar.vue'
import SelectEquipment from '~/views/mobileApp/components/selectEquipment.vue'
import SelectPerson from '~/views/mobileApp/components/selectPerson.vue'
import { useAppPageStateStore } from '~/views/mobileApp/store/useAppPageStateStore'

export default {
  components: {
    FormItemDate,
    SelectPerson,
    SelectEquipment,
    MobileTitleBar,
  },
  beforeRouteLeave(to, from, next) {
    const pageState = useAppPageStateStore().getPage(to.name)
    pageState.resetPage = this.isResetPage
    next()
  },

  data() {
    return {
      formData: {},
      selectPersonVisible: false,
      selectEquipmentVisible: false,
      activeNames: ['1', '2'],
      selDevice: [],
      isResetPage: false,
    }
  },

  methods: {
    openSelectPerson() {
      this.selectPersonVisible = true
      this.$refs.SelectPerson.selectType('checkbox')
    },
    getPerson(data) {
      if (data && data.length) {
        this.formData.personsName = data[0].name
        this.formData.personsId = data[0].id
      }
    },
    getDevice(data) {
      if (data && data.length) {
        this.selDevice = data
      }
    },
    submit() {
      this.isResetPage = true
    },
  },
}
</script>

<style lang="less" scoped>
.add_but {
  text-align: center;
  padding: 10px 0;
  .add_but_icon {
    font-size: 55px;
    color: #154bd0;
  }
}
.footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px;
  background-color: #fff;
  display: flex;
  gap: 12px;
}
:deep(.van-collapse-item__content) {
  padding: unset;
}
</style>
