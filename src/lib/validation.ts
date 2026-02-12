import { z } from "zod";
import { Contact } from "@/types/contact";

// Schema for contact validation
const ContactTypeEnum = z.enum(["company", "individual"]);
const LogActionEnum = z.enum(["create", "update", "submit"]);

export const ContactSchema = z.object({
  id: z.string().min(1, "ID is required"),
  type: ContactTypeEnum,
  name: z.string().min(1, "Name is required"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  companyName: z.string().optional(),
  email: z.string().email("Invalid email format").min(1, "Email is required"),
  addressLine1: z.string().min(1, "Address line 1 is required"),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Country is required"),
});

// Schema for API log request validation
export const LogRequestSchema = z.object({
  action: LogActionEnum,
  field: z.string().optional(),
  payload: z.any().optional(),
});

// Type-safe validation function
export function validateContact(contact: unknown): Contact {
  return ContactSchema.parse(contact);
}

// Type-safe validation function for log requests
export function validateLogRequest(body: unknown) {
  return LogRequestSchema.parse(body);
}
