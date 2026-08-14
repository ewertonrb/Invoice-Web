"use client";

import { useState } from "react";

export const DEFAULT_AVATAR_SRC = "/images/default-avatar.png";

type UserAvatarProps = {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
};

export function UserAvatar({ src, name, size = 48, className = "" }: UserAvatarProps) {
  const normalizedSrc = src?.trim() || DEFAULT_AVATAR_SRC;
  const [failedSource, setFailedSource] = useState<string>();
  const imageSrc = failedSource === normalizedSrc ? DEFAULT_AVATAR_SRC : normalizedSrc;

  return <img src={imageSrc} alt={`${name} profile photo`} width={size} height={size} className={`shrink-0 rounded-full object-cover ${className}`} onError={() => { if (imageSrc !== DEFAULT_AVATAR_SRC) setFailedSource(normalizedSrc); }} />;
}
