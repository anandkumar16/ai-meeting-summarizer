"use client"

import { useState, useCallback } from "react"
import { generateSummary, sendEmail, validateEmails, withRetry } from "@/services/api"
import toast from "react-hot-toast"

export function useAPI() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const callAPI = useCallback(async (apiFunction, ...args) => {
    setLoading(true)
    setError(null)

    try {
      const result = await withRetry(() => apiFunction(...args))
      return result
    } catch (err) {
      setError(err.message)
      toast.error(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const generateSummaryWithRetry = useCallback((data) => callAPI(generateSummary, data), [callAPI])

  const sendEmailWithRetry = useCallback((data) => callAPI(sendEmail, data), [callAPI])

  const validateEmailsWithRetry = useCallback((recipients) => callAPI(validateEmails, recipients), [callAPI])

  return {
    loading,
    error,
    generateSummary: generateSummaryWithRetry,
    sendEmail: sendEmailWithRetry,
    validateEmails: validateEmailsWithRetry,
  }
}
