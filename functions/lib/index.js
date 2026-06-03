"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyEmailToken = exports.sendVerificationToken = void 0;
const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
admin.initializeApp();
const db = admin.firestore();
function generateToken() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
function createTransporter() {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
        },
    });
}
// ─── sendVerificationToken ────────────────────────────────────────────────────
// Gera um código de 6 dígitos, armazena em /emailVerifications/{uid} (somente
// admin SDK tem acesso) e envia por e-mail. Pode ser chamada no cadastro e no
// reenvio.
exports.sendVerificationToken = functions.https.onCall(async (_data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Não autenticado.');
    }
    const uid = context.auth.uid;
    const email = context.auth.token.email;
    if (!email) {
        throw new functions.https.HttpsError('invalid-argument', 'Usuário sem e-mail.');
    }
    const token = generateToken();
    const expiresAt = admin.firestore.Timestamp.fromDate(new Date(Date.now() + 15 * 60 * 1000));
    await db.doc(`emailVerifications/${uid}`).set({ token, expiresAt, attempts: 0 });
    await createTransporter().sendMail({
        from: `"Meu Álbum Completo" <${process.env.MAIL_USER}>`,
        to: email,
        subject: 'Seu código de verificação',
        html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px">
        <h2 style="color:#10B981;margin-bottom:8px">Meu Álbum Completo</h2>
        <p style="color:#334155;font-size:15px">Seu código de verificação é:</p>
        <div style="font-size:42px;font-weight:900;letter-spacing:10px;color:#0F172A;margin:20px 0;text-align:center">
          ${token}
        </div>
        <p style="color:#64748B;font-size:13px">
          Válido por 15 minutos. Não compartilhe este código com ninguém.
        </p>
      </div>
    `,
    });
    return { success: true };
});
// ─── verifyEmailToken ─────────────────────────────────────────────────────────
// Valida o código informado pelo usuário. Em caso de sucesso, marca
// users/{uid}.emailVerified = true e apaga o documento de verificação.
exports.verifyEmailToken = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'Não autenticado.');
    }
    const uid = context.auth.uid;
    const { token } = data;
    if (!token || typeof token !== 'string' || token.length !== 6) {
        throw new functions.https.HttpsError('invalid-argument', 'Código inválido.');
    }
    const verRef = db.doc(`emailVerifications/${uid}`);
    const verDoc = await verRef.get();
    if (!verDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Nenhum código pendente. Solicite um novo.');
    }
    const { token: stored, expiresAt, attempts } = verDoc.data();
    if (attempts >= 5) {
        throw new functions.https.HttpsError('resource-exhausted', 'Muitas tentativas incorretas. Solicite um novo código.');
    }
    await verRef.update({ attempts: admin.firestore.FieldValue.increment(1) });
    if (expiresAt.toDate() < new Date()) {
        throw new functions.https.HttpsError('deadline-exceeded', 'Código expirado. Solicite um novo.');
    }
    if (token.trim() !== stored) {
        const remaining = 4 - attempts;
        throw new functions.https.HttpsError('invalid-argument', remaining > 0
            ? `Código incorreto. ${remaining} tentativa(s) restante(s).`
            : 'Código incorreto. Solicite um novo código.');
    }
    await db.doc(`users/${uid}`).update({ emailVerified: true });
    await verRef.delete();
    return { success: true };
});
//# sourceMappingURL=index.js.map