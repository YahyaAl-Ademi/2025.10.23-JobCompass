import { images } from "../assets";
import regexEndNormalizeSkill from "../util/regexEndNormalizeSkill";

export function formatAddress(user) {
  const streetParts = [];
  if (user?.street) streetParts.push(user.street);
  if (user?.house_number) streetParts.push(user.house_number);
  if (user?.city) streetParts.push(user.city);

  const addressParts = [streetParts.join(" ")];
  if (user?.country) addressParts.push(user.country);
  return addressParts.join(", ");
}

// list of default skill display names
const defaultSkillNames = [
  "Adaptability",
  "Active listening",
  "Attention to detail",
  "Collaboration",
  "Communication",
  "Conflict resolution",
  "Creativity",
  "Critical thinking",
  "Customer Service",
  "Data analysis",
  "Decision making",
  "Digital literacy",
  "Emotional Intelligence",
  "Goal setting",
  "Initiative",
  "Leadership",
  "Negotiation",
  "Problem-solving",
  "Project management",
  "Public speaking",
  "Risk management",
  "Strategic thinking",
  "Teamwork",
  "Technical literacy",
];

export const defaultUser = {
  first_name: "Guest",
  last_name: "User",
  avatar: images.defaultAvatar,
  email: "guest@example.com",

  street: "Keizersgracht",
  house_number: 123,
  city: "Amsterdam",
  country: "Netherlands",
  skills: defaultSkillNames
    .map((skill) => regexEndNormalizeSkill(skill))
    .sort((a, b) => a.normalizedSkill.localeCompare(b.normalizedSkill)),
  favorites: [],
};
