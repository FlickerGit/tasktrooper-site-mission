/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'TaskTroopers'

interface QuoteRequestProps {
  fullName?: string
  email?: string
  phone?: string
  address?: string
  serviceType?: string
  description?: string
  preferredDate?: string
}

const QuoteRequestNotificationEmail = ({
  fullName,
  email,
  phone,
  address,
  serviceType,
  description,
  preferredDate,
}: QuoteRequestProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New quote request from {fullName ?? 'a customer'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New Quote Request</Heading>
        <Text style={text}>
          You've received a new quote request via the {SITE_NAME} website.
        </Text>

        <Section style={card}>
          <Row label="Name" value={fullName} />
          <Row label="Email" value={email} />
          <Row label="Phone" value={phone} />
          <Row label="Property Address" value={address} />
          <Row label="Service Type" value={serviceType} />
          <Row label="Preferred Date" value={preferredDate || 'Not specified'} />
        </Section>

        <Heading as="h2" style={h2}>Job Description</Heading>
        <Text style={description_text}>{description}</Text>

        <Hr style={hr} />
        <Text style={footer}>
          Reply directly to {email ?? 'the customer'} to follow up.
        </Text>
      </Container>
    </Body>
  </Html>
)

const Row = ({ label, value }: { label: string; value?: string }) => (
  <Text style={rowText}>
    <strong style={rowLabel}>{label}:</strong> {value || '—'}
  </Text>
)

export const template = {
  component: QuoteRequestNotificationEmail,
  subject: (data: Record<string, any>) =>
    `New quote request${data?.fullName ? ` from ${data.fullName}` : ''}`,
  displayName: 'Quote request notification',
  previewData: {
    fullName: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+61 400 000 000',
    address: '12 Example St, Mosman NSW 2088',
    serviceType: 'garden',
    description: 'Hedge trimming and lawn mowing for a strata property.',
    preferredDate: '2026-06-01',
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
const description_text = {
  fontSize: '14px',
  color: '#222',
  lineHeight: '1.6',
  whiteSpace: 'pre-wrap' as const,
  backgroundColor: '#fafafa',
  border: '1px solid #eee',
  borderRadius: '8px',
  padding: '12px 16px',
  margin: '0 0 16px',
}
const hr = { borderColor: '#eee', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#888', margin: '0' }