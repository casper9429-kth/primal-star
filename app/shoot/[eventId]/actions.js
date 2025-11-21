'use server';

import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from 'next/cache';
import { calculateScore } from '@/lib/scoring';

export async function submitScore(formData) {
    const session = await getSession();
    if (!session) return;

    const eventId = formData.get('eventId');
    const image = formData.get('image'); // In a real app, upload this to blob storage

    // Mock processing
    const result = await calculateScore(null);

    const id = uuidv4();

    db.prepare(`
    INSERT INTO scores (id, user_id, event_id, points, series_data, created_at)
    VALUES (?, ?, ?, ?, ?, unixepoch())
  `).run(id, session.userId, eventId, result.totalPoints, JSON.stringify(result.shots));

    revalidatePath(`/shoot/${eventId}`);
}
