import * as vscode from "vscode"

interface Replacement {
    searchValue: string
    replaceValue: string
}

export function activate(context: vscode.ExtensionContext) {
    const name = "dev-buddy";

    console.log("Extension " + name + " loaded.")

    let commandExecuteSelectedCode = vscode.commands.registerCommand(name + ".executeSelectedCode", () => {
        console.log("Executing command " + name + ".executeSelectedCode.")
        const editor = vscode.window.activeTextEditor
        if (editor) {
            let destination = undefined
            for (let terminal of vscode.window.terminals) {
                if (terminal.name == name) {
                    destination = terminal
                }
            }

            if (destination == undefined) {
                destination = vscode.window.createTerminal(name)
            }

            const document = editor.document
            const selection = editor.selection
            destination.sendText(document.getText(selection))
            destination.show(true)
        }
    })
    context.subscriptions.push(commandExecuteSelectedCode)

    let commandFormatMarkdownTable = vscode.commands.registerCommand(name + ".formatMarkdownTable", () => {
        console.log("Executing command " + name + ".formatMarkdownTable.")
        const editor = vscode.window.activeTextEditor
        if (editor) {
            // Task @UBE: add all replacements
            const replacements: Replacement[] = [
                { searchValue: "  ", replaceValue: " " },
                { searchValue: "| -", replaceValue: "|-" },
                { searchValue: "- |", replaceValue: "-|" },
                { searchValue: "|----", replaceValue: "|---" },
                { searchValue: "----|", replaceValue: "---|" }
            ]

            const document = editor.document
            const selection = editor.selection
            let text = document.getText(selection)

            for (const replacement of replacements) {
                while (text.includes(replacement.searchValue)) {
                    text = text.replace(replacement.searchValue, replacement.replaceValue)
                }
            }

            let table: Array<Array<string>> = [] // [rows][columns]

            const rows = text.split('\n')
            for (let row of rows) {
                table.push(row.split('|'))
            }

            if (table.length < 3) {
                console.error("Selected text does not seem to be a markdown table. Number of rows < 3.")
                return
            }

            for (let i = 1; i < table.length; i++) {
                if (table[i - 1].length != table[i].length) {
                    console.error("Selected text has different column length.")
                    return
                }
            }

            let widths: Array<number> = []

            for (let c = 0; c < table[0].length; c++) {
                let width = 0;
                for (let r = 0; r < table.length; r++) {
                    if (table[r][c].length > width) {
                        width = table[r][c].length;
                    }
                }
                widths.push(width)
            }

            let output = ""

            for (let r = 0; r < table.length; r++) {
                for (let c = 0; c < table[0].length; c++) {
                    output += table[r][c];
                    let diff = widths[c] - table[r][c].length;
                    for (let i = 0; i < diff; i++) {
                        if (r == 1) {
                            output += '-'
                        } else {
                            output += ' '
                        }
                    }
                    if (c < table[0].length - 1) {
                        output += '|'
                    }
                }
                if (r < table.length - 1) {
                    output += '\n'
                }
            }

            editor.edit(editBuilder => {
                editBuilder.replace(selection, output)
            })
        }
    })
    context.subscriptions.push(commandFormatMarkdownTable)

    let commandSortSelectedWords = vscode.commands.registerCommand(name + ".sortSelectedWords", () => {
        console.log("Executing command " + name + ".sortSelectedWords.")
        const editor = vscode.window.activeTextEditor
        if (editor) {
            const document = editor.document
            const selection = editor.selection

            const words = document.getText(selection)
            const sorted = words.split(' ').sort().join(' ')
            editor.edit(editBuilder => {
                editBuilder.replace(selection, sorted)
            })
        }
    })
    context.subscriptions.push(commandSortSelectedWords)
}

export function deactivate() { }
