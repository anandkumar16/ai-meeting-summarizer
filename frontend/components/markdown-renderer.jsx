"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function MarkdownRenderer({ content, className }) {
  const renderMarkdown = (text) => {
    if (!text) return ""

    return (
      text
        // Headers
        .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-4 mb-2 font-heading">$1</h3>')
        .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mt-6 mb-3 font-heading">$1</h2>')
        .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-8 mb-4 font-heading">$1</h1>')

        // Bold and Italic
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')

        // Lists
        .replace(/^• (.*$)/gim, '<li class="ml-4 mb-1">• $1</li>')
        .replace(/^\d+\. (.*$)/gim, '<li class="ml-4 mb-1 list-decimal">$1</li>')

        // Line breaks
        .replace(/\n\n/g, "<br><br>")
        .replace(/\n/g, "<br>")

        // Code blocks (simple)
        .replace(/`(.*?)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn("prose prose-sm max-w-none text-foreground", className)}
      dangerouslySetInnerHTML={{
        __html: renderMarkdown(content),
      }}
    />
  )
}
