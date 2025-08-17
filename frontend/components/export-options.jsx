"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Download, FileText, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import toast from "react-hot-toast"

export function ExportOptions({ summary, onClose }) {
  const [fileName, setFileName] = useState(`meeting-summary-${new Date().toISOString().split("T")[0]}`)
  const [isExporting, setIsExporting] = useState(false)

  const exportFile = async (format, mimeType, extension) => {
    setIsExporting(true)
    try {
      const blob = new Blob([summary], { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${fileName}.${extension}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success(`Summary exported as ${format.toUpperCase()} file!`)
      onClose?.()
    } catch (error) {
      toast.error("Failed to export file")
    } finally {
      setIsExporting(false)
    }
  }

  const exportOptions = [
    {
      name: "Plain Text",
      description: "Simple text file (.txt)",
      icon: FileText,
      action: () => exportFile("text", "text/plain", "txt"),
    },
    {
      name: "Markdown",
      description: "Formatted markdown file (.md)",
      icon: File,
      action: () => exportFile("markdown", "text/markdown", "md"),
    },
    {
      name: "Rich Text",
      description: "Rich text format (.rtf)",
      icon: File,
      action: () => exportFile("rtf", "application/rtf", "rtf"),
    },
  ]

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="glass bg-transparent">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="glass border-border/50">
        <DialogHeader>
          <DialogTitle className="font-heading">Export Summary</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="filename">File Name</Label>
            <Input
              id="filename"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="glass"
              placeholder="Enter file name..."
            />
          </div>

          <div className="space-y-2">
            <Label>Export Format</Label>
            <div className="grid gap-2">
              {exportOptions.map((option) => (
                <motion.div key={option.name} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    onClick={option.action}
                    disabled={isExporting || !fileName.trim()}
                    className="w-full justify-start h-auto p-4 glass bg-transparent"
                  >
                    <option.icon className="w-5 h-5 mr-3 text-primary" />
                    <div className="text-left">
                      <div className="font-medium">{option.name}</div>
                      <div className="text-xs text-muted-foreground">{option.description}</div>
                    </div>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
