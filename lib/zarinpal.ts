/**
 * ZarinPal payment gateway server-side wrapper.
 * Handles payment request (authority) and verification flows.
 * Supports sandbox mode via ZARINPAL_SANDBOX env var.
 */

const SANDBOX_BASE = "https://sandbox.zarinpal.com";
const PRODUCTION_BASE = "https://payment.zarinpal.com";

function getBaseUrl(): string {
  return process.env.ZARINPAL_SANDBOX === "true" ? SANDBOX_BASE : PRODUCTION_BASE;
}

function getMerchantId(): string {
  const id = process.env.ZARINPAL_MERCHANT_ID;
  if (!id) throw new Error("ZARINPAL_MERCHANT_ID is not configured");
  return id;
}

// ── Types ──────────────────────────────────────────────────────────────

export interface ZarinpalRequestPayload {
  amount: number;
  description: string;
  callbackUrl: string;
  mobile?: string;
  email?: string;
  orderId?: string;
  /** Currency unit. Store amounts are in Toman, so we always use IRT. */
  currency?: "IRT" | "IRR";
}

export interface ZarinpalRequestResponse {
  success: boolean;
  authority: string;
  url: string;
  code: number;
  message: string;
}

export interface ZarinpalVerifyResponse {
  success: boolean;
  refId: number;
  cardPan: string;
  cardHash: string;
  fee: number;
  feeType: string;
  code: number;
  message: string;
}

// ── Request Payment (get authority) ────────────────────────────────────

export async function requestPayment(
  payload: ZarinpalRequestPayload,
): Promise<ZarinpalRequestResponse> {
  const baseUrl = getBaseUrl();
  const merchantId = getMerchantId();

  const body: Record<string, unknown> = {
    merchant_id: merchantId,
    amount: payload.amount,
    currency: payload.currency ?? "IRT",
    callback_url: payload.callbackUrl,
    description: payload.description,
  };

  if (payload.orderId) {
    body.metadata = { order_id: payload.orderId };
  }
  if (payload.mobile) {
    body.metadata = { ...(body.metadata as Record<string, string>), mobile: payload.mobile };
  }
  if (payload.email) {
    body.metadata = { ...(body.metadata as Record<string, string>), email: payload.email };
  }

  const res = await fetch(`${baseUrl}/pg/v4/payment/request.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = await res.json();

  if (json.errors?.length > 0) {
    return {
      success: false,
      authority: "",
      url: "",
      code: json.errors[0]?.code ?? -1,
      message: json.errors[0]?.message ?? "خطای ناشناخته زرین‌پال",
    };
  }

  const code = json.data?.code;
  const authority = json.data?.authority ?? "";

  if (code === 100 || code === 101) {
    const startPayUrl = `${baseUrl}/pg/StartPay/${authority}`;
    return {
      success: true,
      authority,
      url: startPayUrl,
      code,
      message: json.data?.message ?? "موفق",
    };
  }

  return {
    success: false,
    authority,
    url: "",
    code: code ?? -1,
    message: json.data?.message ?? "خطا در دریافت authority",
  };
}

// ── Verify Payment ─────────────────────────────────────────────────────

export async function verifyPayment(
  amount: number,
  authority: string,
): Promise<ZarinpalVerifyResponse> {
  const baseUrl = getBaseUrl();
  const merchantId = getMerchantId();

  const res = await fetch(`${baseUrl}/pg/v4/payment/verify.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      merchant_id: merchantId,
      amount,
      authority,
    }),
  });

  const json = await res.json();

  if (json.errors?.length > 0) {
    return {
      success: false,
      refId: 0,
      cardPan: "",
      cardHash: "",
      fee: 0,
      feeType: "",
      code: json.errors[0]?.code ?? -1,
      message: json.errors[0]?.message ?? "خطای ناشناخته زرین‌پال",
    };
  }

  const code = json.data?.code;
  const success = code === 100 || code === 101;

  return {
    success,
    refId: json.data?.ref_id ?? 0,
    cardPan: json.data?.card_pan ?? "",
    cardHash: json.data?.card_hash ?? "",
    fee: json.data?.fee ?? 0,
    feeType: json.data?.fee_type ?? "",
    code: code ?? -1,
    message: json.data?.message ?? (success ? "تایید شده" : "تایید نشد"),
  };
}

// ── ZarinPal Error Codes Reference ────────────────────────────────────

export const ZARINPAL_ERRORS: Record<number, string> = {
  100: "عملیات با موفقیت انجام شد",
  101: "پرداخت قبلاً تایید شده",
  "-1": "پارامترهای ارسالی نامعتبر",
  "-2": "merchant_id نامعتبر",
  "-3": "پرداخت با موفقیت انجام نشد",
  "-4": "تایید پرداخت انجام نشد",
  "-11": "درخواست مورد نظر یافت نشد",
  "-12": " unable to perform operation",
  "-21": "پرداخت انجام نشد",
  "-22": "پرداخت ناموفق",
  "-33": "رقم پرداخت شده با مبلغ درخواستی مطابقت ندارد",
  "-34": "سقف تقسیم تراکنش رد شده",
  "-35": "پرداخت قبلا با کد رهگیری xxxxxx انجام شده",
  "-40": "آدرس بازگشت نامعتبر",
  "-41": "آدرس بازگشت نامعتبر",
  "-42": "مدت زمان مجاز برای انجام تراکنش تمام شده",
  "-54": "درخواست غیر مجاز",
};
