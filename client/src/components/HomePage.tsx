import { useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { useTheme } from '../contexts/ThemeContext';
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
import ImageViewer from './chat/ImageViewer';
import CreateChatModal from './chat/CreateChatModal';
import CreateGroupModal from './chat/CreateGroupModal';
import ProfileEditor from './profile/ProfileEditor';
import OnlineDot from './chat/OnlineDot';
import Avatar from './common/Avatar';
import { Chat } from '../types';

function HomePageInner() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showGroup, setShowGroup] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [avatarViewerUrl, setAvatarViewerUrl] = useState<string | null>(null);
  const createMenuRef = useRef<HTMLDivElement>(null);
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
    if (!showCreateMenu) return;
    const handler = (e: MouseEvent) => {
      if (createMenuRef.current && !createMenuRef.current.contains(e.target as Node)) {
        setShowCreateMenu(false);
      }
    };
    const escapeHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowCreateMenu(false);
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', escapeHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', escapeHandler);
    };
  }, [showCreateMenu]);

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
        <aside className={`${showSidebar ? 'flex' : 'hidden'} md:flex w-full md:w-80 flex-col bg-[#E8EFF7] dark:bg-gray-900 border-r border-[#C9D6E4] dark:border-gray-800`}>
          <div className="px-4 pt-3 pb-3">
            <button
              onClick={() => setShowProfile(true)}
              className="flex items-center gap-3 w-full text-left group"
            >
              <div className="relative shrink-0">
                <Avatar name={user?.name || 'User'} size={40} url={user?.avatarUrl} />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#E8EFF7] dark:border-gray-900 rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary transition-colors">
                  {user?.name || 'User'}
                </div>
                <div className="text-[11px] text-green-500 font-medium">Online</div>
              </div>
              <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-600 tracking-wider uppercase shrink-0">Zokul</span>
            </button>
          </div>
          <div className="mx-4 border-t border-[#C9D6E4] dark:border-gray-800" />
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
          <div className="border-t border-[#C9D6E4] dark:border-gray-800 px-4 pt-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] flex items-center justify-around gap-1">
            <div className="relative">
              <button
                onClick={() => setShowCreateMenu((v) => !v)}
                className={`w-11 h-11 flex items-center justify-center transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                  showCreateMenu
                    ? 'text-primary bg-[#D7E6F6] dark:bg-gray-800'
                    : 'text-gray-500 hover:text-primary dark:hover:text-primary hover:bg-[#D7E6F6] dark:hover:bg-gray-800'
                }`}
                title="New Chat"
                aria-label="New Chat"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                  <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
              </button>
              {showCreateMenu && (
                <div
                  ref={createMenuRef}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 bg-[#F8FAFD] dark:bg-gray-800 border border-[#D5DEE9] dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-20"
                  role="menu"
                >
                  <button
                    onClick={() => { setShowCreateMenu(false); setShowCreate(true); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#DFEAF5] dark:hover:bg-gray-700 transition-colors text-left"
                    role="menuitem"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5 text-gray-500 shrink-0">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Personal chat</span>
                  </button>
                  <div className="border-t border-[#D5DEE9] dark:border-gray-700/50" />
                  <button
                    onClick={() => { setShowCreateMenu(false); setShowGroup(true); }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#DFEAF5] dark:hover:bg-gray-700 transition-colors text-left"
                    role="menuitem"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5 text-gray-500 shrink-0">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Group chat</span>
                  </button>
                </div>
              )}
            </div>
            <button
              onClick={toggleTheme}
              className="w-11 h-11 flex items-center justify-center text-gray-500 hover:text-primary dark:hover:text-primary transition-colors rounded-lg hover:bg-[#D7E6F6] dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                  <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
            </button>
            <button
              onClick={logout}
              className="w-11 h-11 flex items-center justify-center text-gray-500 hover:text-red-500 transition-colors rounded-lg hover:bg-[#D7E6F6] dark:hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              title="Log out"
              aria-label="Log out"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-5 h-5">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </aside>
        <section className={`${!showSidebar || selectedChat ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-[#EAF1F8] dark:bg-gray-900`}>
          {selectedChat ? (
            <>
              <div className="px-4 py-3 border-b border-[#C9D6E4] dark:border-gray-700 flex items-center gap-3 bg-[#E6EEF7] dark:bg-gray-900">
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
                  {!isGroupChat && otherUser?.avatarUrl ? (
                    <button type="button" onClick={() => setAvatarViewerUrl(otherUser.avatarUrl!)} aria-label={`View ${otherUser.name} avatar`} className="block rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                      <Avatar name={displayChatName} size={36} url={otherUser.avatarUrl} />
                    </button>
                  ) : (
                    <Avatar name={displayChatName} size={36} url={!isGroupChat ? otherUser?.avatarUrl : undefined} />
                  )}
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
      {avatarViewerUrl && (
        <ImageViewer src={avatarViewerUrl} onClose={() => setAvatarViewerUrl(null)} />
      )}
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
