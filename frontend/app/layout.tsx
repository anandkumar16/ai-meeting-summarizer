import { Playfair_Display, Source_Sans_3 } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "react-hot-toast"

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
  weight: ["400", "600", "700"],
})

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-source-sans",
  weight: ["400", "500", "600"],
})

export const metadata = {
  title: "AI Meeting Summarizer - Transform Your Meeting Notes",
  description: "Professional AI-powered meeting notes summarizer with email sharing capabilities",
  generator: "v0.app",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${playfairDisplay.variable} ${sourceSans.variable}`}>
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: "glass",
              style: {
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(20px)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "white",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
