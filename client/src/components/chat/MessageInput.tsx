import { useState, useRef, useEffect, FormEvent } from 'react';
import api from '../../services/api';
import { useChatContext } from '../../contexts/ChatContext';
import ReplyQuote from './ReplyQuote';

interface MessageInputProps {
  onSend: (text: string) => void;
  onEdit?: (messageId: string, text: string) => void;
  onSendImage?: (imageUrl: string) => void;
  onSendImages?: (imageUrls: string[]) => void;
  onTyping?: () => void;
  draft?: string;
  onDraftChange?: (text: string) => void;
}

const EMOJIS = ['😀','😁','😂','🤣','😊','😎','🥰','😍','🤩','😋','🤔','🙄','😴','🥳','😇','🙃','😤','😢','😭','🥺','🤗','😡','🤯','🫡','😏','🥴','🫠','😶','🫥','😬','🥸','🤨','😐','😑','😮‍💨','🤤','😪','😵','🤐','🥶','🥵','🤧','🤮','🥴','😈','👹','👺','💩','👻','☠️','👽','🤖','🎃','😺','💀','🔥','⭐','✨','🌟','💫','⚡','🌈','☀️','🌙','⭐','💥','🔥','❤️','💔','💖','💗','💙','💚','💛','💜','🖤','🤍','🤎','💝','💞','💓','❣️','💕','💌','💋','🫶','👀','👁️','👅','👄','🦷','👍','👎','👊','✊','🤛','🤜','🤚','👋','✋','🖐️','✌️','🤞','🫰','🤟','🤘','👌','🤌','🤏','🫵','🫱','🫲','🫳','🫴','👐','🤲','🙌','🙏','💪','🦾','🦶','👣','👂','🦻','👃','🧠','🫀','🫁','👁️‍🗨️','👤','👥','🗣️','👶','🧒','👦','👧','🧑','👱','👨','👩','🧔','👩‍🦰','👨‍🦰','👩‍🦱','👨‍🦱','👩‍🦳','👨‍🦳','👩‍🦲','👨‍🦲','👳','🧕','👮','🕵️','💂','👷','👸','🤴','👳‍♂️','👳‍♀️','🧑‍🎄','🎅','🤶','🦸','🦹','🧙','🧚','🧛','🧜','🧝','🧞','🧟','🧌','👯','🧑‍🤝‍🧑','👫','👬','👭','💑','👩‍❤️‍👨','👨‍❤️‍👨','👩‍❤️‍👩','💏','👩‍❤️‍💋‍👨','👨‍❤️‍💋‍👨','👩‍❤️‍💋‍👩','👪','👨‍👩‍👧','👨‍👩‍👧‍👦','👨‍👩‍👦‍👦','👨‍👩‍👧‍👧','👩‍👩‍👦','👩‍👩‍👧','👩‍👩‍👧‍👦','👩‍👩‍👦‍👦','👩‍👩‍👧‍👧','👨‍👨‍👦','👨‍👨‍👧','👨‍👨‍👧‍👦','👨‍👨‍👦‍👦','👨‍👨‍👧‍👧','👩‍👦','👩‍👧','👩‍👧‍👦','👩‍👦‍👦','👩‍👧‍👧','👨‍👦','👨‍👧','👨‍👧‍👦','👨‍👦‍👦','👨‍👧‍👧','🧑‍🧑‍🧒','🧑‍🧑‍🧒‍🧒','🧑‍🧒','🧑‍🧒‍🧒','👴','👵','🧓','🙇','💁','🙅','🙆','🙋','🙎','🙍','💇','💆','🧖','💅','🤳','💃','🕺','🕴️','👯‍♂️','👯‍♀️','🧑‍🦯','🧑‍🦼','🧑‍🦽','🦮','🐕‍🦺','🐕','🐩','🐈','🐈‍⬛','🐓','🦃','🦤','🦚','🦜','🦢','🦩','🕊️','🐇','🦝','🦊','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🪰','🪲','🪳','🪴','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🦙','🦥','🦨','🦡','🦦','🦔','🐁','🐀','🐹','🐿️','🦫','🦔','🦇','🐻','🐻‍❄️','🐨','🐼','🦣','🐲','🐉','🐦','🐧','🐤','🐣','🐥','🦆','🦅','🦉','🦇','🐸','🐊','🐍','🐢','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐚','🪸','🐌','🐛','🦋','🐜','🐝','🪲','🐞','🦗','🪳','🪰','🦟','🪱','🦂','🕷️','🕸️','☘️','🍀','🍁','🍂','🍃','🍄','🌰','🪵','🌲','🌳','🌴','🌵','🌾','🌿','☘️','🍀','🍁','🍂','🍃','🍇','🍈','🍉','🍊','🍋','🍌','🍍','🥭','🍎','🍏','🍐','🍑','🍒','🍓','🫐','🥝','🍅','🫒','🥥','🥑','🍆','🥔','🥕','🌽','🌶️','🫑','🥒','🥬','🥦','🧄','🧅','🍄','🥜','🌰','🍞','🥐','🥖','🥨','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🦴','🌭','🍔','🍟','🍕','🫓','🥪','🥙','🧆','🌮','🌯','🫔','🥗','🥘','🫕','🥫','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥠','🥮','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','🥛','🍼','🫖','☕','🍵','🧃','🥤','🧋','🍶','🍺','🍻','🥂','🍷','🫗','🥃','🧊','🍸','🍹','🍾','🥄','🍴','🍽️','🔪','🫙','🏺','🌍','🌎','🌏','🗺️','🧭','🏔️','⛰️','🌋','🗻','🏕️','🏖️','🏜️','🏝️','🏞️','🏟️','🏛️','🏗️','🧱','🪨','🪵','🛖','🏘️','🏚️','🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏨','🏩','🏪','🏫','🏬','🏭','🏯','🏰','💒','🗼','🗽','⛪','🕌','🛕','🕍','⛩️','🕋','⛲','⛺','🌁','🌃','🏙️','🌄','🌅','🌆','🌇','🌉','🎠','🎡','🎢','💈','🎪','🎭','🖼️','🎨','🎬','🎤','🎧','🎼','🎹','🥁','🪘','🎷','🎺','🎸','🪕','🎻','🎲','♟️','🎯','🎳','🎮','🕹️','🎰','🚗','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜','🏍️','🛵','🛺','🚲','🛴','🛹','🛼','🚏','🛣️','🛤️','⛽','🛞','🚨','🚥','🚦','🛑','🚧','⚓','🛟','⛵','🛶','🚤','🛳️','⛴️','🛥️','🚢','✈️','🛩️','🛫','🛬','🪂','💺','🚁','🚟','🚠','🚡','🛰️','🚀','🛸','🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏨','🏩','🏪','🏫','🏬','🏭','🏯','🏰','💒','🗼','🗽','⛪','🕌','🛕','🕍','⛩️','🕋','⛲','⛺','🌁','🌃','🏙️','🌄','🌅','🌆','🌇','🌉','🎠','🎡','🎢','💈','🎪','🎭','🖼️','🎨','🎬','🎤','🎧','🎼','🎹','🥁','🪘','🎷','🎺','🎸','🪕','🎻','🎲','♟️','🎯','🎳','🎮','🕹️','🎰','🚗','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜','🏍️','🛵','🛺','🚲','🛴','🛹','🛼','⌚','📱','📲','💻','⌨️','🖥️','🖨️','🖱️','🖲️','🕹️','🗜️','💽','💾','💿','📀','📼','📷','📸','📹','🎥','📽️','🎞️','📞','☎️','📟','📠','📺','📻','🎙️','🎚️','🎛️','🧭','⏱️','⏲️','🕰️','⌛','⏳','📡','🔋','🔌','💡','🔦','🕯️','🪔','🧯','🗑️','🛢️','💸','💵','💴','💶','💷','🪙','💰','💳','💎','⚖️','🪜','🧰','🪛','🔧','🔨','⚒️','🛠️','⛏️','🪚','🔩','⚙️','🪤','🧱','⛓️','🧲','🔫','💣','🧨','🪓','🔪','🗡️','⚔️','🛡️','🚬','⚰️','🪦','⚱️','🏺','🔮','📿','💈','⚗️','🔭','🔬','🕳️','🩻','🩼','🩺','💊','💉','🩸','🧬','🦠','🧫','🧪','🌡️','🧹','🪠','🧺','🧻','🚽','🚰','🚿','🛁','🛀','🧼','🪥','🪒','🧽','🪣','🧴','🛎️','🔑','🗝️','🚪','🪑','🛋️','🛏️','🛌','🧸','🪆','🖼️','🪞','🪟','🛍️','🛒','🎁','🎀','🎊','🎉','🎎','🏮','🎐','🧧','✉️','📩','📨','📧','💌','📥','📤','📦','🏷️','📪','📫','📬','📭','📮','📯','📜','📃','📄','📑','🧾','🏷️','💰','💴','💵','💶','💷','✂️','📌','📍','📎','🖇️','📏','📐','🧮','📊','📈','📉','🗒️','🗓️','📆','📅','🗑️','📇','🗃️','🗳️','🗄️','📋','📁','📂','🗂️','🗞️','📰','📓','📔','📒','📕','📗','📘','📙','📚','📖','🔖','🧷','🔗','📎','🖇️','📐','📏','🧮','📌','📍','✂️','🖊️','🖋️','✒️','🖌️','🖍️','📝','✏️','🔍','🔎','🔏','🔐','🔒','🔓','💯','🔢','🔣','🔤','🅰️','🆎','🅱️','🆑','🅾️','🆘','🛑','⛔','📛','🚫','❌','⭕','💢','♨️','🚷','🚯','🚳','🚱','🔞','📵','🚭','❗','❕','❓','❔','‼️','⁉️','🔅','🔆','〽️','⚠️','🚸','🔱','⚜️','🔰','♻️','✅','🈯','💹','❇️','✳️','❎','🌐','💠','Ⓜ️','🌀','💤','🚼','🈂️','🈁','🈶','🈚','🈸','🈺','🈷️','✴️','🆚','🉑','💮','🉐','㊗️','㊙️','🈴','🈵','🔯','🔴','🟠','🟡','🟢','🔵','🟣','🟤','⚫','⚪','🟥','🟧','🟨','🟩','🟦','🟪','🟫','⬛','⬜','◼️','◻️','◾','◽','▪️','▫️','🔶','🔷','🔸','🔹','🔺','🔻','💠','🔘','🔳','🔲','🏁','🚩','🎌','🏴','🏳️','🏳️‍🌈','🏳️‍⚧️','🏴‍☠️'];

