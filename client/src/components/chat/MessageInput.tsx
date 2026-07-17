import { useState, useRef, useEffect, FormEvent, useCallback } from 'react';
import api from '../../services/api';
import { useChatContext } from '../../contexts/ChatContext';
import ReplyQuote from './ReplyQuote';
import VoiceRecorder from './VoiceRecorder';
import { isTouchDevice, shouldCancelGesture, getSupportedMimeType, getExtension, MIN_DURATION_MS } from '../../utils/voice';

interface MessageInputProps {
  onSend: (text: string) => void;
  onEdit?: (messageId: string, text: string) => void;
  onSendImage?: (imageUrl: string) => void;
  onSendImages?: (imageUrls: string[]) => void;
  onSendVoice?: (voiceUrl: string, voiceDuration: number) => void;
  onTyping?: () => void;
  draft?: string;
  onDraftChange?: (text: string) => void;
}

const EMOJIS = ['😀','😁','😂','🤣','😊','😎','🥰','😍','🤩','😋','🤔','🙄','😴','🥳','😇','🙃','😤','😢','😭','🥺','🤗','😡','🤯','🫡','😏','🥴','🫠','😶','🫥','😬','🥸','🤨','😐','😑','😮‍💨','🤤','😪','😵','🤐','🥶','🥵','🤧','🤮','🥴','😈','👹','👺','💩','👻','☠️','👽','🤖','🎃','😺','💀','🔥','⭐','✨','🌟','💫','⚡','🌈','☀️','🌙','⭐','💥','🔥','❤️','💔','💖','💗','💙','💚','💛','💜','🖤','🤍','🤎','💝','💞','💓','❣️','💕','💌','💋','🫶','👀','👁️','👅','👄','🦷','👍','👎','👊','✊','🤛','🤜','🤚','👋','✋','🖐️','✌️','🤞','🫰','🤟','🤘','👌','🤌','🤏','🫵','🫱','🫲','🫳','🫴','👐','🤲','🙌','🙏','💪','🦾','🦶','👣','👂','🦻','👃','🧠','🫀','🫁','👁️‍🗨️','👤','👥','🗣️','👶','🧒','👦','👧','🧑','👱','👨','👩','🧔','👩‍🦰','👨‍🦰','👩‍🦱','👨‍🦱','👩‍🦳','👨‍🦳','👩‍🦲','👨‍🦲','👳','🧕','👮','🕵️','💂','👷','👸','🤴','👳‍♂️','👳‍♀️','🧑‍🎄','🎅','🤶','🦸','🦹','🧙','🧚','🧛','🧜','🧝','🧞','🧟','🧌','👯','🧑‍🤝‍🧑','👫','👬','👭','💑','👩‍❤️‍👨','👨‍❤️‍👨','👩‍❤️‍👩','💏','👩‍❤️‍💋‍👨','👨‍❤️‍💋‍👨','👩‍❤️‍💋‍👩','👪','👨‍👩‍👧','👨‍👩‍👧‍👦','👨‍👩‍👦‍👦','👨‍👩‍👧‍👧','👩‍👩‍👦','👩‍👩‍👧','👩‍👩‍👧‍👦','👩‍👩‍👦‍👦','👩‍👩‍👧‍👧','👨‍👨‍👦','👨‍👨‍👧','👨‍👨‍👧‍👦','👨‍👨‍👦‍👦','👨‍👨‍👧‍👧','👩‍👦','👩‍👧','👩‍👧‍👦','👩‍👦‍👦','👩‍👧‍👧','👨‍👦','👨‍👧','👨‍👧‍👦','👨‍👦‍👦','👨‍👧‍👧','🧑‍🧑‍🧒','🧑‍🧑‍🧒‍🧒','🧑‍🧒','🧑‍🧒‍🧒','👴','👵','🧓','🙇','💁','🙅','🙆','🙋','🙎','🙍','💇','💆','🧖','💅','🤳','💃','🕺','🕴️','👯‍♂️','👯‍♀️','🧑‍🦯','🧑‍🦼','🧑‍🦽','🦮','🐕‍🦺','🐕','🐩','🐈','🐈‍⬛','🐓','🦃','🦤','🦚','🦜','🦢','🦩','🕊️','🐇','🦝','🦊','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🪰','🪲','🪳','🪴','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧','🐘','🦛','🦏','🐪','🐫','🦒','🦘','🦙','🦥','🦨','🦡','🦦','🦔','🐁','🐀','🐹','🐿️','🦫','🦔','🦇','🐻','🐻‍❄️','🐨','🐼','🦣','🐲','🐉','🐦','🐧','🐤','🐣','🐥','🦆','🦅','🦉','🦇','🐸','🐊','🐍','🐢','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐚','🪸','🐌','🐛','🦋','🐜','🐝','🪲','🐞','🦗','🪳','🪰','🦟','🪱','🦂','🕷️','🕸️','☘️','🍀','🍁','🍂','🍃','🍄','🌰','🪵','🌲','🌳','🌴','🌵','🌾','🌿','☘️','🍀','🍁','🍂','🍃','🍇','🍈','🍉','🍊','🍋','🍌','🍍','🥭','🍎','🍏','🍐','🍑','🍒','🍓','🫐','🥝','🍅','🫒','🥥','🥑','🍆','🥔','🥕','🌽','🌶️','🫑','🥒','🥬','🥦','🧄','🧅','🍄','🥜','🌰','🍞','🥐','🥖','🥨','🧀','🥚','🍳','🧈','🥞','🧇','🥓','🥩','🍗','🍖','🦴','🌭','🍔','🍟','🍕','🫓','🥪','🥙','🧆','🌮','🌯','🫔','🥗','🥘','🫕','🥫','🍝','🍜','🍲','🍛','🍣','🍱','🥟','🦪','🍤','🍙','🍚','🍘','🍥','🥠','🥮','🍢','🍡','🍧','🍨','🍦','🥧','🧁','🍰','🎂','🍮','🍭','🍬','🍫','🍿','🍩','🍪','🌰','🥜','🍯','🥛','🍼','🫖','☕','🍵','🧃','🥤','🧋','🍶','🍺','🍻','🥂','🍷','🫗','🥃','🧊','🍸','🍹','🍾','🥄','🍴','🍽️','🔪','🫙','🏺','🌍','🌎','🌏','🗺️','🧭','🏔️','⛰️','🌋','🗻','🏕️','🏖️','🏜️','🏝️','🏞️','🏟️','🏛️','🏗️','🧱','🪨','🪵','🛖','🏘️','🏚️','🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏨','🏩','🏪','🏫','🏬','🏭','🏯','🏰','💒','🗼','🗽','⛪','🕌','🛕','🕍','⛩️','🕋','⛲','⛺','🌁','🌃','🏙️','🌄','🌅','🌆','🌇','🌉','🎠','🎡','🎢','💈','🎪','🎭','🖼️','🎨','🎬','🎤','🎧','🎼','🎹','🥁','🪘','🎷','🎺','🎸','🪕','🎻','🎲','♟️','🎯','🎳','🎮','🕹️','🎰','🚗','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜','🏍️','🛵','🛺','🚲','🛴','🛹','🛼','🚏','🛣️','🛤️','⛽','🛞','🚨','🚥','🚦','🛑','🚧','⚓','🛟','⛵','🛶','🚤','🛳️','⛴️','🛥️','🚢','✈️','🛩️','🛫','🛬','🪂','💺','🚁','🚟','🚠','🚡','🛰️','🚀','🛸','🏠','🏡','🏢','🏣','🏤','🏥','🏦','🏨','🏩','🏪','🏫','🏬','🏭','🏯','🏰','💒','🗼','🗽','⛪','🕌','🛕','🕍','⛩️','🕋','⛲','⛺','🌁','🌃','🏙️','🌄','🌅','🌆','🌇','🌉','🎠','🎡','🎢','💈','🎪','🎭','🖼️','🎨','🎬','🎤','🎧','🎼','🎹','🥁','🪘','🎷','🎺','🎸','🪕','🎻','🎲','♟️','🎯','🎳','🎮','🕹️','🎰','🚗','🚙','🚌','🚎','🏎️','🚓','🚑','🚒','🚐','🛻','🚚','🚛','🚜','🏍️','🛵','🛺','🚲','🛴','🛹','🛼','⌚','📱','📲','💻','⌨️','🖥️','🖨️','🖱️','🖲️','🕹️','🗜️','💽','💾','💿','📀','📼','📷','📸','📹','🎥','📽️','🎞️','📞','☎️','📟','📠','📺','📻','🎙️','🎚️','🎛️','🧭','⏱️','⏲️','🕰️','⌛','⏳','📡','🔋','🔌','💡','🔦','🕯️','🪔','🧯','🗑️','🛢️','💸','💵','💴','💶','💷','🪙','💰','💳','💎','⚖️','🪜','🧰','🪛','🔧','🔨','⚒️','🛠️','⛏️','🪚','🔩','⚙️','🪤','🧱','⛓️','🧲','🔫','💣','🧨','🪓','🔪','🗡️','⚔️','🛡️','🚬','⚰️','🪦','⚱️','🏺','🔮','📿','💈','⚗️','🔭','🔬','🕳️','🩻','🩼','🩺','💊','💉','🩸','🧬','🦠','🧫','🧪','🌡️','🧹','🪠','🧺','🧻','🚽','🚰','🚿','🛁','🛀','🧼','🪥','🪒','🧽','🪣','🧴','🛎️','🔑','🗝️','🚪','🪑','🛋️','🛏️','🛌','🧸','🪆','🖼️','🪞','🪟','🛍️','🛒','🎁','🎀','🎊','🎉','🎎','🏮','🎐','🧧','✉️','📩','📨','📧','💌','📥','📤','📦','🏷️','📪','📫','📬','📭','📮','📯','📜','📃','📄','📑','🧾','🏷️','💰','💴','💵','💶','💷','✂️','📌','📍','📎','🖇️','📏','📐','🧮','📊','📈','📉','🗒️','🗓️','📆','📅','🗑️','📇','🗃️','🗳️','🗄️','📋','📁','📂','🗂️','🗞️','📰','📓','📔','📒','📕','📗','📘','📙','📚','📖','🔖','🧷','🔗','📎','🖇️','📐','📏','🧮','📌','📍','✂️','🖊️','🖋️','✒️','🖌️','🖍️','📝','✏️','🔍','🔎','🔏','🔐','🔒','🔓','💯','🔢','🔣','🔤','🅰️','🆎','🅱️','🆑','🅾️','🆘','🛑','⛔','📛','🚫','❌','⭕','💢','♨️','🚷','🚯','🚳','🚱','🔞','📵','🚭','❗','❕','❓','❔','‼️','⁉️','🔅','🔆','〽️','⚠️','🚸','🔱','⚜️','🔰','♻️','✅','🈯','💹','❇️','✳️','❎','🌐','💠','Ⓜ️','🌀','💤','🚼','🈂️','🈁','🈶','🈚','🈸','🈺','🈷️','✴️','🆚','🉑','💮','🉐','㊗️','㊙️','🈴','🈵','🔯','🔴','🟠','🟡','🟢','🔵','🟣','🟤','⚫','⚪','🟥','🟧','🟨','🟩','🟦','🟪','🟫','⬛','⬜','◼️','◻️','◾','◽','▪️','▫️','🔶','🔷','🔸','🔹','🔺','🔻','💠','🔘','🔳','🔲','🏁','🚩','🎌','🏴','🏳️','🏳️‍🌈','🏳️‍⚧️','🏴‍☠️'];

