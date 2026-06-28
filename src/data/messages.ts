import type {ChatMessage} from "../model/ChatMessage";

export const messages:ChatMessage[]=[

    {
        id:1,
        conversationId:1,
        text:"سلام امیر 👋",
        outgoing:false,
        timestamp:12
    },
    

    {
        id:2,
        conversationId:1,
        text:"سلام علی",
        outgoing:true,
                timestamp:13
    },

    {
        id:3,
        conversationId:2,
        text:"Hello Amir",
        outgoing:false,
                timestamp:14

    },

    {
        id:4,
        conversationId:2,
        text:"Hello Sara",
        outgoing:true,
                timestamp:15
    },

    {
        id:5,
        conversationId:3,
        text:"Picture",
        outgoing:false,
                timestamp:16
    }

];