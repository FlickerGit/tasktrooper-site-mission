/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = 'TaskTroopers'

interface ContactMessageProps {
  fullName?: string
  email?: string
  message?: string
}

const ContactMessageNotificationEmail = ({
  fullName,
  email,
  message,
}: ContactMessageProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New contact message from {fullName ?? 'a visitor'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>New Contact Message</Heading>
        <Text style={text}>
          You've received a new message via the {SITE_NAME} website.
        </Text>

        <Section style={card}>
          <Text style={rowText}>
            <strong style={rowLabel}>Name:</strong> {fullName || '—'}
          </Text>
          <Text style={rowText}>
            <strong style={rowLabel}>Email:</strong> {email || '—'}
          </Text>
        </Section>

        <Heading as="h2" style={h2}>Message</Heading>
        <Text style={messageText}>{message}</Text>

        <Hr style={hr} />
        <Text style={footer}>
          Reply directly to {email ?? 'the sender'} to follow up.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ContactMessageNotificationEmail,
  subject: (data: Record<string, any>) =>
    `New contact message${data?.fullName ? ` from ${data.fullName}` : ''}`,
  displayName: 'Contact message notification',
  previewData: {
    fullName: 'Sam Walker',
    email: 'sam@example.com',
    message: 'Hi, I would like to get more info about your strata services.',
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
const messageText = {
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