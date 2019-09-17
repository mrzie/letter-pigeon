import { memo } from "react";
import CodeMirror from "./codemirror";
import * as React from "react";
import * as styles from './jsonExplorer.less'
import { js as beautify } from 'js-beautify'

export function isJSON(src: string) {
    if (typeof src == 'string') {
        try {
            const obj = JSON.parse(src);
            if (typeof obj == 'object' && obj) {
                return true;
            } else {
                return false;
            }

        } catch (e) {
            return false;
        }
    }
}


interface JSONExplorerProps {
    value: string,
}

export const JSONExplorer = memo((props: JSONExplorerProps) => {
    const { value } = props;

    return (
        <CodeMirror
            value={beautify(value)}
            className={styles.editor}
            options={{
                lineNumbers: true,
                mode: {
                    name: "javascript",
                    json: true,
                },
                readOnly: true,
                // lineWrapping: true,
                theme: "mdn-like",
                autoCloseBrackets: true,
                matchBrackets: true,
                keyMap: 'sublime',
                styleActiveLine: true,
                extraKeys: { Enter: "newlineAndIndentContinueMarkdownList" },
                foldGutter: true,
                gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
            }}
        />
    )
});