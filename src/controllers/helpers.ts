export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const ISO_DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

//0 and false are valid values, so only null/undefined/'' count as missing
export const isMissing = (value: unknown): boolean =>
  value === undefined || value === null || value === '';
