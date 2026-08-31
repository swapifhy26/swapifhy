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
        // sanitize-html transforms <script> into empty, but it might turn > into &gt;.
        // We will just return the strictly stripped version.
        return sanitizeHtml(data, sanitizeOptions);
    }
    
    if (Array.isArray(data)) {
        return data.map((item) => clean(item));
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
    if (req.body) req.body = clean(req.body);
    if (req.query) req.query = clean(req.query);
    if (req.params) req.params = clean(req.params);
    next();
};
