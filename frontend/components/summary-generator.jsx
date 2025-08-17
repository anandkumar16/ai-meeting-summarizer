"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, RefreshCw, Copy, BarChart3, Clock, ArrowLeft, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import toast from "react-hot-toast"
import { generateSummary } from "@/services/api"

export function SummaryGenerator({
  transcript,
  customPrompt,
  summary,
  setSummary,
  isGenerating,
  setIsGenerating,
  onNext,
  onBack,
}) {
  const [progress, setProgress] = useState(0)
  const [currentPhase, setCurrentPhase] = useState("")
  const [typingText, setTypingText] = useState("")
  const [compressionRatio, setCompressionRatio] = useState(0)
  const [wordCount, setWordCount] = useState({ original: 0, summary: 0 })

  const phases = [
    { name: "Analyzing transcript...", duration: 2000 },
    { name: "Processing with AI...", duration: 3000 },
    { name: "Generating summary...", duration: 2000 },
    { name: "Finalizing results...", duration: 1000 },
  ]

  useEffect(() => {
    if (summary) {
      const originalWords = transcript.split(" ").filter((w) => w.length > 0).length
      const summaryWords = summary.split(" ").filter((w) => w.length > 0).length
      setWordCount({ original: originalWords, summary: summaryWords })
      setCompressionRatio(((originalWords - summaryWords) / originalWords) * 100)
    }
  }, [summary, transcript])

  const simulateTyping = (text, callback) => {
    setTypingText("")
    let index = 0
    const interval = setInterval(() => {
      if (index < text.length) {
        setTypingText(text.slice(0, index + 1))
        index++
      } else {
        clearInterval(interval)
        if (callback) callback()
      }
    }, 30)
    return interval
  }

  const handleGenerate = async () => {
    if (!transcript.trim()) {
      toast.error("Please enter a transcript first")
      return
    }

    setIsGenerating(true)
    setProgress(0)
    setSummary("")
    setTypingText("")

    try {
      // Simulate progress phases
      let currentProgress = 0
      for (let i = 0; i < phases.length; i++) {
        setCurrentPhase(phases[i].name)
        const phaseProgress = ((i + 1) / phases.length) * 100

        // Animate progress
        const progressInterval = setInterval(() => {
          currentProgress += 2
          if (currentProgress >= phaseProgress) {
            clearInterval(progressInterval)
          }
          setProgress(Math.min(currentProgress, phaseProgress))
        }, phases[i].duration / 50)

        await new Promise((resolve) => setTimeout(resolve, phases[i].duration))
      }

      // Call the actual API
      const result = await generateSummary({
        transcript,
        prompt: customPrompt || "Create a comprehensive summary of this meeting transcript.",
      })

      if (result.success) {
        // Simulate typing effect for the summary
        simulateTyping(result.summary, () => {
          setSummary(result.summary)
          toast.success("Summary generated successfully!")
        })
      } else {
        throw new Error(result.message || "Failed to generate summary")
      }
    } catch (error) {
      console.error("Summary generation error:", error)
      toast.error(error.message || "Failed to generate summary. Please try again.")

      // Fallback demo summary for development
      const demoSummary = `**Meeting Summary: Q4 Planning Session**

**Key Decisions:**
• Dashboard feature development prioritized for Q4 completion
• Mobile app launch timeline confirmed
• Performance optimization identified as critical blocker

**Progress Updates:**
• Backend development: 90% complete (Mike)
• Design phase: Completed with positive user feedback (Lisa)
• Marketing campaign: Ready for launch (Tom)

**Action Items:**
• Mike: Resolve performance issues by Friday, December 22nd
• Lisa: Implement additional customization options based on user feedback
• Tom: Coordinate with Lisa for final product screenshots by December 20th
• Sarah: Schedule follow-up meeting for Tuesday to review testing results

**Next Steps:**
Follow-up meeting scheduled for next Tuesday to review testing results and finalize launch preparations.

**Compression:** ${Math.round(((transcript.length - 800) / transcript.length) * 100)}% reduction in content length`

      simulateTyping(demoSummary, () => {
        setSummary(demoSummary)
        toast.success("Demo summary generated!")
      })
    } finally {
      setIsGenerating(false)
      setProgress(100)
      setCurrentPhase("Complete!")
    }
  }

  const handleRegenerate = () => {
    handleGenerate()
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(summary)
      toast.success("Summary copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy to clipboard")
    }
  }

  const canProceed = summary.trim().length > 0

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold font-heading mb-2">Generate AI Summary</h2>
        <p className="text-muted-foreground">Transform your meeting transcript into a professional summary using AI</p>
      </div>

      {/* Generation Controls */}
      <Card className="glass p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">AI Summary Generator</h3>
              <p className="text-sm text-muted-foreground">
                {transcript.split(" ").filter((w) => w.length > 0).length} words to process
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isGenerating && !summary && (
              <Button onClick={handleGenerate} className="px-6">
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Summary
              </Button>
            )}

            {!isGenerating && summary && (
              <Button variant="outline" onClick={handleRegenerate} className="glass bg-transparent">
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate
              </Button>
            )}
          </div>
        </div>

        {/* Progress Indicator */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4 mb-6"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{currentPhase}</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
                <span>AI is analyzing your transcript...</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary Display */}
        <AnimatePresence>
          {(typingText || summary) && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Generated Summary</h4>
                <div className="flex items-center space-x-2">
                  {summary && (
                    <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                  )}
                </div>
              </div>

              <div className="glass p-4 rounded-lg">
                <div className="prose prose-sm max-w-none text-foreground">
                  <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                    {typingText || summary}
                    {typingText && typingText.length < summary.length && (
                      <motion.span
                        animate={{ opacity: [1, 0] }}
                        transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
                        className="inline-block w-2 h-4 bg-primary ml-1"
                      />
                    )}
                  </pre>
                </div>
              </div>

              {/* Summary Stats */}
              {summary && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="grid grid-cols-3 gap-4"
                >
                  <div className="text-center p-3 glass rounded-lg">
                    <BarChart3 className="w-5 h-5 mx-auto mb-1 text-primary" />
                    <div className="text-lg font-semibold">{Math.round(compressionRatio)}%</div>
                    <div className="text-xs text-muted-foreground">Compression</div>
                  </div>

                  <div className="text-center p-3 glass rounded-lg">
                    <Clock className="w-5 h-5 mx-auto mb-1 text-secondary" />
                    <div className="text-lg font-semibold">{wordCount.summary}</div>
                    <div className="text-xs text-muted-foreground">Words</div>
                  </div>

                  <div className="text-center p-3 glass rounded-lg">
                    <Sparkles className="w-5 h-5 mx-auto mb-1 text-accent" />
                    <div className="text-lg font-semibold">
                      {Math.round((wordCount.summary / wordCount.original) * 100)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Of Original</div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="glass bg-transparent">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Input
        </Button>

        <Button onClick={onNext} disabled={!canProceed} className="px-8">
          Next: Edit Summary
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </motion.div>
  )
}
