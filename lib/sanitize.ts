/**
 * Input Sanitization Utility
 * Prevents NoSQL injection by removing dangerous operators
 */

export function sanitizeInput(input: any): any {
    if (typeof input === 'string') {
        // Remove potential MongoDB operators from strings
        return input.replace(/^\$/, '');
    }

    if (Array.isArray(input)) {
        return input.map(sanitizeInput);
    }

    if (input && typeof input === 'object') {
        const sanitized: any = {};
        for (const key in input) {
            // Skip keys that start with $ (MongoDB operators)
            if (!key.startsWith('$')) {
                sanitized[key] = sanitizeInput(input[key]);
            }
        }
        return sanitized;
    }

    return input;
}

/**
 * Sanitize query parameters from URLs
 */
export function sanitizeQueryParams(searchParams: URLSearchParams): Record<string, string> {
    const sanitized: Record<string, string> = {};

    for (const [key, value] of searchParams.entries()) {
        // Only allow alphanumeric keys and safe values
        const safeKey = key.replace(/[^a-zA-Z0-9_]/g, '');
        const safeValue = value.replace(/[\$\{\}\.]/g, ''); // Remove MongoDB operators

        if (safeKey && safeValue) {
            sanitized[safeKey] = safeValue;
        }
    }

    return sanitized;
}

/**
 * Validate and sanitize ObjectId
 */
export function isValidObjectId(id: string): boolean {
    return /^[0-9a-fA-F]{24}$/.test(id);
}

/**
 * Escape HTML to prevent XSS
 */
export function escapeHtml(unsafe: string): string {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Remove null bytes (can cause issues in some contexts)
 */
export function removeNullBytes(str: string): string {
    return str.replace(/\0/g, '');
}
