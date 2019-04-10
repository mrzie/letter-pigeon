import { useMemo, useEffect, useCallback } from "react";
import { useListener, useEventHandler } from "fugo";
import { Message, MessageTypes, MsgType } from "./model";
import { map, filter } from 'rxjs/operators'

const useWs = (path: string) => {
    const [onopen, open$] = useEventHandler()
    const [onmessage, _message$] = useEventHandler<MessageEvent>()
    const [onerror, error$] = useEventHandler()
    const [onclose, close$] = useEventHandler()
    const ws = useMemo(() => new WebSocket(path), [])

    useMemo(() => {
        ws.onopen = onopen
        ws.onerror = onerror
        ws.onclose = onclose
        ws.onmessage = onmessage
    }, [])

    const message$ = useMemo(() => _message$.pipe(
        map(ev => {
            try {
                const msg: Message = JSON.parse(ev.data)
                if (!MessageTypes.includes(msg.type)) {
                    throw 0;
                }
                return msg
            } catch (e) {
                console.warn('some dirt data', ev)
                return null
            }
        }),
        filter(msg => msg !== null)
    ), [])

    useEffect(() => {
        return () => {
            ws.close()
        }
    }, [])

    const send = useCallback((msg: Message) => ws.send(JSON.stringify(msg)), [])

    return {
        open$,
        message$,
        error$,
        close$,
        send,
    }
    // useListener
}

export default useWs