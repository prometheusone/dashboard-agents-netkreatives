import { useState, useEffect, useCallback, useRef } from 'react'

export function useWebSocket(url: string) {
  const [connected, setConnected] = useState(false)
  const ws = useRef<WebSocket | null>(null)
  const reconnectTimeout = useRef<NodeJS.Timeout>()

  const connect = useCallback(() => {
    try {
      ws.current = new WebSocket(url)

      ws.current.onopen = () => {
        console.log('WebSocket connected')
        setConnected(true)
      }

      ws.current.onclose = () => {
        console.log('WebSocket disconnected')
        setConnected(false)
        
        // Auto-reconnect after 5 seconds
        reconnectTimeout.current = setTimeout(() => {
          console.log('Reconnecting...')
          connect()
        }, 5000)
      }

      ws.current.onerror = (error) => {
        console.error('WebSocket error:', error)
        setConnected(false)
      }

      ws.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          console.log('WebSocket message:', data)
          // Handle real-time updates here
          // Could trigger a data refresh or update state directly
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err)
        }
      }
    } catch (err) {
      console.error('Failed to connect WebSocket:', err)
      setConnected(false)
    }
  }, [url])

  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current)
      }
      if (ws.current) {
        ws.current.close()
      }
    }
  }, [connect])

  const sendMessage = useCallback((message: any) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message))
    } else {
      console.warn('WebSocket not connected')
    }
  }, [])

  return {
    connected,
    sendMessage
  }
}
