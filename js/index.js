function voteWithX() {
      window.location.href = 'xlogin-auth.html';
    }

    // ── Toast system ──────────────────────────────────────────
    const cities = [
      'New York','Los Angeles','London','Paris','Tokyo','Sydney',
      'Toronto','Berlin','Dubai','Seoul','Milan','Amsterdam',
      'Barcelona','Chicago','São Paulo','Singapore','Mumbai','Lagos'
    ];

    let userPool = [];
    let poolIndex = 0;

    async function fetchUserPool() {
      try {
        const res = await fetch('https://randomuser.me/api/?results=20&inc=login,picture,nat');
        const data = await res.json();
        userPool = data.results;
      } catch (e) {
        userPool = [];
      }
    }

    function getNextUser() {
      if (userPool.length === 0) {
        const adj = ['cool','sunny','brave','swift','bright'];
        const noun = ['panda','fox','eagle','wolf','lynx'];
        const num = Math.floor(Math.random() * 99);
        return {
          username: adj[Math.floor(Math.random()*adj.length)] + '_' + noun[Math.floor(Math.random()*noun.length)] + num,
          avatar: `https://api.dicebear.com/7.x/thumbs/svg?seed=${Math.random()}`
        };
      }
      const user = userPool[poolIndex % userPool.length];
      poolIndex++;
      return {
        username: user.login.username,
        avatar: user.picture.thumbnail
      };
    }

    function randomCity() {
      return cities[Math.floor(Math.random() * cities.length)];
    }

    function showToast() {
      const { username, avatar } = getNextUser();
      const city = randomCity();

      const toast = document.createElement('div');
      toast.className = 'toast-anim flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.13)] border border-black/[0.06] w-full';
      toast.innerHTML = `
        <img src="${avatar}" alt="${username}"
             class="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-white shadow" />
        <div class="flex flex-col min-w-0">
          <span class="text-[11px] font-semibold text-gray-900 truncate">@${username}</span>
          <span class="text-[10px] text-gray-400 leading-snug">just voted from <span class="text-gray-600 font-medium">${city}</span> 🗳️</span>
        </div>
        <div class="ml-auto flex-shrink-0 w-2 h-2 rounded-full bg-green-400 shadow-[0_0_6px_2px_rgba(74,222,128,0.5)]"></div>
      `;

      const container = document.getElementById('toast-container');
      container.appendChild(toast);

      setTimeout(() => toast.remove(), 4100);
    }

    // Init
    fetchUserPool().then(() => {
      setTimeout(() => {
        showToast();
        setInterval(showToast, 3500);
      }, 1500);
    });

    setInterval(fetchUserPool, 5 * 60 * 1000);