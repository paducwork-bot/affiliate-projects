// Simple Dashboard Server
// Serves dashboard HTML + API endpoint

const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PORT = 3002;
const API_SCRIPT = path.join(__dirname, 'dashboard-api.sh');

// Stats API endpoint
function getStats() {
  try {
    const result = execSync(API_SCRIPT, { encoding: 'utf8' });
    return JSON.parse(result);
  } catch (err) {
    return { error: err.message, status: 'error' };
  }
}

// Format number with K/M
function formatNum(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toString();
}

// Dashboard HTML
const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mexx Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    body { font-family: 'Inter', sans-serif; }
    .gradient-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .pulse { animation: pulse 2s infinite; }
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  </style>
</head>
<body class="bg-gray-900 text-white min-h-screen">
  <!-- Header -->
  <header class="gradient-bg py-4 px-4 shadow-lg">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
          <i class="fas fa-robot text-xl"></i>
        </div>
        <div>
          <h1 class="text-xl font-bold">Mexx Dashboard</h1>
          <p class="text-white/70 text-xs">AI Assistant Stats</p>
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <span id="status-dot" class="pulse w-2 h-2 bg-green-400 rounded-full"></span>
        <span id="status-text" class="text-sm">Loading...</span>
      </div>
    </div>
  </header>

  <!-- Main -->
  <main class="max-w-7xl mx-auto px-4 py-6">
    <!-- Stats Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div class="flex items-center justify-between mb-2">
          <i class="fas fa-comments text-blue-400"></i>
          <span class="text-xs text-gray-500">Sessions</span>
        </div>
        <h3 id="sessions" class="text-2xl font-bold">--</h3>
      </div>
      <div class="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div class="flex items-center justify-between mb-2">
          <i class="fas fa-coins text-green-400"></i>
          <span class="text-xs text-gray-500">Tokens</span>
        </div>
        <h3 id="tokens" class="text-2xl font-bold">--</h3>
      </div>
      <div class="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div class="flex items-center justify-between mb-2">
          <i class="fas fa-dollar-sign text-yellow-400"></i>
          <span class="text-xs text-gray-500">Cost</span>
        </div>
        <h3 id="cost" class="text-2xl font-bold">$0</h3>
      </div>
      <div class="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <div class="flex items-center justify-between mb-2">
          <i class="fas fa-clock text-purple-400"></i>
          <span class="text-xs text-gray-500">Uptime</span>
        </div>
        <h3 id="uptime" class="text-2xl font-bold">--</h3>
      </div>
    </div>

    <!-- Agents -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div class="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <h4 class="text-sm font-semibold mb-3 flex items-center">
          <i class="fas fa-user-tie text-blue-400 mr-2"></i>
          Agent: main
        </h4>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span class="text-gray-500">Sessions:</span>
            <span id="main-sessions" class="ml-1 font-medium">--</span>
          </div>
          <div>
            <span class="text-gray-500">Tokens:</span>
            <span id="main-tokens" class="ml-1 font-medium">--</span>
          </div>
        </div>
      </div>
      <div class="bg-gray-800 rounded-xl p-4 border border-gray-700">
        <h4 class="text-sm font-semibold mb-3 flex items-center">
          <i class="fas fa-robot text-purple-400 mr-2"></i>
          Agent: mexx_01
        </h4>
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span class="text-gray-500">Sessions:</span>
            <span id="mexx-sessions" class="ml-1 font-medium">--</span>
          </div>
          <div>
            <span class="text-gray-500">Tokens:</span>
            <span id="mexx-tokens" class="ml-1 font-medium">--</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-gray-800 rounded-xl p-4 border border-gray-700">
      <h4 class="text-sm font-semibold mb-3 flex items-center">
        <i class="fas fa-history text-green-400 mr-2"></i>
        Recent Activity
        <span id="refresh-indicator" class="ml-auto text-gray-500 text-xs hidden">
          <i class="fas fa-sync spin"></i> Refreshing...
        </span>
      </h4>
      <div id="activity-list" class="space-y-2 text-sm max-h-60 overflow-y-auto">
        <p class="text-gray-500">Loading...</p>
      </div>
    </div>

    <!-- Footer -->
    <div class="mt-6 text-center text-xs text-gray-500">
      <span>Auto-refresh: 10s</span>
      <span class="mx-2">|</span>
      <span id="last-update">--</span>
    </div>
  </main>

  <script>
    async function fetchStats() {
      document.getElementById('refresh-indicator').classList.remove('hidden');
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        updateUI(data);
      } catch (err) {
        document.getElementById('status-text').textContent = 'Error';
        document.getElementById('status-dot').classList.remove('bg-green-400');
        document.getElementById('status-dot').classList.add('bg-red-400');
      }
      document.getElementById('refresh-indicator').classList.add('hidden');
    }

    function updateUI(data) {
      // Status
      const isOnline = data.status === 'online';
      document.getElementById('status-text').textContent = isOnline ? 'Online' : 'Offline';
      document.getElementById('status-dot').classList.toggle('bg-green-400', isOnline);
      document.getElementById('status-dot').classList.toggle('bg-red-400', !isOnline);

      // Stats
      document.getElementById('sessions').textContent = data.sessions || 0;
      document.getElementById('tokens').textContent = formatNum(data.tokens || 0);
      document.getElementById('cost').textContent = '$' + (data.cost || '0');
      document.getElementById('uptime').textContent = data.uptime || '--';

      // Agents
      if (data.agents) {
        document.getElementById('main-sessions').textContent = data.agents.main?.sessions || 0;
        document.getElementById('main-tokens').textContent = formatNum(data.agents.main?.tokens || 0);
        document.getElementById('mexx-sessions').textContent = data.agents.mexx_01?.sessions || 0;
        document.getElementById('mexx-tokens').textContent = formatNum(data.agents.mexx_01?.tokens || 0);
      }

      // Activity
      const activityEl = document.getElementById('activity-list');
      if (data.recentMessages && data.recentMessages.length > 0) {
        activityEl.innerHTML = data.recentMessages.slice(0, 10).map(m => {
          const role = m.role === 'user' ? '👤' : '🤖';
          const content = typeof m.content === 'string' ? m.content : 
            (m.content[0]?.text || m.content[0]?.thinking || JSON.stringify(m.content).substring(0, 80));
          return '<div class="bg-gray-700/50 rounded p-2"><span class="mr-1">' + role + '</span><span class="text-gray-300">' + escapeHtml(content.substring(0, 100)) + '</span></div>';
        }).join('');
      } else {
        activityEl.innerHTML = '<p class="text-gray-500">No recent activity</p>';
      }

      // Last update
      document.getElementById('last-update').textContent = 'Updated: ' + new Date().toLocaleTimeString();
    }

    function formatNum(n) {
      if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
      if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
      return n.toString();
    }

    function escapeHtml(str) {
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // Initial fetch
    fetchStats();
    // Auto-refresh every 10 seconds
    setInterval(fetchStats, 10000);
  </script>
</body>
</html>`;

// Create server
const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // API endpoint
  if (req.url === '/api/stats') {
    res.setHeader('Content-Type', 'application/json');
    const stats = getStats();
    res.writeHead(200);
    res.end(JSON.stringify(stats, null, 2));
    return;
  }

  // Serve HTML
  if (req.url === '/' || req.url === '/index.html') {
    res.setHeader('Content-Type', 'text/html');
    res.writeHead(200);
    res.end(HTML);
    return;
  }

  // 404
  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('Dashboard server running at http://0.0.0.0:' + PORT);
  console.log('API endpoint: http://0.0.0.0:' + PORT + '/api/stats');
});
