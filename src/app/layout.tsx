import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "tvoj AI knjigovođa",
  description: "AI knjigovođa za paušalce",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sr">
      <body>{children}</body>
    </html>
  );
}
