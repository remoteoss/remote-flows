// Fields that Tiger accepts but doesn't save, because of a bug on Tiger's side.
// The canary skips them when it compares what it sent with what Tiger returns, so a
// known Tiger bug doesn't fail the run. Entries are grouped by country, and each value
// says what the bug is. Once Tiger fixes the bug, the canary fails and asks you to
// remove the entry.
export const KNOWN_UNSAVED_FIELDS: Record<string, Record<string, string>> = {};
