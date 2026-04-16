const NSFW_KEYWORDS = [
  'adult',
  'nsfw',
  'xxx',
  'porn',
  'sex',
  'nude',
  'lingerie',
  'erotic',
]

function containsKeyword(value: string) {
  const normalized = value.toLowerCase()
  return NSFW_KEYWORDS.some((keyword) => normalized.includes(keyword))
}

export function isLikelyNsfwText(...values: Array<string | null | undefined>) {
  return values.some((value) => (value ? containsKeyword(value) : false))
}
