import React from 'react';

function IconShell({ children, className = '' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      {children}
    </svg>
  );
}

export function ChatBubbleIcon({ className = '' }) {
  return (
    <IconShell className={className}>
      <path d="M20 15.5c0 1.38-1.12 2.5-2.5 2.5H9l-5 3v-3.5A2.5 2.5 0 0 1 1.5 15V6.5A2.5 2.5 0 0 1 4 4h13.5A2.5 2.5 0 0 1 20 6.5v9z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M7.25 9.5h9.5M7.25 12h6.25" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </IconShell>
  );
}

export function TrashIcon({ className = '' }) {
  return (
    <IconShell className={className}>
      <path d="M5 7h14M9 7V5.8A1.8 1.8 0 0 1 10.8 4h2.4A1.8 1.8 0 0 1 15 5.8V7m-7 0 .7 12.2A1.8 1.8 0 0 0 10.5 21h3a1.8 1.8 0 0 0 1.8-1.8L16 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v5M14 11v5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </IconShell>
  );
}

export function CloseIcon({ className = '' }) {
  return (
    <IconShell className={className}>
      <path d="M6 6l12 12M18 6L6 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </IconShell>
  );
}

export function EmptyChatIcon({ className = '' }) {
  return (
    <IconShell className={className}>
      <path d="M20 15.5c0 1.38-1.12 2.5-2.5 2.5H9l-5 3v-3.5A2.5 2.5 0 0 1 1.5 15V6.5A2.5 2.5 0 0 1 4 4h13.5A2.5 2.5 0 0 1 20 6.5v9z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8 8h8M8 11h5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </IconShell>
  );
}

export function WarningIcon({ className = '' }) {
  return (
    <IconShell className={className}>
      <path d="M12 3 2.8 19.5A1.3 1.3 0 0 0 3.9 21.5h16.2a1.3 1.3 0 0 0 1.1-2L12 3z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 8v5M12 16.6h.01" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </IconShell>
  );
}

export function ThumbsUpIcon({ className = '' }) {
  return (
    <IconShell className={className}>
      <path d="M10 11V7.8A2.8 2.8 0 0 1 12.8 5l.5 4V16H7.8a2.3 2.3 0 0 1-2.2-1.7L4.3 10h1.9A2.8 2.8 0 0 1 9 8.1V7.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M12.5 9.1h3.8A1.7 1.7 0 0 1 18 10.8v4.5A2.7 2.7 0 0 1 15.3 18H12.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </IconShell>
  );
}

export function ThumbsDownIcon({ className = '' }) {
  return (
    <IconShell className={className}>
      <path d="M14 13v3.2A2.8 2.8 0 0 1 11.2 19l-.5-4V8H16.2a2.3 2.3 0 0 1 2.2 1.7l1.3 4.3h-1.9A2.8 2.8 0 0 1 15 15.9v.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
      <path d="M11.5 14.9H7.7A1.7 1.7 0 0 1 6 13.2V8.7A2.7 2.7 0 0 1 8.7 6H11.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </IconShell>
  );
}

export function CopyIcon({ className = '' }) {
  return (
    <IconShell className={className}>
      <path d="M9 9.5h7A2.5 2.5 0 0 1 18.5 12v7A2.5 2.5 0 0 1 16 21.5H9A2.5 2.5 0 0 1 6.5 19v-7A2.5 2.5 0 0 1 9 9.5z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8.5 15.5H7A2.5 2.5 0 0 1 4.5 13V6A2.5 2.5 0 0 1 7 3.5h7A2.5 2.5 0 0 1 16.5 6v1.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </IconShell>
  );
}

export function SpeakerIcon({ className = '' }) {
  return (
    <IconShell className={className}>
      <path d="M3 9v6a1 1 0 0 0 1 1h3l4 3V5L7 8H4a1 1 0 0 0-1 1z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.5 8.5a4 4 0 0 1 0 7" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 6.5a7 7 0 0 1 0 11" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
    </IconShell>
  );
}

export function SendIcon({ className = '' }) {
  return (
    <IconShell className={className}>
      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </IconShell>
  );
}

export function HourglassIcon({ className = '' }) {
  return (
    <IconShell className={className}>
      <path d="M12 2v20M9 2h6M9 22h6M12 12c-3-3-3-6-3-6h6s0 3-3 6 3 6 3 6H9s0-3 3-6z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </IconShell>
  );
}