
import '../styles/globals.css'

export const metadata = {
  title: 'ElderCare AI - Never Worry About Mum Again',
  description: 'Daily AI companion calls keep your elderly parent happy, healthy, and connected. Get real-time health monitoring and instant alerts.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap" 
          rel="stylesheet" 
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
