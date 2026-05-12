/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Button, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'TaskTroopers'

interface QuoteReadyProps {
  fullName?: string
  serviceType?: string
  serviceDate?: string
  productService?: string
  description?: string
  subtotal?: string
  gst?: string
  total?: string
  adminNotes?: string
  portalUrl?: string
}

const CustomerQuoteReadyEmail = ({
  fullName,
  serviceType,
  serviceDate,
  productService,
  description,
  subtotal,
  gst,
  total,
  adminNotes,
  portalUrl,
}: QuoteReadyProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your {SITE_NAME} quote is ready</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Your quote is ready</Heading>
        <Text style={text}>
          Hi {fullName || 'there'}, thanks for choosing {SITE_NAME}. We've prepared
          a quote for your {serviceType || 'requested'} job.
        </Text>

        <Section style={card}>
          {productService ? (
            <Text style={rowText}><strong style={rowLabel}>Product / Service:</strong> {productService}</Text>
          ) : null}
          {serviceDate ? (
            <Text style={rowText}><strong style={rowLabel}>Service date:</strong> {serviceDate}</Text>
          ) : null}
          {description ? (
            <Text style={rowText}><strong style={rowLabel}>Description:</strong> {description}</Text>
          ) : null}
          {(productService || serviceDate || description) ? <Hr style={innerHr} /> : null}
          <Text style={rowText}><strong style={rowLabel}>Subtotal:</strong> {subtotal || '—'}</Text>
          <Text style={rowText}><strong style={rowLabel}>GST (10%):</strong> {gst || '—'}</Text>
          <Hr style={innerHr} />
          <Text style={totalText}><strong>Total inc. GST:</strong> {total || '—'}</Text>
        </Section>

        {adminNotes ? (
          <>
            <Heading as="h2" style={h2}>Notes from our team</Heading>
            <Text style={notes}>{adminNotes}</Text>
          </>
        ) : null}

        {portalUrl ? (
          <Section style={{ textAlign: 'center', margin: '24px 0' }}>
            <Button href={portalUrl} style={button}>Review &amp; approve quote</Button>
          </Section>
        ) : null}

        <Hr style={hr} />
        <Text style={footer}>
          Reply to this email if you have any questions — we're happy to help.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: CustomerQuoteReadyEmail,
  subject: (data: Record<string, any>) =>
    `Your ${SITE_NAME} quote${data?.total ? ` — ${data.total}` : ''}`,
  displayName: 'Customer quote ready',
  previewData: {
    fullName: 'Jane Smith',
    serviceType: 'garden',
    serviceDate: '15 June 2026',
    productService: 'Garden tidy + hedge trim',
    description: 'Trim two hedges along front fence, mow lawn and remove green waste.',
    subtotal: '$300.00',
    gst: '$30.00',
    total: '$330.00',
    adminNotes: 'Includes hedge trimming and green waste removal.',
    portalUrl: 'https://tasktroopers.com.au/dashboard',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '24px', maxWidth: '600px' }
const h1 = { fontSize: '24px', fontWeight: 'bold', color: '#0a0a0a', margin: '0 0 16px' }
const h2 = { fontSize: '16px', fontWeight: 'bold', color: '#0a0a0a', margin: '24px 0 8px' }
const text = { fontSize: '14px', color: '#444', lineHeight: '1.5', margin: '0 0 20px' }
const card = {
  backgroundColor: '#f6faf4',
  border: '1px solid #d8e8d0',
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '0 0 16px',
}
const rowText = { fontSize: '14px', color: '#222', margin: '6px 0', lineHeight: '1.5' }
const rowLabel = { color: '#16a34a' }
const totalText = { fontSize: '16px', color: '#0a0a0a', margin: '8px 0 0', lineHeight: '1.5' }
const innerHr = { borderColor: '#d8e8d0', margin: '12px 0' }
const notes = {
  fontSize: '14px', color: '#222', lineHeight: '1.6',
  whiteSpace: 'pre-wrap' as const,
  backgroundColor: '#fafafa', border: '1px solid #eee',
  borderRadius: '8px', padding: '12px 16px', margin: '0 0 16px',
}
const button = {
  backgroundColor: '#16a34a', color: '#ffffff', padding: '12px 24px',
  borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '14px',
}
const hr = { borderColor: '#eee', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#888', margin: '0' }
