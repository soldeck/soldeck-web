import { atom, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { ReactNode, createContext } from "react";
import { v4 as uuidv4 } from "uuid";

const DATA_KEY_PROFILES = "soldeck:data:profiles";
const DATA_KEY_ACTIVE_PROFILE_ID = "soldeck:data:activeProfileId";

export type Profile = {
  id: string;
  name: string;
  walletAddresses: string[];
};

const profilesAtom = atomWithStorage<Profile[]>(DATA_KEY_PROFILES, []);
const activeProfileIdStoreAtom = atomWithStorage<string | null>(
  DATA_KEY_ACTIVE_PROFILE_ID,
  null
);
const activeProfileIdAtom = atom(
  (get) => {
    const profiles = get(profilesAtom);
    const activeProfileId = get(activeProfileIdStoreAtom);
    if (activeProfileId === null) {
      return profiles[0]?.id ?? null;
    }
    if (profiles.find((profile) => profile.id === activeProfileId)) {
      return activeProfileId;
    } else {
      return profiles[0]?.id ?? null;
    }
  },
  (_, set, activeProfileId: string | null) => {
    set(activeProfileIdStoreAtom, activeProfileId);
  }
);

export interface ProfilesContextType {
  profiles: Profile[];
  setProfiles: (profiles: Profile[]) => void;
  activeProfileId: string | null;
  setActiveProfileId: (id: string) => void;
  cloneProfile: (profile: Profile) => Profile;
  buildNewProfile: () => Profile;
  saveNewProfile: (profile: Profile) => void;
  getProfile: (id: string) => Profile | null;
  getActiveProfile(): Profile | null;
  updateProfile: (profile: Profile) => void;
  deleteProfile: (id: string) => void;
}

export const ProfilesContext = createContext<ProfilesContextType>(
  {} as ProfilesContextType
);

export function ProfilesProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useAtom(profilesAtom);
  const [activeProfileId, setActiveProfileId] = useAtom(activeProfileIdAtom);

  const context: ProfilesContextType = {
    profiles,
    setProfiles,
    activeProfileId,
    setActiveProfileId,
    cloneProfile: (profile: Profile): Profile => {
      return {
        id: profile.id,
        name: profile.name,
        walletAddresses: [...profile.walletAddresses],
      };
    },
    buildNewProfile: () => {
      const profile: Profile = {
        id: uuidv4(),
        name: "default",
        walletAddresses: [],
      };
      return profile;
    },
    saveNewProfile: (profile: Profile) => {
      setProfiles([...profiles, profile]);
    },
    getProfile: (id: string) => {
      const profile = profiles.find((value) => value.id === id) ?? null;
      if (profile) {
        return context.cloneProfile(profile);
      } else {
        return null;
      }
    },
    getActiveProfile: (): Profile | null => {
      if (activeProfileId === null) {
        return null;
      } else {
        return context.getProfile(activeProfileId);
      }
    },
    updateProfile: (profile: Profile): void => {
      const targetProfile = profiles.find((value) => value.id === profile.id);
      if (targetProfile) {
        targetProfile.name = profile.name;
        targetProfile.walletAddresses = profile.walletAddresses;
      }
      context.setProfiles(profiles);
    },
    deleteProfile: (id: string): void => {
      context.setProfiles(profiles.filter((value) => value.id !== id));
    },
  };

  return (
    <ProfilesContext.Provider value={context}>
      {children}
    </ProfilesContext.Provider>
  );
}
