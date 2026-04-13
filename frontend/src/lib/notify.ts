import { toast } from 'sonner'

type NotifyAction = {
  label: string
  onClick: () => void
}

export function notifySuccess(message: string) {
  toast.success(message)
}

export function notifySuccessWithAction(message: string, action: NotifyAction) {
  toast.success(message, {
    action,
  })
}

export function notifyError(message: string) {
  toast.error(message)
}

export function notifyInfo(message: string) {
  toast(message)
}
