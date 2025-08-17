"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, X, Send, Check, AlertCircle, Users, Eye, ArrowLeft, Sparkles, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import toast from "react-hot-toast"
import { sendEmail, validateEmails } from "@/services/api"

export function EmailSharing({ summary, onBack, onComplete }) {
  const [recipients, setRecipients] = useState([])
  const [currentEmail, setCurrentEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [senderName, setSenderName] = useState("")
  const [customMessage, setCustomMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [sendProgress, setSendProgress] = useState(0)
  const [validationResults, setValidationResults] = useState({})
  const [recentRecipients, setRecentRecipients] = useState([])
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    // Load recent recipients and settings from localStorage
    const recent = localStorage.getItem("ai-meeting-recent-recipients")
    const savedSender = localStorage.getItem("ai-meeting-sender-name")

    if (recent) {
      setRecentRecipients(JSON.parse(recent))
    }
    if (savedSender) {
      setSenderName(savedSender)
    }

    // Set default subject
    const today = new Date().toLocaleDateString()
    setSubject(`Meeting Summary - ${today}`)
  }, [])

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const addRecipient = async () => {
    const email = currentEmail.trim().toLowerCase()

    if (!email) return

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address")
      return
    }

    if (recipients.includes(email)) {
      toast.error("Email already added")
      return
    }

    setRecipients([...recipients, email])
    setCurrentEmail("")

    // Validate email with backend
    try {
      const result = await validateEmails([email])
      setValidationResults((prev) => ({
        ...prev,
        [email]: result.success && result.validEmails.includes(email),
      }))
    } catch (error) {
      console.error("Email validation error:", error)
    }
  }

  const removeRecipient = (email) => {
    setRecipients(recipients.filter((r) => r !== email))
    setValidationResults((prev) => {
      const updated = { ...prev }
      delete updated[email]
      return updated
    })
  }

  const addFromRecent = (email) => {
    if (!recipients.includes(email)) {
      setRecipients([...recipients, email])
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addRecipient()
    }
  }

  const generateEmailContent = () => {
    const greeting = senderName
      ? `Hi there,\n\n${senderName} has shared a meeting summary with you.\n\n`
      : "Hi there,\n\nPlease find the meeting summary below.\n\n"
    const customPart = customMessage ? `${customMessage}\n\n` : ""
    const summaryPart = `--- Meeting Summary ---\n\n${summary}\n\n`
    const footer = "Best regards,\nAI Meeting Summarizer"

    return greeting + customPart + summaryPart + footer
  }

  const handleSend = async () => {
    if (recipients.length === 0) {
      toast.error("Please add at least one recipient")
      return
    }

    if (!subject.trim()) {
      toast.error("Please enter a subject line")
      return
    }

    setIsSending(true)
    setSendProgress(0)

    try {
      // Save sender name and update recent recipients
      if (senderName) {
        localStorage.setItem("ai-meeting-sender-name", senderName)
      }

      const updatedRecent = [...new Set([...recipients, ...recentRecipients])].slice(0, 10)
      localStorage.setItem("ai-meeting-recent-recipients", JSON.stringify(updatedRecent))

      // Simulate progress
      const progressInterval = setInterval(() => {
        setSendProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      const emailContent = generateEmailContent()

      const result = await sendEmail({
        summary: emailContent,
        recipients,
        subject,
        senderName,
      })

      clearInterval(progressInterval)
      setSendProgress(100)

      if (result.success) {
        toast.success(`Summary sent to ${recipients.length} recipient${recipients.length > 1 ? "s" : ""}!`)
        setTimeout(() => {
          onComplete()
        }, 2000)
      } else {
        throw new Error(result.message || "Failed to send email")
      }
    } catch (error) {
      console.error("Send email error:", error)
      toast.error(error.message || "Failed to send email. Please try again.")
      setSendProgress(0)
    } finally {
      setIsSending(false)
    }
  }

  const EmailPreview = () => (
    <Dialog open={showPreview} onOpenChange={setShowPreview}>
      <DialogContent className="glass border-border/50 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading">Email Preview</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2 text-sm">
            <div>
              <strong>To:</strong> {recipients.join(", ")}
            </div>
            <div>
              <strong>Subject:</strong> {subject}
            </div>
            {senderName && (
              <div>
                <strong>From:</strong> {senderName}
              </div>
            )}
          </div>

          <div className="glass p-4 rounded-lg max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{generateEmailContent()}</pre>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold font-heading mb-2">Share Your Summary</h2>
        <p className="text-muted-foreground">Send your meeting summary via email to team members and stakeholders</p>
      </div>

      {/* Email Configuration */}
      <Card className="glass p-6">
        <div className="space-y-6">
          {/* Recipients Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-medium">Recipients</Label>
              <Badge variant="secondary" className="glass">
                <Users className="w-3 h-3 mr-1" />
                {recipients.length}
              </Badge>
            </div>

            {/* Add Recipients Input */}
            <div className="flex space-x-2">
              <Input
                value={currentEmail}
                onChange={(e) => setCurrentEmail(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Enter email address..."
                className="glass"
                type="email"
              />
              <Button onClick={addRecipient} disabled={!currentEmail.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Recipients List */}
            <AnimatePresence>
              {recipients.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2"
                >
                  <div className="flex flex-wrap gap-2">
                    {recipients.map((email, index) => (
                      <motion.div
                        key={email}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <Badge
                          variant="secondary"
                          className={cn(
                            "flex items-center space-x-2 px-3 py-1 glass",
                            validationResults[email] === false && "border-destructive/50",
                          )}
                        >
                          <span>{email}</span>
                          {validationResults[email] === true && <Check className="w-3 h-3 text-green-500" />}
                          {validationResults[email] === false && <AlertCircle className="w-3 h-3 text-destructive" />}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeRecipient(email)}
                            className="h-auto p-0 hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Recent Recipients */}
            {recentRecipients.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm text-muted-foreground">Recent Recipients</Label>
                <div className="flex flex-wrap gap-1">
                  {recentRecipients.slice(0, 5).map((email) => (
                    <Button
                      key={email}
                      variant="ghost"
                      size="sm"
                      onClick={() => addFromRecent(email)}
                      disabled={recipients.includes(email)}
                      className="h-auto px-2 py-1 text-xs glass bg-transparent"
                    >
                      {email}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Email Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject Line</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Meeting Summary - [Date]"
                className="glass"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sender">Your Name (Optional)</Label>
              <Input
                id="sender"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Your name"
                className="glass"
              />
            </div>
          </div>

          {/* Custom Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Custom Message (Optional)</Label>
            <Textarea
              id="message"
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Add a personal message to include with the summary..."
              className="glass min-h-[80px]"
            />
          </div>

          {/* Preview and Send */}
          <div className="flex items-center justify-between pt-4 border-t border-border/50">
            <Button
              variant="outline"
              onClick={() => setShowPreview(true)}
              disabled={recipients.length === 0}
              className="glass bg-transparent"
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview Email
            </Button>

            <div className="flex items-center space-x-2">
              <Button
                onClick={handleSend}
                disabled={recipients.length === 0 || !subject.trim() || isSending}
                className="px-6"
              >
                {isSending ? (
                  <>
                    <Clock className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Summary
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Sending Progress */}
          <AnimatePresence>
            {isSending && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Sending to {recipients.length} recipient{recipients.length > 1 ? "s" : ""}...
                  </span>
                  <span className="font-medium">{sendProgress}%</span>
                </div>
                <Progress value={sendProgress} className="h-2" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>

      {/* Summary Preview */}
      <Card className="glass p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Summary to be Sent</h3>
          <Badge variant="outline" className="glass">
            {summary.split(" ").filter((w) => w.length > 0).length} words
          </Badge>
        </div>
        <div className="glass p-4 rounded-lg max-h-48 overflow-y-auto">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-muted-foreground">
            {summary.slice(0, 300)}
            {summary.length > 300 && "..."}
          </pre>
        </div>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} className="glass bg-transparent">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Edit
        </Button>

        <Button variant="outline" onClick={onComplete} className="glass bg-transparent">
          <Sparkles className="w-4 h-4 mr-2" />
          Start New Summary
        </Button>
      </div>

      <EmailPreview />
    </motion.div>
  )
}
