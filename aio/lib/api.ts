export const getApiUrl = (endpoint: string) => {
  if (typeof window === 'undefined') {
    // Server-side
    return process.env.NODE_ENV === 'production' 
      ? `https://aiodemo.netlify.app/api${endpoint}`
      : `http://localhost:3000/api${endpoint}`
  } else {
    // Client-side
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    return `${baseUrl}/api${endpoint}`
  }
}

export const fetchApi = async (endpoint: string, options?: RequestInit) => {
  const url = getApiUrl(endpoint)
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })
} 