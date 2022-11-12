const vscode = require('vscode');
const Auth = require('../auth');
const { getDomainFromToken } = require('../utils');

const defaultStatus = 'Auth0: None';

const statusBarItem = vscode.window.createStatusBarItem(
  vscode.StatusBarAlignment.Left,
  100
);

function update(tokenSet) {
  if (tokenSet && tokenSet.access_token) {
    statusBarItem.text = `Auth0: ${getDomainFromToken(tokenSet.access_token)}`;
    statusBarItem.command = 'auth0.auth.signOut';
  } else {
    statusBarItem.text = defaultStatus;
    statusBarItem.command = 'auth0.auth.signIn';
  }
}

Auth.onAuthStatusChanged(update, this);

update();

statusBarItem.show();

module.exports = statusBarItem;
