export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export const apiUrl = (endpoint: string) => `${API_URL}${endpoint}`;

export const api = {
  get: async (endpoint: string, token?: string) => {
    const res = await fetch(apiUrl(endpoint), {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    return res.json();
  },

  post: async (endpoint: string, body: unknown, token?: string) => {
    const res = await fetch(apiUrl(endpoint), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });
    return res.json();
  },
};
