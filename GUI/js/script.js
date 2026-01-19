import './ui.js';
import './install.js';
import './launcher.js';
import './news.js';
import './mods.js';
import './players.js';
import './chat.js';
import './settings.js';

window.closeDiscordNotification = function() {
  const notification = document.getElementById('discordNotification');
  if (notification) {
    notification.classList.add('hidden');
    setTimeout(() => {
      notification.style.display = 'none';
    }, 300);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const notification = document.getElementById('discordNotification');
  if (notification) {
    const dismissed = localStorage.getItem('discordNotificationDismissed');
    if (!dismissed) {
      setTimeout(() => {
        notification.style.display = 'flex';
      }, 3000); 
    } else {
      notification.style.display = 'none';
    }
  }
});

const originalClose = window.closeDiscordNotification;
window.closeDiscordNotification = function() {
  localStorage.setItem('discordNotificationDismissed', 'true');
  originalClose();
};