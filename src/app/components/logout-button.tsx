"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");

  async function logout() {
    setLoggingOut(true);
    setError("");
    try {
      const response = await fetch("/api/auth?action=logout", { method: "POST" });
      if (!response.ok) throw new Error("The server could not sign you out.");
      router.push("/");
      router.refresh();
    } catch (reason) {
      setError(reason instanceof TypeError ? "The app is offline. Start the development server and try again." : reason instanceof Error ? reason.message : "Could not sign you out.");
      setLoggingOut(false);
    }
  }

  return <div className="welcome-logout-wrap"><button className="welcome-logout" type="button" onClick={logout} disabled={loggingOut}>{loggingOut ? "Signing out..." : "Sign out"}</button>{error && <span className="welcome-logout-error" role="alert">{error}</span>}</div>;
}
