import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://eliora-baptism-invitation.vercel.app"),
  title: "The Holy Baptism of Eliora Faye 💗",
  description:
    "A little blessing is on the way. Join us for the Holy Baptism of Eliora Faye De Guzman.",
  facebook: { appId: "2174331380102780" },
  openGraph: {
    title: "The Holy Baptism of Eliora Faye 💗",
    description: "You are invited to celebrate Eliora Faye's special day!",
    url: "https://eliora-baptism-invitation.vercel.app/",
    siteName: "Eliora Faye Baptism Invitation",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Pink envelope baptism invitation for Eliora Faye",
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
