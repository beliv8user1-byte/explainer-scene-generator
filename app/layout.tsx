import "./globals.css";
import TopBar from "@/components/TopBar";
import ThemeScript from "@/components/ThemeScript";

export const metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "Explainer Scene Generator",
  description: "Generate 60s explainer scripts, scenes, and image frames."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-screen bg-background text-foreground">
        <TopBar />
        <main className="mx-auto max-w-5xl px-4 md:px-6 py-6">{children}</main>
      </body>
    </html>
  );
}
