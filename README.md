# gludoc

Gludoc is a VSCode extension for generating Lua documentation from Lua source
code.

![Screenshot](assets/readme/screenshot.png)

## Features

Gludoc will trawl through your workspace and generate documentation for all
Lua files it can find.

It parses Lua Language Server documentation comments and uses these to generate
markdown documentation.

## Supported Tags

Gludoc supports the following tags:

### Single-line tags

#### Param

```lua
--- @param <type> <name> - <description>
```

#### Return

```lua
--- @return <type> - <description>
```

### Multi-line tags

#### Example

```lua
--- @example
--- <example>
--- <more example
--- <even more example
```

### Description

Anything that doesn't match a supported tag is treated as a description.

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something.

## Release Notes


### 0.1.0

Initial release of Gludoc.

---


[Fromat icons created by PixelX - Flaticon](https://www.flaticon.com/free-icons/fromat)[^1]

[^1]: This is not a typo by me, this is the attribution required by Flaticon for the format icons used in the extension.
