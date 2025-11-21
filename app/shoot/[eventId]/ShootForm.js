'use client';

import { useActionState } from 'react';
import { submitScore } from './actions';

const initialState = {
    message: null,
    error: null,
};

export default function ShootForm({ eventId }) {
    const [state, formAction, isPending] = useActionState(submitScore, initialState);

    return (
        <form action={formAction}>
            <input type="hidden" name="eventId" value={eventId} />

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

            {state?.error && (
                <div style={{ color: '#ff4444', marginBottom: '1rem', textAlign: 'center' }}>
                    {state.error}
                </div>
            )}

            <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%' }}
                disabled={isPending}
            >
                {isPending ? 'Analyzing...' : 'Analyze & Log Score'}
            </button>
        </form>
    );
}
