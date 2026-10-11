/**
 * PKS JKM Geofence Ground-Truth
 * Location: Kompleks Bengkel Mekanikal, Politeknik Kuching Sarawak
 * KM22, Jalan Matang, 93050 Kuching, Sarawak
 */
export const PKS_JKM_COORDS = {
  lat: 1.63085,
  lng: 110.23321,
  name: "Kompleks Bengkel Mekanikal JKM (PKS)",
  address: "KM22 Jalan Matang, 93050 Kuching, Sarawak",
  radius: 150 // 150-meter campus workshop geofence boundary
};

/**
 * Haversine formula to compute great-circle distance between two GPS coordinates in meters
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const toRad = Math.PI / 180;
  const phi1 = lat1 * toRad;
  const phi2 = lat2 * toRad;
  const deltaPhi = (lat2 - lat1) * toRad;
  const deltaLambda = (lon2 - lon1) * toRad;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

export function formatDistance(meters: number): string {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(1)} km`;
  }
  return `${meters} m`;
}

/**
 * Generate cryptographic-like verification code
 */
export function generateVerificationToken(courseCode: string): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let randomStr = '';
  for (let i = 0; i < 5; i++) {
    randomStr += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const cleanCode = courseCode.replace(/[^A-Za-z0-9]/g, '').slice(0, 4).toUpperCase();
  return `PKS-${cleanCode}-${randomStr}`;
}

/**
 * Web Audio API synthesizer for positive confirmation chime
 */
export function playCheckInChime(): void {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play warm harmonious two-tone chime
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'triangle';

    osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc1.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
    osc1.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2); // G5
    osc1.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.3); // C6

    osc2.frequency.setValueAtTime(261.63, ctx.currentTime);
    osc2.frequency.setValueAtTime(523.25, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc2.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.65);
    osc2.stop(ctx.currentTime + 0.65);
  } catch {
    // Audio contexts might be blocked until user gesture, graceful fallback
  }
}

/**
 * Export data array to CSV file download
 */
export function exportToCSV(filename: string, rows: Record<string, string | number>[]): void {
  if (!rows || !rows.length) return;
  const headers = Object.keys(rows[0]);
  const csvContent = [
    headers.join(','),
    ...rows.map(row => headers.map(h => `"${String(row[h] ?? '').replace(/"/g, '""')}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
