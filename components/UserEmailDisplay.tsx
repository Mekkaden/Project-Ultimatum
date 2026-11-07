"use client";

import { useOfflineSession } from "@/lib/useOfflineSession";

export default function UserEmailDisplay() {
  const { data: session } = useOfflineSession();

  if (!session?.user?.email) return null;

  return (
    <div className="inline-flex items-center justify-center mt-2 px-3 h-7 bg-[#1C1C1E] rounded-full border border-[#2C2C2E]">
      <span className="text-xs text-neutral-400">
        {session.user.email}
      </span>
    </div>
  );
}
