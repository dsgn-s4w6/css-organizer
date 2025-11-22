const vscode = require('vscode');
const postcss = require('postcss');

function activate(context) {
    let disposable = vscode.commands.registerCommand('css-organizer.organize', async function () {
        const editor = vscode.window.activeTextEditor;
        
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found');
            return;
        }

        const document = editor.document;
        
        // Check if it's a CSS file
        if (document.languageId !== 'css' && document.languageId !== 'scss' && document.languageId !== 'less') {
            vscode.window.showErrorMessage('This command only works with CSS/SCSS/LESS files');
            return;
        }

        try {
            const config = vscode.workspace.getConfiguration('cssOrganizer');
            const propertyGroups = config.get('propertyGroups');
            const addBlankLines = config.get('addBlankLinesBetweenGroups');
            const sortPropertiesInGroup = config.get('sortPropertiesInGroup');

            const cssText = document.getText();
            const organized = await organizeCSS(cssText, {
                propertyGroups,
                addBlankLines,
                sortPropertiesInGroup
            });

            const edit = new vscode.WorkspaceEdit();
            const fullRange = new vscode.Range(
                document.positionAt(0),
                document.positionAt(cssText.length)
            );
            edit.replace(document.uri, fullRange, organized);
            
            await vscode.workspace.applyEdit(edit);
            vscode.window.showInformationMessage('CSS organized successfully!');
        } catch (error) {
            vscode.window.showErrorMessage(`Error organizing CSS: ${error.message}`);
        }
    });

    context.subscriptions.push(disposable);
}

async function organizeCSS(cssText, options) {
    const { propertyGroups, addBlankLines, sortPropertiesInGroup } = options;

    return postcss([
        organizeCSSPlugin({ propertyGroups, addBlankLines, sortPropertiesInGroup })
    ]).process(cssText, { from: undefined }).css;
}

function organizeCSSPlugin(options) {
    return {
        postcssPlugin: 'organize-css',
        Rule(rule) {
            const declarations = [];
            
            // Collect all declarations
            rule.each(node => {
                if (node.type === 'decl') {
                    declarations.push(node.clone());
                }
            });

            // Group declarations by property groups
            const grouped = groupDeclarations(declarations, options.propertyGroups);
            
            // Sort within groups if enabled
            if (options.sortPropertiesInGroup) {
                grouped.forEach(group => {
                    group.declarations.sort((a, b) => 
                        a.prop.localeCompare(b.prop)
                    );
                });
            }

            // Remove all existing declarations
            rule.each(node => {
                if (node.type === 'decl') {
                    node.remove();
                }
            });

            // Re-add declarations in organized order
            let isFirstGroup = true;
            grouped.forEach((group, groupIndex) => {
                if (group.declarations.length === 0) return;

                group.declarations.forEach((decl, index) => {
                    // Add extra newline before group (except first)
                    if (index === 0 && !isFirstGroup && options.addBlankLines) {
                        decl.raws.before = '\n\n    ';
                    } else {
                        decl.raws.before = '\n    ';
                    }
                    
                    rule.append(decl);
                });
                
                isFirstGroup = false;
            });
        }
    };
}

organizeCSSPlugin.postcss = true;

function groupDeclarations(declarations, propertyGroups) {
    const groups = propertyGroups.map(group => ({
        name: group.name,
        properties: group.properties,
        declarations: []
    }));

    // Add an "unknown" group for properties not in any group
    groups.push({
        name: 'unknown',
        properties: [],
        declarations: []
    });

    declarations.forEach(decl => {
        let matched = false;
        
        for (let group of groups.slice(0, -1)) { // Exclude unknown group
            if (propertyMatchesGroup(decl.prop, group.properties)) {
                group.declarations.push(decl);
                matched = true;
                break;
            }
        }

        if (!matched) {
            groups[groups.length - 1].declarations.push(decl);
        }
    });

    return groups;
}

function propertyMatchesGroup(property, patterns) {
    return patterns.some(pattern => {
        if (pattern.endsWith('*')) {
            return property.startsWith(pattern.slice(0, -1));
        }
        return property === pattern;
    });
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};