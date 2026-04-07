import type { UnwrapRef } from 'vue'

/**
 * 该hooks处理值的改变，避免页面中过多定义值和改变值的代码，主要用于弹窗，其他简单数据的赋值也可以
 * 用法，通过解构来命名变量：
 * const [visible1, setVisible1] = useStateHooks(false);
 * const [visible2, setVisible2] = useStateHooks(false);
 */
export function useStateHooks<T>(defaultValue?: T): [Ref<UnwrapRef<T>>, (value: T) => void] {
  const state = ref(defaultValue as T)

  const setState = (value: any) => {
    state.value = value
  }

  return [state, setState]
}
