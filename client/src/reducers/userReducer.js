import { defaultUser } from "../data/defaultUser";

export default function userReducer(state, action) {
  switch (action.type) {
    case "REGISTER":
    case "LOGIN":
      return { ...defaultUser, ...action.payload };
    case "UPDATE_USER": {
      return { ...state, ...action.payload };
    }
    case "LOGOUT":
      return defaultUser;
    case "SET_SKILLS": {
      return { ...state, skills: action.payload };
    }
    case "TOGGLE_FAVORITE": {
      return { ...state, favorites: action.payload };
    }
    default:
      return state;
  }
}
