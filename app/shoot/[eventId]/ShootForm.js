'use client';

import { useState, useActionState, useEffect } from 'react';
import { uploadImage, saveScore } from './actions';
import { useRouter } from 'next/navigation';

const initialState = {
    message: null,
    error: null,
};

export default function ShootForm({ eventId }) {
    const [mode, setMode] = useState('upload'); // 'upload' | 'calibrate' | 'score'
    const [analysisData, setAnalysisData] = useState(null);
    const [imageData, setImageData] = useState(null);
    const [shots, setShots] = useState([]);
    const [isSaving, setIsSaving] = useState(false);
    const [calibrationPoints, setCalibrationPoints] = useState([]);
    const router = useRouter();

    const [state, formAction, isPending] = useActionState(uploadImage, initialState);

    useEffect(() => {
        if (state?.success && state.analysis && state.imageData) {
            setAnalysisData(state.analysis);
            setImageData(state.imageData);
            setShots(state.analysis.shots);
            setMode('calibrate'); // Go to calibration first
        }
    }, [state]);

    const handleCalibrationClick = (e) => {
        const rect = e.target.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        const newPoints = [...calibrationPoints, { x, y }];
        setCalibrationPoints(newPoints);

        // After 2 clicks, calculate target geometry
        if (newPoints.length === 2) {
            const center = newPoints[0];
            const edge = newPoints[1];

            const dx = edge.x - center.x;
            const dy = edge.y - center.y;
            const radius = Math.sqrt(dx * dx + dy * dy);

            // User clicked from center to 5-ring edge
            // So 5 rings = radius, meaning 1 ring = radius / 5
            const ringWidth = radius / 5;

            setAnalysisData({
                ...analysisData,
                target: {
                    centerX: center.x,
                    centerY: center.y,
                    ringWidth
                }
            });

            setMode('score');
            setCalibrationPoints([]);
        }
    };

    const skipCalibration = () => {
        setMode('score');
    };

    const handleImageClick = (e) => {
        const target = analysisData?.target || { centerX: 0.5, centerY: 0.5, ringWidth: 0.05 };

        const rect = e.target.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        const points = calculatePoints(x, y, target);

        const newShot = { x, y, points, id: Date.now() };
        setShots([...shots, newShot]);
    };

    const removeShot = (index, e) => {
        e.stopPropagation();
        const newShots = [...shots];
        newShots.splice(index, 1);
        setShots(newShots);
    };

    const calculatePoints = (x, y, target) => {
        const dx = x - target.centerX;
        const dy = y - target.centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        const ringIndex = Math.floor(distance / target.ringWidth);
        const points = Math.max(0, 10 - ringIndex);
        return points;
    };

    const handleSave = async () => {
        setIsSaving(true);
        const totalPoints = shots.reduce((sum, shot) => sum + shot.points, 0);

        const result = await saveScore(eventId, {
            totalPoints,
            shots
        });

        if (result.success) {
            router.refresh();
            setMode('upload');
            setShots([]);
            setImageData(null);
            setAnalysisData(null);
            setCalibrationPoints([]);
        } else {
            alert('Failed to save score');
        }
        setIsSaving(false);
    };

    // Calibration mode
    if (mode === 'calibrate' && imageData) {
        return (
            <div className="card">
                <h2 style={{ marginBottom: '1rem' }}>Calibrate Target</h2>
                <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#a0a0a0' }}>
                    {calibrationPoints.length === 0 && 'Step 1: Click the center (bullseye)'}
                    {calibrationPoints.length === 1 && 'Step 2: Click the edge of the 5-ring'}
                </p>

                <div
                    style={{ position: 'relative', marginBottom: '1.5rem', cursor: 'crosshair' }}
                    onClick={handleCalibrationClick}
                >
                    <img
                        src={imageData}
                        alt="Target"
                        style={{ width: '100%', borderRadius: '8px', display: 'block' }}
                    />

                    {calibrationPoints.map((point, index) => (
                        <div
                            key={index}
                            style={{
                                position: 'absolute',
                                left: `${point.x * 100}%`,
                                top: `${point.y * 100}%`,
                                width: '16px',
                                height: '16px',
                                background: index === 0 ? 'rgba(0, 255, 0, 0.8)' : 'rgba(0, 150, 255, 0.8)',
                                border: '2px solid white',
                                borderRadius: '50%',
                                transform: 'translate(-50%, -50%)'
                            }}
                        />
                    ))}
                </div>

                <button
                    className="btn btn-outline"
                    onClick={skipCalibration}
                    style={{ width: '100%' }}
                >
                    Skip Calibration
                </button>
            </div>
        );
    }

    // Scoring mode
    if (mode === 'score' && imageData) {
        const totalPoints = shots.reduce((sum, shot) => sum + shot.points, 0);

        return (
            <div className="card">
                <h2 style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                    Score Target
                    <span style={{ color: 'var(--primary)' }}>{totalPoints} pts</span>
                </h2>
                <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#a0a0a0' }}>
                    Tap bullet holes to add shot. Tap red dot to remove.
                </p>

                <div
                    style={{ position: 'relative', marginBottom: '1.5rem', cursor: 'crosshair' }}
                    onClick={handleImageClick}
                >
                    <img
                        src={imageData}
                        alt="Target"
                        style={{ width: '100%', borderRadius: '8px', display: 'block' }}
                    />

                    {shots.map((shot, index) => (
                        <div
                            key={shot.id || index}
                            onClick={(e) => removeShot(index, e)}
                            style={{
                                position: 'absolute',
                                left: `${shot.x * 100}%`,
                                top: `${shot.y * 100}%`,
                                width: '20px',
                                height: '20px',
                                background: 'rgba(255, 0, 0, 0.6)',
                                border: '2px solid white',
                                borderRadius: '50%',
                                transform: 'translate(-50%, -50%)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                                color: 'white',
                                fontWeight: 'bold'
                            }}
                        >
                            {shot.points}
                        </div>
                    ))}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <button
                        className="btn btn-outline"
                        onClick={() => setMode('upload')}
                        disabled={isSaving}
                    >
                        Discard
                    </button>
                    <button
                        className="btn btn-primary"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? 'Saving...' : 'Confirm & Save'}
                    </button>
                </div>
            </div>
        );
    }

    // Upload mode
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
                {isPending ? 'Uploading...' : 'Upload & Score'}
            </button>
        </form>
    );
}
