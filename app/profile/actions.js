'use server';

import db from '@/lib/db';
import { getSession } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { revalidatePath } from 'next/cache';

async function checkAuth() {
    const session = await getSession();
    if (!session) {
        throw new Error('Unauthorized');
    }
    return session;
}

export async function addLicense(formData) {
    const session = await checkAuth();
    const type = formData.get('type');
    const number = formData.get('number');
    const expiry_date = formData.get('expiry_date');
    const id = uuidv4();

    db.prepare('INSERT INTO licenses (id, user_id, type, number, expiry_date) VALUES (?, ?, ?, ?, ?)')
        .run(id, session.userId, type, number, expiry_date);
    revalidatePath('/profile');
}

export async function deleteLicense(formData) {
    const session = await checkAuth();
    const id = formData.get('id');
    db.prepare('DELETE FROM licenses WHERE id = ? AND user_id = ?').run(id, session.userId);
    revalidatePath('/profile');
}

export async function addWeapon(formData) {
    const session = await checkAuth();
    const model = formData.get('model');
    const caliber = formData.get('caliber');
    const serial_number = formData.get('serial_number');
    const id = uuidv4();

    db.prepare('INSERT INTO weapons (id, user_id, model, caliber, serial_number) VALUES (?, ?, ?, ?, ?)')
        .run(id, session.userId, model, caliber, serial_number);
    revalidatePath('/profile');
}

export async function deleteWeapon(formData) {
    const session = await checkAuth();
    const id = formData.get('id');
    db.prepare('DELETE FROM weapons WHERE id = ? AND user_id = ?').run(id, session.userId);
    revalidatePath('/profile');
}
