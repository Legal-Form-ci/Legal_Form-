import { useCallback, useEffect, useRef } from 'react';

declare global {
  interface Window {
    openKkiapayWidget: (config: KkiapayConfig) => void;
    addKkiapayListener: (event: string, callback: (data: any) => void) => void;
    removeKkiapayListener: (event: string, callback: (data: any) => void) => void;
    addSuccessListener: (callback: (data: KkiapaySuccessResponse) => void) => void;
    addWidgetInitListener: (callback: () => void) => void;
    addKkiapayFailedListener: (callback: (data: any) => void) => void;
    addKkiapayCloseListener: (callback: () => void) => void;
  }
}

export interface KkiapayConfig {
  amount: number;
  key: string;
  sandbox?: boolean;
  callback?: string;
  theme?: string;
  name?: string;
  email?: string;
  phone?: string;
  partnerId?: string;
  paymentmethod?: 'momo' | 'card';
  data?: Record<string, any>;
}

export interface KkiapaySuccessResponse {
  transactionId: string;
  amount?: number;
  phone?: string;
}

interface UseKkiapayOptions {
  onSuccess?: (response: KkiapaySuccessResponse) => void;
  onFailed?: (error: any) => void;
  onClose?: () => void;
}

export const useKkiapay = (options: UseKkiapayOptions = {}) => {
  const { onSuccess, onFailed, onClose } = options;
  const scriptLoaded = useRef(false);
  const listenersAttached = useRef(false);

  // Load KkiaPay script
  useEffect(() => {
    if (scriptLoaded.current) return;

    const existingScript = document.querySelector('script[src="https://cdn.kkiapay.me/k.js"]');
    
    if (existingScript) {
      scriptLoaded.current = true;
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.kkiapay.me/k.js';
    script.async = true;
    script.onload = () => {
      scriptLoaded.current = true;
      console.log('KkiaPay SDK loaded successfully');
    };
    script.onerror = () => {
      console.error('Failed to load KkiaPay SDK');
    };
    
    document.body.appendChild(script);

    return () => {
      // Keep script in DOM as it might be used by other components
    };
  }, []);

  // Attach event listeners
  useEffect(() => {
    if (listenersAttached.current) return;

    const handleSuccess = (response: KkiapaySuccessResponse) => {
      console.log('KkiaPay payment success:', response);
      onSuccess?.(response);
    };

    const handleFailed = (error: any) => {
      console.error('KkiaPay payment failed:', error);
      onFailed?.(error);
    };

    const handleClose = () => {
      console.log('KkiaPay widget closed');
      onClose?.();
    };

    // Wait for SDK to load
    const attachListeners = () => {
      if (typeof window.addSuccessListener === 'function') {
        window.addSuccessListener(handleSuccess);
        listenersAttached.current = true;
      }
      if (typeof window.addKkiapayFailedListener === 'function') {
        window.addKkiapayFailedListener(handleFailed);
      }
      if (typeof window.addKkiapayCloseListener === 'function') {
        window.addKkiapayCloseListener(handleClose);
      }
    };

    // Check if SDK is already loaded
    if (typeof window.addSuccessListener === 'function') {
      attachListeners();
    } else {
      // Wait for SDK to load
      const interval = setInterval(() => {
        if (typeof window.addSuccessListener === 'function') {
          attachListeners();
          clearInterval(interval);
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => clearInterval(interval), 10000);
    }
  }, [onSuccess, onFailed, onClose]);

  const openPayment = useCallback((config: Omit<KkiapayConfig, 'key'>) => {
    // Public API key from KKIAPAY dashboard
    const kkiapayPublicKey = '193bbb7e7387d1c3ac16ced9d47fe52fad2b228e';
    
    if (typeof window.openKkiapayWidget !== 'function') {
      console.error('KkiaPay SDK not loaded');
      return false;
    }

    const fullConfig: KkiapayConfig = {
      ...config,
      key: kkiapayPublicKey,
      sandbox: true, // Set to false in production
      theme: '#0891b2', // Primary color
    };

    console.log('Opening KkiaPay widget with config:', fullConfig);
    window.openKkiapayWidget(fullConfig);
    return true;
  }, []);

  return {
    openPayment,
    isReady: scriptLoaded.current,
  };
};

export default useKkiapay;
