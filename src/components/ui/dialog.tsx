import * as React from "react"

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black/50" 
            onClick={() => onOpenChange?.(false)}
          />
          <div className="relative z-50 bg-background p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
            {children}
          </div>
        </div>
      )}
    </>
  )
}

const DialogTrigger: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({ children, onClick }) => {
  return (
    <div onClick={onClick}>
      {children}
    </div>
  )
}

const DialogContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

const DialogHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="mb-4">
      {children}
    </div>
  )
}

const DialogTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <h2 className="text-lg font-semibold">
      {children}
    </h2>
  )
}

const DialogFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex justify-end gap-2 mt-4">
      {children}
    </div>
  )
}

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter }
