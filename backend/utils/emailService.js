import nodemailer from 'nodemailer';

// Creer le transporteur email (Gmail ou SMTP generique)
const createTransporter = () => {
    // En dev: utiliser Ethereal (mail de test gratuit)
    // En prod: utiliser un vrai SMTP (Gmail, SendGrid, etc.)
    if (process.env.SMTP_HOST) {
        const config = {
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === 'true',
            tls: { rejectUnauthorized: false }
        };
        // N'ajouter auth que si user/pass sont renseignes (MailHog n'en a pas besoin)
        if (process.env.SMTP_USER && process.env.SMTP_PASS) {
            config.auth = {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            };
        }
        return nodemailer.createTransport(config);
    }

    // Gmail (necessite un "App Password")
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD
            }
        });
    }

    // Fallback: Ethereal (emails de test, visibles sur ethereal.email)
    return null;
};

// Formater le prix
const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-TN', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(price);
};

// Generer le HTML de la facture
const generateInvoiceHTML = (order) => {
    const orderDate = new Date(order.createdAt).toLocaleDateString('fr-FR', {
        day: '2-digit', month: 'long', year: 'numeric'
    });
    const orderNumber = order._id.toString().slice(-8).toUpperCase();

    const itemsHTML = order.items.map(item => `
    <tr>
      <td style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9; font-size: 14px; color: #334155;">
        ${item.productName}
      </td>
      <td style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9; text-align: center; font-size: 14px; color: #64748b;">
        ${item.quantity}
      </td>
      <td style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9; text-align: right; font-size: 14px; color: #334155;">
        ${formatPrice(item.price)} DT
      </td>
      <td style="padding: 14px 16px; border-bottom: 1px solid #f1f5f9; text-align: right; font-size: 14px; font-weight: 600; color: #0f172a;">
        ${formatPrice(item.price * item.quantity)} DT
      </td>
    </tr>
  `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <div style="max-width: 640px; margin: 0 auto; padding: 32px 16px;">

    <!-- Header -->
    <div style="background: linear-gradient(145deg, #4361ee, #3a0ca3); border-radius: 16px 16px 0 0; padding: 40px 32px; text-align: center;">
      <h1 style="margin: 0; color: white; font-size: 26px; font-weight: 700; letter-spacing: -0.5px;">
        UniVerTechno+
      </h1>
      <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">
        Votre facture de commande
      </p>
    </div>

    <!-- Content -->
    <div style="background: white; padding: 32px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">

      <!-- Success badge -->
      <div style="text-align: center; margin-bottom: 28px;">
        <div style="display: inline-block; background: #d1fae5; color: #065f46; padding: 8px 20px; border-radius: 50px; font-size: 13px; font-weight: 600;">
          &#10003; Paiement confirme
        </div>
      </div>

      <!-- Order info -->
      <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 28px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 4px 0; font-size: 13px; color: #64748b;">N de commande</td>
            <td style="padding: 4px 0; font-size: 13px; color: #0f172a; font-weight: 600; text-align: right;">#${orderNumber}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-size: 13px; color: #64748b;">Date</td>
            <td style="padding: 4px 0; font-size: 13px; color: #0f172a; text-align: right;">${orderDate}</td>
          </tr>
          <tr>
            <td style="padding: 4px 0; font-size: 13px; color: #64748b;">Statut</td>
            <td style="padding: 4px 0; font-size: 13px; color: #065f46; font-weight: 600; text-align: right;">Confirmee</td>
          </tr>
        </table>
      </div>

      <!-- Shipping info -->
      <h3 style="margin: 0 0 12px; font-size: 15px; color: #0f172a; font-weight: 600;">
        Adresse de livraison
      </h3>
      <div style="background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 10px; padding: 16px; margin-bottom: 28px; font-size: 13px; color: #334155; line-height: 1.6;">
        <strong>${order.shippingInfo.fullName}</strong><br>
        ${order.shippingInfo.address}<br>
        ${order.shippingInfo.postalCode} ${order.shippingInfo.city}<br>
        Tel: ${order.shippingInfo.phone}<br>
        Email: ${order.shippingInfo.email}
      </div>

      <!-- Items table -->
      <h3 style="margin: 0 0 12px; font-size: 15px; color: #0f172a; font-weight: 600;">
        Articles commandes
      </h3>
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr style="background: #f8fafc;">
            <th style="padding: 12px 16px; text-align: left; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Produit</th>
            <th style="padding: 12px 16px; text-align: center; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Qte</th>
            <th style="padding: 12px 16px; text-align: right; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Prix unit.</th>
            <th style="padding: 12px 16px; text-align: right; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; font-weight: 600;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHTML}
        </tbody>
      </table>

      <!-- Totals -->
      <div style="border-top: 2px solid #e2e8f0; padding-top: 16px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 6px 16px; font-size: 14px; color: #64748b;">Sous-total</td>
            <td style="padding: 6px 16px; text-align: right; font-size: 14px; color: #334155;">${formatPrice(order.totalAmount)} DT</td>
          </tr>
          <tr>
            <td style="padding: 6px 16px; font-size: 14px; color: #64748b;">Livraison</td>
            <td style="padding: 6px 16px; text-align: right; font-size: 14px; color: #16a34a; font-weight: 500;">Gratuite</td>
          </tr>
          <tr>
            <td style="padding: 14px 16px; font-size: 18px; font-weight: 700; color: #0f172a;">Total</td>
            <td style="padding: 14px 16px; text-align: right; font-size: 20px; font-weight: 700; color: #4361ee;">${formatPrice(order.totalAmount)} DT</td>
          </tr>
        </table>
      </div>

      <!-- CTA -->
      <div style="text-align: center; margin-top: 32px;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/client/dashboard"
          style="display: inline-block; background: linear-gradient(145deg, #4361ee, #3a0ca3); color: white; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-size: 14px; font-weight: 600; box-shadow: 0 8px 25px rgba(67, 97, 238, 0.35);">
          Voir mes commandes
        </a>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; padding: 24px 16px;">
      <p style="margin: 0 0 8px; font-size: 13px; color: #64748b;">
        Merci pour votre confiance !
      </p>
      <p style="margin: 0; font-size: 12px; color: #94a3b8;">
        UniVerTechno+ - Equipements CNC & Education
      </p>
      <p style="margin: 8px 0 0; font-size: 11px; color: #cbd5e1;">
        Cet email a ete envoye automatiquement. Veuillez ne pas y repondre.
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

// Envoyer l'email de facture
export const sendInvoiceEmail = async (order) => {
    try {
        let transporter = createTransporter();

        // Si pas de transporter configure, utiliser Ethereal (test)
        if (!transporter) {
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                secure: false,
                auth: {
                    user: testAccount.user,
                    pass: testAccount.pass
                }
            });
            console.log('Email de test via Ethereal (pas de SMTP configure)');
        }

        const orderNumber = order._id.toString().slice(-8).toUpperCase();

        const mailOptions = {
            from: `"UniVerTechno+" <${process.env.GMAIL_USER || process.env.SMTP_USER || 'noreply@univertechno.com'}>`,
            to: order.shippingInfo.email,
            subject: `Confirmation de commande #${orderNumber} - UniVerTechno+`,
            html: generateInvoiceHTML(order)
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`Email facture envoye: ${info.messageId}`);

        // Si Ethereal, afficher le lien de preview
        if (info.messageId && !process.env.GMAIL_USER && !process.env.SMTP_HOST) {
            const previewUrl = nodemailer.getTestMessageUrl(info);
            console.log(`Preview email: ${previewUrl}`);
        }

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Erreur envoi email facture:', error);
        return { success: false, error: error.message };
    }
};

