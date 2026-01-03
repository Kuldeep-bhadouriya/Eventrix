import { NextRequest } from 'next/server';
import { z } from 'zod';
import {
  successResponse,
  errorResponse,
  validateBody,
  rateLimit,
  ApiError,
  apiLogger,
} from '@/lib/api';

// Contact form validation schema
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

type ContactFormData = z.infer<typeof contactSchema>;

// Rate limiter for contact form (5 requests per 15 minutes)
const contactRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many contact form submissions. Please try again later.',
});

/**
 * POST /api/contact
 * Handle contact form submissions
 */
export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();
  const log = apiLogger()(request, requestId);

  try {
    // Apply rate limiting
    await contactRateLimit(request);

    // Validate request body
    const body = await validateBody(request, contactSchema);

    // Log the contact form submission
    log.info('Contact form submitted', {
      email: body.email,
      subject: body.subject,
    });

    // Process the contact form
    await processContactForm(body);

    const response = successResponse({
      message: 'Thank you for contacting us! We will get back to you soon.',
    });
    
    log.success(response);
    return response;
  } catch (error) {
    log.error(error);
    return errorResponse(error, requestId);
  }
}

/**
 * Process contact form data
 * In production, this would handle email sending and database storage
 */
async function processContactForm(data: ContactFormData): Promise<void> {
  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 500));

  // TODO: Implement actual email sending logic
  // Example using nodemailer (if configured):
  /*
  const nodemailer = require('nodemailer');
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Send email to support team
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: 'support@eventrix.com',
    subject: `New Contact Form: ${data.subject}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Subject:</strong> ${data.subject}</p>
      <p><strong>Message:</strong></p>
      <p>${data.message}</p>
    `,
  });

  // Send confirmation email to user
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: data.email,
    subject: 'We received your message - Eventrix',
    html: `
      <h2>Thank you for contacting us!</h2>
      <p>Hi ${data.name},</p>
      <p>We have received your message and will get back to you as soon as possible.</p>
      <p><strong>Your message:</strong></p>
      <p>${data.message}</p>
      <hr />
      <p>Best regards,<br />The Eventrix Team</p>
    `,
  });
  */

  // TODO: Save to database
  // Example using Prisma:
  /*
  const prisma = new PrismaClient();
  await prisma.contactMessage.create({
    data: {
      name: data.name,
      email: data.email,
      subject: data.subject,
      message: data.message,
      status: 'NEW',
    },
  });
  */

  console.log('Contact form processed successfully:', data.email);
}

/**
 * Handle other HTTP methods
 */
export async function GET() {
  return errorResponse(
    new ApiError('Method not allowed', 405, 'METHOD_NOT_ALLOWED')
  );
}

export async function PUT() {
  return errorResponse(
    new ApiError('Method not allowed', 405, 'METHOD_NOT_ALLOWED')
  );
}

export async function DELETE() {
  return errorResponse(
    new ApiError('Method not allowed', 405, 'METHOD_NOT_ALLOWED')
  );
}

export async function PATCH() {
  return errorResponse(
    new ApiError('Method not allowed', 405, 'METHOD_NOT_ALLOWED')
  );
}
