import * as React from 'react'
import { useContext, useCallback, useRef, useMemo } from 'react'
import * as styles from './input.less'
import PigeonContext from '../context'
import { useEventHandler, useListener } from 'fugo';
import { pluck, tap, map, filter, mapTo, startWith, withLatestFrom } from 'rxjs/operators';
import { fromEvent, merge, combineLatest } from 'rxjs';
import reduxContext, { useTerminal } from '../store';

let inputCount = 0

const InputView = () => {
    const { send } = useContext(PigeonContext);

    const terminal = useTerminal();
    const terminalName = terminal ? terminal.name : null;

    const textRef = useRef(null as HTMLTextAreaElement)

    const [onSubmit, submit$] = useEventHandler()

    const [onKeyDown, keyDown$] = useEventHandler<React.KeyboardEvent<HTMLTextAreaElement>>()
    const [onKeyUp, keyUp$] = useEventHandler<React.KeyboardEvent<HTMLTextAreaElement>>()

    // 点击发送上传
    useListener(() => {
        const enterKey$ = merge(
            keyDown$.pipe(
                filter(ev => ev.keyCode === 13),
                mapTo(true)
            ),
            keyUp$.pipe(
                filter(ev => ev.keyCode === 13),
                mapTo(false)
            )
        ).pipe(startWith(false))

        const cmdKey$ = merge(
            keyDown$.pipe(
                filter(ev => ev.keyCode === 91),
                mapTo(true)
            ),
            keyUp$.pipe(
                filter(ev => ev.keyCode === 91),
                mapTo(false)
            )
        )

        const cmdEnter$ = enterKey$.pipe(
            withLatestFrom(cmdKey$),
            map(([enterPressed, cmdPressed]) => enterPressed && cmdPressed),
            filter(cool => cool)
        )

        const ctrlEnter$ = keyDown$.pipe(
            filter(ev => ev.keyCode === 13 && ev.ctrlKey)
        )

        return merge(
            submit$,
            cmdEnter$,
            ctrlEnter$
        ).subscribe(() => {

            try {
                if (textRef.current.value.trim() === '') {
                    return
                }
                send({
                    type: 'document',
                    content: {
                        msgType: 'text',
                        text: textRef.current.value,
                    },
                    from: null,
                })
                textRef.current.value = ''
            } catch (e) {

            }
        })
    })

    const [onParse, parse$] = useEventHandler<React.ClipboardEvent<HTMLTextAreaElement>>()

    // 粘贴上传
    useListener(() => parse$.subscribe((e) => {
        const items = [...e.clipboardData.items]
        if (items.find(item => item.type.includes('image'))) {
            e.preventDefault()
            items.filter(item => item.type.includes('image')).forEach(async item => {
                send({
                    type: 'document',
                    content: {
                        msgType: 'img',
                        base64: await readBase64(item)
                    },
                    from: null,
                })
            })
        }
    }))
    const [onFileChange, fileChange$] = useEventHandler<React.ChangeEvent<HTMLInputElement>>()
    useListener(() => fileChange$.subscribe((e) => {
        const files = [...e.target.files]
        files.filter(f => f.type.includes('image')).forEach(async f => {
            send({
                type: 'document',
                content: {
                    msgType: 'img',
                    base64: await readFile(f)
                },
                from: null,
            })
        })
    }))

    const inputRef = useRef(null as HTMLInputElement)
    const inputId = useMemo(() => `input-id-${++inputCount}`, [])


    return <div className={styles.container}>
        <label
            htmlFor={inputId}
            className={styles.iconAdd}
            onClick={() => inputRef.current.focus()}
        ></label>
        <input type="file"
            ref={inputRef}
            id={inputId}
            className={styles.hide}
            onChange={onFileChange}
            accept="image/*"
        />
        <textarea
            ref={textRef}
            className={styles.textarea}
            placeholder={`从『${terminalName}』发送消息`}
            onPaste={onParse}
            // onKeyPress={onKeyPress}
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
        />
        <button
            className={styles.send}
            disabled={terminalName === null}
            onClick={onSubmit}
        >
            发送
        </button>
    </div>
}

const readBase64 = (item: DataTransferItem) => readFile(item.getAsFile())

const readFile = (f: File) => new Promise<string>(resolve => {
    const reader = new FileReader()
    reader.onloadend = (e: E) => {
        resolve(e.target.result)
    }
    reader.readAsDataURL(f)
})

interface ET extends EventTarget {
    result: string
}

interface E extends ProgressEvent {
    target: ET
}

export default InputView