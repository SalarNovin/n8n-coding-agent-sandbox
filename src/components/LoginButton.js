import React, { useState } from 'react';
import PropTypes from 'prop-types';

/**
 * LoginButton
 * یک کامپوننت دکمه ورود که:
 * - رندر دکمه و وضعیت‌های loading / error
 * - مدیریت رویداد کلیک
 * - اتصال به منطق ورود از طریق prop onLogin یا روش پیش‌فرض
 *
 * نحوه استفاده:
 * <LoginButton onLogin={async () => { ... }} />
 * یا
 * <LoginButton>ورود با گوگل</LoginButton>
 */

// منطق پیش‌فرض ورود در صورتی که prop onLogin ارائه نشود.
// تلاش می‌کند اول window.Auth.login را صدا بزند، سپس یک درخواست POST به /api/auth/login ارسال کند
// و در صورت دریافت redirectUrl، مرورگر را به آن هدایت کند.
export async function defaultLogin() {
  if (typeof window !== 'undefined' && window.Auth && typeof window.Auth.login === 'function') {
    return window.Auth.login();
  }

  // فالو بک: فراخوانی نقطه پایانی استاندارد برای شروع جریان ورود
  const resp = await fetch('/api/auth/login', { method: 'POST', credentials: 'include' });
  if (!resp.ok) {
    const text = await resp.text().catch(() => resp.statusText || 'خطا در درخواست ورود');
    throw new Error(`Login request failed: ${resp.status} - ${text}`);
  }

  // انتظار داریم سرور یک redirectUrl یا اطلاعات وضعیت برگرداند
  const data = await resp.json().catch(() => null);
  if (data && data.redirectUrl) {
    window.location.assign(data.redirectUrl);
    return;
  }

  return data;
}

export default function LoginButton({ onLogin, children, className, disabled: disabledProp }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const disabled = Boolean(disabledProp) || loading;

  const handleClick = async (e) => {
    e && typeof e.preventDefault === 'function' && e.preventDefault();
    if (disabled) return;

    setError(null);
    setLoading(true);

    try {
      const handler = onLogin || defaultLogin;
      const result = await handler();
      setLoading(false);
      return result;
    } catch (err) {
      const message = (err && err.message) ? err.message : String(err);
      setError(message);
      setLoading(false);
      return null;
    }
  };

  return (
    <div className={className || 'login-button-wrapper'}>
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled}
        aria-busy={loading}
        className={`login-button ${loading ? 'loading' : ''}`}
      >
        {loading ? 'در حال ورود...' : (children || 'ورود')}
      </button>
      {error && (
        <div role="alert" style={{ color: 'var(--error, #c00)', marginTop: 8 }}>
          {error}
        </div>
      )}
    </div>
  );
}

LoginButton.propTypes = {
  // تابع ورود async که در کلیک صدا زده می‌شود. در صورت عدم ارائه، defaultLogin استفاده می‌شود.
  onLogin: PropTypes.func,
  // متن یا عناصر درون دکمه
  children: PropTypes.node,
  // کلاس‌های دورن‌ساز
  className: PropTypes.string,
  // برای غیرفعال‌سازی دستی
  disabled: PropTypes.bool,
};
