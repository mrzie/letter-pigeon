import * as React from 'react'
import { useContext, useRef, useEffect } from 'react'
import * as styles from './list.less'
import { MessageType, Message, Document, TextDocument, ImgDocument } from '../model'
import PigeonContext from '../context'
import { useObservable, useEventHandler, useWhenLayout, useListener } from 'fugo';
import { map, pairwise, filter, throttle, debounce, startWith, withLatestFrom } from 'rxjs/operators';
import { fromEvent, merge } from 'rxjs';

const ListView = () => {
    const { state$ } = useContext(PigeonContext)
    const list = useObservable(() => state$.pipe(
        map(state => state.list)
    ), [])
    const selfName = useObservable(() => state$.pipe(
        map(state => {
            try {
                return state.terminal.name
            } catch (e) {
                return null
            }
        })
    ), null)

    const rootRef = useRef(null as HTMLDivElement)
    const scrollHeight$ = useWhenLayout(() => rootRef.current ? rootRef.current.scrollHeight : 0)

    const [onCaptureLoad, captureLoad$] = useEventHandler()
    useEffect(() => {
        document.addEventListener('load', onCaptureLoad, true)
    }, [])

    useListener(() => merge(scrollHeight$, captureLoad$).subscribe(() => {
        if (rootRef.current.scrollHeight > rootRef.current.clientHeight) {

            rootRef.current.scrollTo({ top: rootRef.current.scrollHeight - rootRef.current.clientHeight })
        }
    }))

    return <div className={styles.container} ref={rootRef} >
        {
            list.sort((a, b) => a.time > b.time ? 1 : -1).map((doc, index) => <DocumentItem
                msg={doc.content}
                from={doc.from.name}
                isSelf={doc.from.name === selfName}
                key={index}
                isTemp={doc.isTemp}
            />
            )
        }
    </div>
}

interface DocumentItemProps {
    msg: TextDocument | ImgDocument,
    isSelf: boolean,
    from: string,
    isTemp: boolean,
}

const DocumentItem = (props: DocumentItemProps) => {
    const { msg, isSelf, isTemp } = props
    const css = [styles.item]

    if (isSelf) {
        css.push(styles.fromSelf)
    }
    if (isTemp) {
        css.push(styles.tempDoc)
    }
    if (msg.msgType === 'text') {

        return <div className={css.join(' ')}>
            <div className={styles.textItem}>
                {msg.text}
            </div>
        </div>
    } else if (msg.msgType === 'img') {
        return <div className={css.join(' ')}>
            <div className={styles.imageItem}>
                <img src={msg.base64} />
            </div>
        </div>
    }
    // const isSelf = 
    return null as null
}

export default ListView