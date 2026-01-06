export type DataAttributeMap = Record<string, string>;

export const dataAttributesHelper = (
  prefix: string,
  attributes: DataAttributeMap,
): Record<string, string> =>
  Object.fromEntries(
    Object.entries(attributes).map(([key, value]) => [
      `data-${prefix}-${key}`,
      value,
    ]),
  );
