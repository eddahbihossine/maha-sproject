"use client";

import React, { Suspense, useEffect } from "react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  Search,
  MessageSquare,
  MoreVertical,
  Archive,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getConversations } from "@/lib/api/messages";
import { useAuth } from "@/lib/auth/AuthProvider";
import { useT } from "@/lib/i18n/use-t";

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user } = useAuth();
  const t = useT();
  const [conversations, setConversations] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "archived">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConversations = async () => {
      if (!user) return;
      try {
        const data = await getConversations(user.id);
        setConversations(data || []);
      } catch (err) {
        console.error("Error loading conversations:", err);
        setConversations([]);
      } finally {
        setLoading(false);
      }
    };
    loadConversations();
  }, [user]);

  const filteredConversations = conversations.filter((conv) => {
    const otherName = conv.other_user_name || "";
    const matchesSearch =
      otherName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (conv.listing_title || "").toLowerCase().includes(searchQuery.toLowerCase());

    if (filter === "unread") return matchesSearch && (conv.unread_count || 0) > 0;
    if (filter === "archived") return matchesSearch && conv.archived;
    return matchesSearch && !conv.archived;
  });

  const isConversationPage = pathname !== "/messages";
  const totalUnread = conversations.reduce((acc, c) => acc + (c.unread_count || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card">
        <div className="flex h-16 items-center px-4 gap-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <span className="text-sm font-bold text-primary-foreground">
                SE
              </span>
            </div>
            <span className="font-semibold hidden sm:inline-block">
              Semsari
            </span>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/search">{t('home.browseListings')}</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Conversation List Sidebar */}
        <aside
          className={cn(
            "w-full md:w-80 lg:w-96 border-r bg-card flex flex-col",
            isConversationPage && "hidden md:flex"
          )}
        >
          {/* Sidebar Header */}
          <div className="p-4 border-b space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold">{t('messages.title')}</h1>
              <Badge variant="secondary">
                {t('messages.unreadCount', { count: totalUnread })}
              </Badge>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('messages.searchConversations')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-1">
              {(["all", "unread", "archived"] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setFilter(f)}
                  className="capitalize"
                >
                  {f === 'all'
                    ? t('messages.filterAll')
                    : f === 'unread'
                      ? t('messages.filterUnread')
                      : t('messages.filterArchived')}
                </Button>
              ))}
            </div>
          </div>

          {/* Conversation List */}
          <ScrollArea className="flex-1">
            {filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium">{t('messages.noConversationsTitle')}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {filter === "unread"
                    ? t('messages.noConversationsUnread')
                    : filter === "archived"
                      ? t('messages.noConversationsArchived')
                      : t('messages.noConversationsDefault')}
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {filteredConversations.map((conversation) => {
                  const isActive =
                    pathname === `/messages/${conversation.id}`;

                  return (
                    <Link
                      key={conversation.id}
                      href={`/messages/${conversation.id}`}
                      className={cn(
                        "flex items-start gap-3 p-4 hover:bg-muted/50 transition-colors",
                        isActive && "bg-muted"
                      )}
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {(conversation.other_user_name || t('messages.userFallback'))
                              .split(" ")
                              .map((part: string) => part[0])
                              .slice(0, 2)
                              .join("")
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium truncate">
                            {conversation.other_user_name || t('messages.userFallback')}
                          </span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {conversation.last_message_time
                              ? formatRelativeTime(conversation.last_message_time)
                              : ""}
                          </span>
                        </div>

                        {conversation.listing_title && (
                          <p className="text-xs text-muted-foreground truncate">
                            Re: {conversation.listing_title}
                          </p>
                        )}

                        <div className="flex items-center justify-between gap-2 mt-1">
                          <p
                            className={cn(
                              "text-sm truncate",
                              conversation.unread_count > 0
                                ? "font-medium text-foreground"
                                : "text-muted-foreground"
                            )}
                          >
                            {conversation.last_message || ""}
                          </p>
                          {conversation.unread_count > 0 && (
                            <Badge className="h-5 min-w-5 flex items-center justify-center rounded-full px-1.5">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100"
                            onClick={(e) => e.preventDefault()}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Archive className="h-4 w-4 mr-2" />
                            Archive
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </Link>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </aside>

        {/* Main Content / Chat Area */}
        <main
          className={cn(
            "flex-1 flex flex-col",
            !isConversationPage && "hidden md:flex"
          )}
        >
          <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
        </main>
      </div>
    </div>
  );
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
