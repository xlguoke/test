import Vue from 'vue'
import Vuex from 'vuex'
import userAuth from "@/lib/userAuth";

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    userLaboratoryID: userAuth.getUserLaboratoryID(),
    pageStyleKey: localStorage.getItem("pageStyleKey") || 2,
    tableStyleKey: 2
  },
  getters: {
  },
  mutations: {
    loginout(state) {
      userAuth.removeUserLaboratoryID();
      state.userLaboratoryID = null;
    },
    SET_PAGE_STYLE(state, key) {
      state.pageStyleKey = key;
      localStorage.setItem("pageStyleKey", key)
    },
    SET_TABLE_STYLE(state, key) {
      state.tableStyleKey = key;
    },
  },
  actions: {
  },
  modules: {
  }
})
