export interface TokenSigner {
  sign(payload: Record<string, unknown>): string
  verify(token: string): Record<string, unknown>
}
