// modules/lab.js - Lab module FACADE
// Re-exports handlers from lab-profile.js and lab-requests.js for backward compatibility
import { handleLabProfileGet, handleLabProfilePost } from './lab-profile';
import { handleLabRequestsPost } from './lab-requests';

// ==================== LAB GET HANDLERS (facade) ====================
export async function handleLabGet(path, request) {
  return handleLabProfileGet(path, request);
}

// ==================== LAB POST HANDLERS (facade) ====================
export async function handleLabPost(path, request, body) {
  // Try profile/setup handlers first
  const profileResult = await handleLabProfilePost(path, request, body);
  if (profileResult) return profileResult;

  // Then try requests/reports handlers
  const requestsResult = await handleLabRequestsPost(path, request, body);
  if (requestsResult) return requestsResult;

  return null;
}
