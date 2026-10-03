import React, { useState, useRef, useEffect, DragEvent, ClipboardEvent } from 'react';
import {
  Paperclip,
  ArrowUp,
  Image as ImageIcon,
  FileText,
  Film,
  Code,
  Music,
  X,
  Sparkles,
  Plus,
  Link as LinkIcon
} from 'lucide-react';

export interface AttachedFileItem {
  id: string;
  name: string;
  type: 'text' | 'code' | 'document' | 'image' | 'audio' | 'video' | 'link';
  sizeFormatted: string;
  content: string; // text, base64 data URL, or web link
  metadata?: any;
}

interface UniversalChatInputProps {
  onSendMessage: (message: string, attachments: AttachedFileItem[]) => void;
  isLoading: boolean;
  placeholder?: string;
}

export const UniversalChatInput: React.FC<UniversalChatInputProps> = ({
  onSendMessage,
  isLoading,
  placeholder = "Ask anything, or show me what you're working on..."
}) => {
  const [text, setText] = useState<string>('');
  const [attachments, setAttachments] = useState<AttachedFileItem[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [text]);

  const detectFileType = (file: File): AttachedFileItem['type'] => {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (file.type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext)) return 'image';
    if (file.type.startsWith('video/') || ['mp4', 'webm', 'mov'].includes(ext)) return 'video';
    if (file.type.startsWith('audio/') || ['mp3', 'wav', 'm4a'].includes(ext)) return 'audio';
    if (['pdf', 'docx', 'doc', 'pptx', 'txt'].includes(ext)) return 'document';
    if (['js', 'ts', 'jsx', 'tsx', 'py', 'sql', 'c', 'cpp', 'java', 'html', 'css'].includes(ext)) return 'code';
    return 'document';
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processFiles = (files: FileList | File[]) => {
    Array.from(files).forEach((file) => {
      const fileType = detectFileType(file);
      const reader = new FileReader();

      reader.onload = (e) => {
        const result = e.target?.result as string;
        const newAttachment: AttachedFileItem = {
          id: 'att_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
          name: file.name,
          type: fileType,
          sizeFormatted: formatFileSize(file.size),
          content: result,
          metadata: {
            sizeBytes: file.size,
            mimeType: file.type
          }
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };

      if (fileType === 'image' || fileType === 'video' || fileType === 'audio') {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  const handlePaste = (e: ClipboardEvent<HTMLTextAreaElement>) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      e.preventDefault();
      processFiles(e.clipboardData.files);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSend = () => {
    if ((!text.trim() && attachments.length === 0) || isLoading) return;
    onSendMessage(text, attachments);
    setText('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getChipIcon = (type: AttachedFileItem['type']) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5 text-violet-400" />;
      case 'video':
        return <Film className="w-3.5 h-3.5 text-pink-400" />;
      case 'audio':
        return <Music className="w-3.5 h-3.5 text-amber-400" />;
      case 'code':
        return <Code className="w-3.5 h-3.5 text-cyan-400" />;
      case 'link':
        return <LinkIcon className="w-3.5 h-3.5 text-blue-400" />;
      case 'document':
      default:
        return <FileText className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative rounded-2xl glass-panel border transition-all ${
        isDragging
          ? 'border-cyan-400 bg-cyan-950/20 shadow-glow-cyan'
          : 'border-slate-800/80 focus-within:border-cyan-500/60 focus-within:shadow-glow-cyan'
      }`}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) processFiles(e.target.files);
        }}
      />

      {/* Drag overlay notice */}
      {isDragging && (
        <div className="absolute inset-0 z-30 bg-[#090d16]/90 rounded-2xl border-2 border-dashed border-cyan-400 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs">
            <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
            <span>Drop ANY material: Code, PDF, Image, Video, Audio...</span>
          </div>
        </div>
      )}

      {/* Attachment Chips Preview Bar */}
      {attachments.length > 0 && (
        <div className="p-3 pb-0 flex flex-wrap gap-2">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs font-mono text-slate-200 shadow-sm"
            >
              {getChipIcon(att.type)}
              <span className="truncate max-w-[160px] font-medium">{att.name}</span>
              <span className="text-[10px] text-slate-400">({att.sizeFormatted})</span>
              <button
                type="button"
                onClick={() => handleRemoveAttachment(att.id)}
                className="text-slate-400 hover:text-rose-400 ml-1 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Composer Field */}
      <div className="flex items-end gap-2 p-3">
        {/* Universal Attach Button [+] */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-xl text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition-colors shrink-0"
          title="Attach PDF, Document, Code, Screenshot, Video, or Audio"
        >
          <Plus className="w-4 h-4" />
        </button>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          rows={1}
          className="flex-1 bg-transparent border-0 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-0 resize-none font-sans py-2 leading-relaxed"
        />

        {/* Send Button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={(!text.trim() && attachments.length === 0) || isLoading}
          className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-30 disabled:hover:bg-cyan-500 text-slate-950 font-bold transition-all shadow-glow-cyan shrink-0"
        >
          <ArrowUp className="w-4 h-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
