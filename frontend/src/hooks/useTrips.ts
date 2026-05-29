import { useState, useEffect, useCallback } from "react";
import { useAuthContext } from "../context/AuthContext.tsx";
import type { Group, Member } from "../types/dashboard.types.ts";

export type { Group, Member };

export const useTrips = () => {
  const { token } = useAuthContext();

  const [trips, setTrips] = useState<Group[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<number | null>(() => {
    const stored = localStorage.getItem("activeGroupId");
    return stored ? Number(stored) : null;
  });
  const [activeGroupName, setActiveGroupName] = useState<string>(() => {
    return localStorage.getItem("activeGroupName") || "";
  });

  const [members, setMembers] = useState<Member[]>([]);
  const [searchResults, setSearchResults] = useState<Member[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [inviteError, setInviteError] = useState("");

  // Cargar viajes del usuario
  const loadTrips = useCallback(async () => {
    if (!token) return;
    try {
      const response = await fetch("/api/trips", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data: Group[] = await response.json();
        setTrips(data);
      }
    } catch (err) {
      console.error("Error al cargar viajes:", err);
    }
  }, [token]);

  useEffect(() => {
    loadTrips();
  }, [loadTrips]);

  // Cargar miembros del grupo activo
  const loadMembers = useCallback(async (groupId: number) => {
    if (!token) return;
    try {
      const response = await fetch(`/api/trips/${groupId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        const memberList = data.groupMembers
          .map((m: { user: Member }) => m.user)
          .filter(Boolean) as Member[];
        setMembers(memberList);
      }
    } catch (err) {
      console.error("Error al cargar miembros:", err);
    }
  }, [token]);

  useEffect(() => {
    if (activeGroupId) {
      loadMembers(activeGroupId);
    } else {
      setMembers([]);
    }
  }, [activeGroupId, loadMembers]);

  const selectTrip = (trip: Group) => {
    setActiveGroupId(trip.group_id);
    setActiveGroupName(trip.group_name);
    localStorage.setItem("activeGroupId", String(trip.group_id));
    localStorage.setItem("activeGroupName", trip.group_name);
    setInviteSuccess("");
    setInviteError("");
  };

  const createTrip = async (
    group_name: string,
    trip_starts: string,
    trip_ends: string
  ): Promise<boolean> => {
    if (!token) {
      setError("Debes iniciar sesión para crear un grupo");
      return false;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/trips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ group_name, trip_starts, trip_ends }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Error al crear el grupo");
        return false;
      }
      await loadTrips();
      if (data.group) selectTrip(data.group);
      return true;
    } catch {
      setError("No se pudo conectar con el servidor backend");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const searchUsers = async (query: string) => {
    if (query.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await fetch(
        `/api/users/search?query=${encodeURIComponent(query)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.ok) {
        const data: Member[] = await response.json();
        setSearchResults(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const clearSearchResults = () => setSearchResults([]);

  const inviteMember = async (targetUser: Member) => {
    if (!activeGroupId || !token) return;
    setInviteLoading(true);
    setInviteSuccess("");
    setInviteError("");
    try {
      const response = await fetch(`/api/trips/${activeGroupId}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: targetUser.user_id }),
      });
      const data = await response.json();
      if (!response.ok) {
        setInviteError(data.error || "Error al invitar al usuario");
        return;
      }
      setInviteSuccess(`¡${targetUser.user_name} se ha añadido al viaje!`);
      clearSearchResults();
      await loadMembers(activeGroupId);
    } catch {
      setInviteError("Error al conectar con el servidor");
    } finally {
      setInviteLoading(false);
    }
  };

  return {
    trips,
    activeGroupId,
    activeGroupName,
    members,
    searchResults,
    loading,
    error,
    inviteLoading,
    inviteSuccess,
    inviteError,
    selectTrip,
    createTrip,
    searchUsers,
    clearSearchResults,
    inviteMember,
    setError,
  };
};
