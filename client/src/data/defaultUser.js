import { images } from "../assets";
import { convertNames2Objects } from "../util/skillsConversion";

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

  street: "Keizersgracht",
  house_number: 123,
  city: "Amsterdam",
  country: "Netherlands",
  skills: convertNames2Objects(defaultSkillNames).sort((a, b) =>
    a.normalizedSkill.localeCompare(b.normalizedSkill),
  ),
  favorites: [],
};
