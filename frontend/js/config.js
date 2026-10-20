/**
 * QueueFlow Frontend Configuration
 * ============================================================================
 * Configuration for frontend-to-backend API communication across environments.
 *
 * HOW TO CONFIGURE:
 * 1. Local Development:
 *    When running on http://localhost or http://127.0.0.1, the application
 *    automatically defaults to 'http://localhost:3000/api'. No edit is needed.
 *
 * 2. Production Deployment (Vercel Frontend -> Render Backend):
 *    Replace the placeholder below with your live Render backend URL:
 *    Example: 'https://queueflow-backend.onrender.com'
 *
 * SECURITY NOTICE:
 * This file is public and served directly to client web browsers.
 * NEVER place database connection strings, passwords, or secrets here.
 * ============================================================================
 */
(function () {
    'use strict';

    // ------------------------------------------------------------------------
    // CONFIGURE YOUR PRODUCTION RENDER BACKEND URL HERE:
    // (Replace with your actual Render service URL, e.g., 'https://queueflow-backend.onrender.com')
    // ------------------------------------------------------------------------
    var PRODUCTION_BACKEND_URL = 'https://YOUR-RENDER-BACKEND.onrender.com';

    /**
     * Normalizes any base URL to ensure clean formatting with an '/api' suffix
     * and no trailing slash.
     */
    function normalizeApiUrl(rawUrl) {
        if (!rawUrl || typeof rawUrl !== 'string') return '';
        var trimmed = rawUrl.trim().replace(/\/+$/, '');
        if (trimmed.endsWith('/api')) {
            return trimmed;
        }
        return trimmed + '/api';
    }

    // Detect if running on a local development server or file protocol
    var isLocalhost = Boolean(
        window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname === '' ||
        window.location.protocol === 'file:'
    );

    var resolvedApiUrl;

    if (isLocalhost) {
        resolvedApiUrl = 'http://localhost:3000/api';
    } else if (PRODUCTION_BACKEND_URL && !PRODUCTION_BACKEND_URL.includes('YOUR-RENDER-BACKEND')) {
        resolvedApiUrl = normalizeApiUrl(PRODUCTION_BACKEND_URL);
    } else if (window.QUEUEFLOW_API_URL && !window.QUEUEFLOW_API_URL.includes('YOUR-RENDER-BACKEND')) {
        resolvedApiUrl = normalizeApiUrl(window.QUEUEFLOW_API_URL);
    } else {
        // Fallback placeholder when running on production host without configured URL
        resolvedApiUrl = normalizeApiUrl(PRODUCTION_BACKEND_URL);
        console.warn(
            '[QueueFlow Config] Notice: Backend URL is set to placeholder (' + PRODUCTION_BACKEND_URL + '). ' +
            'Please update PRODUCTION_BACKEND_URL in frontend/js/config.js with your Render backend URL.'
        );
    }

    // Expose unified configuration to global scope
    window.QUEUEFLOW_CONFIG = {
        API_BASE_URL: resolvedApiUrl,
        IS_LOCAL: isLocalhost,
        PRODUCTION_BACKEND_URL: PRODUCTION_BACKEND_URL
    };

    // Maintain backwards compatibility with any script referencing window.QUEUEFLOW_API_URL
    window.QUEUEFLOW_API_URL = resolvedApiUrl;
})();
