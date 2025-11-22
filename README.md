# CSS Property Organizer by S4W6
Organise your CSS files in groups. Hyper Customizable !

## Features
- **Fast asf** Just press `ctrl`+`alt`+`o` (or `cmd`+`alt`+`o` on Mac) to clean up your file ! 
- **Hyper customizable** You can define your own property groups in settings
- **Smart grouping** Uses wildcards to match property families (e.g., `margin*` matches all margin properties)
- **Nested CSS support** Works with nested selectors (SCSS, LESS, modern CSS)
- **Preserve formatting** Maintains your code style and comments

## Usage
1. Open the file you wanna clean up
2. Press `ctrl`+`alt`+`o` (or `cmd`+`alt`+`o` on Mac), or type `Organize CSS Properties` in the command palette
3. Your CSS properties will be automatically organized!

## Configuration

Customize the property groups in your VS Code settings:

\`\`\`json
{
  "cssOrganizer.propertyGroups": [
    {
      "name": "Size & Box Model",
      "properties": ["width", "height", "box-sizing"]
    },
    {
      "name": "Display & Positioning",
      "properties": ["display", "flex*", "margin*", "padding*"]
    }
  ],
  "cssOrganizer.addBlankLinesBetweenGroups": true,
  "cssOrganizer.sortPropertiesInGroup": false
}
\`\`\`

### Wildcard Patterns

Use \`*\` to match property families:
- \`margin*\` matches \`margin\`, \`margin-top\`, \`margin-left\`, etc.
- \`font*\` matches \`font-size\`, \`font-weight\`, \`font-family\`, etc.

### Unknown Properties

Properties that don't match any group are placed at the end in an "unknown" group.

## Example

**Before:**
```css
.button {
    color: blue;
    width: 100px;
    display: flex;
    background-color: white;
    height: 40px;
    margin: 10px;
}
```

**After:**
```css
.button {
    width: 100px;
    height: 40px;
    
    display: flex;
    margin: 10px;
    
    background-color: white;
    
    color: blue;
}
```
