import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import { redirect } from 'next/navigation';
import { addMember, addEvent } from './actions';

export default async function AdminPage() {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        redirect('/');
    }

    const members = db.prepare('SELECT * FROM users WHERE role = ?').all('member');
    const events = db.prepare('SELECT * FROM events ORDER BY start_time DESC').all();

    return (
        <div style={{ padding: '2rem 0' }}>
            <h1 style={{ marginBottom: '2rem', color: 'var(--primary)' }}>Admin Dashboard</h1>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                {/* Members Section */}
                <div>
                    <div className="card" style={{ marginBottom: '2rem' }}>
                        <h2 style={{ marginBottom: '1rem' }}>Add New Member</h2>
                        <form action={addMember}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label className="label">Username</label>
                                <input className="input" name="username" required />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label className="label">Password</label>
                                <input className="input" name="password" type="password" required />
                            </div>
                            <button type="submit" className="btn btn-primary">Add Member</button>
                        </form>
                    </div>

                    <div className="card">
                        <h2 style={{ marginBottom: '1rem' }}>Members ({members.length})</h2>
                        <ul style={{ listStyle: 'none' }}>
                            {members.map(member => (
                                <li key={member.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--surface-hover)' }}>
                                    {member.username}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Events Section */}
                <div>
                    <div className="card" style={{ marginBottom: '2rem' }}>
                        <h2 style={{ marginBottom: '1rem' }}>Add New Event</h2>
                        <form action={addEvent}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label className="label">Title</label>
                                <input className="input" name="title" required />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label className="label">Description</label>
                                <textarea className="input" name="description" rows="3"></textarea>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <div>
                                    <label className="label">Start Time</label>
                                    <input className="input" name="start_time" type="datetime-local" required />
                                </div>
                                <div>
                                    <label className="label">End Time</label>
                                    <input className="input" name="end_time" type="datetime-local" required />
                                </div>
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label className="label">Location</label>
                                <input className="input" name="location" />
                            </div>
                            <button type="submit" className="btn btn-primary">Add Event</button>
                        </form>
                    </div>

                    <div className="card">
                        <h2 style={{ marginBottom: '1rem' }}>Events ({events.length})</h2>
                        <ul style={{ listStyle: 'none' }}>
                            {events.map(event => (
                                <li key={event.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--surface-hover)' }}>
                                    <strong>{event.title}</strong><br />
                                    <span style={{ fontSize: '0.85rem', color: '#a0a0a0' }}>
                                        {new Date(event.start_time).toLocaleString()}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
}
