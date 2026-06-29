// import {
//     ChatContainer,
//     ConversationHeader,
//     Message,
//     MessageInput,
//     MessageList
// } from "@chatscope/chat-ui-kit-react";

// import type { Conversation } from "../model/Conversation";
// import { messages } from "../data/messages";
// import UserAvatar from "./UserAvatar";
// import React, { useRef, useEffect } from "react";
// import { XmppServer } from "../xmpp/XmppServer";
// import { useState } from "react";
// import type { XmppMessage } from "../model/XmppMessage";

// interface Props {
//     conversation: Conversation;
// }
// function connect() {
//     console.log("connect ....");
//     const xmpp =
//         XmppServer.getInstance();
//     xmpp.login("nafiseh@zchat.ir", "123");
//     console.log("connection end ....");
// }

// export default function ChatPanel({ conversation }: Props) {

//     const [message, setMessage] = useState("");

//     const xmpp = XmppServer.getInstance();

//     const [currentMessages, setCurrentMessages] = useState(
//         messages.filter(
//             m => m.conversationId === conversation.id
//         )
//     );

//     const messageListRef = useRef<any>(null);

//     // خودکار اسکرول به پایین وقتی پیام جدید اضافه می‌شه
//     // useEffect(() => {
//     //     if (messageListRef.current) {
//     //         messageListRef.current.scrollToBottom();
//     //     }
//     // }, [currentMessages]);
//     useEffect(() => {

//         connect();
        
//         const unsubscribe = xmpp.addMessageListener(message => {
//             setCurrentMessages(previous => [

//                 ...previous,

//                 {
//                     id: Date.now(),

//                     conversationId: conversation.id,

//                     text: message.body,

//                     outgoing: false,
                    
//                     timestamp:Date.now()
//                 }

//             ]);

//         });
//     return () => {

//         unsubscribe();

//     };
//     }, [conversation.jid]);


//     const handleSend = (text: string) => {

//         if (!text.trim()) {
//             return;
//         }
//         console.log("send jid : "+conversation.jid)
//         xmpp.sendMessage(
//             conversation.jid,
//             text
//         );

// setCurrentMessages(previous => [

//     ...previous,

//     {

//         id: Date.now(),

//         conversationId: conversation.id,

//         text,

//         outgoing: true,

//         timestamp: Date.now()

//     }

// ]);
//     };

//     return (
//         <ChatContainer>
//             <ConversationHeader>
//                 <ConversationHeader.Back />
//                 <UserAvatar name={conversation.name} online={true} />
//                 <ConversationHeader.Content
//                     userName={conversation.name}
//                     info="Online"
//                 />
//             </ConversationHeader>

//             <MessageList
//                 ref={messageListRef}
//                 autoScrollToBottom={true}           // مهم
//             // style={{ display: 'flex', flexDirection: 'column-reverse' }}
//             >
//                 {currentMessages.map((message) => (
//                     <Message
//                         key={message.id}
//                         model={{
//                             message: message.text,
//                             direction: message.outgoing ? "outgoing" : "incoming",
//                             position: "single",
//                         }}
//                     />
//                 ))}
//             </MessageList>

//             <MessageInput
//                 placeholder="Type a message..."
//                 attachButton={true}
//                 onChange={setMessage}
//                 value={message}
//                 onSend={handleSend}
//             />
//         </ChatContainer>
//     );
// }