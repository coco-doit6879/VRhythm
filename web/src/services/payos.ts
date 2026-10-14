export interface PayOSPaymentRequest {
  orderCode: number;
  amount: number;
  description: string;
  cancelUrl?: string;
  returnUrl?: string;
  items?: Array<{ name: string; quantity: number; price: number }>;
}

export interface PayOSPaymentResponse {
  bin: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  description: string;
  orderCode: number;
  currency: string;
  paymentLinkId: string;
  status: 'PENDING' | 'PAID' | 'CANCELLED';
  checkoutUrl: string;
  qrCode: string;
}

export interface PremiumSubscription {
  active: boolean;
  packageCode: string;
  packageName: string;
  amountVnd: number;
  orderCode: number;
  activatedAt: string;
  expiresAt: string;
}

const STORAGE_PREMIUM_KEY = 'vrhythm_premium_subscription';

// Generate integer order code valid for PayOS (under 9007199254740991)
export function generatePayOSOrderCode(): number {
  const timestamp = Date.now().toString().slice(-8);
  const randomSuffix = Math.floor(Math.random() * 90 + 10).toString();
  return parseInt(`${timestamp}${randomSuffix}`, 10);
}

export const DEFAULT_PAYOS_CHECKOUT_URL = 'https://pay.payos.vn/web/d4f43bdb3ca84976be491cf20c039bb0';
export const DEFAULT_PAYOS_BANK = {
  bin: '970422',
  bankName: 'MB Bank (Ngân hàng TMCP Quân Đội)',
  accountNumber: '0908120950',
  accountName: 'DUONG NGOC HOANG',
};

// VietQR QuickLink generation utility
export function getVietQRImageUrl({
  bin = DEFAULT_PAYOS_BANK.bin,
  accountNumber = DEFAULT_PAYOS_BANK.accountNumber,
  accountName = DEFAULT_PAYOS_BANK.accountName,
  amount = 59000,
  description = 'VRHYTHM PREMIUM',
}: {
  bin?: string;
  accountNumber?: string;
  accountName?: string;
  amount?: number;
  description?: string;
}): string {
  const encodedName = encodeURIComponent(accountName);
  const encodedDesc = encodeURIComponent(description);
  return `https://img.vietqr.io/image/${bin}-${accountNumber}-compact2.png?amount=${amount}&addInfo=${encodedDesc}&accountName=${encodedName}`;
}

export const premiumStorage = {
  get(): PremiumSubscription | null {
    try {
      const raw = localStorage.getItem(STORAGE_PREMIUM_KEY);
      if (!raw) return null;
      const parsed: PremiumSubscription = JSON.parse(raw);
      if (!parsed || !parsed.active) return null;
      if (parsed.expiresAt && Date.parse(parsed.expiresAt) <= Date.now()) {
        localStorage.removeItem(STORAGE_PREMIUM_KEY);
        return null;
      }
      return parsed;
    } catch {
      localStorage.removeItem(STORAGE_PREMIUM_KEY);
      return null;
    }
  },

  isActive(): boolean {
    return this.get() !== null;
  },

  activate(orderCode: number, packageCode = 'flute-plus', packageName = 'Gói Premium Chuyên Sâu', amountVnd = 59000, days = 30): PremiumSubscription {
    const now = new Date();
    const expires = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const sub: PremiumSubscription = {
      active: true,
      packageCode,
      packageName,
      amountVnd,
      orderCode,
      activatedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
    };
    localStorage.setItem(STORAGE_PREMIUM_KEY, JSON.stringify(sub));
    return sub;
  },

  clear() {
    localStorage.removeItem(STORAGE_PREMIUM_KEY);
  },
};

export function parsePayOSCallbackParams(search: string): {
  isCallback: boolean;
  status: 'PAID' | 'CANCELLED' | 'PENDING' | null;
  orderCode: number | null;
} {
  const params = new URLSearchParams(search);
  const statusParam = params.get('status');
  const codeParam = params.get('code');
  const cancelParam = params.get('cancel');
  const orderCodeStr = params.get('orderCode');
  const orderCode = orderCodeStr ? parseInt(orderCodeStr, 10) : null;

  if (statusParam === 'PAID' || (codeParam === '00' && cancelParam !== 'true')) {
    return { isCallback: true, status: 'PAID', orderCode };
  }
  if (statusParam === 'CANCELLED' || cancelParam === 'true') {
    return { isCallback: true, status: 'CANCELLED', orderCode };
  }
  if (statusParam === 'PENDING') {
    return { isCallback: true, status: 'PENDING', orderCode };
  }
  return { isCallback: false, status: null, orderCode };
}
