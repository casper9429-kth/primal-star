'use client';

import { useFormState } from 'react-dom';
import { login } from './actions';

export default function LoginPage() {
    return (
        <div style={{ maxWidth: '400px', margin: '4rem auto' }}>
            <div className="card">
                <h1 style={{ marginBottom: '1.5rem', textAlign: 'center', color: 'var(--primary)' }}>Member Login</h1>
                <form action={login} autoComplete="off">
                    <div style={{ marginBottom: '1rem' }}>
                        <label className="label" htmlFor="username">Username</label>
                        <input className="input" type="text" id="username" name="username" required />
                    </div>
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label className="label" htmlFor="password">Password</label>
                        <input className="input" type="password" id="password" name="password" required />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}
