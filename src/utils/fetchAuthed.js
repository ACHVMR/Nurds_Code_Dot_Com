import { useAuth } from '@clerk/clerk-react';

export const fetchAuthed = async (path, options = {}) => {
  const { getToken } = useAuth();
  const token = await getToken();
  return fetch(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`
    }
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
