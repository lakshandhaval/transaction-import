export async function api(path, { user, ...options } = {}) {
  const headers = new Headers(options.headers);
  if (user) headers.set('x-user', user);

  const response = await fetch(path, { ...options, headers });
  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const error = new Error(data?.error || data?.message || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}
