"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Undo,
  Redo,
  Save,
  Download,
  Copy,
  Eye,
  Edit3,
  ArrowLeft,
  ArrowRight,
  FileText,
  Hash,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import toast from "react-hot-toast"

export function SummaryEditor({ summary, setSummary, onNext, onBack }) {
  const [editMode, setEditMode] = useState("edit")
  const [undoStack, setUndoStack] = useState([])
  const [redoStack, setRedoStack] = useState([])
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [isAutoSaving, setIsAutoSaving] = useState(false)
  const textareaRef = useRef(null)

  useEffect(() => {
    const words = summary.split(/\s+/).filter((word) => word.length > 0).length
    setWordCount(words)
    setCharCount(summary.length)
  }, [summary])

  // Auto-save functionality
  useEffect(() => {
    const autoSaveTimer = setTimeout(() => {
      if (summary) {
        setIsAutoSaving(true)
        localStorage.setItem("ai-meeting-summary-draft", summary)
        setTimeout(() => setIsAutoSaving(false), 1000)
      }
    }, 2000)

    return () => clearTimeout(autoSaveTimer)
  }, [summary])

  const addToUndoStack = (currentText) => {
    setUndoStack((prev) => [...prev.slice(-19), currentText])
    setRedoStack([])
  }

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousText = undoStack[undoStack.length - 1]
      setRedoStack((prev) => [summary, ...prev])
      setUndoStack((prev) => prev.slice(0, -1))
      setSummary(previousText)
    }
  }

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextText = redoStack[0]
      setUndoStack((prev) => [...prev, summary])
      setRedoStack((prev) => prev.slice(1))
      setSummary(nextText)
    }
  }

  const insertFormatting = (before, after = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = summary.substring(start, end)
    const newText = summary.substring(0, start) + before + selectedText + after + summary.substring(end)

    addToUndoStack(summary)
    setSummary(newText)

    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, end + before.length)
    }, 0)
  }

  const formatBold = () => insertFormatting("**", "**")
  const formatItalic = () => insertFormatting("*", "*")
  const formatHeading = () => insertFormatting("## ")
  const formatBulletList = () => insertFormatting("• ")
  const formatNumberedList = () => insertFormatting("1. ")

  const handleTextChange = (e) => {
    const newText = e.target.value
    if (newText !== summary) {
      addToUndoStack(summary)
      setSummary(newText)
    }
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(summary)
      toast.success("Summary copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy to clipboard")
    }
  }

  const exportAsText = () => {
    const blob = new Blob([summary], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `meeting-summary-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Summary exported as text file!")
  }

  const exportAsMarkdown = () => {
    const blob = new Blob([summary], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `meeting-summary-${new Date().toISOString().split("T")[0]}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success("Summary exported as Markdown file!")
  }

  const renderMarkdownPreview = (text) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/^## (.*$)/gm, "<h2 class='text-lg font-semibold mt-4 mb-2'>$1</h2>")
      .replace(/^### (.*$)/gm, "<h3 class='text-base font-semibold mt-3 mb-2'>$1</h3>")
      .replace(/^• (.*$)/gm, "<li class='ml-4'>$1</li>")
      .replace(/^\d+\. (.*$)/gm, "<li class='ml-4 list-decimal'>$1</li>")
      .replace(/\n/g, "<br>")
  }

  const canProceed = summary.trim().length > 0

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold font-heading mb-2">Edit Your Summary</h2>
        <p className="text-muted-foreground">Review and refine your AI-generated summary before sharing</p>
      </div>

      {/* Editor Toolbar */}
      <Card className="glass p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" onClick={handleUndo} disabled={undoStack.length === 0}>
                <Undo className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleRedo} disabled={redoStack.length === 0}>
                <Redo className="w-4 h-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" onClick={formatBold} title="Bold (Ctrl+B)">
                <Bold className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={formatItalic} title="Italic (Ctrl+I)">
                <Italic className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={formatHeading} title="Heading">
                <Hash className="w-4 h-4" />
              </Button>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" onClick={formatBulletList} title="Bullet List">
                <List className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={formatNumberedList} title="Numbered List">
                <ListOrdered className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isAutoSaving && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center space-x-1 text-xs text-muted-foreground"
              >
                <Save className="w-3 h-3" />
                <span>Auto-saved</span>
              </motion.div>
            )}

            <Button variant="ghost" size="sm" onClick={copyToClipboard}>
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </Button>

            <div className="flex items-center space-x-1">
              <Button variant="ghost" size="sm" onClick={exportAsText}>
                <Download className="w-4 h-4 mr-1" />
                TXT
              </Button>
              <Button variant="ghost" size="sm" onClick={exportAsMarkdown}>
                <FileText className="w-4 h-4 mr-1" />
                MD
              </Button>
            </div>
          </div>
        </div>

        {/* Editor Tabs */}
        <Tabs value={editMode} onValueChange={setEditMode} className="w-full">
          <TabsList className="grid w-full grid-cols-2 glass">
            <TabsTrigger value="edit" className="flex items-center space-x-2">
              <Edit3 className="w-4 h-4" />
              <span>Edit</span>
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>Preview</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="mt-4">
            <Textarea
              ref={textareaRef}
              value={summary}
              onChange={handleTextChange}
              placeholder="Your meeting summary will appear here..."
              className="min-h-[400px] glass resize-none font-mono text-sm leading-relaxed"
              onKeyDown={(e) => {
                if (e.ctrlKey || e.metaKey) {
                  switch (e.key) {
                    case "b":
                      e.preventDefault()
                      formatBold()
                      break
                    case "i":
                      e.preventDefault()
                      formatItalic()
                      break
                    case "z":
                      e.preventDefault()
                      if (e.shiftKey) {
                        handleRedo()
                      } else {
                        handleUndo()
                      }
                      break
                  }
                }
              }}
            />
          </TabsContent>

          <TabsContent value="preview" className="mt-4">
            <div className="glass p-6 rounded-lg min-h-[400px]">
              <div
                className="prose prose-sm max-w-none text-foreground"
                dangerouslySetInnerHTML={{
                  __html: renderMarkdownPreview(summary),
                }}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Editor Stats */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span>{wordCount} words</span>
            <span>{charCount} characters</span>
            <span>{Math.ceil(wordCount / 200)} min read</span>
          </div>

          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="glass">
              <Save className="w-3 h-3 mr-1" />
              Auto-save enabled
            </Badge>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="glass p-4">
        <h3 className="font-semibold mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => insertFormatting("**Key Points:**\n• ")}
            className="glass bg-transparent justify-start"
          >
            Add Key Points
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => insertFormatting("**Action Items:**\n1. ")}
            className="glass bg-transparent justify-start"
          >
            Add Action Items
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => insertFormatting("**Next Steps:**\n• ")}
            className="glass bg-transparent justify-start"
          >
            Add Next Steps
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => insertFormatting("**Decisions Made:**\n• ")}
            className="glass bg-transparent justify-start"
          >
            Add Decisions
          </Button>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="glass bg-transparent">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Generate
        </Button>

        <Button onClick={onNext} disabled={!canProceed} className="px-8">
          Next: Share Summary
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  )
}
