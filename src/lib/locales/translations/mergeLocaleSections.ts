import { notProd } from '../../runtimeEnv';

type RecordLike = Record<string, unknown>;

type MergeSections<T extends ReadonlyArray<RecordLike>> =
  T extends readonly [infer Head, ...infer Tail]
    ? Head &
        MergeSections<
          Tail extends ReadonlyArray<RecordLike> ? Tail : []
        >
    : Record<string, never>;

export function mergeLocaleSections<
  Base extends RecordLike,
  Sections extends ReadonlyArray<RecordLike>,
>(base: Base, ...sections: Sections): Base & MergeSections<Sections> {
  if (notProd()) {
    const seen = new Set(Object.keys(base));
    for (const section of sections) {
      for (const key of Object.keys(section)) {
        if (seen.has(key)) {
          throw new Error(
            `[locales] Duplicate key "${key}" while merging locale sections.`,
          );
        }
        seen.add(key);
      }
    }
  }

  return sections.reduce<RecordLike>(
    (acc, section) => Object.assign(acc, section),
    { ...base },
  ) as Base & MergeSections<Sections>;
}
