# n8n-coding-agent-sandbox
Private sandbox repository for n8n exercise 2 coding-agent workflow.

## دکمه ورود

در این بخش یک نمونه ساده از دکمه Login با HTML آورده شده است. این دکمه می‌تواند برای ارسال فرم ورود یا فراخوانی تابع جاوااسکریپت جهت نمایش فرم احراز هویت استفاده شود.

نمونه HTML:

```html
<button id="login-button" class="login-btn" type="button">Login</button>
```

توضیح کوتاه:
- id: "login-button" برای انتخاب دکمه با جاوااسکریپت یا CSS.
- class: "login-btn" برای استایل‌دهی.
- type: "button" به این معناست که دکمه به طور پیش‌فرض فرم را ارسال نمی‌کند. برای ارسال فرم از type="submit" استفاده کنید.

نمونه ساده استفاده با جاوااسکریپت:

```html
<script>
  document.getElementById("login-button").addEventListener("click", function() {
    // اینجا می‌توانید نمایش فرم ورود یا فراخوانی API را انجام دهید
    alert("Login button clicked");
  });
</script>
```
