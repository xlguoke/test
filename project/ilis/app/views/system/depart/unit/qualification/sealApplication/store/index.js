import * as Vuex from 'vuex'
import authStore from '~/providers/config/store'

const state = {
  count: 1,
  applyTypes: [
    {
      label: '设备出库',
      value: '设备出库',
    },
    {
      label: '设备流转',
      value: '设备流转',
    },
    {
      label: '设备归还',
      value: '设备归还',
    },
  ],
  // 调拨状态 40:"已安装", 50: "已移交"
  ALLOT_STATUS: { 10: '闲置中', 20: '调拨中', 30: '使用中' },
  // 申领状态
  APPLY_STATUS: { '00': '待选取', '10': '审核中', '20': '待邮寄', '30': '待确认' },
}

const getters = {
  applyTypes: state => state.applyTypes,
  ALLOT_STATUS: state => state.ALLOT_STATUS,
  APPLY_STATUS: state => state.APPLY_STATUS,
}

const mutations = {
  add(state) {
    state.count = state.count + 1
  },
}

const actions = {
  add2(context) {
    context.commit('add')
  },
}

export default Vuex.createStore({
  state: {
    ...state,
    ...authStore.state,
  },
  getters: {
    ...getters,
    ...authStore.getters,
  },
  mutations: {
    ...mutations,
    ...authStore.mutations,
  },
  actions: {
    ...actions,
    ...authStore.actions,
  },
})
