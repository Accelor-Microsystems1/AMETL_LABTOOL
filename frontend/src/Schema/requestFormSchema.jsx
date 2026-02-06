// Example schema with custom error messages
import { z } from "zod";

export const requestSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  companyAddress: z.string().min(1, "Company address is required"),
  contactPerson: z.string().min(1, "Contact person is required"),
  contactNumber: z
    .string()
    .min(10, "Contact number must be 10 digits")
    .max(10, "Contact number must be 10 digits")
    .regex(/^\d+$/, "Only numbers allowed"),
  customerEmail: z.string().email("Invalid email address"),
  uutName: z.string().min(1, "Unit name is required"),
  noOfUUT: z.string().min(1, "Number of UUT is required"),
  dimension: z.string().min(1, "Dimension is required"),
  weight: z.string().min(1, "Weight is required"),
  uutSerialNo: z.string().min(1, "UUT Serial No is required"),
  repeatTest: z.string().min(1, "Please select an option"),
  previousRefNo: z.string().optional(),
  testLevel: z.string().min(1, "Test level is required"),
  otherTestLevel: z.string().optional(),
  testName: z.string().min(1, "Test name is required"),
  testSpecification: z.string().min(1, "Test specification is required"),
  testStandard: z.string().min(1, "Test standard is required"),
  specialRequirement: z.string().optional(),
  customerRepName: z.string().min(1, "Customer rep name is required"),
  customerRepDate: z.string().min(1, "Customer rep date is required"),
  qaRepName: z.string().min(1, "QA rep name is required"),
  qaRepDate: z.string().min(1, "QA date is required"),
});