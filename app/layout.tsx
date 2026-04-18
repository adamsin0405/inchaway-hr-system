import type { Metadata } from 'next'
import './globals.css'
import { StoreProvider } from '@/lib/store'

export const metadata: Metadata = {
  title: 'Driver Payroll',
  description: 'Logistics driver payroll management',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  )
}
