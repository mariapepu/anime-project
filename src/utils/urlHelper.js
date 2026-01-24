/**
 * Builds a full video URL from a path and a base URL.
 * If the path is already a full URL (starts with http/https), it returns it as-is.
 * Otherwise, it concatenates the base URL and the path.
 * 
 * @param {string} path - The video path or full URL
 * @param {string} baseUrl - The base host URL (e.g., https://xyz.trycloudflare.com)
 * @returns {string} - The resolved full URL
 */
export const buildVideoUrl = (path, baseUrl) => {
    if (!path) return '';

    // If it's already a full URL, return it
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    if (!baseUrl) return path;

    // Remove trailing slash from baseUrl if it exists
    const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

    // Ensure path starts with a slash if it doesn't already
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return `${cleanBase}${cleanPath}`;
};
