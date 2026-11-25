'use client';

import { useState, type ReactNode } from 'react';

export function DocumentDropZone({ children, className, disabled = false, onFiles }: {
  children: ReactNode;
  className: string;
  disabled?: boolean;
  onFiles: (files: File[]) => void;
}) {
  const [dragging, setDragging] = useState(false);
  return <article
    className={`${className} transition-colors ${dragging && !disabled ? 'ring-2 ring-primary bg-blue-50' : ''}`}
    aria-busy={disabled}
    onDragEnter={event => {
      if (!event.dataTransfer.types.includes('Files')) return;
      event.preventDefault();
      setDragging(true);
    }}
    onDragOver={event => {
      if (!event.dataTransfer.types.includes('Files')) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = disabled ? 'none' : 'copy';
    }}
    onDragLeave={event => {
      if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return;
      setDragging(false);
    }}
    onDrop={event => {
      event.preventDefault();
      event.stopPropagation();
      setDragging(false);
      if (!disabled) onFiles(Array.from(event.dataTransfer.files));
    }}
  >{children}</article>;
}
