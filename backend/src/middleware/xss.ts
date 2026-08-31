import { Request, Response, NextFunction } from 'express';
import sanitizeHtml from 'sanitize-html';

const sanitizeOptions = {
    allowedTags: [], // Strip absolutely all HTML tags for maximum API security
    allowedAttributes: {}
};

const clean = (data: any, keyName: string = ''): any => {
    // Never sanitize passwords to prevent locking users out of their accounts
    if (keyName.toLowerCase().includes('password')) {
        return data;
    }

    if (typeof data === 'string') {
        // Unescape basic characters that sanitize-html might over-encode, but strip tags.
        return sanitizeHtml(data, sanitizeOptions);
    }
    
    if (Array.isArray(data)) {
        return data.map((item) => clean(item, keyName));
    }
    
    if (typeof data === 'object' && data !== null) {
        const cleanedObj: any = {};
        for (const key in data) {
            cleanedObj[key] = clean(data[key], key);
        }
        return cleanedObj;
    }
    
    return data;
};

export const xssSanitizer = (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.body && typeof req.body === 'object') {
            for (const key in req.body) {
                req.body[key] = clean(req.body[key], key);
            }
        }
        if (req.query && typeof req.query === 'object') {
            for (const key in req.query) {
                req.query[key] = clean(req.query[key], key);
            }
        }
        if (req.params && typeof req.params === 'object') {
            for (const key in req.params) {
                req.params[key] = clean(req.params[key], key);
            }
        }
    } catch (e) {
        console.error("XSS Sanitization Error:", e);
    }
    next();
};
