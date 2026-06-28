import {
  Sidebar,
  Search,
  ConversationList,
  Conversation,
  Avatar
} from "@chatscope/chat-ui-kit-react";
import React from "react";
import type { Conversation as ConversationModel } from "../model/Conversation";
import UserAvatar from "./UserAvatar";

const conversations = [
  {
    id: 1,
    name: "Ali",
    lastMessage: "سلام",
    time: "10:30",
  },
  {
    id: 2,
    name: "Sara",
    lastMessage: "How are you?",
    time: "10:28",
  },
  {
    id: 3,
    name: "Reza",
    lastMessage: "Picture",
    time: "10:25",
  },
];

interface Props {
  conversations: ConversationModel[];
  selected: ConversationModel;
  onSelect: (conversation: ConversationModel) => void;
}

export default function ConversationListPanel({
  conversations,
  selected,
  onSelect,
}: Props) {
  return (
    <Sidebar
      position="left"
      style={{
        width: 380,
        background: "#ffffff",
      }}
    >
      <Search placeholder="Search..." />

      <ConversationList>
        {conversations.map((c) => (
    <Conversation

    key={c.id}

    name={c.name}

    info={c.lastMessage}
            lastActivityTime="10:30"
            onClick={() => onSelect(c)}
>
<UserAvatar
    name={c.name}
    online={true}
/>
</Conversation>
        ))}
      </ConversationList>
    </Sidebar>
  );
}