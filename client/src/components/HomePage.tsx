import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useChats, useUnread, useMessages } from '../hooks/useChat';
import { useTyping } from '../hooks/useTyping';
import { usePresence } from '../hooks/usePresence';
import { usePushSubscription } from '../hooks/usePushSubscription';
import AppLayout from './layout/AppLayout';
import ChatList from './chat/ChatList';
import ChatView from './chat/ChatView';
import MessageInput from './chat/MessageInput';
import CreateChatModal from './chat/CreateChatModal';
import CreateGroupModal from './chat/CreateGroupModal';
import OnlineDot from './chat/OnlineDot';
import Avatar from './common/Avatar';
import { Chat } from '../types';

export default function HomePage() {
  const { user, logout } = useAuth();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showGroup, setShowGroup] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const { chats, loading: chatsLoading, error: chatsError, reload: reloadChats } = useChats();
  const { messages, loading: msgsLoading, error: msgsError, sendMessage, sendImage } = useMessages(selectedChat?.id || null);
  const { handleTyping } = useTyping(selectedChat?.id || null);
  const { isOnline } = usePresence(user?.id);
  const { count: unreadCount, markRead } = useUnread(selectedChat?.id || null);
  usePushSubscription();

  const handleSelectChat = useCallback((chat: Chat) => {
    setSelectedChat(chat);
    setShowSidebar(false);
    markRead(chat.id);
  }, [markRead]);

  const handleChatCreated = useCallback((chat: Chat) => {
    setSelectedChat(chat);
    setShowSidebar(false);
    reloadChats();
  }, [reloadChats]);

  const handleBack = useCallback(() => {
    setShowSidebar(true);
    setSelectedChat(null);
  }, []);

  const otherUser = selectedChat?.participants.find((p) => p.id !== user?.id);
  const otherOnline = isOnline(otherUser?.id || '');

  return (
    <AppLayout>
      <div className="flex h-full">
        <aside className={`${showSidebar ? 'flex' : 'hidden'} md:flex w-full md:w-80 border-r border-gray-200 dark:border-gray-700 flex-col`}>
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h1 className="font-semibold text-sm truncate">{user?.name || 'Chats'}</h1>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowGroup(true)}
                className="w-8 h-8 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center justify-center transition-colors"
                title="New Group"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </button>
              <button
                onClick={() => setShowCreate(true)}
                className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors"
                title="New Chat"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
              </button>
              <button
                onClick={logout}
                className="w-8 h-8 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors"
                title="Log out"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          </div>
          <ChatList
            chats={chats}
            selectedId={selectedChat?.id}
            currentUserId={user?.id || ''}
            onSelect={handleSelectChat}
            loading={chatsLoading}
            error={chatsError}
            unreadCount={unreadCount}
          />
        </aside>
        <section className={`${!showSidebar || selectedChat ? 'flex' : 'hidden'} md:flex flex-1 flex-col`}>
          {selectedChat ? (
            <>
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
                <button
                  onClick={handleBack}
                  className="md:hidden w-8 h-8 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center justify-center"
                  title="Back"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                  </svg>
                </button>
                <div className="relative shrink-0">
                  <Avatar name={otherUser?.name || selectedChat.participants[0]?.name || 'Chat'} size={36} />
                  <OnlineDot online={otherOnline} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {otherUser?.name || selectedChat.participants.map((p) => p.name).join(', ')}
                  </div>
                  <div className="text-xs text-gray-400">{otherOnline ? 'Online' : 'Offline'}</div>
                </div>

              </div>
              <ChatView
                messages={messages}
                currentUserId={user?.id || ''}
                chatId={selectedChat.id}
                loading={msgsLoading}
                error={msgsError}
              />
              <MessageInput onSend={sendMessage} onSendImage={sendImage} onTyping={handleTyping} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <p className="text-lg mb-1">Select a chat</p>
                <p className="text-sm">or create a new one</p>
              </div>
            </div>
          )}
        </section>
      </div>
      <CreateChatModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleChatCreated}
      />
      <CreateGroupModal
        open={showGroup}
        onClose={() => setShowGroup(false)}
        onCreated={handleChatCreated}
      />
    </AppLayout>
  );
}
