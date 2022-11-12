// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const Auth = require('./auth');
const AuthCommands = require('./auth.commands');

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

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
    /**
     * Set a global context item `auth0:authenticated`. This
     * setting is used to determine what commands/views/etc are
     * available to the user. The access token is also used
     * when making requests from the Management API.
     */
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

// This method is called when your extension is deactivated
function deactivate() {
  /**
   * Sign out and dispose of all tokensets
   */
  Auth.signOut();
  Auth.dispose();
}

module.exports = {
  activate,
  deactivate,
};
