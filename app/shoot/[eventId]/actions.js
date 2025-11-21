'use server';

import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from 'next/cache';
import { calculateScore } from '@/lib/scoring';

export async function submitScore(prevState, formData) {
  const session = await getSession();
  if (!session) return;

  try {
    const eventId = formData.get('eventId');
    const imageFile = formData.get('image');

    if (!imageFile || imageFile.size === 0) {
      return { error: 'No image uploaded' };
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Call Gemini AI
    const result = await calculateScore(buffer, imageFile.type);
    console.log('AI Score Result:', result);

    if (!result || typeof result.totalPoints !== 'number' || !Array.isArray(result.shots)) {
      throw new Error('Invalid AI response format');
    }

    const id = uuidv4();

    db.prepare(`
      INSERT INTO scores (id, user_id, event_id, points, series_data, created_at)
      VALUES (?, ?, ?, ?, ?, unixepoch())
    `).run(id, session.userId, eventId, result.totalPoints, JSON.stringify(result.shots));

    revalidatePath(`/shoot/${eventId}`);
    return { success: true };
  } catch (error) {
    console.error('Submit Score Error:', error);
    return { error: 'Failed to submit score: ' + error.message };
  }
}
