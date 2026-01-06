import { MantineProvider, createTheme } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@/styles/globals.css'

const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'Plus Jakarta Sans, sans-serif',
  headings: { fontFamily: 'Space Grotesk, sans-serif' },
  colors: {
    willay: [
      '#eff6ff', '#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa',
      '#3b82f6', '#2563eb', '#1d4ed8', '#1e40af', '#1e3a8a',
    ],
  },
  radius: { xs: '4px', sm: '8px', md: '12px', lg: '16px', xl: '24px' },
  shadows: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },
  defaultRadius: 'md',
  components: {
    Button: {
      defaultProps: { radius: 'md' },
      styles: { root: { fontWeight: 600, transition: 'all 0.2s ease' } },
    },
    Card: { defaultProps: { radius: 'lg', shadow: 'sm' } },
  },
})

export default function App({ Component, pageProps }) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Notifications position="top-right" />
      <Component {...pageProps} />
    </MantineProvider>
  )
}