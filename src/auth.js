const vscode = require('vscode');
const OIDC_CONFIG = require('./auth.config');
const { Issuer, TokenSet } = require('openid-client');
const { AbortController } = require('abort-controller');
const { getDomainFromToken } = require('./utils');

const SECRET_KEY_SERVICE_NAME = 'auth0-vsc-token-set';
const authStatusEventEmitter = new vscode.EventEmitter();

var tokenStorage;
var issuer;
var client;

function useStorage(storage) {
  tokenStorage = storage;
}

async function getClient() {
  console.log('auth0.auth.getClient');
  if (client) {
    return client;
  }
  issuer = await Issuer.discover(OIDC_CONFIG.ISSUER);
  console.log(`Discovered issuer: ${issuer.issuer}`);
  console.log(issuer.metadata);
  client = new issuer.Client({
    client_id: OIDC_CONFIG.CLIENT_ID,
    redirect_uris: [],
    response_types: [],
    token_endpoint_auth_method: 'none',
  });
  return getClient();
}

async function getTokenSet() {
  console.log('auth0.auth.getTokenSet');
  const secret = await tokenStorage.get(SECRET_KEY_SERVICE_NAME);

  if (secret) {
    const tokenSet = new TokenSet(JSON.parse(secret));
    if (tokenSet.expired()) {
      return refreshTokenSet(tokenSet);
    }
    return tokenSet;
  }
  return undefined;
}

async function refreshTokenSet(current) {
  console.log('auth0.auth.refreshTokenSet');
  const client = await getClient();
  const newTokenSet = await client.refresh(current);
  await tokenStorage.store(
    SECRET_KEY_SERVICE_NAME,
    JSON.stringify(newTokenSet)
  );

  authStatusEventEmitter.fire(newTokenSet);

  return newTokenSet;
}

async function silentSignIn() {
  console.log('auth0.auth.silentSignIn');
  const tokenSet = await getTokenSet();

  authStatusEventEmitter.fire(tokenSet);
}

async function getDeviceCodeAuthorization() {
  console.log('auth0.auth.getDeviceCodeAuthorization');
  const client = await getClient();
  return await client.deviceAuthorization({
    audience: OIDC_CONFIG.AUDIENCE,
    scope: OIDC_CONFIG.SCOPE,
  });
}

async function deviceCodeSignIn(handle, cancellationToken) {
  const abort = new AbortController();
  cancellationToken.onCancellationRequested(() => {
    abort.abort();
  });
  try {
    const tokenSet = await handle.poll(abort);

    if (!tokenSet) {
      return;
    }

    console.log('Token Set: ', tokenSet);

    await tokenStorage.store(SECRET_KEY_SERVICE_NAME, JSON.stringify(tokenSet));

    authStatusEventEmitter.fire(tokenSet);
  } catch (e) {
    console.log(e);
  }
}

async function signOut() {
  console.log('auth0.auth.signOut');
  await tokenStorage.delete(SECRET_KEY_SERVICE_NAME);

  authStatusEventEmitter.fire(undefined);
}

async function isAuthenticated() {
  console.log('auth0.auth.isAuthenticated');
  const tokenSet = await getTokenSet();
  if (tokenSet) {
    return !tokenSet.expired();
  }
  return false;
}

function dispose() {
  authStatusEventEmitter.dispose();
}

async function getTenantDomain() {
  const tokenSet = await getTokenSet();
  if (tokenSet && tokenSet.access_token) {
    return getDomainFromToken(tokenSet.access_token);
  }
}

module.exports = {
  onAuthStatusChanged: authStatusEventEmitter.event,
  useStorage,
  isAuthenticated,
  silentSignIn,
  getDeviceCodeAuthorization,
  deviceCodeSignIn,
  signOut,
  getTenantDomain,
  dispose,
};
