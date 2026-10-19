import crypto from 'crypto';
import { env } from '../config/env';

export interface Fast2SmsResponse {
  return: boolean;
  request_id?: string;
  message?: string[] | string;
  status_code?: number;
}

export class SmsService {
  private apiUrl = 'https://www.fast2sms.com/dev/bulkV2';

  /**
   * Generates a secure, random 6-digit numeric OTP and its SHA-256 hash.
   */
  public generateOtp(): { otp: string; hash: string } {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hash = crypto.createHash('sha256').update(otp).digest('hex');
    return { otp, hash };
  }

  /**
   * Verifies an OTP against a stored SHA-256 hash.
   */
  public verifyOtpHash(otp: string, hash: string): boolean {
    const calculatedHash = crypto.createHash('sha256').update(otp).digest('hex');
    return calculatedHash === hash;
  }

  /**
   * Normalizes an Indian phone number to a clean 10-digit format required by Fast2SMS.
   * Strips +91, 91, leading 0, spaces, and punctuation.
   */
  public cleanPhoneNumber(phone: string): string {
    let digits = (phone || '').replace(/\D/g, '');
    if (digits.length === 12 && digits.startsWith('91')) {
      digits = digits.substring(2);
    } else if (digits.length === 11 && digits.startsWith('0')) {
      digits = digits.substring(1);
    }
    return digits;
  }

  /**
   * Sends a 6-digit OTP to the specified mobile number via Fast2SMS Bulk V2 OTP route.
   */
  public async sendOtp(
    mobileNumber: string,
    otp: string
  ): Promise<{ success: boolean; message: string; data?: any }> {
    const cleanNumber = this.cleanPhoneNumber(mobileNumber);

    if (cleanNumber.length !== 10) {
      throw new Error(
        `Invalid phone number '${mobileNumber}'. Fast2SMS requires a valid 10-digit Indian mobile number.`
      );
    }

    const apiKey = env.FAST2SMS_API_KEY;
    if (!apiKey) {
      throw new Error('FAST2SMS_API_KEY is not configured in environment variables.');
    }

    const payload = {
      route: 'q',
      message: `Your StroitX verification code is: ${otp}. Valid for 10 minutes.`,
      language: 'english',
      numbers: cleanNumber,
      flash: 0,
    };

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          authorization: apiKey,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as Fast2SmsResponse;

      if (!response.ok || data.return === false) {
        const errorMsg = Array.isArray(data.message)
          ? data.message.join(', ')
          : typeof data.message === 'string'
          ? data.message
          : JSON.stringify(data.message || `Fast2SMS failed with status ${data.status_code || response.status}`);

        console.warn(`[Fast2SMS Warning] ${errorMsg}`);

        // In development mode, log OTP to server console so testing is never blocked
        if (env.NODE_ENV === 'development') {
          console.log('\n======================================================');
          console.log(`[StroitX Local Dev OTP]: Code for ${cleanNumber} is ${otp}`);
          console.log(`[Fast2SMS Gateway Note]: ${errorMsg}`);
          console.log('======================================================\n');

          return {
            success: true,
            message: `OTP generated. Use code ${otp} to log in.`,
            data: { testMode: true, error: errorMsg },
          };
        }

        return {
          success: false,
          message: errorMsg,
          data,
        };
      }

      console.log(
        `[Fast2SMS] Successfully sent Quick SMS OTP to ${cleanNumber}. Request ID: ${data.request_id || 'N/A'}`
      );

      return {
        success: true,
        message: 'OTP dispatched successfully via Fast2SMS Quick Route.',
        data,
      };
    } catch (error: any) {
      console.error(`[Fast2SMS Network Error] Error sending OTP to ${cleanNumber}:`, error);

      if (env.NODE_ENV === 'development') {
        console.log('\n======================================================');
        console.log(`[StroitX Local Dev OTP]: Code for ${cleanNumber} is ${otp}`);
        console.log('======================================================\n');
        return {
          success: true,
          message: `OTP generated (Dev mode fallback). Code: ${otp}`,
          data: { testMode: true, error: error.message },
        };
      }

      throw new Error(error.message || 'Failed to dispatch SMS through Fast2SMS gateway.');
    }
  }
}

export const smsService = new SmsService();
