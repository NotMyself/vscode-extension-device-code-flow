const vscode = require('vscode');
const Auth = require('./auth');
const AuthCommands = require('./auth.commands');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  /**
   * Register commands & views
   */
  const authCommands = new AuthCommands(context.subscriptions);

  /**
   * Register changes in authentication to update views
   */
  const updateViews = async (tokenSet) => {
    const authenticated = tokenSet && !tokenSet.expired();

    await vscode.commands.executeCommand(
      'setContext',
      'auth0:authenticated',
      authenticated
    );
  };

  Auth.useStorage(context.secrets);
  Auth.onAuthStatusChanged(updateViews);

  vscode.commands.executeCommand('auth0.auth.silentSignIn');
}

function deactivate() {
  Auth.dispose();
}

module.exports = {
  activate,
  deactivate,
};
