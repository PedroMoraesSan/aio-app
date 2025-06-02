"use client"

import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'

interface VirtualMessageListProps {
  messages: any[]
  renderMessage: (message: any, index: number) => React.ReactNode
  itemHeight?: number
  containerHeight?: number
  overscan?: number
}

export function VirtualMessageList({
  messages,
  renderMessage,
  itemHeight = 100,
  containerHeight = 600,
  overscan = 3
}: VirtualMessageListProps) {
  const [scrollTop, setScrollTop] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)

  // Calcular itens visíveis
  const visibleRange = useMemo(() => {
    const start = Math.floor(scrollTop / itemHeight)
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) + overscan * 2,
      messages.length
    )
    
    return {
      start: Math.max(0, start - overscan),
      end
    }
  }, [scrollTop, itemHeight, containerHeight, messages.length, overscan])

  // Items visíveis
  const visibleItems = useMemo(() => {
    return messages.slice(visibleRange.start, visibleRange.end).map((message, index) => ({
      message,
      index: visibleRange.start + index,
      style: {
        position: 'absolute' as const,
        top: (visibleRange.start + index) * itemHeight,
        left: 0,
        right: 0,
        height: itemHeight,
      }
    }))
  }, [messages, visibleRange, itemHeight])

  // Handle scroll
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  // Auto scroll para nova mensagem
  useEffect(() => {
    if (containerRef.current && messages.length > 0) {
      const isAtBottom = scrollTop + containerHeight >= (messages.length * itemHeight) - 50
      
      if (isAtBottom) {
        containerRef.current.scrollTop = messages.length * itemHeight
      }
    }
  }, [messages.length, scrollTop, containerHeight, itemHeight])

  const totalHeight = messages.length * itemHeight

  return (
    <div
      ref={containerRef}
      className="chat-scroll overflow-auto"
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ message, index, style }) => (
          <div key={message.id || index} style={style}>
            {renderMessage(message, index)}
          </div>
        ))}
      </div>
    </div>
  )
} 