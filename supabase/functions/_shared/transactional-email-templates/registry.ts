/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'

export interface TemplateEntry {
  component: React.ComponentType<any>
  subject: string | ((data: Record<string, any>) => string)
  to?: string
  displayName?: string
  previewData?: Record<string, any>
}

import { template as quoteRequestNotification } from './quote-request-notification.tsx'
import { template as contactMessageNotification } from './contact-message-notification.tsx'
import { template as customerQuoteReady } from './customer-quote-ready.tsx'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'quote-request-notification': quoteRequestNotification,
  'contact-message-notification': contactMessageNotification,
  'customer-quote-ready': customerQuoteReady,
}