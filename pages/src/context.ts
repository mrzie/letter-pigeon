import { createContext } from "react";
import { BehaviorSubject } from "rxjs";
import { Document } from "./model";

export interface Terminal {
    name: string,
}

export interface PigeonContextType {
    state$: BehaviorSubject<{
        list: Document[],
        terminal: Terminal,
    }>,
    send: (msg: Document) => void,
}

export default createContext(null as PigeonContextType);