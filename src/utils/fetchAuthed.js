import { useAuth } from '@clerk/clerk-react';

export function useFetchAuthed() {
  const { getToken } = useAuth();
  
  const fetchAuthed = async (path, options = {}) => {
    const token = await getToken();
    return fetch(path, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`
      }
    });
  };

  return fetchAuthed;
}
