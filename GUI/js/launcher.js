let isDownloading = false;

let playBtn;
let playText;
let homePlayBtn;
let uninstallBtn;
let playerNameInput;
let javaPathInput;

export function setupLauncher() {
  playBtn = document.getElementById('playBtn');
  playText = document.getElementById('playText');
  homePlayBtn = document.getElementById('homePlayBtn');
  uninstallBtn = document.getElementById('uninstallBtn');
  playerNameInput = document.getElementById('playerName');
  javaPathInput = document.getElementById('javaPath');
  
  if (playerNameInput) {
    playerNameInput.addEventListener('change', savePlayerName);
  }
  
  if (javaPathInput) {
    javaPathInput.addEventListener('change', saveJavaPath);
  }
  
  if (window.electronAPI && window.electronAPI.onProgressUpdate) {
    window.electronAPI.onProgressUpdate((data) => {
      if (!isDownloading) return;
      if (window.LauncherUI) {
        window.LauncherUI.updateProgress(data);
      }
    });
  }
}

export async function launch() {
  if (isDownloading || (playBtn && playBtn.disabled)) return;
  
  let playerName = 'Player';
  if (window.SettingsAPI && window.SettingsAPI.getCurrentPlayerName) {
    playerName = window.SettingsAPI.getCurrentPlayerName();
  } else if (playerNameInput && playerNameInput.value.trim()) {
    playerName = playerNameInput.value.trim();
  }
  
  let javaPath = '';
  if (window.SettingsAPI && window.SettingsAPI.getCurrentJavaPath) {
    javaPath = window.SettingsAPI.getCurrentJavaPath();
  }
  
  if (window.LauncherUI) window.LauncherUI.showProgress();
  isDownloading = true;
  if (playBtn) {
    playBtn.disabled = true;
    playText.textContent = 'LAUNCHING...';
  }
  
  try {
    if (window.LauncherUI) window.LauncherUI.updateProgress({ message: 'Starting game...' });
    
    if (window.electronAPI && window.electronAPI.launchGame) {
      const result = await window.electronAPI.launchGame(playerName, javaPath, '');
      
      isDownloading = false;
      
      if (window.LauncherUI) {
        window.LauncherUI.hideProgress();
      }
      resetPlayButton();
      
      if (result.success) {
        if (window.electronAPI.minimizeWindow) {
          setTimeout(() => {
            window.electronAPI.minimizeWindow();
          }, 500);
        }
      } else {
        console.error('Launch failed:', result.error);
      }
    } else {
      isDownloading = false;
      
      if (window.LauncherUI) {
        window.LauncherUI.hideProgress();
      }
      resetPlayButton();
    }
  } catch (error) {
    isDownloading = false;
    
    if (window.LauncherUI) {
      window.LauncherUI.hideProgress();
    }
    resetPlayButton();
    console.error('Launch error:', error);
  }
}

