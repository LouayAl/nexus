// backend/src/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host:   process.env.MAIL_HOST   ?? 'smtp.gmail.com',
    port:   Number(process.env.MAIL_PORT ?? 587),
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  async sendCredentials(to: string, data: {
    nom:      string;
    email:    string;
    password: string;
    role:     'CANDIDAT' | 'ENTREPRISE';
    loginUrl: string;
  }) {
    const roleLabel = data.role === 'CANDIDAT' ? 'candidat' : 'recruteur';
    await this.transporter.sendMail({
      from:    process.env.MAIL_FROM,
      to,
      subject: `Vos identifiants S3M`,
      html: `
        <div style="font-family:'DM Sans',Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;background:#FAFAF8;border-radius:16px;">
          <div style="text-align:center;margin-bottom:24px;">
              <img src="https://recrutement.ifmia.ma/brand/Logo.webp" alt="S3M" style="height:32px;width:auto;" />
            <h1 style="font-size:22px;font-weight:900;color:#10406B;margin:12px 0 4px;">S3M</h1>
          </div>
          <h2 style="font-size:18px;font-weight:700;color:#0D2137;margin-bottom:8px;">Bienvenue sur S3M !</h2>
          <p style="color:#5A7A96;font-size:14px;line-height:1.6;margin-bottom:24px;">
            Votre compte ${roleLabel} a été créé. Voici vos identifiants de connexion :
          </p>
          <div style="background:white;border:1px solid rgba(16,64,107,0.1);border-radius:12px;padding:20px;margin-bottom:24px;">
            <div style="margin-bottom:12px;">
              <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#5A7A96;">Email</span>
              <div style="font-size:15px;font-weight:600;color:#0D2137;margin-top:4px;">${data.email}</div>
            </div>
            <div>
              <span style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:#5A7A96;">Mot de passe temporaire</span>
              <div style="font-size:15px;font-weight:600;color:#0D2137;margin-top:4px;font-family:monospace;background:#F7F8FA;padding:8px 12px;border-radius:8px;">${data.password}</div>
            </div>
          </div>
          <p style="color:#D64045;font-size:13px;margin-bottom:20px;">⚠️ Changez votre mot de passe dès votre première connexion.</p>
          <a href="${data.loginUrl}" style="display:block;text-align:center;background:linear-gradient(135deg,#10406B,#2284C0);color:white;padding:14px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;">
            Se connecter →
          </a>
          <p style="text-align:center;font-size:11px;color:#B0C4D4;margin-top:24px;">Powered by S3M · S3M Recrutement</p>
        </div>
      `,
    });
  }

  async sendPasswordChanged(to: string, nom: string) {
    await this.transporter.sendMail({
      from:    process.env.MAIL_FROM,
      to,
      subject: 'Votre mot de passe S3M a été modifié',
      html: `
        <div style="font-family:'DM Sans',Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;">
          <h2 style="color:#10406B;">Mot de passe modifié</h2>
          <p style="color:#5A7A96;">Bonjour ${nom}, votre mot de passe S3M a été modifié avec succès.</p>
          <p style="color:#5A7A96;">Si vous n'êtes pas à l'origine de cette modification, contactez-nous immédiatement.</p>
        </div>
      `,
    });
  }

  async sendCandidateWelcome(to: string, nom: string, profileUrl: string) {
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject: 'Bienvenue sur S3M / Welcome to S3M',
      html: `
        <div style="font-family:'DM Sans',Arial,sans-serif;max-width:620px;margin:0 auto;padding:32px 24px;background:#FAFAF8;border-radius:16px;">
          <div style="text-align:center;margin-bottom:24px;">
              <img src="https://recrutement.ifmia.ma/brand/Logo.webp" alt="S3M" style="height:42px;width:auto;" />
            <h1 style="font-size:22px;font-weight:900;color:#10406B;margin:12px 0 4px;">S3M</h1>
          </div>
          <h2 style="font-size:18px;font-weight:700;color:#0D2137;margin-bottom:8px;">Bienvenue ${nom}</h2>
          <p style="color:#5A7A96;font-size:14px;line-height:1.7;margin-bottom:10px;">
            Votre espace candidat est prêt. Vous pouvez compléter votre profil, ajouter vos informations et téléverser votre CV pour votre parcours de recrutement.
          </p>
          <p style="color:#5A7A96;font-size:14px;line-height:1.7;margin-bottom:24px;">
            Your candidate space is ready. You can complete your profile, add your information, and upload your resume to support your recruitment journey.
          </p>
          <a href="${profileUrl}" style="display:block;text-align:center;background:linear-gradient(135deg,#10406B,#2284C0);color:white;padding:14px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;">
            Accéder à mon profil / Open my profile
          </a>
          <p style="text-align:center;font-size:11px;color:#B0C4D4;margin-top:24px;">Powered by S3M · S3M Recrutement</p>
        </div>
      `,
    });
  }
  async sendEntrepriseWelcome(to: string, nom: string, dashboardUrl: string) {
  await this.transporter.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject: 'Bienvenue sur S3M — Espace Recruteur',
    html: `
      <div style="font-family:'DM Sans',Arial,sans-serif;max-width:620px;margin:0 auto;padding:32px 24px;background:#FAFAF8;border-radius:16px;">
        <div style="text-align:center;margin-bottom:24px;">
            <img src="https://recrutement.ifmia.ma/brand/Logo.webp" alt="S3M" style="height:42px;width:auto;" />
          <h1 style="font-size:22px;font-weight:900;color:#10406B;margin:12px 0 4px;">S3M</h1>
        </div>
        <h2 style="font-size:18px;font-weight:700;color:#0D2137;margin-bottom:8px;">Bienvenue ${nom}</h2>
        <p style="color:#5A7A96;font-size:14px;line-height:1.7;margin-bottom:10px;">
          Votre espace recruteur est prêt. Vous pouvez compléter le profil de votre entreprise, publier des offres d'emploi et gérer vos candidatures.
        </p>
        <a href="${dashboardUrl}" style="display:block;text-align:center;background:linear-gradient(135deg,#EE813D,#d4691f);color:white;padding:14px;border-radius:12px;text-decoration:none;font-weight:700;font-size:14px;">
          Accéder à mon espace recruteur →
        </a>
        <p style="text-align:center;font-size:11px;color:#B0C4D4;margin-top:24px;">Powered by S3M · S3M Recrutement</p>
      </div>
    `,
  });
}
}
