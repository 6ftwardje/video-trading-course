'use client'

import { useMemo } from 'react'
import DOMPurify from 'dompurify'
import { marked } from 'marked'

interface MarkdownRendererProps {
  content: string
}

// Configure marked once
marked.setOptions({
  breaks: true, // Enable line breaks
})

// Create custom renderer using marked v17 API
const renderer = {
  code({ text }: { text: string }) {
    // Return plain text without code formatting
    return text || ''
  },
  link({ href, title, tokens }: { href: string; title?: string | null; tokens: any[] }) {
    if (!href) {
      // Render tokens as plain text if no href
      return tokens.map((t: any) => t.text || '').join('')
    }
    // Only allow http/https URLs for security
    try {
      // Try to parse as absolute URL first
      let url: URL
      try {
        url = new URL(href)
      } catch {
        // If relative URL, return plain text for security
        return tokens.map((t: any) => t.text || '').join('')
      }
      // Only allow http and https protocols
      if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        return tokens.map((t: any) => t.text || '').join('')
      }
      // Get link text from tokens
      const linkText = tokens.map((t: any) => t.text || '').join('') || href
      return `<a href="${url.toString()}" target="_blank" rel="noopener noreferrer">${linkText}</a>`
    } catch {
      // If invalid URL, return plain text
      return tokens.map((t: any) => t.text || '').join('')
    }
  },
}

// Apply renderer to marked
marked.use({ renderer })

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const sanitizedHtml = useMemo(() => {
    if (!content) return ''

    // Convert markdown to HTML
    const html = marked.parse(content) as string

    // Sanitize HTML with strict allowlist
    const clean = DOMPurify.sanitize(html, {
      USE_PROFILES: { html: true },
      ALLOWED_TAGS: ['p', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'br'],
      ALLOWED_ATTR: ['href', 'target', 'rel'],
      FORBID_TAGS: ['script', 'style', 'iframe', 'img', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
      FORBID_ATTR: ['onerror', 'onload', 'onclick', 'style'],
    })

    return clean
  }, [content])

  return (
    <div
      className="prose prose-invert max-w-full
        [&_p]:mb-3 [&_p]:text-[var(--text-dim)]
        [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3
        [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3
        [&_li]:mb-1
        [&_a]:text-blue-500 [&_a]:underline [&_a]:hover:opacity-80
        [&_strong]:font-semibold [&_strong]:text-white
        [&_em]:italic
        [&_br]:block"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  )
}

