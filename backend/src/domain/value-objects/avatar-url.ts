export class AvatarUrl {
  readonly value: string

  constructor(input: string) {
    this.value = AvatarUrl.validate(input)
  }

  private static validate(input: string): string {
    const url = input.trim()

    if (!url) throw new Error('Avatar URL cannot be empty.')

    if (url.length > 500) throw new Error('Avatar URL must be at most 500 characters.')

    const isAbsoluteUrl = /^https?:\/\/.+/.test(url)
    const isRelativePath = url.startsWith('/')

    if (!isAbsoluteUrl && !isRelativePath) {
      throw new Error('Avatar URL must be an absolute URL (http/https) or a relative path starting with /.')
    }

    return url
  }
}
