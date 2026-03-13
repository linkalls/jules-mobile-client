/**
 * Check if a URL is a valid external link (http or https)
 * This is used to prevent malicious deep links (e.g., javascript:, file:, etc.)
 */
export function isValidExternalLink(url: string | undefined | null): boolean {
  if (!url) return false;

  // Only allow http and https protocols
  // Using case-insensitive regex for the protocol
  return /^(https?):\/\//i.test(url);
}
