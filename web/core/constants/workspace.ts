import { EUserPermissions } from "@/plane-web/constants/user-permissions";

export const ROLE = {
  [EUserPermissions.GUEST]: "Guest",
  [EUserPermissions.MEMBER]: "Member",
  [EUserPermissions.ADMIN]: "Admin",
};

export const ROLE_DETAILS = {
  [EUserPermissions.GUEST]: {
    title: "Guest",
    description: "External members of organizations can be invited as guests.",
  },
  [EUserPermissions.MEMBER]: {
    title: "Member",
    description: "Ability to read, write, edit, and delete entities inside projects, cycles, and modules",
  },
  [EUserPermissions.ADMIN]: {
    title: "Admin",
    description: "All permissions set to true within the workspace.",
  },
};

export const ORGANIZATION_SIZE = ["Just myself", "2-10", "11-50", "51-200", "201-500", "500+"];

export const RESTRICTED_URLS = [
  "404",
  "accounts",
  "api",
  "create-workspace",
  "error",
  "god-mode",
  "installations",
  "invitations",
  "onboarding",
  "profile",
  "spaces",
  "workspace-invitations",
];

export const USER_ROLES = [
  { value: "Product / Project Manager", label: "Product / Project Manager" },
  { value: "Development / Engineering", label: "Development / Engineering" },
  { value: "Founder / Executive", label: "Founder / Executive" },
  { value: "Freelancer / Consultant", label: "Freelancer / Consultant" },
  { value: "Marketing / Growth", label: "Marketing / Growth" },
  { value: "Sales / Business Development", label: "Sales / Business Development" },
  { value: "Support / Operations", label: "Support / Operations" },
  { value: "Student / Professor", label: "Student / Professor" },
  { value: "Human Resources", label: "Human Resources" },
  { value: "Other", label: "Other" },
];
