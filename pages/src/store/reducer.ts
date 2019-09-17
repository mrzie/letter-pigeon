import PigeonContext, { PigeonContextType, Terminal } from "../context";
import { Message, Document, Operation } from "../model";
import { createReduxContext } from "./reduxContext";

type PigeonAction = never
    | { type: "SET_TERMINAL_NAME", name: string }
    | { type: "ADD_MESSAGE_TO_LIST", doc: Document }

const initialState = {
    list: [] as Document[],
    terminal: null as Terminal,
}

export const reducer = (state = initialState, action: PigeonAction) => {
    switch (action.type) {
        case "SET_TERMINAL_NAME":
            const { name } = action;
            return {
                ...state,
                terminal: { name },
            };
        case "ADD_MESSAGE_TO_LIST":
            const { doc } = action;
            return {
                ...state,
                list: [
                    ...state.list.filter(item => (item.from.name !== doc.from.name) || (item.from.msgId !== doc.from.msgId)),
                    doc,
                ],
            };
        default:
            return state;
    }
};