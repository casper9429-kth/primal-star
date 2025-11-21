import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function EventsPage() {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    const events = db.prepare('SELECT * FROM events ORDER BY start_time ASC').all();

    return (
        <div style={{ padding: '2rem 0' }}>
            <h1 style={{ marginBottom: '2rem', color: 'var(--primary)' }}>Club Events</h1>

            {/* Google Calendar Placeholder */}
            <div className="card" style={{ marginBottom: '3rem', textAlign: 'center', padding: '3rem' }}>
                <h3 style={{ marginBottom: '1rem', color: '#a0a0a0' }}>Google Calendar Integration</h3>
                <p style={{ marginBottom: '1rem' }}>
                    (Calendar View Placeholder - Real integration would embed an iframe or fetch from GCal API)
                </p>
                <div style={{ width: '100%', height: '200px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    Calendar Widget
                </div>
            </div>

            <h2 style={{ marginBottom: '1.5rem' }}>Upcoming Events</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {events.map(event => (
                    <div key={event.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                        <h3 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>{event.title}</h3>
                        <p style={{ fontSize: '0.9rem', color: '#a0a0a0', marginBottom: '1rem' }}>
                            {new Date(event.start_time).toLocaleString()}
                        </p>
                        <p style={{ marginBottom: '1.5rem', flexGrow: 1 }}>{event.description}</p>
                        <div style={{ marginTop: 'auto' }}>
                            <Link href={`/shoot/${event.id}`} className="btn btn-primary" style={{ width: '100%' }}>
                                Participate & Log Score
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
