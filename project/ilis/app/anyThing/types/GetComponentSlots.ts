/** # 从组件类型中提取 slots 类型 */
export type GetComponentSlots<T> = T extends {
  $slots: infer S
} ? S : object
