import type { Metadata, Viewport } from "next"
import { Inter, Montserrat } from "next/font/google"
import "./globals.css"
import { QueryProvider } from "@/contexts/query-provider"
import { ThemeProvider } from "@/contexts/ThemeContext"
import { Toaster } from "sonner"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
  weight: ["500", "600", "700", "800"],
})

export const metadata: Metadata = {
  title: "Clearix AR & Vision",
  description: "Prova virtual e medicao digital do ecossistema Clearix by DIGIAI",
  keywords: ["ar", "vision", "try-on", "prova virtual", "armacoes", "otica", "pd", "dip"],
  authors: [{ name: "DIGIAI" }],
  icons: {
    icon: [
      { url: '/clearix-icon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#D946EF',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={`${inter.variable} ${montserrat.variable}`}>
      <body className={`${inter.variable} ${montserrat.variable} ${inter.className} antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          <QueryProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                classNames: {
                  toast: 'dark:bg-slate-800 dark:text-white dark:border-slate-700',
                },
              }}
            />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
