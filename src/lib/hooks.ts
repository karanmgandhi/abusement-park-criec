import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export function useUser() {
  const { data, error, mutate } = useSWR("/api/user", fetcher);
  return {
    user: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useGroups() {
  const { data, error, mutate } = useSWR("/api/groups", fetcher);
  return {
    groups: data || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useMatches(groupId: string | null) {
  const { data, error, mutate } = useSWR(
    groupId ? `/api/matches?groupId=${groupId}` : null,
    fetcher,
    { refreshInterval: 15000 }
  );
  return {
    matches: data || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useMatch(matchId: string | null) {
  const { data, error, mutate } = useSWR(
    matchId ? `/api/matches/${matchId}` : null,
    fetcher,
    { refreshInterval: 10000 }
  );
  return {
    match: data,
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useLeaderboard(groupId: string | null) {
  const { data, error, mutate } = useSWR(
    groupId ? `/api/leaderboard?groupId=${groupId}` : null,
    fetcher,
    { refreshInterval: 15000 }
  );
  return {
    leaderboard: data || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useBets(matchId?: string) {
  const { data, error, mutate } = useSWR(
    matchId ? `/api/bets?matchId=${matchId}` : "/api/bets",
    fetcher
  );
  return {
    bets: data || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}

export function useChat(groupId: string | null) {
  const { data, error, mutate } = useSWR(
    groupId ? `/api/chat?groupId=${groupId}` : null,
    fetcher,
    { refreshInterval: 5000 }
  );
  return {
    messages: data || [],
    isLoading: !error && !data,
    isError: error,
    mutate,
  };
}
