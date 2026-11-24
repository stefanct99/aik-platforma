import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "tvoj AI knjigovođa",
  description: "AI knjigovođa za paušalce",
};

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  weight: ["700", "800"],
  variable: "--font-manrope",
});

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  variable: "--font-inter",
});

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sr" className={`${manrope.variable} ${inter.variable}`}>
      {/* Ekstenzije pregledača (npr. Grammarly) ubacuju svoje atribute u <body> pre nego što React
          hidrira stranicu, što inače ispisuje lažno upozorenje o neslaganju - to upozorenje se odnosi
          samo na njih, ne na stvarnu grešku u ovoj aplikaciji. */}
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
