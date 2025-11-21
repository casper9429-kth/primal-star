import './globals.css';
import Link from 'next/link';
import { getSession, logout } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Precision Shooting Club',
  description: 'Manage your shooting events and track your progress.',
};

export default async function RootLayout({ children }) {
  const session = await getSession();

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <div className="container">
          <nav className="nav">
            <Link href="/" className="nav-brand">
              🎯 Precision Club
            </Link>
            <div className="nav-links">
              {session ? (
                <>
                  <Link href="/events" className="nav-link">Events</Link>
                  <Link href="/profile" className="nav-link">Profile</Link>
                  {session.role === 'admin' && (
                    <Link href="/admin" className="nav-link">Admin</Link>
                  )}
                  <form action={async () => {
                    'use server';
                    await logout();
                    redirect('/login');
                  }}>
                    <button type="submit" className="nav-link" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem' }}>
                      Logout
                    </button>
                  </form>
                </>
              ) : (
                <Link href="/login" className="nav-link">Login</Link>
              )}
            </div>
          </nav>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
