import { platformId, platformVersion } from 'custodian'

describe('the cordova instance', () => {
  it('returns either "android" or "browser" from platformId()', () => {
    expect(platformId()).toMatch(/android|browser/)
  })

  it('shouldn\'t returns "unknown" about the platform version', () => {
    expect(platformVersion()).not.toBe('unknown')
  })
})
