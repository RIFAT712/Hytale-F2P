const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { getResolvedAppDir } = require('../core/paths');

async function getLatestClientVersion() {
  try {
    console.log('Fetching latest client version from API...');
    const response = await axios.get('https://files.hytalef2p.com/api/version_client', {
      timeout: 5000,
      headers: {
        'User-Agent': 'Hytale-F2P-Launcher'
      }
    });

    if (response.data && response.data.client_version) {
      const version = response.data.client_version;
      console.log(`Latest client version: ${version}`);
      return version;
    } else {
      console.log('Warning: Invalid API response, falling back to default version');
      return '4.pwr';
    }
  } catch (error) {
    console.error('Error fetching client version:', error.message);
    console.log('Warning: API unavailable, falling back to default version');
    return '4.pwr';
  }
}

async function getInstalledClientVersion() {
  try {
    const appDir = getResolvedAppDir();
    const versionFile = path.join(appDir, 'release', 'package', 'game', 'version.json');

    if (fs.existsSync(versionFile)) {
      const data = fs.readFileSync(versionFile, 'utf8');
      const json = JSON.parse(data);
      if (json && json.version) {
        console.log(`Installed client version from local file: ${json.version}`);
        return json.version;
      }
    }
    console.log('Local version file not found or invalid, assuming no version installed.');
    return null;
  } catch (error) {
    console.error('Error reading installed client version:', error.message);
    return null;
  }
}

module.exports = {
  getLatestClientVersion,
  getInstalledClientVersion
};
