"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {

  const pathname = usePathname();

  const linkClass = (path:string) =>
    `flex flex-col items-center text-xs ${
      pathname === path
        ? "text-blue-600 font-bold"
        : "text-gray-500"
    }`;

  return (

    <nav className="
      fixed bottom-0 left-0 right-0
      bg-white border-t
      flex justify-around items-center
      py-2 z-50
    ">

      <Link href="/" className={linkClass("/")}>
        <span className="text-lg">🔍</span>
        Search
      </Link>

      <Link href="/vocabulary" className={linkClass("/vocabulary")}>
        <span className="text-lg">📚</span>
        Vocabulary
      </Link>

      <Link href="/quiz" className={linkClass("/quiz")}>
        <span className="text-lg">🧠</span>
        Quiz
      </Link>

    </nav>

  );
}