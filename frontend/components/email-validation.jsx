"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Check, X, AlertCircle, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { validateEmails } from "@/services/api"

export function EmailValidation({ emails, onValidationComplete }) {
  const [validationStatus, setValidationStatus] = useState({})
  const [isValidating, setIsValidating] = useState(false)

  useEffect(() => {
    if (emails.length > 0) {
      validateEmailList(emails)
    }
  }, [emails])

  const validateEmailList = async (emailList) => {
    setIsValidating(true)

    try {
      const result = await validateEmails(emailList)

      if (result.success) {
        const status = {}
        emailList.forEach((email) => {
          status[email] = result.validEmails.includes(email)
        })
        setValidationStatus(status)
        onValidationComplete?.(status)
      }
    } catch (error) {
      console.error("Email validation error:", error)
      // Set all as unknown status on error
      const status = {}
      emailList.forEach((email) => {
        status[email] = null
      })
      setValidationStatus(status)
    } finally {
      setIsValidating(false)
    }
  }

  const getValidationIcon = (email) => {
    if (isValidating) {
      return <Loader2 className="w-3 h-3 animate-spin" />
    }

    const status = validationStatus[email]
    if (status === true) {
      return <Check className="w-3 h-3 text-green-500" />
    } else if (status === false) {
      return <X className="w-3 h-3 text-destructive" />
    } else {
      return <AlertCircle className="w-3 h-3 text-muted-foreground" />
    }
  }

  const getValidationMessage = () => {
    const validCount = Object.values(validationStatus).filter((status) => status === true).length
    const invalidCount = Object.values(validationStatus).filter((status) => status === false).length

    if (isValidating) {
      return "Validating email addresses..."
    }

    if (invalidCount > 0) {
      return `${validCount} valid, ${invalidCount} invalid email${invalidCount > 1 ? "s" : ""}`
    }

    return `All ${validCount} email${validCount > 1 ? "s" : ""} validated`
  }

  if (emails.length === 0) return null

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Email Validation</span>
        <Badge variant="secondary" className="glass text-xs">
          {getValidationMessage()}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-1">
        {emails.map((email) => (
          <motion.div
            key={email}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center space-x-1 text-xs"
          >
            {getValidationIcon(email)}
            <span className={validationStatus[email] === false ? "text-destructive" : ""}>{email}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
