"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Wand2, Save, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"

const PROMPT_TEMPLATES = [
  {
    id: "executive",
    name: "Executive Summary",
    description: "High-level overview for leadership",
    prompt:
      "Create a concise executive summary focusing on key decisions, action items, and strategic implications. Include main outcomes and next steps.",
  },
  {
    id: "action-items",
    name: "Action Items",
    description: "Focus on tasks and responsibilities",
    prompt:
      "Extract and organize all action items, deadlines, and assigned responsibilities. Format as a clear task list with owners and due dates.",
  },
  {
    id: "key-points",
    name: "Key Points",
    description: "Main discussion topics and decisions",
    prompt:
      "Summarize the main discussion points, key decisions made, and important insights shared during the meeting.",
  },
  {
    id: "detailed",
    name: "Detailed Summary",
    description: "Comprehensive meeting overview",
    prompt:
      "Provide a detailed summary including all major topics discussed, decisions made, action items, and participant contributions.",
  },
]

export function AIPromptCustomizer({ customPrompt, setCustomPrompt }) {
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [savedPrompts, setSavedPrompts] = useState([])

  useEffect(() => {
    // Load saved prompts from localStorage
    const saved = localStorage.getItem("ai-meeting-saved-prompts")
    if (saved) {
      setSavedPrompts(JSON.parse(saved))
    }
  }, [])

  const selectTemplate = (template) => {
    setSelectedTemplate(template.id)
    setCustomPrompt(template.prompt)
    toast.success(`Applied "${template.name}" template`)
  }

  const saveCustomPrompt = () => {
    if (!customPrompt.trim()) {
      toast.error("Please enter a prompt to save")
      return
    }

    const promptName = prompt("Enter a name for this prompt:")
    if (!promptName) return

    const newPrompt = {
      id: Date.now().toString(),
      name: promptName,
      prompt: customPrompt,
    }

    const updated = [...savedPrompts, newPrompt]
    setSavedPrompts(updated)
    localStorage.setItem("ai-meeting-saved-prompts", JSON.stringify(updated))
    toast.success("Prompt saved successfully")
  }

  const loadSavedPrompt = (savedPrompt) => {
    setCustomPrompt(savedPrompt.prompt)
    setSelectedTemplate("")
    toast.success(`Loaded "${savedPrompt.name}"`)
  }

  const deleteSavedPrompt = (id) => {
    const updated = savedPrompts.filter((p) => p.id !== id)
    setSavedPrompts(updated)
    localStorage.setItem("ai-meeting-saved-prompts", JSON.stringify(updated))
    toast.success("Prompt deleted")
  }

  const resetPrompt = () => {
    setCustomPrompt("")
    setSelectedTemplate("")
    toast.success("Prompt cleared")
  }

  return (
    <Card className="glass p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold font-heading">AI Prompt Customization</h3>
        <Wand2 className="w-5 h-5 text-primary" />
      </div>

      {/* Template Selection */}
      <div className="space-y-3 mb-4">
        <h4 className="text-sm font-medium">Quick Templates</h4>
        <div className="grid grid-cols-1 gap-2">
          {PROMPT_TEMPLATES.map((template) => (
            <motion.div key={template.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => selectTemplate(template)}
                className={cn(
                  "w-full justify-start text-left h-auto p-3 glass",
                  selectedTemplate === template.id && "bg-primary/20 border-primary/50",
                )}
              >
                <div>
                  <div className="font-medium">{template.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">{template.description}</div>
                </div>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Custom Prompt Input */}
      <div className="space-y-2 mb-4">
        <label className="text-sm font-medium">Custom Prompt</label>
        <Textarea
          value={customPrompt}
          onChange={(e) => setCustomPrompt(e.target.value)}
          placeholder="Enter your custom summarization instructions..."
          className="min-h-[100px] glass text-sm"
        />
        <div className="text-xs text-muted-foreground">{customPrompt.length}/500 characters</div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={saveCustomPrompt}
          disabled={!customPrompt.trim()}
          className="glass bg-transparent"
        >
          <Save className="w-3 h-3 mr-1" />
          Save
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={resetPrompt}
          disabled={!customPrompt}
          className="glass bg-transparent"
        >
          <RotateCcw className="w-3 h-3 mr-1" />
          Clear
        </Button>
      </div>

      {/* Saved Prompts */}
      {savedPrompts.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Saved Prompts</h4>
          <div className="space-y-1">
            {savedPrompts.map((savedPrompt) => (
              <div key={savedPrompt.id} className="flex items-center justify-between p-2 rounded glass">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => loadSavedPrompt(savedPrompt)}
                  className="flex-1 justify-start text-left h-auto p-1"
                >
                  <span className="text-sm">{savedPrompt.name}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteSavedPrompt(savedPrompt.id)}
                  className="h-auto p-1 text-destructive hover:text-destructive"
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
