const bcrypt = require('bcryptjs');
const { SignJWT, jwtVerify } = require('jose');
const { cookies } = require('next/headers');

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key-change-me');
const ALG = 'HS256';

async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

async function verifyPassword(password, hash) {
    return await bcrypt.compare(password, hash);
}

async function createSession(userId, role) {
    const token = await new SignJWT({ userId, role })
        .setProtectedHeader({ alg: ALG })
        .setExpirationTime('24h')
        .sign(SECRET_KEY);

    const cookieStore = await cookies();
    cookieStore.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
    });
}

async function getSession() {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;

    if (!token) return null;

    try {
        const { payload } = await jwtVerify(token, SECRET_KEY, {
            algorithms: [ALG],
        });
        return payload;
    } catch (error) {
        return null;
    }
}

async function logout() {
    (await cookies()).delete('session');
}

module.exports = {
    hashPassword,
    verifyPassword,
    createSession,
    getSession,
    logout,
};
