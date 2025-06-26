import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/Navbar';

// Server component for layout
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <title>H.K.Bank</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
          <AuthProvider>
            <Navbar />
            <main>{children}</main>
          </AuthProvider>
      </body>
    </html>
  );
}
