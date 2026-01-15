import { useState } from "react";
import { Link } from "react-router-dom";
import CommentsDialog from "./dialogs/CommentsDialog";
import { MessageCircle } from 'lucide-react';
function getRelativeTime(createdAt) {
  const postDate = new Date(createdAt); // ISO UTC
  const now = new Date();

  const diffMs = now - postDate;

  const minutes = Math.floor(diffMs / (1000 * 60));
  const hours   = Math.floor(minutes / 60);
  const days    = Math.floor(hours / 24);
  const weeks   = Math.floor(days / 7);
  const months  = Math.floor(days / 30);

  if (months >= 1) return `${months}mo`;
  if (weeks >= 1)  return `${weeks}w`;
  if (days >= 1)   return `${days}d`;
  if (hours >= 1)  return `${hours}h`;
  if (minutes >= 1) return `${minutes}m`;

  return "now";
}

export default function PostCard({ post }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="w-full flex justify-center px-3 sm:px-4">
        <div
          className="
            w-full
            max-w-[520px]
            md:max-w-[600px]
            lg:max-w-[680px]
            bg-white/10
            backdrop-blur-md
            border border-white/10
            rounded-2xl
            p-4 sm:p-5
            shadow-lg
            text-white
          "
        >
          {/* USER */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <img
                src={post.userImageUrl}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover"
                alt="user"
              />

              <Link to={`/app/profile/${post.ownerId}`}>
                <span className="font-semibold text-base sm:text-lg">
                  {post.ownerName}
                </span>
              </Link>
            </div>

            {/* TIME */}
            <span className="text-xs text-white/50">
              {getRelativeTime(post.createdAt)}
            </span>
          </div>

          {/* TEXT */}
          <p className="text-sm sm:text-base leading-relaxed mb-4">
            {post.content}
          </p>

          {/* IMAGE (optional) */}
          {post.imageUrl && (
            <div className="w-full aspect-[4/5] overflow-hidden rounded-xl mb-4 bg-black">
              <img
                src={post.imageUrl}
                alt="post"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* ACTIONS */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="text-xl hover:scale-110 transition"
            >
                <MessageCircle />
            </button>
            <span className="text-sm text-white/70">
              {post.commentCount} comments
            </span>
          </div>
        </div>

        {/* COMMENTS DIALOG */}
        <CommentsDialog
          open={open}
          onClose={() => setOpen(false)}
          postId={post.id}
        />
      </div>
    </>
  );
}
