import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enhanzers | Selected Works",
  description: "Portfolio and digital experiences crafted by Enhanzers.",
};

export default function OurWorkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}