/**
 * SQL expression for the current instant in the ISO-8601 UTC format used by
 * the schema defaults of `created_at` and `updated_at`.
 */
export const SQL_NOW = "strftime('%Y-%m-%dT%H:%M:%fZ', 'now')";
