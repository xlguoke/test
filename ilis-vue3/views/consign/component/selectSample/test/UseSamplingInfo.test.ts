import { beforeAll, describe, expect, it, vi } from 'vitest'
import { config, mount } from '@vue/test-utils'
import { UseSamplingInfo } from '~/views/consign/component/selectSample/modules/UseSamplingInfo.ts'
import SamplingInfo from '~/views/consign/component/selectSample/components/SamplingInfo.vue'

describe('useSamplingInfo data and view', () => {
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

  // init class
  const useSamplingInfo = new UseSamplingInfo()
  useSamplingInfo.setDataField('samplingPerson', 'Test samplingPerson')
  useSamplingInfo.setDataField('samplingCompany', 'Test samplingCompany')
  useSamplingInfo.setDataField('samplingPersonNumber', 'Test samplingPersonNumber')
  useSamplingInfo.setDataField('samplingPlace', 'Test samplingPlace')

  // data test
  it('should value correctly', () => {
    expect(useSamplingInfo.data.samplingPerson).toBe('Test samplingPerson')
    expect(useSamplingInfo.data.samplingCompany).toBe('Test samplingCompany')
    expect(useSamplingInfo.data.samplingPersonNumber).toBe('Test samplingPersonNumber')
    expect(useSamplingInfo.data.samplingPlace).toBe('Test samplingPlace')
  })

  it('should bind data correctly', async () => {
    config.global.provide.useSamplingInfo = useSamplingInfo
    const wrapper = mount(SamplingInfo)

    // test inject useSamplingInfo bind view
    expect(wrapper.find('#form_item_samplingPerson').element.value).toBe('Test samplingPerson')
    expect(wrapper.find('#form_item_samplingCompany').element.value).toBe('Test samplingCompany')
    expect(wrapper.find('#form_item_samplingPersonNumber').element.value).toBe('Test samplingPersonNumber')
    expect(wrapper.find('#form_item_samplingPlace').element.value).toBe('Test samplingPlace')

    // test view bind useSamplingInfo
    wrapper.find('#form_item_samplingPerson').setValue('Test change samplingPerson')
    await wrapper.find('#form_item_samplingPerson').trigger('input')
    expect(useSamplingInfo.data.samplingPerson).toBe('Test change samplingPerson')

    wrapper.find('#form_item_samplingCompany').setValue('Test change samplingCompany')
    await wrapper.find('#form_item_samplingCompany').trigger('input')
    expect(useSamplingInfo.data.samplingCompany).toBe('Test change samplingCompany')

    wrapper.find('#form_item_samplingPersonNumber').setValue('Test change samplingPersonNumber')
    await wrapper.find('#form_item_samplingPersonNumber').trigger('input')
    expect(useSamplingInfo.data.samplingPersonNumber).toBe('Test change samplingPersonNumber')

    wrapper.find('#form_item_samplingPlace').setValue('Test change samplingPlace')
    await wrapper.find('#form_item_samplingPlace').trigger('input')
    expect(useSamplingInfo.data.samplingPlace).toBe('Test change samplingPlace')
  })
})
