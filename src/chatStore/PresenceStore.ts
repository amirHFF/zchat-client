import { create } from "zustand";

export const toBareJid = (jid: string) => jid.split("/")[0].toLowerCase();

interface UsePresenceState {
    online: Record<string, boolean>; // bare jid -> online
    setPresence: (jid: string, online: boolean) => void;
    reset: () => void;
}

export const usePresenceStore = create<UsePresenceState>((set) => ({
    online: {},
    setPresence: (jid, online) =>
        set((state) => {
            const key = toBareJid(jid);
            if (state.online[key] === online) return state; // بدون رندر اضافه
            return { online: { ...state.online, [key]: online } };
        }),
    reset: () => set({ online: {} }),
}));