"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";

const Theme = dynamic(
  () => import("@/components/theme-provider").then((mod) => mod.ThemeProvider),
  { ssr: false }
);

export const ClientOnlyThemeProvider = ({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider> & {
  children: ReactNode;
}) => {
  return <Theme {...props}>{children}</Theme>;
};
