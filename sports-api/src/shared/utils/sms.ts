import { env } from '../../config/env.js';

interface SendSmsParams {
  to: string;
  message: string;
}

interface SendOtpParams {
  to: string;
  code: string;
}

// SMS provider stub - replace with actual provider (Twilio, Africa's Talking, etc.)
export const sendSms = async ({ to, message }: SendSmsParams): Promise<boolean> => {
  if (!env.SMS_API_KEY) {
    // Only log in development - NEVER log OTP codes in production
    if (env.NODE_ENV === 'development') {
      console.log(`[SMS STUB] To: ${to}, Message: ${message}`);
    } else {
      console.log(`[SMS STUB] OTP sent to: ${to.slice(0, 4)}****`);
    }
    return true; // Stub returns success in development
  }

  // TODO: Implement actual SMS provider
  // Example with Twilio:
  // const client = twilio(env.TWILIO_SID, env.TWILIO_AUTH_TOKEN);
  // await client.messages.create({
  //   body: message,
  //   from: env.TWILIO_PHONE_NUMBER,
  //   to: to,
  // });

  // Log sending (without sensitive content) for audit trail
  console.log(`[SMS] Sent to: ${to.slice(0, 4)}****`);
  return true;
};

export const sendOtp = async ({ to, code }: SendOtpParams): Promise<boolean> => {
  const message = `Your verification code is: ${code}. Valid for 10 minutes.`;
  return sendSms({ to, message });
};

export const generateOtpCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
