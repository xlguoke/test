import { getRequirements } from '~/views/consign/component/selectSample/api.ts'

class RequirementsEntity {
  text = ''
  images: string[] = []
}

/** 收样要求 */
export function useSampleRequirement() {
  const requirements = ref<RequirementsEntity>()

  const images = computed(() => requirements.value ? requirements.value.images : [])

  function initRequirements(sampleId?: string, testItemIds?: string) {
    if (!sampleId) {
      requirements.value = undefined
      return
    }

    getRequirements({
      sampleId,
      testItemIds,
    }).then((res) => {
      const result = new RequirementsEntity()
      const content = res.data
      const regex = /<img[^>]*>/g
      const imgTags = content.match(regex) || []

      result.images = imgTags
      result.text = content.replace(regex, '')

      requirements.value = result
    })
  }

  function checkRequirementImage(str: string) {
    const imageSrcPattern = /<img\s[^>]*src=["']([^"']+)["']/i
    const match = str.match(imageSrcPattern)

    if (match) {
      const url = match[1]
      const wWidth = window.screen.width
      const hHeight = window.screen.height
      window.open(url, url, `height=800, width=800, top=${hHeight / 2 - 400}, left=${wWidth / 2 - 400}`)
    }
  }

  return { requirements, images, initRequirements, checkRequirementImage }
}
