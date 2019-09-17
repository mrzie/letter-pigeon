import { createReduxContext } from "./reduxContext";
import { reducer } from "./reducer";

export const reduxContext = createReduxContext(reducer);
export default reduxContext;

export const useList = reduxContext.createStateHook(state => state.list);

export const useTerminal = reduxContext.createStateHook(state => state.terminal);