import "./globals.css";
import TopBar from "@/components/TopBar";

export const metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "Explainer Scene Generator",
  description: "Generate 60s explainer scripts, scenes, and image frames."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TopBar />
        <main className="max-w-5xl mx-auto p-6">{children}</main>
      </body>
    </html>
  );
}
