import { useContext } from "react";
import { ProfilesContext } from "./profiles-data-access";

export function useProfiles() {
  return useContext(ProfilesContext);
}
