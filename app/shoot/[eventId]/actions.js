'use server';

import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from 'next/cache';


export async function uploadImage(prevState, formData) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    const imageFile = formData.get('image');

    if (!imageFile || imageFile.size === 0) {
      return { error: 'No image uploaded' };
    }

    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Return data to client for review (convert buffer to base64 for preview)
    const base64Image = `data:${imageFile.type};base64,${buffer.toString('base64')}`;

    return {
      success: true,
      analysis: {
        // Default geometry for manual scoring (assuming centered target)
        target: { centerX: 0.5, centerY: 0.5, ringWidth: 0.05 },
        shots: [] // Start with no shots
      },
      imageData: base64Image
    };

  } catch (error) {
    console.error('Upload Image Error:', error);
    return { error: 'Failed to upload image: ' + error.message };
  }
}

export async function saveScore(eventId, scoreData) {
  const session = await getSession();
  if (!session) return { error: 'Unauthorized' };

  try {
    const id = uuidv4();

    db.prepare(`
          INSERT INTO scores (id, user_id, event_id, points, series_data, created_at)
          VALUES (?, ?, ?, ?, ?, unixepoch())
        `).run(id, session.userId, eventId, scoreData.totalPoints, JSON.stringify(scoreData.shots));

    revalidatePath(`/shoot/${eventId}`);
    return { success: true };
  } catch (error) {
    console.error('Save Score Error:', error);
    return { error: 'Failed to save score' };
  }
}
