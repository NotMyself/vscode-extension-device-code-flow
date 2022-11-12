# VSCode Extension Device Code Flow
A fully functioning demonstration of authentication and authorization for a visual studio code extension using device code flow.
## Features

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Working with Markdown

You can author your README using Visual Studio Code.  Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux)
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux)
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**

### Device Flow

```mermaid
sequenceDiagram
    autonumber
    User->>VSCode: Issue Sign In Command
    VSCode->>Auth0 Tenant: Authorization request to /oauth/device/code
    Auth0 Tenant->>VSCode: Device Code + User Code + Verification URL
    VSCode->>User: Display User Code
    VSCode->>User: Open Verification URL in Browser
    Note over User: User switches to Browser Flow
    loop Polling
        VSCode->>Auth0 Tenant: Access token request to /oauth/token
    end
    Note over Auth0 Tenant: Once user has completed Browser Flow
    Auth0 Tenant->>VSCode: Returns Access Token
    VSCode->>API: Request user data with Access Token
    API->>VSCode: Response with data
    
```

### Browser Flow

```mermaid
sequenceDiagram
    autonumber
    User->>Auth0 Tenant: User Navigates to the Verification Url
    Auth0 Tenant->>User: Redirect to login/authorization prompt
    User->>Auth0 Tenant: User authenticates and gives consent
    Auth0 Tenant->>User: Mark device as authorized and displays success message

```
