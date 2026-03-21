import { useState, useEffect, useCallback } from 'react';

/**
 * React hook for Freighter wallet connection.
 * Manages connect/disconnect, address state, and errors.
 */
export function useWallet() {
  const [address, setAddress] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [freighterAvailable, setFreighterAvailable] = useState(null);

  // Check if Freighter is installed on mount
  useEffect(() => {
    async function checkFreighter() {
      try {
        const freighter = await import('@stellar/freighter-api');
        
        // If the user previously allowed the app, we can just grab the address
        if (typeof freighter.isAllowed === 'function') {
          const allowed = await freighter.isAllowed();
          if (allowed) {
            const addrResult = await freighter.getAddress();
            const addr = typeof addrResult === 'string' ? addrResult : addrResult?.address;
            if (addr) {
              setAddress(addr);
              setIsConnected(true);
              setFreighterAvailable(true);
            }
          }
        }
      } catch (err) {
        console.warn("Freighter auto-connect failed:", err);
      }
    }
    
    // Slight delay to ensure extension scripts have loaded
    setTimeout(checkFreighter, 250);
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    setIsConnecting(true);

    try {
      const freighter = await import('@stellar/freighter-api');

      // Freighter v6+ standard connection flow
      if (typeof freighter.setAllowed === 'function') {
        await freighter.setAllowed();
      }
      
      // Request access prompts the extension popup
      await freighter.requestAccess();

      // Retrieve the address after successful authorization
      const addrResult = await freighter.getAddress();
      const addr = typeof addrResult === 'string' ? addrResult : addrResult?.address;

      if (!addr) {
        throw new Error('Could not retrieve wallet address from Freighter');
      }

      setAddress(addr);
      setIsConnected(true);
      setFreighterAvailable(true);
    } catch (err) {
      console.error("Freighter Connection Error:", err);
      const msg = typeof err === 'string' ? err : err.message;
      if (msg && msg.toLowerCase().includes('not installed')) {
         setError('Freighter wallet not detected. Please install the Freighter browser extension.');
      } else {
         setError(msg || 'Failed to connect wallet');
      }
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setIsConnected(false);
    setError(null);
  }, []);

  return {
    address,
    isConnected,
    isConnecting,
    error,
    freighterAvailable,
    connect,
    disconnect,
  };
}
