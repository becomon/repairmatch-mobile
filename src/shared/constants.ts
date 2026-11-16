/** Limits and sizes shared by several features. Anything used by one feature lives with that feature. */

/** Shortest description the AI structuring and the publish form accept. */
export const MIN_DESCRIPTION_CHARS = 10;
/** Shortest text worth sending to a search endpoint. */
export const MIN_SEARCH_CHARS = 3;
export const MAX_DESCRIPTION_CHARS = 5000;
export const MAX_SEARCH_CHARS = 300;
export const MAX_NAME_CHARS = 100;

/** Photos a client can attach while publishing. */
export const MAX_PHOTOS = 5;
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;

/** Rows per page in every paginated list (the API allows up to `API_MAX_PAGE_SIZE`). */
export const LIST_PAGE_SIZE = 10;
export const API_MAX_PAGE_SIZE = 100;
/** Cards shown in the "recent" blocks of the client home. */
export const HOME_PREVIEW_COUNT = 3;
export const AI_SEARCH_PAGE_SIZE = 20;

export const API_TIMEOUT_MS = 30_000;
export const UPLOAD_TIMEOUT_MS = 60_000;
/** How long a request fetched for a card is reused by other cards. */
export const REQUEST_CACHE_TTL_MS = 15_000;

export const SEARCH_DEBOUNCE_MS = 400;
export const AI_SEARCH_DEBOUNCE_MS = 450;
