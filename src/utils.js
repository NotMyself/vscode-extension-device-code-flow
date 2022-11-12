const vscode = require('vscode');

function parseAccessToken(accessToken) {
  const tokenParts = accessToken.split('.');
  const buff = Buffer.from(tokenParts[1], 'base64');
  const text = buff.toString('ascii');
  return JSON.parse(text);
}

function getDomainFromToken(accessToken) {
  const data = parseAccessToken(accessToken);
  let domain = null;

  for (const aud of data.aud) {
    if (aud.endsWith('/api/v2/')) {
      const audUrl = vscode.Uri.parse(aud);
      domain = audUrl.authority;
      break;
    }
  }

  if (!domain) {
    throw new Error('Audience not found');
  }

  return domain;
}

module.exports = {
  parseAccessToken,
  getDomainFromToken,
};
