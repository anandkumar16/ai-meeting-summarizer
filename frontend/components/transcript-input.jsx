"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { useDropzone } from "react-dropzone"
import { Upload, FileText, X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"

const SAMPLE_TRANSCRIPT = `Meeting: Q4 Planning Session
Date: December 15, 2024
Attendees: Sarah (PM), Mike (Engineering), Lisa (Design), Tom (Marketing)

Sarah: Let's start with our Q4 objectives. We need to finalize the new dashboard feature and prepare for the mobile app launch.

Mike: The dashboard backend is 90% complete. We should have it ready for testing by next Friday. However, we're facing some performance issues with the real-time updates.

Lisa: From a design perspective, we've completed all the wireframes and high-fidelity mockups. The user testing sessions showed positive feedback, but users want more customization options.

Tom: Marketing is ready to launch the campaign. We've prepared social media content, blog posts, and email sequences. We need the final product screenshots by December 20th.

Sarah: Great progress everyone. Let's prioritize the performance fixes and plan a follow-up meeting for next Tuesday to review the testing results.

Action Items:
- Mike: Fix performance issues by Friday
- Lisa: Add customization options to designs
- Tom: Coordinate with Lisa for final screenshots
- Sarah: Schedule follow-up meeting`

export function TranscriptInput({ transcript, setTranscript, onNext }) {
  const [uploadedFiles, setUploadedFiles] = useState([])

  const onDrop = useCallback(
    (acceptedFiles) => {
      acceptedFiles.forEach((file) => {
        const reader = new FileReader()

        reader.onload = () => {
          const content = reader.result
          setTranscript((prev) => prev + (prev ? "\n\n" : "") + content)
          setUploadedFiles((prev) => [...prev, { name: file.name, size: file.size }])
          toast.success(`File "${file.name}" uploaded successfully`)
        }

        reader.onerror = () => {
          toast.error(`Error reading file "${file.name}"`)
        }

        reader.readAsText(file)
      })
    },
    [setTranscript],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/plain": [".txt"],
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    multiple: true,
  })

  const removeFile = (index) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const loadSampleTranscript = () => {
    setTranscript(SAMPLE_TRANSCRIPT)
    toast.success("Sample transcript loaded")
  }

  const clearTranscript = () => {
    setTranscript("")
    setUploadedFiles([])
    toast.success("Transcript cleared")
  }

  const handlePaste = (e) => {
    // Clean up pasted content
    setTimeout(() => {
      const content = e.target.value
      const cleaned = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
      if (content !== cleaned) {
        setTranscript(cleaned)
      }
    }, 0)
  }

  const canProceed = transcript.trim().length > 50

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold font-heading mb-2">Upload Your Meeting Transcript</h2>
        <p className="text-muted-foreground">
          Paste your transcript or upload a file to get started with AI-powered summarization
        </p>
      </div>

      {/* File Upload Area */}
      <Card
        {...getRootProps()}
        className={cn(
          "glass border-2 border-dashed transition-all duration-300 cursor-pointer hover:border-primary/50",
          isDragActive && "border-primary bg-primary/5 scale-[1.02]",
        )}
      >
        <input {...getInputProps()} />
        <div className="p-8 text-center">
          <motion.div
            animate={{
              scale: isDragActive ? 1.1 : 1,
              rotate: isDragActive ? 5 : 0,
            }}
            transition={{ duration: 0.2 }}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          </motion.div>
          <h3 className="text-lg font-semibold mb-2">{isDragActive ? "Drop files here" : "Drag & drop files here"}</h3>
          <p className="text-muted-foreground mb-4">Supports TXT, PDF, and DOCX files</p>
          <Button variant="outline" className="glass bg-transparent">
            <FileText className="w-4 h-4 mr-2" />
            Browse Files
          </Button>
        </div>
      </Card>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="space-y-2">
          <h4 className="font-medium">Uploaded Files:</h4>
          {uploadedFiles.map((file, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Badge variant="secondary" className="flex items-center justify-between w-full p-2">
                <span className="flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  className="h-auto p-1 hover:bg-destructive hover:text-destructive-foreground"
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Transcript Textarea */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Meeting Transcript</label>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={loadSampleTranscript} className="text-xs">
              <Sparkles className="w-3 h-3 mr-1" />
              Load Sample
            </Button>
            {transcript && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearTranscript}
                className="text-xs text-destructive hover:text-destructive"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        <Textarea
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          onPaste={handlePaste}
          placeholder="Paste your meeting transcript here or upload a file above..."
          className="min-h-[300px] glass resize-none"
          style={{ fieldSizing: "content" }}
        />

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {transcript.length} characters, {transcript.split(" ").filter((w) => w.length > 0).length} words
          </span>
          {transcript.length < 50 && <span className="text-destructive">Minimum 50 characters required</span>}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end">
        <Button onClick={onNext} disabled={!canProceed} className="px-8">
          Next: Generate Summary
          <Sparkles className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  )
}