export default function MessageInput({ onSend, onEdit, onSendImage, onSendImages, onSendVoice, onTyping, draft, onDraftChange }: MessageInputProps) {
  const [text, setText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showEmoji, setShowEmoji] = useState(false);
  const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
  const [pendingImages, setPendingImages] = useState<{ file: File; preview: string }[]>([]);
  const [touchRecorderActive, setTouchRecorderActive] = useState(false);
  const [touchDuration, setTouchDuration] = useState(0);
  const [touchCancelling, setTouchCancelling] = useState(false);
  const [touchUploading, setTouchUploading] = useState(false);
  const [touchError, setTouchError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const { replyTo, setReplyTo, editingMessage, setEditingMessage } = useChatContext();
  const touchMediaRef = useRef<MediaRecorder | null>(null);
  const touchChunksRef = useRef<Blob[]>([]);
  const touchStreamRef = useRef<MediaStream | null>(null);
  const touchTimerRef = useRef<ReturnType<typeof setInterval>>();
  const touchStartXRef = useRef(0);
  const touchStartTimeRef = useRef(0);
  const touchModeRef = useRef(isTouchDevice());
  const touchPointerDownRef = useRef(false);
  const touchStartingRef = useRef(false);
  const touchPendingFinishRef = useRef<boolean | null>(null);
  const touchPendingCancelRef = useRef(false);
  const touchRecorderActiveRef = useRef(false);
  const finishTouchRecordingRef = useRef<(discard: boolean) => void>();
  const cancelTouchRecordingRef = useRef<() => void>();

  const voiceSupported = typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof window.MediaRecorder !== 'undefined';

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

  const stopTouchTracks = useCallback(() => {
    if (touchStreamRef.current) {
      touchStreamRef.current.getTracks().forEach((t) => t.stop());
      touchStreamRef.current = null;
    }
  }, []);

  const startTouchRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      touchStreamRef.current = stream;
      const mimeType = getSupportedMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      touchMediaRef.current = recorder;
      touchChunksRef.current = [];
      setTouchDuration(0);
      setTouchCancelling(false);
      setTouchError('');
      touchStartTimeRef.current = Date.now();

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) touchChunksRef.current.push(e.data);
      };

      recorder.start();
      touchRecorderActiveRef.current = true;
      setTouchRecorderActive(true);
      touchStartingRef.current = false;

      const pending = touchPendingFinishRef.current;
      if (pending !== null) {
        touchPendingFinishRef.current = null;
        finishTouchRecordingRef.current?.(pending);
        return;
      }
      if (touchPendingCancelRef.current) {
        touchPendingCancelRef.current = false;
        cancelTouchRecordingRef.current?.();
        return;
      }

      touchTimerRef.current = setInterval(() => {
        setTouchDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      touchStartingRef.current = false;
      touchPendingFinishRef.current = null;
      touchPendingCancelRef.current = false;
      const domErr = err as { name?: string };
      if (domErr.name === 'NotAllowedError' || domErr.name === 'PermissionDeniedError') {
        setTouchError('Microphone access denied');
      } else {
        setTouchError('Failed to start recording');
      }
    }
  }, []);

  const finishTouchRecording = useCallback((discard: boolean) => {
    const recorder = touchMediaRef.current;
    if (!recorder || recorder.state === 'inactive') {
      stopTouchTracks();
      clearInterval(touchTimerRef.current);
      touchRecorderActiveRef.current = false;
      setTouchRecorderActive(false);
      return;
    }
    recorder.onstop = () => {
      clearInterval(touchTimerRef.current);
      stopTouchTracks();
      touchRecorderActiveRef.current = false;
      setTouchRecorderActive(false);
      if (discard) return;
      if (touchChunksRef.current.length === 0) return;
      const elapsed = Date.now() - touchStartTimeRef.current;
      if (elapsed < MIN_DURATION_MS) return;
      const actualMimeType = recorder.mimeType || getSupportedMimeType() || 'audio/webm';
      const blob = new Blob(touchChunksRef.current, { type: actualMimeType });
      setTouchUploading(true);
      const ext = getExtension(actualMimeType);
      const finalDuration = Math.max(1, Math.round(elapsed / 1000));
      const formData = new FormData();
      formData.append('file', blob, `voice${ext}`);
      api.post<{ url: string }>('/upload', formData)
        .then((res) => {
          onSendVoice?.(res.data.url, finalDuration);
        })
        .catch(() => {
          setTouchError('Upload failed');
        })
        .finally(() => {
          setTouchUploading(false);
        });
    };
    recorder.stop();
  }, [stopTouchTracks, onSendVoice]);

  const cancelTouchRecording = useCallback(() => {
    clearInterval(touchTimerRef.current);
    stopTouchTracks();
    if (touchMediaRef.current && touchMediaRef.current.state !== 'inactive') {
      touchMediaRef.current.stream.getTracks().forEach((t) => t.stop());
      touchMediaRef.current.stop();
    }
    touchRecorderActiveRef.current = false;
    setTouchRecorderActive(false);
    setTouchDuration(0);
  }, [stopTouchTracks]);

  finishTouchRecordingRef.current = finishTouchRecording;
  cancelTouchRecordingRef.current = cancelTouchRecording;

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    touchPointerDownRef.current = true;
    touchStartingRef.current = true;
    touchStartXRef.current = e.clientX;
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
    startTouchRecording();
  }, [startTouchRecording]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!touchRecorderActiveRef.current) return;
    setTouchCancelling(shouldCancelGesture(touchStartXRef.current, e.clientX));
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    touchPointerDownRef.current = false;
    if (touchStartingRef.current) {
      touchPendingFinishRef.current = shouldCancelGesture(touchStartXRef.current, e.clientX);
      touchStartingRef.current = false;
      try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
      return;
    }
    if (!touchRecorderActiveRef.current) return;
    e.preventDefault();
    const discard = shouldCancelGesture(touchStartXRef.current, e.clientX);
    finishTouchRecording(discard);
  }, [finishTouchRecording]);

  const handlePointerCancel = useCallback((e: React.PointerEvent) => {
    touchPointerDownRef.current = false;
    if (touchStartingRef.current) {
      touchPendingCancelRef.current = true;
      touchStartingRef.current = false;
      try { e.currentTarget.releasePointerCapture(e.pointerId); } catch {}
      return;
    }
    if (!touchRecorderActiveRef.current) return;
    cancelTouchRecording();
  }, [cancelTouchRecording]);

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

  const hasContent = text.trim().length > 0 || replyTo || editingMessage || pendingImages.length > 0;
  const showVoiceButton = voiceSupported && !editingMessage && pendingImages.length === 0;
  const showTouchRecorderBar = touchRecorderActive || touchUploading || !!touchError;

  return (
    <form onSubmit={handleSubmit} className="relative flex flex-col border-t border-[#C9D6E4] dark:border-gray-700 pb-2">
      {replyTo && !editingMessage && (
        <div className="absolute bottom-full left-0 right-0 z-10 px-3">
          <ReplyQuote reply={replyTo} onCancel={() => setReplyTo(null)} />
        </div>
      )}
      {pendingImages.length > 0 && (
        <div className="flex gap-1.5 px-3 pt-2 pb-1 overflow-x-auto">
          {pendingImages.map((img, idx) => (
            <div key={img.file.name + img.file.size} className="relative shrink-0">
              <img src={img.preview} alt="" className="w-16 h-16 rounded-lg object-cover" />
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
      <div className="flex items-end gap-2 px-3 py-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-9 h-9 self-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center justify-center shrink-0"
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
        {showVoiceButton && touchModeRef.current && !showVoiceRecorder && (
          <div style={{ touchAction: 'none' }}>
            <button
              type="button"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
              className="w-9 h-9 self-center text-gray-400 hover:text-primary dark:hover:text-primary transition-colors flex items-center justify-center shrink-0"
              aria-label="Hold to record voice message"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth={2}>
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>
          </div>
        )}
        {showVoiceButton && !touchModeRef.current && (
          <button
            type="button"
            onClick={() => setShowVoiceRecorder(true)}
            className="w-9 h-9 self-center text-gray-400 hover:text-primary dark:hover:text-primary transition-colors flex items-center justify-center shrink-0"
            aria-label="Record voice message"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth={2}>
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
        <div ref={emojiRef} className="relative flex-1">
          {showEmoji && !showVoiceRecorder && !showTouchRecorderBar && (
            <div className="absolute bottom-full left-0 mb-2 p-2 bg-[#F8FAFD] dark:bg-gray-800 rounded-xl shadow-lg border border-[#D5DEE9] dark:border-gray-700 grid grid-cols-10 gap-1 max-h-72 overflow-y-auto z-10">
              {EMOJIS.map((e) => (
                <button key={e} type="button" onClick={() => pickEmoji(e)} className="w-8 h-8 hover:bg-[#DFEAF5] dark:hover:bg-gray-700 rounded-lg text-lg flex items-center justify-center">
                  {e}
                </button>
              ))}
            </div>
          )}
          {showTouchRecorderBar ? (
            touchError ? (
              <div className="flex items-center gap-2 bg-[#E1EAF4] dark:bg-gray-800 rounded-2xl px-4 py-2">
                <span className="text-xs text-red-500 flex-1">{touchError}</span>
                <button type="button" onClick={() => { setTouchError(''); setTouchRecorderActive(false); }} className="text-gray-400 hover:text-gray-600 shrink-0">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            ) : touchUploading ? (
              <div className="flex items-center gap-2 bg-[#E1EAF4] dark:bg-gray-800 rounded-2xl px-4 py-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-gray-500">Uploading...</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-[#E1EAF4] dark:bg-gray-800 rounded-2xl px-4 py-2 select-none" style={{ touchAction: 'none' }}>
                <button type="button" onClick={cancelTouchRecording} className="text-gray-400 hover:text-gray-600 shrink-0" aria-label="Cancel recording">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                <span className="text-sm font-medium tabular-nums">
                  {Math.floor(touchDuration / 60)}:{(touchDuration % 60).toString().padStart(2, '0')}
                </span>
                <div className="flex-1 h-1 bg-[#C9D6E4] dark:bg-gray-600 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${touchCancelling ? 'bg-red-500 w-full' : 'bg-primary w-1/2 animate-pulse'}`} />
                </div>
                <span className={`text-[10px] whitespace-nowrap transition-colors ${touchCancelling ? 'text-red-500' : 'text-gray-400'}`}>
                  {touchCancelling ? 'Release to cancel' : 'Slide to cancel'}
                </span>
              </div>
            )
          ) : showVoiceRecorder ? (
            <VoiceRecorder
              onSend={(url, dur) => {
                onSendVoice?.(url, dur);
                setShowVoiceRecorder(false);
              }}
              onCancel={() => setShowVoiceRecorder(false)}
            />
          ) : (
            <div className="flex items-center gap-2 bg-[#E1EAF4] dark:bg-gray-800 rounded-3xl px-4 py-1" onClick={() => inputRef.current?.focus()}>
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={handleChange}
                placeholder={editingMessage ? 'Edit message...' : replyTo ? 'Reply...' : pendingImages.length > 0 ? 'Add a caption...' : 'Message...'}
                className="flex-1 bg-transparent focus:outline-none text-base leading-5 py-0.5"
                autoFocus={!!editingMessage}
              />
              <button
                type="button"
                onClick={() => setShowEmoji((v) => !v)}
                className="w-8 h-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center justify-center shrink-0"
                aria-label="Toggle emoji picker"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 14s1.5 2 4 2 4-2 4-2" />
                  <line x1="9" y1="9" x2="9.01" y2="9" />
                  <line x1="15" y1="9" x2="15.01" y2="9" />
                </svg>
              </button>
              <button
                type="submit"
                disabled={!hasContent && !text.trim()}
                className="w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center disabled:opacity-40 transition-opacity shrink-0"
                aria-label="Send message"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </div>
          )}
        </div>
        {uploadError && <span className="text-xs text-red-500 absolute -bottom-1 left-3">{uploadError}</span>}
      </div>
    </form>
  );
}
