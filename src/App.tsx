import {useState} from "react";
import {MainContainer} from "@chatscope/chat-ui-kit-react";
import ConversationListPanel from "./components/ConversationListPanel";
import {ChatPanel} from "../components/ChatPanel";
import {conversations} from "./data/conversations";
import React from "react";
export const userJid = 'nafiseh@zchat.ir';

export default function App(){

    const [selectedConversation,setSelectedConversation]=useState(conversations[0]);

    return(
            <div
      style={{
        height: "100vh",
        padding: "30px",
        background:
          "linear-gradient(135deg,#c8d5ff 0%,#b8b6ff 100%)",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          height: "100%",
          borderRadius: "18px",
          overflow: "hidden",
          boxShadow: "0 20px 50px rgba(0,0,0,0.15)",
        }}
      >

        <MainContainer responsive >

            <ConversationListPanel
                conversations={conversations}
                selected={selectedConversation}
                onSelect={setSelectedConversation}
            />


            <ChatPanel
                conversation={selectedConversation}
            />

        </MainContainer>

</div>
      </div>

    );

}