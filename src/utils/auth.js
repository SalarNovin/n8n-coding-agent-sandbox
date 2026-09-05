// src/utils/auth.js
// مدیریت توکن/سشن و عملیات ورود/خروج (Auth utilities)
// نسخه اصلاح‌شده: ایمن‌تر و قابل‌کانفیگ با پشتیبانی از signout URL، حذف کوکی‌های مشخص‌شده و امکان ارسال httpClient (مثلاً axios instance)

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const LOGOUT_MESSAGE_KEY = 'logout_message';

/**
 * ذخیره توکن
 * @param {string} token
 * @param {{ remember?: boolean }} options
 */
export function setToken(token, { remember = true } = {}) {
  try {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;

    if (remember) {
      localStorage.setItem(TOKEN_KEY, token);
      try { sessionStorage.removeItem(TOKEN_KEY); } catch (e) { /* ignore */ }
    } else {
      sessionStorage.setItem(TOKEN_KEY, token);
      try { localStorage.removeItem(TOKEN_KEY); } catch (e) { /* ignore */ }
    }
  } catch (e) {
    // محیط‌هایی مثل SSR ممکن است به storage دسترسی نداشته باشند
  }
}

/**
 * بازیابی توکن از localStorage یا sessionStorage
 * @returns {string|null}
 */
export function getToken() {
  try {
    if (typeof window === 'undefined') return null;
    return (localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY) || null);
  } catch (e) {
    return null;
  }
}

export function isAuthenticated() {
  return !!getToken();
}

