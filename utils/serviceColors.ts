import { SERVICE_COLORS } from '@/constants';

/**
 * Get the color for a service based on its name
 * Falls back to a default color if not found
 */
export function getServiceColor(serviceName: string): string {
  if (!serviceName) return '#6366F1';
  
  const normalizedName = serviceName.toLowerCase().replace(/\s+/g, '').replace(/\./g, '').replace(/\+/g, 'plus');
  
  // Direct match
  if (SERVICE_COLORS[normalizedName]) {
    return SERVICE_COLORS[normalizedName];
  }
  
  // Try partial matches
  for (const [key, value] of Object.entries(SERVICE_COLORS)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return value;
    }
  }
  
  // Default fallback color
  return '#6366F1';
}

