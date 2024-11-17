# gludoc

Gludoc is a VSCode extension for generating Lua documentation from Lua source
code.

![Screenshot](assets/readme/screenshot.png)

You should be documenting files that are intended to be documentation lua
files instead of your actual code files. This is because Gludoc will generate
documentation for all Lua files it can find in your workspace that begin
with `---@meta <documentname>`; this must be the very first line of the file
and the file must be a Lua file.

See the [example](#example).

Such documentation is also useful with the [Lua Language Server](https://marketplace.visualstudio.com/items?itemName=sumneko.lua) extension.

> It is worth mentioning that Gludoc is not a replacement for LDoc or LuaDoc
> It is simply a tool to help you generate documentation for your Lua code. It
> is not intended to be a fully featured documentation tool, rather, it is
> intended to be a quick and easy way to generate documentation for the lazy
> coding git who just wants to burp out some docs, potentially, for inclusion
> in a wiki or documentation site. If you want a fully featured documentation
> tool, you should use LDoc or LuaDoc. I just find them too ~~complicated~~
> heavyweight for my general needs.

### Protips

- Keep your documentation files in a separate directory from your code files.
- Hmm. Idk anymore yet. Maybe later. 🤷🏻

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
--- @return <type> # <description>
```

### Multi-line tags

#### Example

```lua
--- @example
--- ```lua
--- <example>
--- <more example
--- <even more example
--- ```
```

### Description

Anything that doesn't match a supported tag is treated as a description.

## Example

Given the following Lua code:

```lua
---@meta DateClass

------------------------------------------------------------------------------
-- DateClass
------------------------------------------------------------------------------

if false then -- ensure that functions do not get defined

  ---@class DateClass

  ---Converts a number of seconds into a human-readable string. By default, the
  ---result is returned as a table of three strings. However, if the `as_string`
  ---parameter is provided, the result is returned as a single string.
  ---
  ---@name shms
  ---@param seconds number - The number of seconds to convert.
  ---@param as_string boolean? - Whether to return the result as a string.
  ---@return string[]|string # The resulting string or table of strings.
  function date.shms(seconds, as_string) end

end
```

The following markdown documentation would be generated:

```markdown
# DateClass

## date.shms

Converts a number of seconds into a human-readable string. By default, the
result is returned as a table of three strings. However, if the `as_string`
parameter is provided, the result is returned as a single string.

**Parameters**

- `seconds` (`number`) - The number of seconds to convert.
- `as_string` (`boolean?`) - Whether to return the result as a string.

**Returns**

`string[]|string` - The resulting string or table of strings.
```

## Contributes

This extension contributes the following to the VSCode command palette:

- `[Gludoc] Generate Lua Documentation from current workspace`: Generates
  documentation for the current workspace.

## Release Notes

### 0.1.0

Initial release of Gludoc.

### 0.2.0

Major update to Gludoc. Now supports `@name` for functionsd and @meta for
describing the module name at the top of a file.

---


[Fromat icons created by PixelX - Flaticon](https://www.flaticon.com/free-icons/fromat)[^1]

[^1]: This is not a typo by me, this is the attribution required by Flaticon for the format icons used in the extension.
