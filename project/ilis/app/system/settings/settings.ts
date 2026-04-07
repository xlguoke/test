import type { Ref } from 'vue'
import type { Option } from './Options.vue'
import { useAxios } from '@vueuse/integrations/useAxios'
// 防抖函数实现
function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      func.apply(this, args)
    }, wait)
  }
}

export function useSettingOptions(id: Ref<string>) {
  const { data, execute, isLoading, error } = useAxios<Option[]>(ilisAxios)
  /**
   * `watchEffect` has more succinct syntax than `watch` and it can track all the reactive dependencies.
   *
   * Thus, `useAxios`'s internal reactive state will also be tracked.
   *
   * If we put external reactive states like `useAxios` in the first `await` tick in the async callback of `watchEffect`,
   * it will cause an infinite loop.
   */

  // 使用防抖函数延迟请求执行，避免频繁切换时发送过多请求
  const debouncedFetch = debounce(async (id: string) => {
    const url = `rest/system/settings/${id}/options`
    try {
      await execute(url)
    }
    catch (err) {
      console.error('Request failed:', err)
    }
  }, 300) // 300ms 的防抖延迟

  watchEffect(async () => {
    debouncedFetch(id.value)
  })

  return {
    options: data,
    isLoading,
    error,
  }
}

export function clearUdrTemplateCache() {
  return ilisAxios.get<{ msg: string }>('udrController.do?refreshTemplate')
}

export function saveChanges(changes: { [key: string]: any }) {
  return ilisAxios.post('rest/system/settings/options', changes)
}
