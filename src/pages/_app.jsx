import '@mantine/core/styles.css'
import '@mantine/dates/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/dropzone/styles.css'

import { MantineProvider, createTheme } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import { AuthProvider } from '@/contexts/AuthContext'
import Head from 'next/head'

const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  headings: {
    fontFamily: 'Space Grotesk, Inter, sans-serif',
  },
  defaultRadius: 'md',
})

export default function App({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Willay Map - Reportes Ciudadanos</title>
        <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <MantineProvider theme={theme}>
        <Notifications position="top-right" />
        <AuthProvider>
          <Component {...pageProps} />
        </AuthProvider>
      </MantineProvider>

      <style jsx global>{`
        * {
          box-sizing: border-box;
        }
        html, body {
          padding: 0;
          margin: 0;
          font-family: Inter, -apple-system, BlinkMacSystemFont, sans-serif;
        }
        a {
          color: inherit;
          text-decoration: none;
        }
        .custom-marker {
          background: transparent !important;
          border: none !important;
        }
      `}</style>
    </>
  )
}