export default function MessageInput({ onSend, onEdit, onSendImage, onSendImages, onTyping, draft, onDraftChange }: MessageInputProps) {
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [pendingImages, setPendingImages] = useState<{ file: File; preview: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const { replyTo, setReplyTo, editingMessage, setEditingMessage } = useChatContext();

  useEffect(() => {
    if (editingMessage) {
      setText(editingMessage.text || '');
      inputRef.current?.focus();
    }
  }, [editingMessage]);

  useEffect(() => {
    if (draft !== undefined && !editingMessage) {
      setText(draft);
    }
  }, [draft]);

  useEffect(() => {
    return () => {
      pendingImages.forEach((img) => URL.revokeObjectURL(img.preview));
    };
  }, [pendingImages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();

    if (editingMessage) {
      if (!trimmed) return;
      onEdit?.(editingMessage.id, trimmed);
      setText('');
      setEditingMessage(null);
      setReplyTo(null);
      onDraftChange?.('');
      inputRef.current?.focus();
      return;
    }

    if (pendingImages.length > 0) {
      setUploading(true);
      setUploadError('');
      try {
        const uploads = pendingImages.map((img) => {
          const formData = new FormData();
          formData.append('file', img.file);
          return api.post<{ url: string }>('/upload', formData).then((res) => res.data.url);
        });
        const urls = await Promise.all(uploads);
        pendingImages.forEach((img) => URL.revokeObjectURL(img.preview));
        setPendingImages([]);
        if (urls.length === 1) {
          onSendImage?.(urls[0]);
        } else {
          onSendImages?.(urls);
        }
        setText('');
        setReplyTo(null);
        onDraftChange?.('');
        inputRef.current?.focus();
        setUploading(false);
        return;
      } catch {
        setUploadError('Failed to upload images');
        setUploading(false);
        return;
      }
    }

    if (!trimmed) return;
    onSend(trimmed);
    setText('');
    setReplyTo(null);
    setEditingMessage(null);
    onDraftChange?.('');
    inputRef.current?.focus();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    onTyping?.();
    onDraftChange?.(e.target.value);
  };

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const total = pendingImages.length + files.length;
    if (total > 4) {
      setUploadError('Maximum 4 images');
      if (fileRef.current) fileRef.current.value = '';
      return;
    }
    const newImages = Array.from(files).map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setPendingImages((prev) => [...prev, ...newImages]);
    setUploadError('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const removeImage = (idx: number) => {
    setPendingImages((prev) => {
      const img = prev[idx];
      if (img) URL.revokeObjectURL(img.preview);
      return prev.filter((_, i) => i !== idx);
    });
  };

  const pickEmoji = (emoji: string) => {
    setText((prev) => prev + emoji);
    inputRef.current?.focus();
    setShowEmoji(false);
  };

  const hasContent = text.trim().length > 0 || pendingImages.length > 0;

  return (
    <form onSubmit={handleSubmit} className="relative flex flex-col border-t border-gray-200/80 dark:border-white/5 bg-white dark:bg-surface-header safe-area-bottom">
      {replyTo && !editingMessage && (
        <div className="absolute bottom-full left-0 right-0 z-10 px-3 pb-1">
          <ReplyQuote reply={replyTo} onCancel={() => setReplyTo(null)} />
        </div>
      )}
      {pendingImages.length > 0 && (
        <div className="flex gap-1.5 px-3 pt-2 pb-1 overflow-x-auto">
          {pendingImages.map((img, idx) => (
            <div key={img.file.name + img.file.size} className="relative shrink-0">
              <img src={img.preview} alt="" className="w-14 h-14 rounded-lg object-cover" />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-gray-800/70 text-white rounded-full flex items-center justify-center"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3 h-3">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-end gap-1.5 px-2 py-2">
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors shrink-0"
          aria-label="Attach file"
        >
          {uploading ? (
            <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth={2}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          )}
        </button>
        <div ref={emojiRef} className="relative flex-1 min-w-0">
          {showEmoji && (
            <div className="absolute bottom-full left-0 mb-2 p-2 bg-white dark:bg-surface-elevated rounded-xl shadow-2xl border border-gray-200/80 dark:border-white/10 grid grid-cols-8 sm:grid-cols-10 gap-1 max-h-60 overflow-y-auto z-10">
              {EMOJIS.map((e) => (
                <button key={e} type="button" onClick={() => pickEmoji(e)} className="w-8 h-8 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-lg flex items-center justify-center">
                  {e}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-white/5 rounded-2xl px-3 py-1.5 border border-gray-200/80 dark:border-white/10 focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition-all">
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={handleChange}
              placeholder={editingMessage ? 'Edit message...' : replyTo ? 'Reply...' : pendingImages.length > 0 ? 'Add a caption...' : 'Message...'}
              className="flex-1 bg-transparent focus:outline-none text-sm leading-5 py-1 min-h-[36px] placeholder:text-gray-400 dark:placeholder:text-gray-600"
              autoFocus={!!editingMessage}
            />
            <button
              type="button"
              onClick={() => setShowEmoji((v) => !v)}
              className="w-9 h-9 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors shrink-0"
              aria-label="Toggle emoji picker"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                <line x1="9" y1="9" x2="9.01" y2="9" />
                <line x1="15" y1="9" x2="15.01" y2="9" />
              </svg>
            </button>
          </div>
        </div>
        <button
          type="submit"
          disabled={!hasContent && !text.trim()}
          className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center disabled:opacity-30 hover:bg-primary-dark transition-all active:scale-[0.95] shrink-0"
          aria-label="Send message"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
        {uploadError && <span className="text-xs text-red-500 absolute -bottom-5 left-3">{uploadError}</span>}
      </div>
    </form>
  );
}
