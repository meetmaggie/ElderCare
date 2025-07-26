
import '../styles/globals.css'

export const metadata = {
  title: 'ElderCare AI - Never Worry About Mum Again',
  description: 'Daily AI companion calls keep your elderly parent happy, healthy, and connected. Get real-time health monitoring and instant alerts.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans">
        {children}
      </body>
    </html>
  )
}
