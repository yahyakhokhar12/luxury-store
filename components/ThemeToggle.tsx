"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("luxora-theme");
    if (stored === "dark") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDark(true);
    }
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark", dark);
    localStorage.setItem("luxora-theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <button onClick={() => setDark((prev) => !prev)} className="theme-btn">
      {dark ? "Light" : "Dark"}
    </button>
  );
}
