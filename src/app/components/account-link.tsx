"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function AccountLink() {
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    fetch("/api/auth?action=session")
      .then((response) => setSignedIn(response.ok))
      .catch(() => setSignedIn(false));
  }, []);

  return <Link className="landing-signin" href={signedIn ? "/welcome" : "/login"}>{signedIn ? "Go to your wedding" : "Sign in"}</Link>;
}
