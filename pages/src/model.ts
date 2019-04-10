export interface Document extends Message {
    type: 'document',
    content: TextDocument | ImgDocument,
    from: TerminalInfo,
}

export interface TerminalInfo {
    name: string,
    msgId: number,
}

export enum MsgType {

}

export interface TextDocument {
    msgType: 'text',
    text: string,
}

export interface ImgDocument {
    msgType: 'img',
    base64: string,
}

export interface Operation extends Message {
    type: 'operation',
    // name: OperationType,
}

export interface Operation extends Message {
    type: 'operation',
    name: 'start',
    terminalName: string,
}

export interface Message {
    type: MessageType,
}


export type MessageType = 'document' | 'operation'


export const MessageTypes: MessageType[] = ['document', 'operation']

export type Lifecycle = 'inited' | 'actived' | 'end'