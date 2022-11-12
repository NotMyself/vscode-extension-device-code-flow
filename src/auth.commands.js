const vscode = require('vscode');
const Auth = require('./auth');
const StatusBar = require('./views/auth.StatusBar');

const registerCommand = vscode.commands.registerCommand;

class AuthCommands {
  constructor(subscriptions) {
    subscriptions.push(
      ...[
        registerCommand('auth0.auth.silentSignIn', this.silentSignIn),
        registerCommand('auth0.auth.signIn', this.signIn),
        registerCommand('auth0.auth.signOut', this.signOut),
        StatusBar,
      ]
    );
  }

  async silentSignIn() {
    console.log('auth0.authCommands.silentSignIn');
    try {
      await Auth.silentSignIn();
    } catch (e) {
      console.log(e.message);
      //if silent sign in fails, clear any stored tokensets
      vscode.commands.executeCommand('auth0.auth.signOut');
    }
  }

  async signIn() {
    console.log('auth0.authCommands.signIn');
    try {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: `Sign in`,
          cancellable: true,
        },
        async (progress, token) => {
          progress.report({
            message: 'Fetching Device Code',
          });

          const handle = await Auth.getDeviceCodeAuthorization();

          progress.report({
            message: `Your pairing code is ${handle.user_code}`,
          });

          vscode.commands.executeCommand(
            'vscode.open',
            vscode.Uri.parse(handle.verification_uri_complete)
          );

          await Auth.deviceCodeSignIn(handle, token);
        }
      );
    } catch (e) {
      vscode.window.showErrorMessage(e.message);
    }
  }

  async signOut() {
    console.log('auth0:authCommands:signOut');
    await Auth.signOut();
  }
}

module.exports = AuthCommands;
