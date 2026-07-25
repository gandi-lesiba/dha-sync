/**
 * Frontend mirror of the backend's role_required() decorators.
 * Auditor and BorderOfficial are read-only: the API rejects their writes with
 * 403, so the UI hides write controls rather than offering actions that fail.
 */

export const WRITE_ROLES = ["officer", "supervisor", "admin"];

/** True if the role may create/update/delete cases and documents. */
export function canWrite(role) {
  return WRITE_ROLES.includes(role);
}
