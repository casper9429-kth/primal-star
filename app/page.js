import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import Link from 'next/link';

export default async function HomePage() {
  const session = await getSession();

  if (!session) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 0' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--primary)' }}>Precision Shooting Club</h1>
        <p style={{ fontSize: '1.2rem', color: '#a0a0a0', marginBottom: '2rem' }}>
          Elevate your marksmanship with advanced tracking and AI analysis.
        </p>
        <Link href="/login" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '0.75rem 2rem' }}>
          Member Login
        </Link>
      </div>
    );
  }

  const user = db.prepare('SELECT username FROM users WHERE id = ?').get(session.userId);
  const scores = db.prepare('SELECT * FROM scores WHERE user_id = ? ORDER BY created_at DESC').all(session.userId);

  // Calculate stats
  const totalSeries = scores.length;
  const totalPoints = scores.reduce((acc, s) => acc + s.points, 0);
  const avgScore = totalSeries > 0 ? (totalPoints / totalSeries).toFixed(1) : 0;
  const bestSeries = scores.length > 0 ? Math.max(...scores.map(s => s.points)) : 0;

  return (
    <div style={{ padding: '2rem 0' }}>
      <h1 style={{ marginBottom: '0.5rem' }}>Welcome back, <span style={{ color: 'var(--primary)' }}>{user.username}</span></h1>
      <p style={{ color: '#a0a0a0', marginBottom: '2rem' }}>Here is your performance overview.</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.9rem', color: '#a0a0a0', marginBottom: '0.5rem' }}>Total Series</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold' }}>{totalSeries}</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.9rem', color: '#a0a0a0', marginBottom: '0.5rem' }}>Avg Score</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--secondary)' }}>{avgScore}</div>
        </div>
        <div className="card" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '0.9rem', color: '#a0a0a0', marginBottom: '0.5rem' }}>Best Series</div>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{bestSeries}</div>
        </div>
      </div>

      <h2 style={{ marginBottom: '1.5rem' }}>Recent Activity</h2>
      {scores.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
          <p style={{ marginBottom: '1rem' }}>No shooting activity recorded yet.</p>
          <Link href="/events" className="btn btn-primary">Find an Event</Link>
        </div>
      ) : (
        <div className="card">
          <ul style={{ listStyle: 'none' }}>
            {scores.slice(0, 5).map(score => (
              <li key={score.id} style={{ padding: '1rem 0', borderBottom: '1px solid var(--surface-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '0.9rem', color: '#a0a0a0' }}>
                    {new Date(score.created_at * 1000).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                  {score.points} pts
                </div>
              </li>
            ))}
          </ul>
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <Link href="/events" className="btn btn-outline" style={{ fontSize: '0.9rem' }}>View All Events</Link>
          </div>
        </div>
      )}
    </div>
  );
}
