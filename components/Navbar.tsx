"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {

  const pathname = usePathname();

  const linkClass = (path:string) =>
    pathname === path
      ? "font-bold text-blue-600"
      : "text-gray-700";

  return (

    <nav className="flex gap-6 p-4 border-b bg-white">

      <Link href="/" className={linkClass("/")}>
        🔍 Search
      </Link>

      <Link href="/vocabulary" className={linkClass("/vocabulary")}>
        📚 Vocabulary
      </Link>

      <Link href="/quiz" className={linkClass("/quiz")}>
        🧠 Quiz
      </Link>

    </nav>

  );
}