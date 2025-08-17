"use client"

import { useState, useEffect } from "react"

export function useEmailHistory() {
  const [recentRecipients, setRecentRecipients] = useState([])
  const [emailTemplates, setEmailTemplates] = useState([])

  useEffect(() => {
    // Load from localStorage
    const recent = localStorage.getItem("ai-meeting-recent-recipients")
    const templates = localStorage.getItem("ai-meeting-email-templates")

    if (recent) {
      setRecentRecipients(JSON.parse(recent))
    }

    if (templates) {
      setEmailTemplates(JSON.parse(templates))
    }
  }, [])

  const addRecentRecipient = (email) => {
    const updated = [email, ...recentRecipients.filter((r) => r !== email)].slice(0, 10)
    setRecentRecipients(updated)
    localStorage.setItem("ai-meeting-recent-recipients", JSON.stringify(updated))
  }

  const addRecentRecipients = (emails) => {
    const updated = [...emails, ...recentRecipients]
      .filter((email, index, arr) => arr.indexOf(email) === index)
      .slice(0, 10)
    setRecentRecipients(updated)
    localStorage.setItem("ai-meeting-recent-recipients", JSON.stringify(updated))
  }

  const saveEmailTemplate = (name, template) => {
    const updated = [...emailTemplates.filter((t) => t.name !== name), { name, template }]
    setEmailTemplates(updated)
    localStorage.setItem("ai-meeting-email-templates", JSON.stringify(updated))
  }

  const removeEmailTemplate = (name) => {
    const updated = emailTemplates.filter((t) => t.name !== name)
    setEmailTemplates(updated)
    localStorage.setItem("ai-meeting-email-templates", JSON.stringify(updated))
  }

  return {
    recentRecipients,
    emailTemplates,
    addRecentRecipient,
    addRecentRecipients,
    saveEmailTemplate,
    removeEmailTemplate,
  }
}
