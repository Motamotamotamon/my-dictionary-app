import Link from "next/link";

export default function Navbar(){

  return(

    <nav className="flex gap-6 p-4 border-b">

      <Link href="/">🏠 Home</Link>

      <Link href="/saved">⭐ Saved</Link>

      <Link href="/vocabulary">📚 Vocabulary</Link>

      <Link href="/quiz">🧠 Quiz</Link>

    </nav>

  );

}