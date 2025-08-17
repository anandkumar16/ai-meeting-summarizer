"use client"

import axios from "axios"

const api = axios.create({
  baseURL: "https://ai-meeting-summarizer-luix.onrender.com/api",
  timeout: 30000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log("[v0] API Request:", config.method?.toUpperCase(), config.url)
    return config
  },
  (error) => {
    console.error("[v0] API Request Error:", error)
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log("[v0] API Response:", response.status, response.config.url)
    return response
  },
  (error) => {
    console.error("[v0] API Response Error:", error.response?.status, error.message)

    if (error.code === "ECONNABORTED") {
      throw new Error("Request timeout. Please try again.")
    }

    if (!error.response) {
      throw new Error("Network error. Please check your connection.")
    }

    const { status, data } = error.response
    switch (status) {
      case 400:
        throw new Error(data?.message || "Invalid request. Please check your input.")
      case 429:
        throw new Error("Too many requests. Please wait a moment and try again.")
      case 500:
        throw new Error("Server error. Please try again later.")
      case 503:
        throw new Error("Service temporarily unavailable. Please try again later.")
      default:
        throw new Error(data?.message || "An unexpected error occurred.")
    }
  },
)



// API Functions
export const generateSummary = async ({ transcript, prompt }) => {
  try {
    const response = await api.post("/summarize", {
      transcript,
      prompt,
    })

    return {
      success: true,
      summary: response.data.summary,
      metadata: response.data.metadata,
    }
  } catch (error) {
    console.error("[v0] Generate Summary Error:", error)
    return {
      success: false,
      message: error.message,
    }
  }
}

export const sendEmail = async ({ summary, recipients, subject, senderName }) => {
  try {
    const response = await api.post("/send-email", {
      summary,
      recipients,
      subject,
      senderName,
    })

    return {
      success: true,
      message: response.data.message,
      metadata: response.data.metadata,
    }
  } catch (error) {
    console.error("[v0] Send Email Error:", error)
    return {
      success: false,
      message: error.message,
    }
  }
}

export const validateEmails = async (recipients) => {
  try {
    const response = await api.post("/validate-email", {
      recipients,
    })

    return {
      success: true,
      validEmails: response.data.validEmails,
      totalCount: response.data.totalCount,
    }
  } catch (error) {
    console.error("[v0] Validate Emails Error:", error)
    return {
      success: false,
      message: error.message,
    }
  }
}

// Retry mechanism for failed requests
export const withRetry = async (apiCall, maxRetries = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall()
    } catch (error) {
      console.log(`[v0] API attempt ${attempt} failed:`, error.message)

      if (attempt === maxRetries) {
        throw error
      }

      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt - 1)))
    }
  }
}
