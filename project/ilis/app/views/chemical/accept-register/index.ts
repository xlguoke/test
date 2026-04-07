import Main from './Main.vue'

export default Main

export {
  AcceptRegisterEntity,
  AcceptRegisterItemEntity,
  AcceptRegisterQueryEntity,
} from './AcceptRegisterEntity'

export {
  createAcceptRegister,
  getAcceptRegisterDetail,
  getAcceptRegisterPage,
  revokeAcceptRegister,
  submitAcceptRegister,
  updateAcceptRegister,
  verifyAcceptRegister,
} from './api'
