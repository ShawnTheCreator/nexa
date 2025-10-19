"use client";
import React from "react";

interface IdeaCardProps {
  idea: any;
  onClick?: () => void;
}

export function IdeaCard({ idea, onClick }: IdeaCardProps) {
  const attachments = idea.attachmentUrls ? JSON.parse(idea.attachmentUrls) : [];
  const thumb = attachments.length > 0 ? attachments[0] : null;
  const video = idea.videoUrl || null;

  const [isHover, setIsHover] = React.useState(false);

  return (
    <article onClick={onClick} onMouseEnter={() => setIsHover(true)} onMouseLeave={() => setIsHover(false)} className="cursor-pointer rounded-lg border p-4 hover:shadow-md">
      <div className="relative">
        {thumb ? (
          <img src={thumb} alt={idea.title} className="h-40 w-full object-cover rounded" />
        ) : (
          <div className="h-40 w-full rounded bg-gray-100 flex items-center justify-center text-gray-400">No image</div>
        )}
        {video ? (
          <video className={`absolute inset-0 h-40 w-full object-cover rounded transition-opacity ${isHover ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} src={video} muted playsInline loop />
        ) : null}
      </div>
      <div className="mt-3 flex items-start justify-between">
        <h3 className="font-medium text-gray-900 dark:text-gray-100 break-words">{idea.title}</h3>
        <span className="text-xs text-gray-500 whitespace-nowrap">{new Date(idea.createdAt).toLocaleDateString()}</span>
      </div>
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 break-words">{idea.description}</p>
      <div className="mt-2 text-xs text-gray-500">Status: {idea.status}</div>
    </article>
  );
}
