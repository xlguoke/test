export class UhbError extends Error {
  constructor(message?: string) {
    super(message)
    if (Error.captureStackTrace)
      Error.captureStackTrace(this, UhbError)
  }
}

/**
 * the message of the error should not be trusted
 *
 * meaning that end user may see a message in a different language
 */
export class ILisRestResponseError extends UhbError {
  constructor(message: string, public code: number) {
    super(message)
  }
}

export class InvalidTokenError extends UhbError {}
