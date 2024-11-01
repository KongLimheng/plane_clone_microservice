import * as React from 'react'

export const useOutsideClickDetector = (
  ref: React.RefObject<HTMLElement>,
  callback: () => void,
  useCapture = false
) => {
  const handleClick = (event: MouseEvent) => {
    if (ref.current && !ref.current.contains(event.target as any)) {
      const preventOutsideClickElement = (
        event.target as unknown as HTMLElement | undefined
      )?.closest('[data-prevent-outside-click]')

      if (preventOutsideClickElement) return

      callback()
    }
  }

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClick, useCapture)
    return () => {
      document.removeEventListener('mousedown', handleClick, useCapture)
    }
  })
}
