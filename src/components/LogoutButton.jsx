import React from 'react';
import PropTypes from 'prop-types';

/**
 * LogoutButton
 * کامپوننت دکمه خروج
 * Props:
 *  - logout: تابع اختیاری (sync یا async) برای انجام عملیات خروج. اگر ارائه شود، صدا زده و انتظار برای تکمیل آن خواهد رفت.
 *            تابع می‌تواند تلاش برای تماس با API سرور را انجام دهد. در صورت خطا یا عدم ارائه، defaultLogout اجرا می‌شود.
 *  - label: متن دکمه (پیش‌فرض: 'خروج')
 *  - className: رشته کلاس‌های CSS اختیاری
 */

const DEFAULT_STORAGE_KEYS = ['authToken', 'refreshToken', 'user'];

function removeStorageKeys(keys) {
  try {
    keys.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch (e) {
        // ignore per-key errors
      }
      try {
        sessionStorage.removeItem(k);
      } catch (e) {
        // ignore per-key errors
      }
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error removing storage keys during logout:', err);
  }
}

function clearClientCookies() {
  try {
    // تلاش برای حذف کلیه کوکی‌های قابل‌دسترس از طریق JS
    // توجه: کوکی‌های HttpOnly قابل حذف از کلاینت نیستند؛ برای آنها لازم است سرور سشن را invalid کند.
    const cookies = document.cookie ? document.cookie.split(';') : [];
    const hostname = window.location.hostname;
    const domainVariants = [hostname, `.${hostname}`];
    const pathVariants = ['/', ''];

    cookies.forEach((cookie) => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      if (!name) return;

      // سعی در حذف با ترکیبات domain/path مختلف
      domainVariants.forEach((domain) => {
        pathVariants.forEach((path) => {
          // مشخص‌سازی expires قدیمی برای حذف
          try {
            const cookieStr = `${encodeURIComponent(name)}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=${path || '/'};domain=${domain}`;
            document.cookie = cookieStr;
          } catch (e) {
            // ignore per-cookie errors
          }
        });
      });

      // تلاش ساده‌تر بدون domain (ممکن است مفید باشد برای کوکی‌هایی که domain ست نشده‌اند)
      try {
        document.cookie = `${encodeURIComponent(name)}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      } catch (e) {
        // ignore
      }
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error clearing cookies during logout:', err);
  }
}

async function defaultLogout() {
  try {
    // سعی می‌کنیم ابتدا endpoint سرور را برای invalidation سشن صدا بزنیم.
    // این ریکوئست باید در سرور منجر به پاک شدن کوکی HttpOnly سمت سرور شود.
    // در صورت عدم وجود endpoint یا خطا، ادامه می‌دهیم و پاک‌سازی کلاینتی را انجام می‌دهیم.
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } catch (err) {
      // اگر درخواست شکست خورد، لاگ می‌کنیم اما ادامه می‌دهیم تا پاک‌سازی کلاینتی انجام شود
      // eslint-disable-next-line no-console
      console.warn('Server logout request failed or not available, continuing client-side cleanup.');
    }

    // حذف کلیدهای شناخته‌شده از storage به‌جای پاک‌سازی کامل
    removeStorageKeys(DEFAULT_STORAGE_KEYS);

    // تلاش برای حذف کوکی‌های قابل‌حذف از کلاینت
    clearClientCookies();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error during default logout cleanup:', err);
  } finally {
    // استفاده از replace تا صفحهٔ login جایگزین تاریخچه شود و کاربر با Back به حالت قبل باز نگردد
    try {
      window.location.replace('/login');
    } catch (e) {
      // اگر replace در محیطی محدود شده باشد، fallback به href
      // eslint-disable-next-line no-console
      console.warn('window.location.replace failed, falling back to href.');
      window.location.href = '/login';
    }
  }
}

const LogoutButton = ({ logout, label = 'خروج', className = '' }) => {
  const handleClick = async (e) => {
    // از آنجایی که این المان یک دکمه است، preventDefault ضرورتی ندارد اما محافظت می‌کنیم
    if (e && typeof e.preventDefault === 'function') e.preventDefault();

    const fn = typeof logout === 'function' ? logout : defaultLogout;

    try {
      // پشتیبانی از توابع sync و async: اگر Promise برگردانده شد، await می‌کنیم
      await Promise.resolve(fn());
    } catch (err) {
      // اگر تابع خروج ارائه‌شده خطا داد یا Promise reject شد، از خروج پیش‌فرض استفاده می‌کنیم
      // eslint-disable-next-line no-console
      console.error('Provided logout function failed, falling back to default logout:', err);
      try {
        await defaultLogout();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Default logout also failed:', e);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      aria-label={label}
    >
      {label}
    </button>
  );
};

LogoutButton.propTypes = {
  logout: PropTypes.func,
  label: PropTypes.string,
  className: PropTypes.string
};

export default LogoutButton;
