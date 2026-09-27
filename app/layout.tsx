import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Eliora Faye | Baptism Invitation",

  description:
    "Join us as we celebrate the baptism of our little blessing, Eliora Faye De Guzman.",

  openGraph: {
    title: "Eliora Faye | Baptism Invitation",
    description:
      "You are warmly invited to celebrate Eliora Faye's special day.",
    url: "https://eliora-baptism-invitation.vercel.app",
    siteName: "Eliora Faye Baptism Invitation",
    type: "website",
    images: [
      {
        url: "https://eliora-baptism-invitation.vercel.app/eliora-faye.jpeg",
        width: 1200,
        height: 630,
        alt: "Eliora Faye",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Eliora Faye | Baptism Invitation",
    description: "Join us as we celebrate Eliora Faye's baptism.",
    images: ["https://eliora-baptism-invitation.vercel.app/eliora-faye.jpeg"],
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
