# gludoc

Gludoc is a VSCode extension for generating Lua documentation from Lua source
code.

![Screenshot](assets/readme/screenshot.png)

> It is worth mentioning that Gludoc is not a replacement for LDoc or the Lua
> Language Server. It is simply a tool to help you generate documentation for
> your Lua code. It is not intended to be a fully featured documentation tool,
> rather, it is intended to be a quick and easy way to generate documentation
> for the lazy coding git who just wants to burp out some docs, potentially,
> for inclusion in a wiki or documentation site. If you want a fully featured
> documentation tool, you should use LDoc or the Lua Language Server. I just
> find them too ~~complicated~~ heavyweight for my general needs.

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

## Contributes

This extension contributes the following to the VSCode command palette:

- `[Gludoc] Generate Lua Documentation`: Generates documentation for the current
  workspace.

## Release Notes

### 0.1.0

Initial release of Gludoc.

### 0.1.1

Fixed issue with function descriptions not being generated.

---


[Fromat icons created by PixelX - Flaticon](https://www.flaticon.com/free-icons/fromat)[^1]

[^1]: This is not a typo by me, this is the attribution required by Flaticon for the format icons used in the extension.
