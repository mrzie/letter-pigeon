import { useBehaviorSubject, useListener } from "fugo"
import PigeonContext, { PigeonContextType, Terminal } from "./context"
import InputView from './input'
import * as React from 'react'
import ListView from "./list"
import * as styles from './main.less'
import { Message, Document, Operation } from "./model";
import useWs from "./useWs";
import { wsPath } from './config'
import { skipUntil } from "rxjs/operators";
import { useCallback, useMemo } from 'react'
import { BehaviorSubject } from "rxjs";

const reduceState = <T extends any>(
    state$: BehaviorSubject<T>,
    reducer: (state: T) => T
) => {
    console.log('do', reducer(state$.getValue()))
    return state$.next(reducer(state$.getValue()))
}


const MainView = () => {
    const ws = useWs(wsPath)

    const state$ = useBehaviorSubject({
        list: [] as Document[],
        terminal: null as Terminal,
    })

    const context$ = useMemo(() => ({
        state$,
        send: msg => {
            addMessageToList({
                ...msg,
                time: +new Date(),
                isTemp: true,
            })
            ws.send(msg)
        }
    }) as PigeonContextType, [])

    const addMessageToList = useCallback((doc: Document) => reduceState(
        state$,
        state => ({
            ...state,
            list: [...state.list.filter(item => (item.from.name !== doc.from.name) || (item.from.msgId !== doc.from.msgId)), doc]
        })
    ), [])

    const setTerminalName = useCallback((name: string) => reduceState(
        state$,
        state => ({
            ...state,
            terminal: { name }
        })
    ), [])


    useListener(() => ws.message$.pipe(
        skipUntil(ws.open$)
    ).subscribe(msg => {
        if (msg.type === 'document') {
            addMessageToList(msg as Document)
        }
        if (msg.type === 'operation') {
            const op = (msg as Operation)
            switch (op.name) {
                case 'start':
                    setTerminalName(op.terminalName)
                    return
            }
        }
    }))

    useListener(() => state$.subscribe(value => {
        console.log('context changed')
        console.log(value)
    }))

    // const status$ = 

    return <PigeonContext.Provider value={context$}>
        <div className={styles.container}>
            <ListView />
            <InputView />
        </div>
    </PigeonContext.Provider>
}

export default MainView;