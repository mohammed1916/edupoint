export async function sendIdTokenToBackend(idToken: string, apiBaseUrl?: string): Promise<{ name?: string; picture?: string } | null> {
  const url = `${apiBaseUrl || process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000"}/auth/google`;
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ idToken }),
    });
    if (res.ok) {
      return await res.json();
    }
    return null;
  } catch (err) {
    console.error("Failed to send ID token to backend:", err);
    return null;
  }
}
