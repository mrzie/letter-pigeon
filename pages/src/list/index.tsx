import * as React from 'react'
import { useRef, useEffect, memo, useLayoutEffect, useState, useMemo } from 'react'
import * as styles from './list.less'
import { TextDocument, ImgDocument, MsgDocument } from '../model'
import { useEventHandler, useWhenLayout, useListener } from 'fugo';
import { merge } from 'rxjs';
import { useList, useTerminal } from '../store';
import { Link } from 'react-router-dom';
import { isJSON } from '../explorer/jsonExplorer';

const ListView = () => {
    const list = useList();
    const terminal = useTerminal();
    const selfName = terminal ? terminal.name : null;

    const rootRef = useRef(null as HTMLDivElement)
    const scrollHeight$ = useWhenLayout(() => rootRef.current ? rootRef.current.scrollHeight : 0)

    const [onCaptureLoad, captureLoad$] = useEventHandler()
    useEffect(() => {
        document.addEventListener('load', onCaptureLoad, true);
        return () => {
            document.removeEventListener('load', onCaptureLoad, true);
        };
    }, [])

    useListener(() => merge(scrollHeight$, captureLoad$).subscribe(() => {
        if (rootRef.current.scrollHeight > rootRef.current.clientHeight) {

            rootRef.current.scrollTo({ top: rootRef.current.scrollHeight - rootRef.current.clientHeight })
        }
    }))

    return <div className={styles.container} ref={rootRef} >
        {
            list.sort((a, b) => a.time > b.time ? 1 : -1).map((doc, index) => {
                switch (doc.content.msgType) {
                    case "text":
                        return <TextDocumentItem
                            index={index}
                            msg={doc.content}
                            isSelf={doc.from.name === selfName}
                            key={index}
                            isTemp={doc.isTemp}
                        />;
                    case "img":
                        return <ImageDocumentItem
                            index={index}
                            msg={doc.content}
                            isSelf={doc.from.name === selfName}
                            key={index}
                            isTemp={doc.isTemp}
                        />
                    default:
                        return null;
                }
            })
        }
    </div>
}

interface DocumentItemProps {
    // msg: TextDocument | ImgDocument,
    isSelf: boolean,
    // from: string,
    isTemp: boolean,
    index: number,
}

interface ImgDocumentItemProps extends DocumentItemProps {
    msg: ImgDocument,
}

interface TextDocumentItemProps extends DocumentItemProps {
    msg: TextDocument,
}

const useBubbleStyle = ({ isSelf, isTemp }: DocumentItemProps) => {
    const css = [styles.item]

    if (isSelf) {
        css.push(styles.fromSelf)
    }
    if (isTemp) {
        css.push(styles.tempDoc)
    }
    return css.join(' ');
};

const notEmpty = (...arr: any[]) => arr.some(some => !!some);

const TextDocumentItem = memo((props: TextDocumentItemProps) => {
    const { msg, index } = props

    const style = useBubbleStyle(props);

    const [isOverflow, setIsOverflow] = useState(false);
    const itemRef = useRef(null as HTMLDivElement);

    useLayoutEffect(() => {
        if (!itemRef.current) {
            setIsOverflow(false);
            return;
        }
        setIsOverflow(itemRef.current.scrollHeight > itemRef.current.clientHeight);
    }, [msg.text]);

    const isAnalyzable = useMemo(() => {
        if (isJSON(msg.text)) {
            return true;
        }
        return false;
    }, [msg.text]);

    const explorerButton = isAnalyzable || isOverflow
        ? <Link to={`/explorer/${index}`}>
            <button className={styles.toolButton}>{isOverflow ? "查看全部" : "查看"}</button>
        </Link>
        : null;

    const toolsNode = notEmpty(explorerButton)
        ? <div className={styles.itemTools}>
            {explorerButton}
        </div>
        : null;

    return (
        <div className={style}>
            <div className={styles.textItem}>
                <div className={styles.textItemContent} ref={itemRef}>
                    {
                        msg.text
                            .split('\n')
                            .map(v => v.replace(/ /g, "\u00a0"))
                            .map((v, k) => <p className={styles.p} key={k}>{v}</p>)
                    }
                </div>
            </div>
            {toolsNode}
        </div>
    );
});

const ImageDocumentItem = memo((props: ImgDocumentItemProps) => {
    const { msg, index } = props

    const style = useBubbleStyle(props);

    return (
        <div className={style}>
            <div className={styles.imageItem}>
                <img src={msg.base64} />
            </div>
        </div>
    );
});

export default ListView