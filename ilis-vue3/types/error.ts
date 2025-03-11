export class ILISError extends Error {

}

export class ILISHTTPError extends ILISError {
  constructor(message: string, public code?: number) {
    super(message)
  }
}
