import { useEffect, useState } from 'react';

/**
 * Simple network status hook
 * Returns online/offline status based on network connectivity test
 */

// Configuration
const CONNECTIVITY_CHECK_URL = 'https://www.google.com';
const CONNECTIVITY_TIMEOUT = 100; // ms
const CHECK_INTERVAL = 30000; // 30 seconds

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    // Check network status on mount
    const checkConnection = async () => {
      try {
        // Make a quick HEAD request to test connectivity
        // This makes an actual HTTP request but aborts it quickly
        const controller = new AbortController();
        setTimeout(() => controller.abort(), CONNECTIVITY_TIMEOUT);
        
        await fetch(CONNECTIVITY_CHECK_URL, { 
          method: 'HEAD',
          signal: controller.signal 
        });
        setIsOnline(true);
      } catch {
        setIsOnline(false);
      }
    };

    checkConnection();

    // Set up interval to check periodically
    const interval = setInterval(checkConnection, CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return { isOnline };
}
