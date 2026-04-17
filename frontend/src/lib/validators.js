import { z } from "zod";

const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;

const emergencyRideSchema = z.object({
  firstName: z.string().trim().min(2, "First name is required."),
  lastName: z.string().trim().min(2, "Last name is required."),
  phone: z.string().trim().min(7, "Phone number is required.").regex(phoneRegex, "Enter a valid phone number."),
  email: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .refine((value) => !value || z.string().email().safeParse(value).success, "Enter a valid email."),
  tripType: z.enum(["one-way", "round-trip", "multi-stop"]),
  mobilityType: z.enum(["ambulatory", "wheelchair", "stretcher", "bariatric", "other"]),
});

const authSchema = z.object({
  name: z.string().trim().min(2, "Name is required.").optional(),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z
    .string()
    .trim()
    .min(7, "Phone number is required.")
    .regex(phoneRegex, "Enter a valid phone number.")
    .optional(),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

const rideRequestSchema = z.object({
  tripType: z.enum(["one-way", "round-trip", "multi-stop"]),
  mobilityType: z.enum(["ambulatory", "wheelchair", "stretcher", "bariatric", "other"]),
  pickupLocation: z.string().trim().min(3, "Pickup location is required."),
  dropoffLocation: z.string().trim().min(3, "Drop-off location is required."),
  dateTime: z.string().min(1, "Date and time are required."),
  notes: z.string().max(1000, "Notes cannot exceed 1000 characters.").optional(),
});

const profileSchema = z.object({
  name: z.string().trim().min(2, "Name is required."),
  phone: z.string().trim().min(7, "Phone is required.").regex(phoneRegex, "Enter a valid phone number."),
});

export { authSchema, emergencyRideSchema, profileSchema, rideRequestSchema };
