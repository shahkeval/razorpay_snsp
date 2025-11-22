// Device fingerprinting utility
// Since MAC ID is not accessible in browsers, we use a combination of browser features
// to create a unique device identifier

export const generateDeviceFingerprint = async () => {
  try {
    // Check if fingerprint already exists in localStorage
    const storedFingerprint = localStorage.getItem('deviceFingerprint');
    if (storedFingerprint) {
      return storedFingerprint;
    }

    // Collect browser and device information
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
    
    const canvasFingerprint = canvas.toDataURL();
    
    // Collect various browser properties
    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      colorDepth: window.screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: canvasFingerprint,
      hardwareConcurrency: navigator.hardwareConcurrency || 'unknown',
      maxTouchPoints: navigator.maxTouchPoints || 0,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack || 'unknown',
    };

    // Create a hash from the fingerprint
    const fingerprintString = JSON.stringify(fingerprint);
    let hash = 0;
    for (let i = 0; i < fingerprintString.length; i++) {
      const char = fingerprintString.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    const deviceId = `device_${Math.abs(hash)}_${Date.now()}`;
    
    // Store in localStorage for future use
    localStorage.setItem('deviceFingerprint', deviceId);
    
    return deviceId;
  } catch (error) {
    console.error('Error generating device fingerprint:', error);
    // Fallback to a simple ID based on timestamp and random number
    const fallbackId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('deviceFingerprint', fallbackId);
    return fallbackId;
  }
};

