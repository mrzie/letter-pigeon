import { useListener } from "fugo"
import PigeonContext from "./context"
import InputView from './input'
import * as React from 'react'
import ListView from "./list"
import * as styles from './main.less'
import { Document, Operation } from "./model";
import useWs from "./useWs";
import { wsPath } from './config'
import { skipUntil } from "rxjs/operators";
import { useMemo } from 'react'
import reduxContext from "./store";
let count = 0

const MainView = () => {
    const ws = useWs(wsPath)

    const { state$, dispatch } = reduxContext.useReduxContext();

    const ctx = useMemo(() => {
        return {
            send: (msg: Document) => {
                const { terminal } = state$.getValue();
                msg = {
                    ...msg,
                    from: {
                        name: terminal && terminal.name,
                        msgId: `${+new Date()}.${++count}`
                    },
                };
                dispatch({
                    type: 'ADD_MESSAGE_TO_LIST',
                    doc: {
                        ...msg,
                        time: +new Date(),
                        isTemp: true,
                    },
                });
                ws.send(msg);
            },
        }
    }, []);

    useListener(() => ws.message$.pipe(
        skipUntil(ws.open$)
    ).subscribe(msg => {
        if (msg.type === 'document') {
            dispatch({
                type: 'ADD_MESSAGE_TO_LIST',
                doc: msg as Document,
            });
            return;
        }
        if (msg.type === 'operation') {
            const op = (msg as Operation)
            switch (op.name) {
                case 'start':
                    dispatch({
                        type: 'SET_TERMINAL_NAME',
                        name: op.terminalName,
                    });
                    return;
            }
        }
    }));

    return <PigeonContext.Provider value={ctx}>
        <div className={styles.container}>
            <ListView />
            <InputView />
        </div>
    </PigeonContext.Provider>
}

export default reduxContext.withProvider(MainView);