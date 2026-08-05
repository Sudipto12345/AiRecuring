import useSWR, { SWRConfiguration } from 'swr';
import { getToken } from './api';

export const apiFetcher = async (url: string) => {
  const token = getToken();
  const res = await fetch(process.env.NEXT_PUBLIC_API_URL + url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export function useApi<T>(path: string | null, config?: SWRConfiguration) {
  return useSWR<T>(path, apiFetcher, {
    revalidateOnFocus: false,
    ...config,
  });
}
