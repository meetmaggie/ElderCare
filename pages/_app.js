
import '../styles/globals.css'
import Head from 'next/head'

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700;800&display=swap" 
          rel="stylesheet" 
        />
        <title>ElderCare AI - Never Worry About Mum Again</title>
        <meta name="description" content="Daily AI companion calls keep your elderly parent happy, healthy, and connected. Get real-time health monitoring and instant alerts." />
      </Head>
      <Component {...pageProps} />
    </>
  )
}
