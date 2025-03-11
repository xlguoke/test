import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import MockAdapter from 'axios-mock-adapter'
import Settings from './Settings.vue'
import Options from './Options.vue'

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
  it('should fetch options', async () => {
    const wrapper = mount(Options, {
      props: {
        id: 'id',
        name: 'OptionGroup',
      },
    })

    await flushPromises()
    expect(wrapper.findAll('[data-test="option-name"]').length).toBe(1)
  })
})

describe('settings', () => {
  it('should react to option changes', async () => {
    const wrapper = mount(Settings, {
      props: {
        catalog: [{ id: 'id', name: 'foobar' }],
      },
    })
    expect(wrapper.text()).toContain('foobar')

    await flushPromises()

    expect(wrapper.find('[data-test="option-changes"]').exists()).toBeFalsy()
    await wrapper.get('[data-test="1"]').setValue('1')
    expect(wrapper.find('[data-test="option-changes"]').exists()).toBeTruthy()
  })
})
