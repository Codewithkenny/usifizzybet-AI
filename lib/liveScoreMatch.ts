interface Matchup {
  home_team: string;
  away_team: string;
  kickoff?: string;
}

function normalizeTeam(value: string): string {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function matchFixture<T extends Matchup>(
  match: string,
  fixtures: T[],
  kickoff?: string,
): T | undefined {
  const teams = match
    .split(/\s+(?:versus|vs?\.?)\s+|\s+[–—-]\s+/i)
    .map(normalizeTeam);
  if (teams.length !== 2 || !teams[0] || !teams[1]) return undefined;
  const expectedKickoff = kickoff ? Date.parse(kickoff) : Number.NaN;

  return fixtures.find((fixture) => {
    const home = normalizeTeam(fixture.home_team);
    const away = normalizeTeam(fixture.away_team);
    const sameTeams =
      (teams[0] === home && teams[1] === away) ||
      (teams[0] === away && teams[1] === home);
    if (!sameTeams) return false;

    const fixtureKickoff = fixture.kickoff
      ? Date.parse(fixture.kickoff)
      : Number.NaN;
    return (
      !Number.isFinite(expectedKickoff) ||
      !Number.isFinite(fixtureKickoff) ||
      Math.abs(expectedKickoff - fixtureKickoff) <= 36 * 60 * 60 * 1000
    );
  });
}
