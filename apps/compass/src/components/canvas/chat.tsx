"use client";

import type React from "react";

import { useChat } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Plus, ImageIcon, Loader2, X } from "lucide-react";
import Image from "next/image";
import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { FileUIPart, TextStreamChatTransport } from "ai";

export interface ChatFormRef {
  addImage: (imageDataUrl: string) => void;
  focusInput: () => void;
}

export const ChatForm = forwardRef<ChatFormRef>((props, ref) => {
  const [input, setInput] = useState("");
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    addImage: (imageDataUrl: string) => {
      setSelectedImages((prev) => [...prev, imageDataUrl]);
    },
    focusInput: () => {
      inputRef.current?.focus();
    },
  }));

  const { messages, status, sendMessage, setMessages } = useChat({
    transport: new TextStreamChatTransport({
      api: `${process.env.NEXT_PUBLIC_SERVER_URL}/api/ai/chat`,
    }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setSelectedImages((prev) => [
              ...prev,
              event?.target?.result as string,
            ]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() && selectedImages.length === 0) return;

    const messageContent = input.trim();

    const files: FileUIPart[] = selectedImages.map((img, idx) => ({
      type: "file",
      mediaType: "image/jpeg",
      fileName: `image_${idx}`,
      url: img,
    }));

    sendMessage({
      text: messageContent,
      files: files,
    });

    setInput("");
    setSelectedImages([]);
  };

  const startNewChat = () => {
    setMessages([]);
    setInput("");
    setSelectedImages([]);
  };

  return (
    <div className='w-60  bg-card border-r border-border flex flex-col fixed left-0 top-30'>
      <div className='p-4 border-b border-border'>
        <Button
          onClick={startNewChat}
          variant='outline'
          className='w-full justify-start gap-2 text-foreground hover:bg-accent bg-transparent'>
          <Plus className='w-4 h-4' />
          New Chat
        </Button>
      </div>

      <ScrollArea className='h-80 p-4'>
        <div className='space-y-4'>
          {messages.length === 0 ? (
            <div className='flex flex-col items-center justify-center h-full text-center py-12'>
              <div className='text-muted-foreground text-sm'>
                <p className='font-semibold mb-2'>No messages yet</p>
                <p className='text-xs'>Start a conversation to begin</p>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-foreground"
                  }`}>
                  <p className='text-sm break-words'>
                    {message.parts.map((part, idx) => (
                      <span key={idx}>
                        {part.type === "text" ? part.text : ""}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>

      <div className='p-4 border-t border-border space-y-3'>
        {selectedImages.length > 0 && (
          <div className='grid grid-cols-3 gap-2'>
            {selectedImages.map((img, idx) => (
              <div key={idx} className='relative group'>
                <div className='relative w-full aspect-square rounded overflow-hidden'>
                  <Image
                    src={img || "/placeholder.svg"}
                    alt={`Preview ${idx + 1}`}
                    fill
                    className='object-cover'
                  />
                </div>
                <button
                  onClick={() => removeImage(idx)}
                  className='absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded'>
                  <X className='w-4 h-4 text-white' />
                </button>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleFormSubmit} className='flex gap-2'>
          <div className='flex-1 flex gap-2'>
            <Input
              ref={inputRef}
              type='text'
              placeholder='Message...'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className='bg-background text-foreground border-border placeholder:text-muted-foreground'
            />
            <input
              ref={fileInputRef}
              type='file'
              multiple
              accept='image/*'
              onChange={handleImageUpload}
              className='hidden'
            />
            <Button
              type='button'
              size='icon'
              variant='ghost'
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              className='text-muted-foreground hover:text-foreground'>
              <ImageIcon className='w-4 h-4' />
            </Button>
          </div>
          <Button
            type='submit'
            size='icon'
            disabled={
              isLoading || (!input.trim() && selectedImages.length === 0)
            }
            className='bg-primary hover:bg-primary/90 text-primary-foreground'>
            {isLoading ? (
              <Loader2 className='w-4 h-4 animate-spin' />
            ) : (
              <Send className='w-4 h-4' />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
});

ChatForm.displayName = "ChatForm";
