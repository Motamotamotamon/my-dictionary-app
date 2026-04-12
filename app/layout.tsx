import "./globals.css";
import Navbar from "../components/Navbar";

export const metadata = {
  title: "English Dictionary",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (

    <html lang="en">

      <body>

        {children}

        {/* 👇 下に移動 */}
        <Navbar />

      </body>

    </html>

  );
}