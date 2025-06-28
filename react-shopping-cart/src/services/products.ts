import axios, { AxiosError, AxiosResponse } from 'axios';
import { IGetProductsResponse, IProduct } from 'models';

// Error types
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  retryable: boolean;
}

export interface ServiceResponse<T> {
  data: T | null;
  error: ApiError | null;
  loading: boolean;
}

// Configuration
const API_CONFIG = {
  baseURL: 'https://react-shopping-cart-67954.firebaseio.com',
  timeout: 10000,
  retryAttempts: 3,
  retryDelay: 1000,
};

// HTTP Status validation
const isRetryableStatus = (status: number): boolean => {
  return status >= 500 || status === 429; // Server errors or rate limiting
};

const isClientError = (status: number): boolean => {
  return status >= 400 && status < 500;
};

// Error message mapping
const getErrorMessage = (error: AxiosError): string => {
  if (error.response) {
    const { status } = error.response;
    
    switch (status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication required. Please log in again.';
      case 403:
        return 'Access denied. You don\'t have permission to access this resource.';
      case 404:
        return 'Products not found. Please try again later.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
        return 'Bad gateway. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return `Request failed with status ${status}. Please try again.`;
    }
  }
  
  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Please check your connection and try again.';
  }
  
  if (error.code === 'NETWORK_ERROR') {
    return 'Network error. Please check your internet connection and try again.';
  }
  
  return 'An unexpected error occurred. Please try again.';
};

// Retry mechanism
const delay = (ms: number): Promise<void> => 
  new Promise(resolve => setTimeout(resolve, ms));

const retryRequest = async <T>(
  requestFn: () => Promise<T>,
  maxAttempts: number = API_CONFIG.retryAttempts,
  delayMs: number = API_CONFIG.retryDelay
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry on client errors (4xx)
      if (axios.isAxiosError(error) && error.response && isClientError(error.response.status)) {
        throw error;
      }
      
      // Don't retry on last attempt
      if (attempt === maxAttempts) {
        throw error;
      }
      
      // Exponential backoff
      const backoffDelay = delayMs * Math.pow(2, attempt - 1);
      console.warn(`Request failed (attempt ${attempt}/${maxAttempts}), retrying in ${backoffDelay}ms...`);
      await delay(backoffDelay);
    }
  }
  
  throw lastError!;
};

// Enhanced axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.baseURL,
  timeout: API_CONFIG.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`Making request to: ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`Response received from: ${response.config.url}`, response.status);
    return response;
  },
  (error: AxiosError) => {
    console.error('Response error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

const isProduction = process.env.NODE_ENV === 'production';

export const getProducts = async (): Promise<ServiceResponse<IProduct[]>> => {
  try {
    let response: IGetProductsResponse;

    if (isProduction) {
      response = await retryRequest(async () => {
        const result = await apiClient.get<IGetProductsResponse>('/products.json');
        return result.data;
      });
    } else {
      // Simulate network delay in development
      await delay(500);
      response = require('static/json/products.json');
    }

    const { products } = response.data || [];

    if (!products || !Array.isArray(products)) {
      throw new Error('Invalid products data received from server');
    }

    return {
      data: products,
      error: null,
      loading: false,
    };
  } catch (error) {
    console.error('Error fetching products:', error);
    
    let apiError: ApiError;
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      apiError = {
        message: getErrorMessage(error),
        status,
        code: error.code,
        retryable: status ? isRetryableStatus(status) : true,
      };
    } else {
      apiError = {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        retryable: false,
      };
    }

    return {
      data: null,
      error: apiError,
      loading: false,
    };
  }
};

// Utility function to check if error is retryable
export const isRetryableError = (error: ApiError): boolean => {
  return error.retryable;
};

// Utility function to format error for user display
export const formatErrorForUser = (error: ApiError): string => {
  return error.message;
};
