export { default as ResetPassword } from './components/ResetPassword.vue'

export const UserAccountTypeDict = [
  { label: '业务类账户', value: 1 },
  { label: '管理类账户', value: 2 },
  { label: '模板受限账户', value: 5 },
  { label: 'OA类用户', value: 8 },
]

export enum UserAccountType {
  业务类账户 = 1,
  管理类账户 = 2,
  模板受限账户 = 5,
  OA类用户 = 8,
}
