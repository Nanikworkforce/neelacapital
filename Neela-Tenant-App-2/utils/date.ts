/**
 * Format a date as MM/DD/YYYY.
 * Accepts Date, date-only (YYYY-MM-DD), or full ISO strings (…T…Z).
 */
export function formatDateMMDDYYYY(value: Date | string | null | undefined): string {
  if (value == null || value === '') return '';

  if (typeof value === 'string') {
    // Date-only — avoid UTC timezone shifting the calendar day
    const dateOnly = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dateOnly) {
      return `${dateOnly[2]}/${dateOnly[3]}/${dateOnly[1]}`;
    }
    // ISO datetime — take calendar parts from the parsed local time
    const iso = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})T/);
    if (iso) {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
      }
      return `${iso[2]}/${iso[3]}/${iso[1]}`;
    }
  }

  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return String(value);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
}

/**
 * Format date + time for activity / ticket timestamps.
 * Example: 09/02/2026 1:36 PM
 */
export function formatDateTime(value: Date | string | null | undefined): string {
  if (value == null || value === '') return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return formatDateMMDDYYYY(value);

  // Date-only strings: no useful time — show date only
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return formatDateMMDDYYYY(value);
  }

  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${formatDateMMDDYYYY(date)} ${displayHours}:${minutes} ${ampm}`;
}

/**
 * Human-readable relative time for activity feeds (e.g. "5m ago", "Yesterday").
 * Future or invalid dates fall back to MM/DD/YYYY — never negative "Xm ago".
 */
export function formatRelativeTimeAgo(value: Date | string | null | undefined): string {
  if (value == null) return '';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return '';

  const diffMs = Date.now() - date.getTime();
  if (diffMs < 0) {
    return formatDateMMDDYYYY(date);
  }

  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return formatDateMMDDYYYY(date);
}
