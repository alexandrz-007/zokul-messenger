import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { Message } from '../types';
import { useChats, useUnread, useMessages } from '../hooks/useChat';
import { usePagination } from '../hooks/usePagination';
import { useTyping } from '../hooks/useTyping';
import { usePresence } from '../hooks/usePresence';
import { usePushSubscription } from '../hooks/usePushSubscription';
import { useDraft } from '../hooks/useDraft';
import { ChatProvider } from '../contexts/ChatContext';
import { playNotificationSound } from '../utils/audio';
import AppLayout from './layout/AppLayout';
import ChatList from './chat/ChatList';
import ChatView from './chat/ChatView';
import MessageInput from './chat/MessageInput';
import CreateChatModal from './chat/CreateChatModal';
import CreateGroupModal from './chat/CreateGroupModal';
import ProfileEditor from './profile/ProfileEditor';
import OnlineDot from './chat/OnlineDot';
import Avatar from './common/Avatar';
import { Chat } from '../types';

function HomePageInner() {
  const { user, logout } = useAuth();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showGroup, setShowGroup] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const { chats, loading: chatsLoading, error: chatsError, reload: reloadChats } = useChats();
  const { messages, loading: msgsLoading, error: msgsError, sendMessage, sendImage, sendImages, sendVoice, editMessage, deleteMessage, prependMessages } = useMessages(selectedChat?.id || null);
  const { loadMore, loadingMore, hasMore, reset: resetPagination } = usePagination(selectedChat?.id || null);
  const { handleTyping } = useTyping(selectedChat?.id || null);
  const { isOnline } = usePresence(user?.id);
  const { count: unreadCount, markRead } = useUnread(selectedChat?.id || null);
  const { socket } = useSocket();
  usePushSubscription();
  const { draft, saveDraft, clearDraft } = useDraft(selectedChat?.id || null);
  const prevChatRef = useRef(selectedChat?.id);

  const handleLoadMore = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    const older = await loadMore();
    if (older.length > 0) prependMessages(older);
  }, [hasMore, loadingMore, loadMore, prependMessages]);

  const prevChatRefForSocket = useRef<string | null>(null);

  const handleSelectChat = useCallback((chat: Chat) => {
    if (prevChatRefForSocket.current && prevChatRefForSocket.current !== chat.id) {
      socket?.emit('chat:leave', { chatId: prevChatRefForSocket.current });
    }
    prevChatRefForSocket.current = chat.id;
    setSelectedChat(chat);
    setShowSidebar(false);
    markRead(chat.id);
    resetPagination();
  }, [markRead, resetPagination, socket]);

  const handleChatCreated = useCallback((chat: Chat) => {
    setSelectedChat(chat);
    setShowSidebar(false);
    reloadChats();
    resetPagination();
    socket?.emit('chat:join', chat.id);
  }, [reloadChats, resetPagination, socket]);

  const handleBack = useCallback(() => {
    setShowSidebar(true);
    setSelectedChat(null);
  }, []);

  const handleMessageEdit = useCallback((messageId: string, text: string, chatId: string) => {
    editMessage(messageId, text, chatId);
  }, [editMessage]);

  const handleMessageDelete = useCallback((messageId: string, chatId: string) => {
    deleteMessage(messageId, chatId);
  }, [deleteMessage]);

  const handleDeleteChat = useCallback((chatId: string) => {
    socket?.emit('chat:delete', { chatId });
  }, [socket]);

  const handleEditSubmit = useCallback((messageId: string, text: string) => {
    editMessage(messageId, text, selectedChat?.id || '');
  }, [editMessage, selectedChat?.id]);

  useEffect(() => {
    if (prevChatRef.current !== selectedChat?.id) {
      clearDraft();
      prevChatRef.current = selectedChat?.id;
    }
  }, [selectedChat?.id, clearDraft]);

  useEffect(() => {
    if (!socket) return;
    const handler = (msg: Message) => {
      if (msg.chatId !== selectedChat?.id && msg.senderId !== user?.id && document.hidden) {
        playNotificationSound();
      }
    };
    socket.on('message:new', handler);
    return () => { socket.off('message:new', handler); };
  }, [socket, selectedChat?.id, user?.id]);

  useEffect(() => {
    if (!socket) return;
    const handler = (data: { chatId: string }) => {
      if (selectedChat?.id === data.chatId) {
        setSelectedChat(null);
        setShowSidebar(true);
      }
      reloadChats();
    };
    socket.on('chat:deleted', handler);
    return () => { socket.off('chat:deleted', handler); };
  }, [socket, selectedChat?.id, reloadChats]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const chatId = params.get('chat');
    if (chatId && chats.length > 0) {
      const chat = chats.find((c) => c.id === chatId);
      if (chat) {
        handleSelectChat(chat);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, [chats, handleSelectChat]);

  const otherUser = selectedChat?.participants.find((p) => p.id !== user?.id);
  const isGroupChat = selectedChat?.isGroup === true;
  const displayChatName = isGroupChat ? (selectedChat?.name || 'Group') : (otherUser?.name || 'Unknown');
  const otherOnline = isOnline(otherUser?.id || '');

  return (
    <AppLayout>
      <div className="flex h-full">
        <aside className={`${showSidebar ? 'flex' : 'hidden'} md:flex w-full md:w-80 border-r border-gray-200 dark:border-gray-700 flex-col`}>
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <button onClick={() => setShowProfile(true)} className="font-semibold text-sm truncate hover:text-primary transition-colors">
              {user?.name || 'Chats'}
            </button>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowGroup(true)}
                className="w-8 h-8 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex items-center justify-center transition-colors"
                title="New Group"
                aria-label="New Group"
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
                aria-label="New Chat"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
              </button>
              <button
                onClick={logout}
                className="w-8 h-8 text-gray-400 hover:text-red-500 flex items-center justify-center transition-colors"
                title="Log out"
                aria-label="Log out"
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
            onDelete={handleDeleteChat}
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
                  <Avatar name={displayChatName} size={36} url={selectedChat && !selectedChat.isGroup ? selectedChat.participants.find((p) => p.id !== user?.id)?.avatarUrl : undefined} />
                  {!isGroupChat && <OnlineDot online={otherOnline} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">
                    {displayChatName}
                  </div>
                  <div className="text-xs text-gray-400">
                    {isGroupChat ? `${selectedChat.participants.length} members` : (otherOnline ? 'Online' : 'Offline')}
                  </div>
                </div>
              </div>
              <ChatView
                messages={messages}
                currentUserId={user?.id || ''}
                currentUserName={user?.name || ''}
                participants={selectedChat.participants}
                chatId={selectedChat.id}
                loading={msgsLoading}
                error={msgsError}
                hasMore={hasMore}
                loadingMore={loadingMore}
                onLoadMore={handleLoadMore}
                onMessageEdit={handleMessageEdit}
                onMessageDelete={handleMessageDelete}
              />
              <MessageInput
                onSend={sendMessage}
                onEdit={handleEditSubmit}
                onSendImage={sendImage}
                onSendImages={sendImages}
                onSendVoice={sendVoice}
                onTyping={handleTyping}
                draft={draft}
                onDraftChange={saveDraft}
              />
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
        socket={socket}
      />
      <ProfileEditor
        open={showProfile}
        onClose={() => setShowProfile(false)}
      />
    </AppLayout>
  );
}

export default function HomePage() {
  return (
    <ChatProvider>
      <HomePageInner />
    </ChatProvider>
  );
}
