import { getSession } from '@/lib/auth';
import db from '@/lib/db';
import { redirect } from 'next/navigation';
import { addLicense, deleteLicense, addWeapon, deleteWeapon } from './actions';

export default async function ProfilePage() {
    const session = await getSession();
    if (!session) {
        redirect('/login');
    }

    const licenses = db.prepare('SELECT * FROM licenses WHERE user_id = ?').all(session.userId);
    const weapons = db.prepare('SELECT * FROM weapons WHERE user_id = ?').all(session.userId);
    const user = db.prepare('SELECT username, role FROM users WHERE id = ?').get(session.userId);

    return (
        <div style={{ padding: '2rem 0' }}>
            <h1 style={{ marginBottom: '0.5rem', color: 'var(--primary)' }}>My Profile</h1>
            <p style={{ marginBottom: '2rem', color: '#a0a0a0' }}>
                Logged in as <strong>{user.username}</strong> ({user.role})
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>

                {/* Licenses Section */}
                <div>
                    <div className="card" style={{ marginBottom: '2rem' }}>
                        <h2 style={{ marginBottom: '1rem' }}>Add License</h2>
                        <form action={addLicense}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label className="label">Type</label>
                                <input className="input" name="type" placeholder="e.g. Pistol, Rifle" required />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label className="label">License Number</label>
                                <input className="input" name="number" required />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label className="label">Expiry Date</label>
                                <input className="input" name="expiry_date" type="date" required />
                            </div>
                            <button type="submit" className="btn btn-primary">Add License</button>
                        </form>
                    </div>

                    <div className="card">
                        <h2 style={{ marginBottom: '1rem' }}>My Licenses ({licenses.length})</h2>
                        <ul style={{ listStyle: 'none' }}>
                            {licenses.map(lic => (
                                <li key={lic.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--surface-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <strong>{lic.type}</strong> - {lic.number}<br />
                                        <span style={{ fontSize: '0.85rem', color: '#a0a0a0' }}>Expires: {lic.expiry_date}</span>
                                    </div>
                                    <form action={deleteLicense}>
                                        <input type="hidden" name="id" value={lic.id} />
                                        <button type="submit" className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}>
                                            Remove
                                        </button>
                                    </form>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Weapons Section */}
                <div>
                    <div className="card" style={{ marginBottom: '2rem' }}>
                        <h2 style={{ marginBottom: '1rem' }}>Add Weapon</h2>
                        <form action={addWeapon}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label className="label">Model</label>
                                <input className="input" name="model" placeholder="e.g. Glock 17" required />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label className="label">Caliber</label>
                                <input className="input" name="caliber" placeholder="e.g. 9mm" required />
                            </div>
                            <div style={{ marginBottom: '1rem' }}>
                                <label className="label">Serial Number</label>
                                <input className="input" name="serial_number" required />
                            </div>
                            <button type="submit" className="btn btn-primary">Add Weapon</button>
                        </form>
                    </div>

                    <div className="card">
                        <h2 style={{ marginBottom: '1rem' }}>My Weapons ({weapons.length})</h2>
                        <ul style={{ listStyle: 'none' }}>
                            {weapons.map(wep => (
                                <li key={wep.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--surface-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <strong>{wep.model}</strong> ({wep.caliber})<br />
                                        <span style={{ fontSize: '0.85rem', color: '#a0a0a0' }}>SN: {wep.serial_number}</span>
                                    </div>
                                    <form action={deleteWeapon}>
                                        <input type="hidden" name="id" value={wep.id} />
                                        <button type="submit" className="btn btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', borderColor: 'var(--danger)', color: 'var(--danger)' }}>
                                            Remove
                                        </button>
                                    </form>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
}
