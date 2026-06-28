const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const container = document.querySelector(".container");

sign_up_btn.addEventListener('click', () => {
    container.classList.add("sign-up-mode");
});


sign_in_btn.addEventListener('click', () => {
    container.classList.remove("sign-up-mode");
});

document.addEventListener('DOMContentLoaded', () => {
  const signinForm = document.getElementById('signin-form');
  const signupForm = document.getElementById('signup-form');
  const isArabic = window.location.pathname.includes('-ar.html') || window.location.pathname.includes('-ar');
  const t = (en, ar) => isArabic ? ar : en;

  if (signinForm) {
    signinForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('signin-email').value.trim();
      const password = document.getElementById('signin-password').value.trim();

      try {
        Swal.fire({
          title: t('Signing in...', 'جاري تسجيل الدخول...'),
          allowOutsideClick: false,
          didOpen: () => { Swal.showLoading(); }
        });

        const res = await window.hshApi.login(email, password);
        Swal.close();

        if (res.token) {
          window.hshApi.setToken(res.token);
          localStorage.setItem('hsh_user', JSON.stringify(res.user));
          
          Swal.fire({
            title: t('Welcome Back!', 'مرحباً بعودتك!'),
            text: t('Success! Loading your map...', 'تم بنجاح! جاري تحميل الخريطة...'),
            icon: 'success',
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
            window.location.href = t('../map.html', '../map-ar.html');
          });
        }
      } catch (err) {
        Swal.fire({
          title: t('Login Failed', 'فشل تسجيل الدخول'),
          text: err.message || t('Please check your credentials.', 'يرجى التحقق من بيانات الدخول الخاصة بك.'),
          icon: 'error'
        });
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fullname = document.getElementById('signup-username').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const password = document.getElementById('signup-password').value.trim();

      const nameParts = fullname.split(/\s+/);
      const firstName = nameParts[0] || 'Cyber';
      const lastName = nameParts.slice(1).join(' ') || 'Hero';

      try {
        Swal.fire({
          title: t('Registering...', 'جاري التسجيل...'),
          allowOutsideClick: false,
          didOpen: () => { Swal.showLoading(); }
        });

        const res = await window.hshApi.register(firstName, lastName, email, password);
        Swal.close();

        // Show SweetAlert prompt to input OTP
        const otpResult = await Swal.fire({
          title: t('Enter Verification Code', 'أدخل رمز التحقق'),
          text: t('We sent a verification code to your email. Enter it below:', 'لقد أرسلنا رمز التحقق إلى بريدك الإلكتروني. أدخله أدناه:'),
          input: 'text',
          inputPlaceholder: t('Enter OTP', 'أدخل الرمز'),
          showCancelButton: true,
          confirmButtonText: t('Verify', 'تحقق'),
          cancelButtonText: t('Cancel', 'إلغاء'),
          allowOutsideClick: false,
          inputValidator: (value) => {
            if (!value) {
              return t('You need to write something!', 'يجب عليك كتابة الرمز!');
            }
          }
        });

        if (otpResult.isConfirmed) {
          const otp = otpResult.value.trim();
          Swal.fire({
            title: t('Verifying code...', 'جاري التحقق من الرمز...'),
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
          });

          await window.hshApi.verifyOtp(email, otp);
          Swal.close();

          await Swal.fire({
            title: t('Account Verified!', 'تم التحقق من الحساب!'),
            text: t("Your account is now ready. Let's log in!", 'حسابك جاهز الآن. دعنا نسجل الدخول!'),
            icon: 'success'
          });

          container.classList.remove("sign-up-mode");
        }
      } catch (err) {
        Swal.fire({
          title: t('Registration Failed', 'فشل التسجيل'),
          text: err.message || t('An error occurred during sign up.', 'حدث خطأ أثناء عملية التسجيل.'),
          icon: 'error'
        });
      }
    });
  }
});

