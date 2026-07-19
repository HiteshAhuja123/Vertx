// VORTX Notification & Automation Engine
// Integrates Resend API if keys are provided, otherwise logs mock details to the Automation Hub.

import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || '';
const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface AutomationLog {
  type: 'EMAIL' | 'WHATSAPP' | 'SYSTEM';
  message: string;
  timestamp: string;
}

type LogListener = (log: AutomationLog) => void;
const listeners = new Set<LogListener>();

export function subscribeToLogs(callback: LogListener) {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function logAutomation(type: 'EMAIL' | 'WHATSAPP' | 'SYSTEM', message: string) {
  const log: AutomationLog = {
    type,
    message,
    timestamp: new Date().toLocaleTimeString()
  };
  
  if (typeof window !== 'undefined') {
    const logs = JSON.parse(sessionStorage.getItem('vortx_logs') || '[]');
    logs.push(log);
    // Keep max 50 logs
    if (logs.length > 50) logs.shift();
    sessionStorage.setItem('vortx_logs', JSON.stringify(logs));
  }
  
  listeners.forEach(cb => cb(log));
}

export function getLogs(): AutomationLog[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(sessionStorage.getItem('vortx_logs') || '[]');
}

export function clearLogs(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('vortx_logs');
  listeners.forEach(cb => cb({ type: 'SYSTEM', message: 'Logs Cleared', timestamp: new Date().toLocaleTimeString() }));
}

// ==========================================
// AUTOMATED WORKFLOWS
// ==========================================

// Welcome automation: Triggered on user registration
export async function triggerWelcomeAutomation(email: string, name: string, phone?: string) {
  const coupon = 'WELCOME10';
  const welcomeMsg = `Welcome to VORTX, ${name || 'Warrior'}. Designed for Warriors, Not Watchers. Use code ${coupon} for 10% off your first gear drop.`;
  
  // 1. Send simulated WhatsApp message
  const whatsappPhone = phone || '+91 XXXXX XXXXX';
  logAutomation('WHATSAPP', `💬 Welcome Message & 10% coupon [${coupon}] sent to ${whatsappPhone}: "${welcomeMsg}"`);

  // 2. Send welcome email (via Resend if keys present, else mock)
  const emailSubject = 'WELCOME TO VORTX — CHOOSE STRENGTH';
  const emailHtml = `
    <h1>WELCOME TO THE VORTX CLAN, ${name.toUpperCase()}</h1>
    <p>We build premium tech activewear for the hybrid athlete. You are here to work, not watch.</p>
    <h3>YOUR EXCLUSIVE SIGNUP DISCOUNT:</h3>
    <code style="font-size: 24px; font-weight: bold; background: #eee; padding: 5px 10px;">${coupon}</code>
    <p>Enter this code at checkout to receive 10% off your first purchase.</p>
    <p>RECOMMENDED GEAR:<br>- Hybrid Compression Shell<br>- Phantom Joggers</p>
  `;

  if (resend) {
    try {
      await resend.emails.send({
        from: 'VORTX <gear@vortx.fit>',
        to: email,
        subject: emailSubject,
        html: emailHtml,
      });
      logAutomation('EMAIL', `✉️ Welcome email (Resend API) successfully dispatched to ${email}`);
    } catch (err: any) {
      logAutomation('SYSTEM', `❌ Resend API Error sending to ${email}: ${err?.message || err}`);
    }
  } else {
    logAutomation('EMAIL', `✉️ Welcome email dispatched to ${email} (Mock active): Code ${coupon} attached + Recommended products (Hybrid Compression Shell, Phantom Joggers).`);
  }
}

// Purchase automation: Triggered on order completion
export async function triggerOrderCompletedAutomation(
  email: string, 
  name: string, 
  orderNumber: string, 
  totalAmount: number,
  phone: string,
  preOrderCount: number
) {
  // 1. Order and Payment Confirmation
  logAutomation('SYSTEM', `⚙️ Payment Success: Transaction ID TXN-${Math.floor(Math.random() * 900000 + 100000)} verified.`);
  logAutomation('EMAIL', `✉️ Order Confirmation email sent to ${email} for Order #${orderNumber} (Total: ₹${totalAmount.toLocaleString('en-IN')}).`);
  logAutomation('WHATSAPP', `💬 Order Confirmation sent to ${phone}: "Your order #${orderNumber} has been received. Amount: ₹${totalAmount.toLocaleString('en-IN')}. Thank you for choosing VORTX."`);

  if (preOrderCount > 0) {
    logAutomation('SYSTEM', `⚙️ Pre-Order System: ${preOrderCount} item(s) logged in global pre-order backlog queue.`);
    logAutomation('WHATSAPP', `💬 Pre-Order Update: "Your pre-ordered items in Order #${orderNumber} will begin shipping from August 15, 2026."`);
  }
}

// Shipping update automation: Triggered on admin status change
export function triggerShippingAutomation(email: string, phone: string, orderNumber: string, courier: string, trackingNum: string) {
  const trackingMsg = `Your VORTX order #${orderNumber} has been handed over to ${courier}. Track with ID: ${trackingNum}. Link: https://track.vortx.fit/${trackingNum}`;
  logAutomation('EMAIL', `✉️ Shipping & Tracking Details email sent to ${email} (Courier: ${courier}, Tracking ID: ${trackingNum})`);
  logAutomation('WHATSAPP', `💬 Shipping Alert sent to ${phone}: "${trackingMsg}"`);
}

// Delivery update automation: Triggered on admin status change
export function triggerDeliveryAutomation(email: string, phone: string, orderNumber: string) {
  logAutomation('EMAIL', `✉️ Order Delivered notification sent to ${email}. We hope you dominate your next workout in VORTX gear.`);
  logAutomation('WHATSAPP', `💬 Delivery Confirmation sent to ${phone}: "Your order #${orderNumber} has been delivered. Welcome to the warrior community."`);
  
  // 5. Automated review request 3 seconds later (simulated)
  setTimeout(() => {
    logAutomation('EMAIL', `✉️ Automated Review Request: Send email to ${email} asking for feedback on Order #${orderNumber}. "Warriors build warriors. Leave a review now and get ₹500 off your next drop."`);
  }, 3000);
}
