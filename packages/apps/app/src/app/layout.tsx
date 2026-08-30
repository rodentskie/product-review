import type { Metadata } from "next"
import { EmotionRegistry } from "@/components/ui/emotion-registry"
import { Provider } from "@/components/ui/provider"
import { Toaster } from "@/components/ui/toaster"

export const metadata: Metadata = {
  title: "Product Reviews",
  description: "Browse products and their reviews.",
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body>
        <EmotionRegistry>
          <Provider>
            {props.children}
            <Toaster />
          </Provider>
        </EmotionRegistry>
      </body>
    </html>
  )
}