function safeDeleteCookie(name) {
  try {
    if (typeof document === 'undefined') return;
    // Domain variations برای سعی در حذف cookies که برای سایر دامنه‌ها/ساب‌دامین‌ها تنظیم شده‌اند
    const domain = document.domain;
    const domainParts = domain.split('.').filter(Boolean);
    const domains = new Set();

    // اضافه کردن دامنه فعلی و نسخه با پیشوند '.'
    if (domain) {
      domains.add(domain);
      domains.add('.' + domain);
    }

    // اضافه کردن parent domains مانند .example.com از sub.example.com
    for (let i = 0; i < domainParts.length - 1; i++) {
      const d = domainParts.slice(i).join('.');
      if (d) {
        domains.add(d);
        domains.add('.' + d);
      }
    }

    // حداقل تلاش برای حذف با path=/ و domain variations
    domains.forEach(d => {
      try {
        const domainStr = d ? `; domain=${d}` : '';
        document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/` + domainStr + ';';
      } catch (e) {
        // ignore per-domain failures
      }
    });

    // آخرین تلاش بدون domain
    try { document.cookie = `${encodeURIComponent(name)}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`; } catch (e) {}
  } catch (e) {
    // ignore
  }
}

/**
 * پاک‌سازی داده‌های احراز هویت
 * options:
 *   httpClient: (اختیاری) نمونه‌ای از axios یا هر ابزاری که header پیش‌فرض Authorization را نگهداری می‌کند
 *   deleteCookies: (boolean) آیا کوکی‌های مشخص‌شده حذف شوند؟ (پیش‌فرض false)
 *   cookieNames: (string[]) نام کوکی‌هایی که باید حذف شوند (پیش‌فرض [])
 */
export async function clearAuthData({ httpClient = null, deleteCookies = false, cookieNames = [] } = {}) {
  // حذف از storages
  try {
    if (typeof window !== 'undefined') {
      try { localStorage.removeItem(TOKEN_KEY); } catch (e) { /* ignore */ }
      try { sessionStorage.removeItem(TOKEN_KEY); } catch (e) { /* ignore */ }
      try { localStorage.removeItem(USER_KEY); } catch (e) { /* ignore */ }
      try { sessionStorage.removeItem(USER_KEY); } catch (e) { /* ignore */ }
    }
  } catch (e) {
    // ignore
  }

  // حذف نام‌های مشخص‌شده کوکی (فقط کوکی‌های قابل دسترسی توسط JS یعنی non-HttpOnly)
  if (deleteCookies && Array.isArray(cookieNames) && cookieNames.length > 0) {
    cookieNames.forEach(name => {
      try { safeDeleteCookie(name); } catch (e) { /* ignore */ }
    });
  }

  // حذف header پیش‌فرض Authorization در صورتی که یک httpClient مثلاً axios ارسال شده باشد
  try {
    if (httpClient && typeof httpClient === 'object') {
      // پشتیبانی از axios instance
      if (httpClient.defaults && httpClient.defaults.headers) {
        if (httpClient.defaults.headers.common) {
          delete httpClient.defaults.headers.common['Authorization'];
        }
      }

      // بعضی http clients ممکن است متد setHeader داشته باشند
      try {
        if (typeof httpClient.setHeader === 'function') {
          httpClient.setHeader('Authorization', null);
        }
      } catch (e) {
        // ignore
      }
    } else {
      // اگر هیچ httpClient ای ارسال نشده، تلاش محدود برای axios سراسری (در صورت وجود) انجام می‌دهیم
      try {
        if (typeof axios !== 'undefined' && axios && axios.defaults && axios.defaults.headers && axios.defaults.headers.common) {
          delete axios.defaults.headers.common['Authorization'];
        }
      } catch (e) {
        // ignore
      }
    }
  } catch (e) {
    // ignore
  }
}

/**
 * logout: پاک‌سازی داده‌های احراز هویت و ریدایرکت به صفحه لاگین
 * options:
 *   redirect: آیا ریدایرکت انجام شود (پیش‌فرض true)
 *   redirectPath: مسیر صفحه لاگین (پیش‌فرض '/login')
 *   preserveMessage: آیا پیام کوتاهی قبل از ریدایرکت نگهداری شود (پیش‌فرض false)
 *   message: متن پیام در صورت preserveMessage
 *   signoutUrl: (اختیاری) endpoint سمت سرور برای invalidation/logout (مثلاً POST /api/logout)
 *   httpClient: (اختیاری) نمونه axios یا هر client برای پاک‌سازی header
 *   deleteCookies: (boolean) آیا کوکی‌های مشخص‌شده حذف شوند؟ (پیش‌فرض false)
 *   cookieNames: (string[]) نام کوکی‌هایی که باید حذف شوند
 *
 * این تابع async است تا در صورت ارائه signoutUrl بتوان منتظر پاسخ سرور ماند قبل از ریدایرکت.
 */
export async function logout({
  redirect = true,
  redirectPath = '/login',
  preserveMessage = false,
  message = '',
  signoutUrl = null,
  httpClient = null,
  deleteCookies = false,
  cookieNames = []
} = {}) {
  // اگر endpoint خروج سمت سرور داده شده، سعی می‌کنیم آن را فراخوانی کنیم تا توکن سمت سرور نیز باطل شود
  if (signoutUrl && typeof signoutUrl === 'string') {
    try {
      // استفاده از fetch برای فراخوانی endpoint. ارسال credentials برای پشتیبانی از cookie-based sessions
      await fetch(signoutUrl, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      }).catch(() => { /* ignore network errors */ });
    } catch (e) {
      // ignore
    }
  }

  // پاک‌سازی محلی (storages, cookies مشخص‌شده، header httpClient)
  try {
    await clearAuthData({ httpClient, deleteCookies, cookieNames });
  } catch (e) {
    // ignore
  }

  // نگهداری پیام کوتاه در sessionStorage در صورت درخواست
  if (preserveMessage && typeof message === 'string' && message) {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem(LOGOUT_MESSAGE_KEY, message);
      }
    } catch (e) {
      // ignore
    }
  }

  // ریدایرکت امن: استفاده از location.replace تا صفحه لاگین به صورت history entry جدید اضافه نشود
  if (redirect && typeof window !== 'undefined') {
    try {
      window.location.replace(redirectPath);
    } catch (e) {
      try { window.location.href = redirectPath; } catch (e2) { /* ignore */ }
    }
  }
}

export default {
  setToken,
  getToken,
  isAuthenticated,
  clearAuthData,
  logout,
};