function showCustomConfirm(message, title = 'Confirm Action', onConfirm, onCancel = null, confirmText = 'Confirm', cancelText = 'Cancel') {
  const existingModal = document.querySelector('.custom-confirm-modal');
  if (existingModal) {
    existingModal.remove();
  }

  const modal = document.createElement('div');
  modal.className = 'custom-confirm-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(4px);
    z-index: 20000;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
  `;

  const dialog = document.createElement('div');
  dialog.className = 'custom-confirm-dialog';
  dialog.style.cssText = `
    background: #1f2937;
    border-radius: 12px;
    padding: 0;
    min-width: 400px;
    max-width: 500px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6);
    border: 1px solid rgba(239, 68, 68, 0.3);
    transform: scale(0.9);
    transition: transform 0.3s ease;
  `;

  dialog.innerHTML = `
    <div style="padding: 24px; border-bottom: 1px solid rgba(255,255,255,0.1);">
      <div style="display: flex; align-items: center; gap: 12px; color: #ef4444;">
        <i class="fas fa-exclamation-triangle" style="font-size: 24px;"></i>
        <h3 style="margin: 0; font-size: 1.2rem; font-weight: 600;">${title}</h3>
      </div>
    </div>
    <div style="padding: 24px; color: #e5e7eb;">
      <p style="margin: 0; line-height: 1.5; font-size: 1rem;">${message}</p>
    </div>
    <div style="padding: 20px 24px; display: flex; gap: 12px; justify-content: flex-end; border-top: 1px solid rgba(255,255,255,0.1);">
      <button class="custom-confirm-cancel" style="
        background: transparent;
        color: #9ca3af;
        border: 1px solid rgba(156, 163, 175, 0.3);
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;
      ">${cancelText}</button>
      <button class="custom-confirm-action" style="
        background: #ef4444;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;
      ">${confirmText}</button>
    </div>
  `;

  modal.appendChild(dialog);
  document.body.appendChild(modal);

  // Animate in
  setTimeout(() => {
    modal.style.opacity = '1';
    dialog.style.transform = 'scale(1)';
  }, 10);

  // Event handlers
  const cancelBtn = dialog.querySelector('.custom-confirm-cancel');
  const actionBtn = dialog.querySelector('.custom-confirm-action');

  const closeModal = () => {
    modal.style.opacity = '0';
    dialog.style.transform = 'scale(0.9)';
    setTimeout(() => {
      modal.remove();
    }, 300);
  };

  cancelBtn.onclick = () => {
    closeModal();
    if (onCancel) onCancel();
  };

  actionBtn.onclick = () => {
    closeModal();
    onConfirm();
  };

  modal.onclick = (e) => {
    if (e.target === modal) {
      closeModal();
      if (onCancel) onCancel();
    }
  };

  // Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      if (onCancel) onCancel();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

export async function uninstallGame() {
  showCustomConfirm(
    'Are you sure you want to uninstall Hytale? All game files will be deleted.',
    'Uninstall Game',
    async () => {
      await performUninstall();
    },
    null,
    'Uninstall',
    'Cancel'
  );
}

async function performUninstall() {
  
  if (window.LauncherUI) window.LauncherUI.showProgress();
  if (window.LauncherUI) window.LauncherUI.updateProgress({ message: 'Uninstalling game...' });
  if (uninstallBtn) uninstallBtn.disabled = true;
  
  try {
    if (window.electronAPI && window.electronAPI.uninstallGame) {
      const result = await window.electronAPI.uninstallGame();
      
      if (result.success) {
        if (window.LauncherUI) {
          window.LauncherUI.updateProgress({ message: 'Game uninstalled successfully!' });
          setTimeout(() => {
            window.LauncherUI.hideProgress();
            window.LauncherUI.showLauncherOrInstall(false);
          }, 2000);
        }
      } else {
        throw new Error(result.error || 'Uninstall failed');
      }
    } else {
      setTimeout(() => {
        if (window.LauncherUI) {
          window.LauncherUI.updateProgress({ message: 'Game uninstalled successfully!' });
          setTimeout(() => {
            window.LauncherUI.hideProgress();
            window.LauncherUI.showLauncherOrInstall(false);
          }, 2000);
        }
      }, 2000);
    }
  } catch (error) {
    if (window.LauncherUI) {
      window.LauncherUI.updateProgress({ message: `Uninstall failed: ${error.message}` });
      setTimeout(() => window.LauncherUI.hideProgress(), 3000);
    }
  } finally {
    if (uninstallBtn) uninstallBtn.disabled = false;
  }
}

function resetPlayButton() {
  isDownloading = false;
  if (playBtn) {
    playBtn.disabled = false;
    playText.textContent = 'PLAY';
  }
}

async function savePlayerName() {
  try {
    if (window.electronAPI && window.electronAPI.saveSettings) {
      const playerName = (playerNameInput ? playerNameInput.value.trim() : '') || 'Player';
      await window.electronAPI.saveSettings({ playerName });
    }
  } catch (error) {
    console.error('Error saving player name:', error);
  }
}

async function saveJavaPath() {
  try {
    if (window.electronAPI && window.electronAPI.saveSettings) {
      const javaPath = (javaPathInput ? javaPathInput.value.trim() : '') || '';
      await window.electronAPI.saveSettings({ javaPath });
    }
  } catch (error) {
    console.error('Error saving Java path:', error);
  }
}

function toggleCustomJava() {
  if (!customJavaOptions) return;
  
  if (customJavaCheck && customJavaCheck.checked) {
    customJavaOptions.style.display = 'block';
  } else {
    customJavaOptions.style.display = 'none';
    if (customJavaPath) customJavaPath.value = '';
    saveCustomJavaPath('');
  }
}

async function browseJavaPath() {
  try {
    if (window.electronAPI && window.electronAPI.browseJavaPath) {
      const result = await window.electronAPI.browseJavaPath();
      if (result && result.filePaths && result.filePaths.length > 0) {
        const selectedPath = result.filePaths[0];
        if (customJavaPath) {
          customJavaPath.value = selectedPath;
        }
        await saveCustomJavaPath(selectedPath);
      }
    }
  } catch (error) {
    console.error('Error browsing Java path:', error);
  }
}

async function saveCustomJavaPath(path) {
  try {
    if (window.electronAPI && window.electronAPI.saveJavaPath) {
      await window.electronAPI.saveJavaPath(path);
    }
  } catch (error) {
    console.error('Error saving custom Java path:', error);
  }
}

async function loadCustomJavaPath() {
  try {
    if (window.electronAPI && window.electronAPI.loadJavaPath) {
      const savedPath = await window.electronAPI.loadJavaPath();
      if (savedPath && savedPath.trim()) {
        if (customJavaPath) {
          customJavaPath.value = savedPath;
        }
        if (customJavaCheck) {
          customJavaCheck.checked = true;
        }
        if (customJavaOptions) {
          customJavaOptions.style.display = 'block';
        }
      }
    }
  } catch (error) {
    console.error('Error loading custom Java path:', error);
  }
}

window.launch = launch;
window.uninstallGame = uninstallGame;

document.addEventListener('DOMContentLoaded', setupLauncher);
