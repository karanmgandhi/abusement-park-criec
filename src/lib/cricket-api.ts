export interface CricketMatchData {
  matchId: string;
  team1: string;
  team2: string;
  team1Score: string;
  team2Score: string;
  status: string;
  currentPhase: string;
  overs: number;
  wickets: number;
  currentBatsmen: string[];
  currentBowler: string;
  recentBalls: string[];
  tossWinner: string;
  tossDecision: string;
  result: string;
  boundaries: number;
  sixes: number;
}

export async function fetchLiveMatchData(
  _externalId: string
): Promise<CricketMatchData | null> {
  const apiKey = process.env.CRICKET_API_KEY;

  if (apiKey) {
    try {
      const res = await fetch(
        `https://api.cricapi.com/v1/match_info?apikey=${apiKey}&id=${_externalId}`,
        { next: { revalidate: 15 } }
      );
      if (res.ok) {
        const data = await res.json();
        if (data.status === "success" && data.data) {
          return mapCricApiData(data.data);
        }
      }
    } catch {
      // fall through to mock data
    }
  }

  return null;
}

function mapCricApiData(data: Record<string, unknown>): CricketMatchData {
  const score = data.score as Array<{ r: number; w: number; o: number; inning: string }> | undefined;
  return {
    matchId: data.id as string,
    team1: (data.teamInfo as Array<{ name: string }>)?.[0]?.name ?? "Team 1",
    team2: (data.teamInfo as Array<{ name: string }>)?.[1]?.name ?? "Team 2",
    team1Score: score?.[0] ? `${score[0].r}/${score[0].w} (${score[0].o} ov)` : "",
    team2Score: score?.[1] ? `${score[1].r}/${score[1].w} (${score[1].o} ov)` : "",
    status: data.matchStarted ? "live" : "upcoming",
    currentPhase: determinePhase(score?.[0]?.o ?? 0),
    overs: score?.[0]?.o ?? 0,
    wickets: score?.[0]?.w ?? 0,
    currentBatsmen: [],
    currentBowler: "",
    recentBalls: [],
    tossWinner: (data.tpiWinner as string) ?? "",
    tossDecision: "",
    result: (data.status as string) ?? "",
    boundaries: 0,
    sixes: 0,
  };
}

function determinePhase(overs: number): string {
  if (overs === 0) return "pre_match";
  if (overs <= 6) return "powerplay";
  if (overs <= 15) return "middle";
  if (overs <= 20) return "death";
  return "innings_break";
}

export function generateMockLiveData(
  team1: string,
  team2: string,
  phase: string
): CricketMatchData {
  const phaseOvers: Record<string, number> = {
    pre_match: 0,
    powerplay: Math.floor(Math.random() * 6) + 1,
    middle: Math.floor(Math.random() * 9) + 7,
    death: Math.floor(Math.random() * 5) + 16,
    innings_break: 20,
    second_innings: Math.floor(Math.random() * 20) + 1,
    completed: 20,
  };

  const overs = phaseOvers[phase] ?? 0;
  const runRate = 7 + Math.random() * 4;
  const runs = Math.round(overs * runRate);
  const wickets = Math.min(Math.floor(Math.random() * (overs / 3)), 10);

  return {
    matchId: "mock-1",
    team1,
    team2,
    team1Score:
      phase !== "pre_match" ? `${runs}/${wickets} (${overs}.0 ov)` : "",
    team2Score: phase === "completed" ? `${runs + (Math.random() > 0.5 ? 5 : -10)}/${wickets}` : "",
    status: phase === "completed" ? "completed" : phase === "pre_match" ? "upcoming" : "live",
    currentPhase: phase,
    overs,
    wickets,
    currentBatsmen: ["V. Kohli", "R. Sharma"],
    currentBowler: "A. Russell",
    recentBalls: ["1", "4", "0", "6", "1", "W"],
    tossWinner: Math.random() > 0.5 ? team1 : team2,
    tossDecision: Math.random() > 0.5 ? "bat" : "bowl",
    result: phase === "completed" ? `${team1} won by 5 wickets` : "",
    boundaries: Math.floor(runs / 8),
    sixes: Math.floor(runs / 15),
  };
}
