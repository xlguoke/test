/**
 * The version of the Cordova platform
 */
export type Version = string

/**
 * The ID of the Cordova platform
 */
export type PlatformID = string

/**
 * Get the version of the Cordova platform
 */
export function platformVersion(): Version {
  return cordova?.version || 'unknown'
}

/**
 * Get the ID of the Cordova platform which is the name of the operating system
 */
export function platformId(): PlatformID {
  return cordova?.platformId || 'unknown'
}
