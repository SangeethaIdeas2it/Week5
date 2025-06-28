// Security utilities for preventing XSS, input validation, and URL sanitization

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param input - The input string to sanitize
 * @returns Sanitized string with HTML entities encoded
 */
export const sanitizeHtml = (input: string): string => {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validate and sanitize URLs to prevent open redirects and XSS
 * @param url - The URL to validate
 * @param allowedDomains - Array of allowed domains (optional)
 * @returns Sanitized URL or null if invalid
 */
export const validateUrl = (url: string, allowedDomains?: string[]): string | null => {
  if (typeof url !== 'string' || !url.trim()) {
    return null;
  }

  try {
    const urlObj = new URL(url);
    
    // Check for dangerous protocols
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:', 'file:'];
    const protocol = urlObj.protocol.toLowerCase();
    if (dangerousProtocols.some(dangerous => protocol === dangerous)) {
      return null;
    }
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(protocol)) {
      return null;
    }
    
    // Check against allowed domains if provided
    if (allowedDomains && allowedDomains.length > 0) {
      const domain = urlObj.hostname.toLowerCase();
      const isAllowed = allowedDomains.some(allowed => 
        domain === allowed.toLowerCase() || domain.endsWith('.' + allowed.toLowerCase())
      );
      
      if (!isAllowed) {
        return null;
      }
    }
    
    return urlObj.toString();
  } catch {
    return null;
  }
};

/**
 * Validate image sources to prevent malicious image loading
 * @param src - The image source URL
 * @param allowedDomains - Array of allowed domains for images
 * @returns Validated image source or fallback
 */
export const validateImageSource = (src: string, allowedDomains?: string[]): string => {
  if (typeof src !== 'string' || !src.trim()) {
    return '/placeholder-image.png'; // Fallback image
  }
  
  // Allow relative paths and data URLs for local images
  if (src.startsWith('/') || src.startsWith('./') || src.startsWith('../') || src.startsWith('data:')) {
    return src;
  }
  
  // Validate external URLs
  const validatedUrl = validateUrl(src, allowedDomains);
  return validatedUrl || '/placeholder-image.png';
};

/**
 * Validate and sanitize user input
 * @param input - The input to validate
 * @param type - The type of validation to apply
 * @returns Sanitized input or null if invalid
 */
export const validateInput = (input: any, type: 'text' | 'number' | 'email' | 'url'): string | number | null => {
  if (input === null || input === undefined) {
    return null;
  }
  
  const stringInput = String(input).trim();
  
  switch (type) {
    case 'text':
      // Remove any HTML tags and limit length
      const sanitizedText = sanitizeHtml(stringInput);
      return sanitizedText.length <= 1000 ? sanitizedText : sanitizedText.substring(0, 1000);
      
    case 'number':
      const num = parseFloat(stringInput);
      return isNaN(num) ? null : num;
      
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(stringInput) ? stringInput.toLowerCase() : null;
      
    case 'url':
      return validateUrl(stringInput);
      
    default:
      return null;
  }
};

/**
 * Prevent clickjacking by validating click events
 * @param event - The click event
 * @returns True if the click is legitimate
 */
export const validateClickEvent = (event: React.MouseEvent): boolean => {
  // Check if the event is synthetic (React-generated)
  if (!event.isTrusted) {
    return false;
  }
  
  // Check for suspicious properties
  if (event.detail > 3) { // Multiple rapid clicks
    return false;
  }
  
  return true;
};

/**
 * Sanitize product data to prevent injection attacks
 * @param product - The product object to sanitize
 * @returns Sanitized product object
 */
export const sanitizeProductData = (product: any) => {
  if (!product || typeof product !== 'object') {
    return null;
  }
  
  return {
    id: typeof product.id === 'number' ? product.id : null,
    sku: typeof product.sku === 'number' ? product.sku : null,
    title: validateInput(product.title, 'text'),
    description: validateInput(product.description, 'text'),
    price: validateInput(product.price, 'number'),
    style: validateInput(product.style, 'text'),
    currencyId: ['USD', 'BRL', 'EUR'].includes(product.currencyId) ? product.currencyId : 'USD',
    currencyFormat: validateInput(product.currencyFormat, 'text'),
    availableSizes: Array.isArray(product.availableSizes) 
      ? product.availableSizes.map((size: any) => validateInput(size, 'text')).filter(Boolean)
      : [],
    installments: typeof product.installments === 'number' ? product.installments : 0,
    isFreeShipping: Boolean(product.isFreeShipping),
    quantity: typeof product.quantity === 'number' ? Math.max(1, product.quantity) : 1,
  };
};

/**
 * Content Security Policy headers for the application
 */
export const CSP_HEADERS = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:'],
  'connect-src': ["'self'", 'https://react-shopping-cart-67954.firebaseio.com'],
  'font-src': ["'self'"],
  'object-src': ["'none'"],
  'media-src': ["'self'"],
  'frame-src': ["'none'"],
};

/**
 * Generate CSP header string
 */
export const generateCSPHeader = (): string => {
  return Object.entries(CSP_HEADERS)
    .map(([key, values]) => `${key} ${values.join(' ')}`)
    .join('; ');
}; 