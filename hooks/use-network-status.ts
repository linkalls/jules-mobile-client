import { useEffect, useState } from 'react';

/**
 * Simple network status hook
 * Returns online/offline status based on fetch availability
 */
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    // Check network status on mount
    const checkConnection = async () => {
      try {
        // Simple fetch test - doesn't make actual request
        const controller = new AbortController();
        setTimeout(() => controller.abort(), 100);
        
        await fetch('https://www.google.com', { 
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
    const interval = setInterval(checkConnection, 30000); // Check every 30s

    return () => clearInterval(interval);
  }, []);

  return { isOnline };
}
