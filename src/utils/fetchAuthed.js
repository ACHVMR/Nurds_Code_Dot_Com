import { useAuth } from '@clerk/clerk-react';

async function tryGetClerkTokenFromWindow() {
  if (typeof window === 'undefined') return null;
  const clerk = window?.Clerk;
  const getToken = clerk?.session?.getToken;
  if (typeof getToken !== 'function') return null;
  try {
    return await getToken.call(clerk.session);
  } catch {
    return null;
  }
}

export const fetchAuthed = async (path, options = {}) => {
  const { authToken, headers: providedHeaders, ...rest } = options || {};
  const token = authToken ?? (await tryGetClerkTokenFromWindow());
  const headers = {
    ...(providedHeaders || {}),
  };

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  return fetch(path, {
    ...rest,
    headers,
  });
};

export function useFetchAuthed() {
  const { getToken } = useAuth();
  
  const fetchAuthedInternal = async (path, options = {}) => {
    const token = await getToken();
    return fetch(path, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`
      }
    });
  };

  return fetchAuthedInternal;
}
