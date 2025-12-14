/**
 * Converts a service name to a URL-friendly slug
 * Example: "OpenAI API" -> "openai-api"
 */
export function createSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Finds a service by its slug
 */
export function findServiceBySlug(slug: string) {
  const { MOCK_SERVICES } = require('@/constants');
  return MOCK_SERVICES.find((service: any) => createSlug(service.name) === slug);
}
