import * as React from "react";
import { RouteComponentProps } from "react-router";
import { useList } from "../store";
import { isJSON, JSONExplorer } from "./jsonExplorer";
import * as styles from './explorer.less';

export const ExplorerView = (props: RouteComponentProps<{ id: string }>) => {
    const content = useExplorerContent(props);

    return (
        <div className={styles.explorerContainer}>
            {content}
        </div>
    );
};

const useExplorerContent = (props: RouteComponentProps<{ id: string }>) => {
    const list = useList();
    const doc = list && list[+props.match.params.id] || null;

    if (!doc) {
        return <div className={styles.loader}></div>
    }

    if (doc.content.msgType === "img") {
        return <div>查看器暂不支持查看图片</div>
    }

    if (doc.content.msgType === "text") {
        // if (isJSON(doc.content.text)) {
        return <JSONExplorer
            value={doc.content.text}
        />
        // } else {
        // return <div className={styles.textBox}>
        //         {doc.content.text}
        // </div>
        // }
    }
    return (
        <div>
            未知错误
        </div>
    );
};