// Envoyer notification email a l'admin pour nouvelle commande
export const sendAdminNotificationEmail = async (order) => {
    try {
        let transporter = createTransporter();
        if (!transporter) {
            const testAccount = await nodemailer.createTestAccount();
            transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email', port: 587, secure: false,
                auth: { user: testAccount.user, pass: testAccount.pass }
            });
        }

        const orderNumber = order._id.toString().slice(-8).toUpperCase();
        const itemsList = order.items.map(item =>
            `<tr><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;font-size:13px;">${item.productName}</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:center;font-size:13px;">${item.quantity}</td><td style="padding:8px 12px;border-bottom:1px solid #f1f5f9;text-align:right;font-size:13px;font-weight:600;">${formatPrice(item.price * item.quantity)} DT</td></tr>`
        ).join('');

        const html = `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="max-width:580px;margin:0 auto;padding:24px 16px;">
  <div style="background:linear-gradient(145deg,#1e3c72,#2a5298);border-radius:12px 12px 0 0;padding:24px;text-align:center;">
    <h2 style="margin:0;color:white;font-size:20px;">Nouvelle Commande !</h2>
    <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">Commande #${orderNumber}</p>
  </div>
  <div style="background:white;padding:24px;border-radius:0 0 12px 12px;box-shadow:0 4px 15px rgba(0,0,0,0.06);">
    <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:12px;margin-bottom:20px;text-align:center;font-size:13px;color:#92400e;font-weight:600;">
      En attente de traitement
    </div>
    <h4 style="margin:0 0 8px;font-size:14px;color:#0f172a;">Client</h4>
    <p style="margin:0 0 16px;font-size:13px;color:#64748b;">${order.shippingInfo.fullName} - ${order.shippingInfo.email}<br>Tel: ${order.shippingInfo.phone}</p>
    <h4 style="margin:0 0 8px;font-size:14px;color:#0f172a;">Livraison</h4>
    <p style="margin:0 0 16px;font-size:13px;color:#64748b;">${order.shippingInfo.address}, ${order.shippingInfo.postalCode} ${order.shippingInfo.city}</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
      <thead><tr style="background:#f8fafc;"><th style="padding:8px 12px;text-align:left;font-size:11px;color:#64748b;text-transform:uppercase;">Produit</th><th style="padding:8px 12px;text-align:center;font-size:11px;color:#64748b;text-transform:uppercase;">Qte</th><th style="padding:8px 12px;text-align:right;font-size:11px;color:#64748b;text-transform:uppercase;">Total</th></tr></thead>
      <tbody>${itemsList}</tbody>
    </table>
    <div style="text-align:right;font-size:18px;font-weight:700;color:#4361ee;padding-top:8px;border-top:2px solid #e2e8f0;">
      ${formatPrice(order.totalAmount)} DT
    </div>
    <div style="text-align:center;margin-top:24px;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders" style="display:inline-block;background:linear-gradient(145deg,#1e3c72,#2a5298);color:white;text-decoration:none;padding:12px 28px;border-radius:50px;font-size:13px;font-weight:600;">
        Voir les commandes
      </a>
    </div>
  </div>
</div>
</body></html>`;

        const adminEmail = process.env.ADMIN_EMAIL || process.env.GMAIL_USER || 'admin@univertechno.com';
        const info = await transporter.sendMail({
            from: `"UniVerTechno+" <${process.env.SMTP_USER || 'noreply@univertechno.com'}>`,
            to: adminEmail,
            subject: `Nouvelle commande #${orderNumber} - ${formatPrice(order.totalAmount)} DT`,
            html
        });

        console.log(`Email admin envoye: ${info.messageId}`);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Erreur envoi email admin:', error);
        return { success: false, error: error.message };
    }
};
