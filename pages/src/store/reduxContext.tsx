import { Reducer, useMemo, useState, createContext, ComponentType, forwardRef, Component, DependencyList, useContext } from "react";
import * as React from "react";
import { Observable, BehaviorSubject, Subject } from "rxjs";
import { scan, startWith, withLatestFrom, map, distinctUntilChanged } from "rxjs/operators";
import { useObservable } from "fugo";

type Epic<S, A> = (action$: Observable<A>, state$: BehaviorSubject<S>) => Observable<A>

export const useReducerObservable = <S, A>(reducer: Reducer<S, A>, epics?: Epic<S, A>) => {
    return useMemo(() => {
        const state$ = new BehaviorSubject(reducer(undefined as S, {} as A));

        const action$ = new Subject<A>();

        action$.pipe(
            withLatestFrom(state$),
            map(([action, state]) => reducer(state, action)),
            distinctUntilChanged()
        ).subscribe(state$);

        const dispatch = (action: A) => action$.next(action);

        // 注册epics
        if (epics instanceof Function) {
            epics(action$, state$).subscribe(nextAction => action$.next(nextAction));
        }

        return {
            state$,
            dispatch,
        };
    }, []);
};

export const createReduxContext = <S, A>(reducer: Reducer<S, A>) => {
    const ctx = createContext(null as { state$: BehaviorSubject<S>, dispatch: (action: A) => void });

    const withProvider = <P extends any, R = any>(C: ComponentType<P>) => forwardRef<R, P>((props: P, ref) => {
        const value = useReducerObservable(reducer);
        return (
            <ctx.Provider value={value}>
                <C {...props} ref={ref} />
            </ctx.Provider>
        );
    });

    const createStateHook = <R extends any>(mapper: (state: S) => R) => () => {
        const { state$ } = useContext(ctx);
        return useObservable(() => state$.pipe(
            map(mapper),
            distinctUntilChanged()
        ), null);
    };

    const useReduxContext = () => useContext(ctx);

    return {
        withProvider,
        createStateHook,
        useReduxContext,
    };
};


