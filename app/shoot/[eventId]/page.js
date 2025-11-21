import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import { redirect } from 'next/navigation';
import { submitScore } from './actions';

export default async function ShootPage({ params }) {
    const session = await getSession();
    if (!session) redirect('/login');

    const { eventId } = await params;
    const event = db.prepare('SELECT * FROM events WHERE id = ?').get(eventId);
    if (!event) return <div>Event not found</div>;

    const myScores = db.prepare('SELECT * FROM scores WHERE event_id = ? AND user_id = ? ORDER BY created_at DESC')
        .all(eventId, session.userId);

    return (
        <div style={{ padding: '2rem 0' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{event.title}</h1>
                <p style={{ color: '#a0a0a0' }}>Log your series results</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                {/* Capture Section */}
                <div className="card">
                    <h2 style={{ marginBottom: '1.5rem' }}>New Series</h2>
                    <form action={submitScore}>
                        <input type="hidden" name="eventId" value={params.eventId} />

                        <div style={{ marginBottom: '2rem', textAlign: 'center', border: '2px dashed var(--surface-hover)', padding: '3rem', borderRadius: '8px' }}>
                            <label htmlFor="target-upload" style={{ cursor: 'pointer', display: 'block' }}>
                                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📸</div>
                                <p style={{ marginBottom: '1rem' }}>Tap to take photo of target</p>
                                <input
                                    id="target-upload"
                                    name="image"
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    style={{ display: 'none' }}
                                    required
                                />
                                <div className="btn btn-outline">Select Image</div>
                            </label>
                        </div>

                        <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                            Analyze & Log Score
                        </button>
                    </form>
                </div>

                {/* History Section */}
                <div className="card">
                    <h2 style={{ marginBottom: '1rem' }}>My Series ({myScores.length})</h2>
                    <ul style={{ listStyle: 'none' }}>
                        {myScores.map((score, index) => (
                            <li key={score.id} style={{ padding: '1rem 0', borderBottom: '1px solid var(--surface-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <strong>Series #{myScores.length - index}</strong><br />
                                    <span style={{ fontSize: '0.85rem', color: '#a0a0a0' }}>
                                        {new Date(score.created_at * 1000).toLocaleString()}
                                    </span>
                                </div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                    {score.points} <span style={{ fontSize: '0.8rem', color: '#a0a0a0' }}>pts</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

            </div>
        </div>
    );
}
