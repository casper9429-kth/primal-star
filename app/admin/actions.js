'use server';

import db from '@/lib/db';
import { hashPassword, getSession } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

async function checkAdmin() {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
        throw new Error('Unauthorized');
    }
    return session;
}

export async function addMember(formData) {
    await checkAdmin();

    const username = formData.get('username');
    const password = formData.get('password');

    if (!username || !password) return;

    const id = uuidv4();
    const hash = await hashPassword(password);

    try {
        db.prepare('INSERT INTO users (id, username, password_hash, role) VALUES (?, ?, ?, ?)')
            .run(id, username, hash, 'member');
        revalidatePath('/admin');
    } catch (error) {
        console.error('Failed to add member:', error);
        // In a real app, return error to UI
    }
}

export async function addEvent(formData) {
    const session = await checkAdmin();

    const title = formData.get('title');
    const description = formData.get('description');
    const start_time = formData.get('start_time');
    const end_time = formData.get('end_time');
    const location = formData.get('location');

    const id = uuidv4();

    try {
        db.prepare(`
      INSERT INTO events (id, title, description, start_time, end_time, location, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, description, start_time, end_time, location, session.userId);
        revalidatePath('/admin');
    } catch (error) {
        console.error('Failed to add event:', error);
    }
}
