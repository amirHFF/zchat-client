export  interface ChatMessage {

    id:string;

    conversationId:any|undefined;

    text:string;

    outgoing:boolean;

    timestamp:number

}