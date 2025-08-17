"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { FileText, Sparkles, Mail, Settings } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { TranscriptInput } from "@/components/transcript-input"
import { AIPromptCustomizer } from "@/components/ai-prompt-customizer"
import { SummaryGenerator } from "@/components/summary-generator"
import { SummaryEditor } from "@/components/summary-editor"
import { EmailSharing } from "@/components/email-sharing"
import { ProgressIndicator } from "@/components/progress-indicator"
import { AnimatedBackground } from "@/components/animated-background"
import { EnhancedCard } from "@/components/enhanced-card"
import { StaggerContainer, StaggerItem } from "@/components/stagger-container"
import { SuccessAnimation } from "@/components/success-animation"

const steps = [
  { id: "input", label: "Input", icon: FileText },
  { id: "generate", label: "Generate", icon: Sparkles },
  { id: "edit", label: "Edit", icon: Settings },
  { id: "share", label: "Share", icon: Mail },
]

export default function Home() {
  const [currentStep, setCurrentStep] = useState("input")
  const [transcript, setTranscript] = useState("")
  const [customPrompt, setCustomPrompt] = useState("")
  const [summary, setSummary] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const handleStepChange = (stepId: any) => {
    setCurrentStep(stepId)
  }

  const handleComplete = () => {
    setShowSuccess(true)
  }

  const handleSuccessComplete = () => {
    setShowSuccess(false)
    setCurrentStep("input")
    setTranscript("")
    setSummary("")
    setCustomPrompt("")
  }

  return (
    <div className="min-h-screen relative">
      <AnimatedBackground />

      {/* Header */}
      <header className="border-b border-border/50 glass relative z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <motion.div
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Sparkles className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold font-heading">AI Meeting Summarizer</h1>
              <p className="text-sm text-muted-foreground">Transform your meeting notes</p>
            </div>
          </motion.div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        <StaggerContainer>
          <StaggerItem>
            <ProgressIndicator steps={steps} currentStep={currentStep} onStepClick={handleStepChange} />
          </StaggerItem>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2">
              <StaggerItem>
                <EnhancedCard className="p-6" hover glow={currentStep === "generate" && isGenerating}>
                  <AnimatePresence mode="wait">
                    {currentStep === "input" && (
                      <motion.div
                        key="input"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <TranscriptInput
                          transcript={transcript}
                          setTranscript={setTranscript}
                          onNext={() => handleStepChange("generate")}
                        />
                      </motion.div>
                    )}

                    {currentStep === "generate" && (
                      <motion.div
                        key="generate"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <SummaryGenerator
                          transcript={transcript}
                          customPrompt={customPrompt}
                          summary={summary}
                          setSummary={setSummary}
                          isGenerating={isGenerating}
                          setIsGenerating={setIsGenerating}
                          onNext={() => handleStepChange("edit")}
                          onBack={() => handleStepChange("input")}
                        />
                      </motion.div>
                    )}

                    {currentStep === "edit" && (
                      <motion.div
                        key="edit"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <SummaryEditor
                          summary={summary}
                          setSummary={setSummary}
                          onNext={() => handleStepChange("share")}
                          onBack={() => handleStepChange("generate")}
                        />
                      </motion.div>
                    )}

                    {currentStep === "share" && (
                      <motion.div
                        key="share"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <EmailSharing
                          summary={summary}
                          onBack={() => handleStepChange("edit")}
                          onComplete={handleComplete}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </EnhancedCard>
              </StaggerItem>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <StaggerItem>
                <AIPromptCustomizer customPrompt={customPrompt} setCustomPrompt={setCustomPrompt} />
              </StaggerItem>

              <StaggerItem>
                <EnhancedCard className="p-4" hover>
                  <h3 className="font-semibold mb-3 font-heading">Quick Stats</h3>
                  <div className="space-y-2 text-sm">
                    <motion.div
                      className="flex justify-between"
                      whileHover={{ x: 2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <span className="text-muted-foreground">Characters:</span>
                      <motion.span
                        key={transcript.length}
                        initial={{ scale: 1.2, color: "rgb(59, 130, 246)" }}
                        animate={{ scale: 1, color: "inherit" }}
                        transition={{ duration: 0.3 }}
                      >
                        {transcript.length.toLocaleString()}
                      </motion.span>
                    </motion.div>
                    <motion.div
                      className="flex justify-between"
                      whileHover={{ x: 2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <span className="text-muted-foreground">Words:</span>
                      <motion.span
                        key={transcript.split(" ").filter((w) => w.length > 0).length}
                        initial={{ scale: 1.2, color: "rgb(59, 130, 246)" }}
                        animate={{ scale: 1, color: "inherit" }}
                        transition={{ duration: 0.3 }}
                      >
                        {transcript
                          .split(" ")
                          .filter((w) => w.length > 0)
                          .length.toLocaleString()}
                      </motion.span>
                    </motion.div>
                    <motion.div
                      className="flex justify-between"
                      whileHover={{ x: 2 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <span className="text-muted-foreground">Summary:</span>
                      <motion.span
                        key={summary.length}
                        initial={{ scale: 1.2, color: "rgb(59, 130, 246)" }}
                        animate={{ scale: 1, color: "inherit" }}
                        transition={{ duration: 0.3 }}
                      >
                        {summary.length} chars
                      </motion.span>
                    </motion.div>
                  </div>
                </EnhancedCard>
              </StaggerItem>
            </div>
          </div>
        </StaggerContainer>
      </main>

      {/* Success Animation */}
      <SuccessAnimation
        show={showSuccess}
        title="Summary Sent Successfully!"
        description="Your meeting summary has been delivered to all recipients"
        onComplete={handleSuccessComplete}
      />
    </div>
  )
}
