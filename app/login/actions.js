'use server';

import { verifyPassword, createSession } from '@/lib/auth';
import db from '@/lib/db';
import { redirect } from 'next/navigation';

export async function login(formData) {
    const username = formData.get('username');
    const password = formData.get('password');

    if (!username || !password) {
        return { error: 'Username and password are required' };
    }

    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user || !(await verifyPassword(password, user.password_hash))) {
        return { error: 'Invalid credentials' };
    }

    await createSession(user.id, user.role);
    redirect('/');
}
