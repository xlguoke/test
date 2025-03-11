import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { AUDIT_STATUS, VIDEO_TYPE } from '../'
import ListSearch from './ListSearch.vue'

function $$antSelectOption(id: string) {
  return document.querySelector(`#form_item_${id}_list + div`)?.querySelectorAll<HTMLElement>('.ant-select-item-option')
}

describe('listSearch', () => {
  beforeAll(() => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })
  })

  it('search pending list', async () => {
    const wrapper = mount(ListSearch, {
      props: {
        status: 'pending',
      },
    })

    const vm = wrapper.vm as any

    expect(vm.form.queryType).toBe(true)
    expect(wrapper.findAll('[data-test="status"]').length).toBe(0)
    expect(wrapper.findAll('[placeholder="审核日期"]').length).toBe(0)
    expect(wrapper.findAll('[data-test="reviewer"]').length).toBe(0)

    wrapper.find('.ant-select-selector').element.dispatchEvent(new MouseEvent('mousedown'))
    await nextTick()
    const options: any = $$antSelectOption('videoType')
    await options[0].click()

    wrapper.get('[data-test="quickQryParam"]').setValue('1')
    wrapper.get('[data-test="reportNumber"]').setValue('no.1')

    vm.handleSearch()
    const form = wrapper.emitted('search')
    expect(form).toBeTruthy()
    expect(form?.[0][0]).toEqual({
      videoType: VIDEO_TYPE.SAMPLE_IN,
      queryType: true,
      quickQryParam: '1',
      reportNumber: 'no.1',
    })

    // 重置
    wrapper.get('[data-test="resetBtn"]').trigger('click')
    await nextTick()
    expect((wrapper.vm as any).form).toEqual({
      queryType: true,
      applicationDate: undefined,
      quickQryParam: undefined,
      reportNumber: undefined,
      videoType: undefined,
    })
  })

  it('search done list', async () => {
    const wrapper = mount(ListSearch, {
      props: {
        status: 'done',
      },
    })
    const vm = wrapper.vm as any

    expect(vm.form.queryType).toBe(false)
    expect(wrapper.findAll('[data-test="status"]').length).toBe(1)
    expect(wrapper.findAll('[placeholder="审核日期"]').length).toBe(2)
    expect(wrapper.findAll('[data-test="reviewer"]').length).toBe(1)

    const selector = wrapper.findAll('.ant-select-selector')
    expect(selector.length).toBe(2)

    // selector[0].element.dispatchEvent(new MouseEvent('mousedown'))
    // await nextTick()
    // const options: any = $$antSelectOption('videoType')
    // await options[0].click()

    selector[1].element.dispatchEvent(new MouseEvent('mousedown'))
    await nextTick()
    const options1: any = $$antSelectOption('status')
    await options1[0].click()

    wrapper.get('[data-test="quickQryParam"]').setValue('111')
    wrapper.get('[data-test="reportNumber"]').setValue('no.2')
    wrapper.get('[data-test="reviewer"]').setValue('222')

    vm.handleSearch()
    const form = wrapper.emitted('search')
    expect(form).toBeTruthy()
    expect(form?.[0][0]).toEqual({
      // videoType: VIDEO_TYPE.SAMPLE_IN,
      status: AUDIT_STATUS.PASS,
      queryType: false,
      quickQryParam: '111',
      reportNumber: 'no.2',
      reviewer: '222',
    })
  })
})
