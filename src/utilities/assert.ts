export function isString(
  value: unknown,
  options?: { allowEmpty?: boolean },
): value is string {
  const allowEmpty = options?.allowEmpty ?? false;

  if (typeof value !== "string") return false;
  if (!allowEmpty && value === "") return false;
  return true;
}

export function isNumber(value: unknown): value is number {
  if (typeof value !== "number") return false;
  return true;
}
