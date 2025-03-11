import { useAxios } from '@vueuse/integrations/useAxios'
import type { Ref } from 'vue'
import type { Option } from './Options.vue'

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
  watchEffect(async () => {
    const url = await `rest/system/settings/${id.value}/options`
    await execute(url)
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
