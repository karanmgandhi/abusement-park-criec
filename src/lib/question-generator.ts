interface QuestionTemplate {
  text: string;
  type: "yes_no" | "multiple_choice" | "range";
  options: string[];
  weight: number;
  phase: string;
}

function substitute(text: string, team1: string, team2: string): string {
  return text.replace("{team1}", team1).replace("{team2}", team2);
}

const TEMPLATES: QuestionTemplate[] = [
  // Pre-match
  { text: "Will {team1} win the toss?", type: "yes_no", options: ["Yes", "No"], weight: 250, phase: "pre_match" },
  { text: "Toss winner will choose to?", type: "multiple_choice", options: ["Bat", "Bowl"], weight: 250, phase: "pre_match" },
  { text: "Will the 1st innings total be over 170?", type: "yes_no", options: ["Yes", "No"], weight: 500, phase: "pre_match" },
  { text: "Who will win the match?", type: "multiple_choice", options: ["{team1}", "{team2}"], weight: 750, phase: "pre_match" },
  { text: "Total match sixes: Over or Under 12?", type: "multiple_choice", options: ["Over 12", "Under 12"], weight: 500, phase: "pre_match" },

  // Powerplay
  { text: "Will {team1} score over 50 in the powerplay?", type: "yes_no", options: ["Yes", "No"], weight: 500, phase: "powerplay" },
  { text: "Wickets in powerplay: 0-1, 2, or 3+?", type: "multiple_choice", options: ["0-1", "2", "3+"], weight: 750, phase: "powerplay" },
  { text: "Highest individual score in powerplay over 30?", type: "yes_no", options: ["Yes", "No"], weight: 500, phase: "powerplay" },
  { text: "Will there be a boundary in the first over?", type: "yes_no", options: ["Yes", "No"], weight: 250, phase: "powerplay" },

  // Middle overs
  { text: "Run rate in middle overs: Over or Under 8?", type: "multiple_choice", options: ["Over 8", "Under 8"], weight: 750, phase: "middle" },
  { text: "Will a wicket fall in overs 7-10?", type: "yes_no", options: ["Yes", "No"], weight: 500, phase: "middle" },
  { text: "Score at 15 overs range?", type: "multiple_choice", options: ["Under 110", "110-130", "131-150", "Over 150"], weight: 1000, phase: "middle" },
  { text: "Number of sixes in middle overs?", type: "multiple_choice", options: ["0-2", "3-5", "6+"], weight: 750, phase: "middle" },

  // Death overs
  { text: "Runs scored in last 5 overs: Over or Under 60?", type: "multiple_choice", options: ["Over 60", "Under 60"], weight: 500, phase: "death" },
  { text: "Will there be a wicket in the 20th over?", type: "yes_no", options: ["Yes", "No"], weight: 500, phase: "death" },
  { text: "Boundaries in overs 16-20?", type: "multiple_choice", options: ["0-4", "5-8", "9+"], weight: 750, phase: "death" },
  { text: "Final innings total range?", type: "multiple_choice", options: ["Under 150", "150-170", "171-190", "Over 190"], weight: 1000, phase: "death" },

  // Post-match
  { text: "Player of the match from which team?", type: "multiple_choice", options: ["{team1}", "{team2}"], weight: 500, phase: "post_match" },
  { text: "Will the margin of victory be over 20 runs / 5 wickets?", type: "yes_no", options: ["Yes", "No"], weight: 750, phase: "post_match" },
];

export function generateQuestionsForPhase(
  team1: string,
  team2: string,
  phase: string,
  count: number = 4
): Array<{
  text: string;
  type: string;
  options: string[];
  weight: number;
  phase: string;
}> {
  const phaseTemplates = TEMPLATES.filter((t) => t.phase === phase);

  const shuffled = [...phaseTemplates].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  return selected.map((t) => ({
    text: substitute(t.text, team1, team2),
    type: t.type,
    options: t.options.map((o) => substitute(o, team1, team2)),
    weight: t.weight,
    phase: t.phase,
  }));
}

export function getAllPhases(): string[] {
  return ["pre_match", "powerplay", "middle", "death", "post_match"];
}
