// src/data/ideas/schema.ts

// Types
export type Category = "bug" | "feature" | "improvement" | "question";
export type TicketType = "support" | "billing" | "technical" | "other";
export type PolicyType = "standard" | "premium" | "enterprise";
export type Priority = "low" | "medium" | "high" | "critical";

// Data arrays
export const categoryTypes = [
  { value: "bug" as Category, name: "Bug", description: "Something isn't working" },
  { value: "feature" as Category, name: "Feature", description: "Suggest a new feature" },
  { value: "improvement" as Category, name: "Improvement", description: "Enhance existing functionality" },
  { value: "question" as Category, name: "Question", description: "Need clarification" },
];

export const ticketTypes = [
  { value: "support" as TicketType, name: "Support", extended: "General assistance" },
  { value: "billing" as TicketType, name: "Billing", extended: "Payment or invoice issues" },
  { value: "technical" as TicketType, name: "Technical", extended: "System or integration problems" },
  { value: "other" as TicketType, name: "Other", extended: "Doesn't fit other categories" },
];

export const policyTypes = [
  { value: "standard" as PolicyType, name: "Standard", description: "Basic support policy" },
  { value: "premium" as PolicyType, name: "Premium", description: "Priority response SLA" },
  { value: "enterprise" as PolicyType, name: "Enterprise", description: "Dedicated support team" },
];

export const priorities = [
  { 
    value: "low" as Priority, 
    label: "Low", 
    sla: "72 hours", 
    description: "Non-urgent issues" 
  },
  { 
    value: "medium" as Priority, 
    label: "Medium", 
    sla: "24 hours", 
    description: "Moderate impact" 
  },
  { 
    value: "high" as Priority, 
    label: "High", 
    sla: "4 hours", 
    description: "Significant business impact" 
  },
  { 
    value: "critical" as Priority, 
    label: "Critical", 
    sla: "1 hour", 
    description: "System down or major outage" 
  },
];

// Optional: Ticket interface
export interface Ticket {
  id?: string;
  status: "in-progress" | "resolved" | "closed";
  category: Category;
  type: TicketType;
  policyType: PolicyType;
  priority: Priority;
  description: string;
  policyNumber?: string;
  duration?: string;
  created: string;
}