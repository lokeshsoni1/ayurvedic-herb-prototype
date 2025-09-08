// Layout file for Next.js App Router
// TODO: Add global navigation, sidebar, and layout components
// TODO: Include Team Hackon branding and project credits

import './globals.css'

export const metadata = {
  title: 'HerbChain - Blockchain Traceability for Ayurvedic Herbs',
  description: 'Prototype proudly built by Team Hackon for SIH25027',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {/* TODO: Add navigation and layout components */}
        <main>{children}</main>
        <footer>
          <p>Prototype proudly built by Team Hackon for SIH25027</p>
        </footer>
      </body>
    </html>
  )
}