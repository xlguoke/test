import { flushPromises, mount } from '@vue/test-utils'
import MockAdapter from 'axios-mock-adapter'
import { beforeEach, describe, expect, it } from 'vitest'
import Options from './Options.vue'
import Settings from './Settings.vue'

const mock = new MockAdapter(ilisAxios)

mock.onGet()
  .reply(200, [
    {
      id: '1',
      type: 'text',
      name: 'Text Option',
      disabled: false,
    },
  ])

describe('dynamic options', () => {
  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
  })

  it('should fetch options', async () => {
    const wrapper = mount(Options, {
      props: {
        id: 'id',
        name: 'OptionGroup',
      },
    })

    // useSettingOptions 中加了防抖导致执行延迟，无法立即获取到数据
    await new Promise(resolve => setTimeout(resolve, 500))
    await flushPromises()

    expect(wrapper.findAll('[data-test="option-name"]').length).toBe(1)
  })
})

describe('settings', () => {
  beforeEach(() => {
    const pinia = createPinia()
    setActivePinia(pinia)
  })

  it('should react to option changes', async () => {
    const wrapper = mount(Settings, {
      props: {
        catalog: [{ id: 'id', name: 'foobar' }],
      },
    })
    expect(wrapper.text()).toContain('foobar')

    await new Promise(resolve => setTimeout(resolve, 500))
    await flushPromises()

    expect(wrapper.find('[data-test="option-changes"]').exists()).toBeFalsy()
    await wrapper.get('[data-test="1"]').setValue('1')
    expect(wrapper.find('[data-test="option-changes"]').exists()).toBeTruthy()
  })
})
