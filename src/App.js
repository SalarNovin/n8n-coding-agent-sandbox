import React, { useState } from 'react';

// کامپوننت دکمه ورود
function LoginButton({ onLogin }) {
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    setLoading(true);
    // شبیه‌سازی جریان ورود؛ در صورت نیاز این قسمت را با راهکار احراز هویت واقعی جایگزین کنید
    setTimeout(() => {
      setLoading(false);
      if (typeof onLogin === 'function') onLogin();
      else alert('ورود انجام شد');
    }, 800);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Login"
      disabled={loading}
      style={{
        padding: '8px 12px',
        borderRadius: 4,
        border: '1px solid #ccc',
        background: '#007bff',
        color: '#fff',
        cursor: loading ? 'default' : 'pointer'
      }}
    >
      {loading ? 'در حال ورود...' : 'ورود'}
    </button>
  );
}

// رابط کاربری اصلی برنامه
function App() {
  const handleLogin = () => {
    // اینجا می‌توانید واکنش روی ورود موفق را پیاده‌سازی کنید
    console.log('User logged in (simulated)');
  };

  return (
    <div className="App" style={{ fontFamily: 'sans-serif', padding: 20 }}>
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20
        }}
      >
        <h1 style={{ margin: 0 }}>My App</h1>
        {/* رندر کامپوننت LoginButton در هدر برای دسترسی آسان کاربر */}
        <LoginButton onLogin={handleLogin} />
      </header>

      <main>
        <p>محتوای اصلی برنامه اینجا نمایش داده می‌شود.</p>
      </main>
    </div>
  );
}

export default App;
