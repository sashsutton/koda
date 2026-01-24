import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
    throw new Error('Il manque la variable RESEND_API_KEY dans le fichier .env');
}

export const resend = new Resend(process.env.RESEND_API_KEY);