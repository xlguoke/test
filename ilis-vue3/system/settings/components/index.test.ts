import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { Checkbox, Number, Select, Switch, Text } from './index'

function $$(className: string) {
  return document.body.querySelectorAll<HTMLElement>(className)
}

describe('setting option components', () => {
  let wrapper
  it('should render text option', async () => {
    wrapper = mount(Text, {
      props: {
        type: 'text',
        id: 'setting0',
        name: 'Setting0',
        description: 'A setting option with input',
        disabled: false,
      },
    })
    expect(wrapper.get('[data-test="option-name"]').text()).toBe('Setting0')
    expect(wrapper.get('[data-test="option-desc"]').text()).toBe('A setting option with input')
    expect(wrapper.get('input').attributes()).not.toHaveProperty('disabled')

    await wrapper.get('input').setValue('Brown fox')
    const emitted = wrapper.emitted('optionChange')
    expect(emitted?.length).toEqual(1)
    expect(emitted?.[0]).toEqual(['setting0', 'Brown fox', undefined])
  })

  it('should render checkbox option', async () => {
    wrapper = mount(Checkbox, {
      props: {
        type: 'checkbox',
        id: 'setting1',
        name: 'Setting1',
        value: 'N',
        description: 'A setting option with checkbox',
        disabled: false,
      },
    })

    expect(wrapper.get('[data-test="option-name"]').text()).toBe('Setting1')
    expect(wrapper.get('[data-test="option-desc"]').text()).toBe('A setting option with checkbox')
    expect(wrapper.get('input').attributes()).not.toHaveProperty('disabled')
    expect(wrapper.get('input').element.checked).toBe(false)
    await wrapper.get('input').setValue(true)
    const emitted = wrapper.emitted('optionChange')
    expect(emitted?.length).toEqual(1)
    expect(emitted?.[0]).toEqual(['setting1', 'Y', 'N'])
  })

  it('should render switch option', async () => {
    wrapper = mount(Switch, {
      props: {
        type: 'switch',
        id: 'setting2',
        name: 'Setting2',
        value: 'N',
        description: 'A setting option with switch',
        disabled: false,
      },
    })

    expect(wrapper.get('[data-test="option-name"]').text()).toBe('Setting2')
    expect(wrapper.get('[data-test="option-desc"]').text()).toBe('A setting option with switch')
    expect(wrapper.find('.ant-switch-inner').text()).toBe('开启关闭')
    await wrapper.find('.ant-switch').trigger('click')
    const emitted = wrapper.emitted('optionChange')
    expect(emitted?.length).toEqual(1)
    expect(emitted?.[0]).toEqual(['setting2', 'Y', 'N'])
  })

  it('should render number option', async () => {
    wrapper = mount(Number, {
      props: {
        type: 'number',
        id: 'setting3',
        name: 'Setting3',
        value: '3',
        description: 'A setting option with number',
        disabled: false,
      },
    })

    expect(wrapper.get('[data-test="option-name"]').text()).toBe('Setting3')
    expect(wrapper.get('[data-test="option-desc"]').text()).toBe('A setting option with number')
    expect(wrapper.get('input').element.value).toBe('3')
    await wrapper.get('input').setValue(5)
    const emitted = wrapper.emitted('optionChange')
    expect(emitted?.length).toEqual(1)
    expect(emitted?.[0]).toEqual(['setting3', 5, '3'])
  })

  it('should render select option', async () => {
    wrapper = mount(Select, {
      props: {
        type: 'select',
        id: 'setting4',
        name: 'Setting4',
        value: '3',
        payload: [
          { label: 'Option1', value: '1' },
          { label: 'Option2', value: '2' },
          { label: 'Option3', value: '3' },
        ],
        description: 'A setting option with select',
        disabled: false,
      },
    })

    expect(wrapper.get('[data-test="option-name"]').text()).toBe('Setting4')
    expect(wrapper.get('[data-test="option-desc"]').text()).toBe('A setting option with select')
    expect(wrapper.find('.ant-select-selection-item').text()).toBe('Option3')

    wrapper.find('.ant-select-selector').element.dispatchEvent(new MouseEvent('mousedown'))
    await nextTick()
    const options = $$('.ant-select-item-option')
    expect(options.length).toBe(3)

    options[1].click()
    const emitted = wrapper.emitted('optionChange')
    expect(emitted?.length).toEqual(1)
    expect(emitted?.[0]).toEqual(['setting4', '2', '3'])
  })
})
