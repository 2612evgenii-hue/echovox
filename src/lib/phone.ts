/** Russian mobile phone — matches client & server validation. */
export const RU_PHONE_REGEX =
  /^(\+7|7|8)?[\s-]?\(?[489][0-9]{2}\)?[\s-]?[0-9]{3}[\s-]?[0-9]{2}[\s-]?[0-9]{2}$/

export function isValidRuPhone(value: string) {
  return RU_PHONE_REGEX.test(value.trim())
}
