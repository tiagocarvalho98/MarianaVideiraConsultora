import { cookies } from "next/headers";
import { mockProfiles } from "@/data/mock/profiles";
import type { Profile } from "@/types/crm";
import { mockAuthUsers } from "./mock-users";

const mockSessionCookie = "mariana_mock_session";

export async function getMockSessionProfile(): Promise<Profile | null> {
  const cookieStore = await cookies();
  const profileId = cookieStore.get(mockSessionCookie)?.value;

  if (!profileId) {
    return null;
  }

  return (
    mockProfiles.find((profile) => profile.id === profileId && profile.isActive) ??
    null
  );
}

export async function signInWithMockCredentials(
  email: string,
  password: string,
): Promise<Profile | null> {
  const normalizedEmail = email.trim().toLowerCase();
  const user = mockAuthUsers.find(
    (candidate) =>
      candidate.email === normalizedEmail && candidate.password === password,
  );

  if (!user) {
    return null;
  }

  const profile =
    mockProfiles.find((candidate) => candidate.id === user.profileId) ?? null;

  if (!profile?.isActive) {
    return null;
  }

  const cookieStore = await cookies();
  cookieStore.set(mockSessionCookie, profile.id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });

  return profile;
}

export async function signOutMockUser() {
  const cookieStore = await cookies();
  cookieStore.delete(mockSessionCookie);
}

export function isMockSessionCookie(name: string) {
  return name === mockSessionCookie;
}
