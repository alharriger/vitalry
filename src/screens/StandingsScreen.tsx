import { useState } from 'react';
import { Badge, Card } from '../components';
import { LeaderboardRow } from '../components/leaderboard/LeaderboardRow';
import { BreakdownSheet } from '../components/leaderboard/BreakdownSheet';
import { useStandings } from '../lib/useStandings';
import { DEFAULT_SCORING_RULES } from '../lib/scoring';
import type { PlayerStanding } from '../lib/standings';
import './StandingsScreen.css';

/**
 * Standings — the live leaderboard. Ranked by goal completion only (never raw
 * stats); each row shows a 9-pip "today" tracker, points, and streak, and taps
 * through to a day-by-day breakdown. Updates in realtime as anyone taps a goal
 * (Phase 3 exit gate). All ranking + breakdown math comes from the shared
 * scoring engine via `useStandings`, so the board and the breakdown never drift.
 */
export function StandingsScreen() {
  const { loading, error, noCompetition, competition, standings, daysLeft, isFinalDay } =
    useStandings();
  const [selected, setSelected] = useState<PlayerStanding | null>(null);
  const goalCount = (competition?.scoringRules ?? DEFAULT_SCORING_RULES).goalCount;

  if (loading) {
    return (
      <div className="today__status" role="status" aria-live="polite">
        <i className="ph-bold ph-ranking" aria-hidden="true" />
        Loading the standings…
      </div>
    );
  }

  if (error) {
    return (
      <StandingsEmpty
        icon="ph-bold ph-cloud-warning"
        color="var(--flame-600)"
        title="Couldn't load standings"
        blurb="Something went wrong reaching your competition. Check your connection and try again — nobody's points are lost."
      />
    );
  }

  if (noCompetition) {
    return (
      <StandingsEmpty
        icon="ph-bold ph-ranking"
        color="var(--goal-sweat)"
        title="Standings"
        blurb="There's no active competition yet. When your group starts one, the live leaderboard shows up right here."
      />
    );
  }

  const daysLabel = isFinalDay ? 'Final day' : `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`;

  return (
    <div className="vt-standings">
      <header className="vt-standings__header">
        <h1 className="vt-standings__title">Standings</h1>
        <div className="vt-standings__badges">
          <Badge variant="tint" color="var(--goal-mind)" icon="ph-bold ph-calendar-blank">
            {daysLabel}
          </Badge>
          {competition?.prizeText ? (
            <Badge variant="tint" color="var(--sun-400)" icon="ph-fill ph-trophy">
              {competition.prizeText}
            </Badge>
          ) : null}
        </div>
      </header>

      <div className="vt-standings__list">
        {standings.map((p) => (
          <LeaderboardRow
            key={p.userId}
            rank={p.rank}
            name={p.name}
            points={p.totalScore}
            doneToday={p.doneToday}
            total={goalCount}
            streak={p.currentStreak}
            isYou={p.isYou}
            avatarColor={p.avatarColor}
            onOpen={() => setSelected(p)}
          />
        ))}
      </div>

      <p className="vt-standings__hint">Tap anyone to see how every point was earned</p>

      <BreakdownSheet player={selected} onClose={() => setSelected(null)} goalCount={goalCount} />
    </div>
  );
}

/** A warm full-height empty/error state matching Today's. */
function StandingsEmpty({
  icon,
  color,
  title,
  blurb,
}: {
  icon: string;
  color: string;
  title: string;
  blurb: string;
}) {
  return (
    <div>
      <header className="vt-standings__header">
        <h1 className="vt-standings__title">{title}</h1>
      </header>
      <Card
        variant="tint"
        style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', alignItems: 'flex-start' }}
      >
        <span
          aria-hidden="true"
          style={{
            width: 46,
            height: 46,
            borderRadius: 'var(--radius-md)',
            display: 'grid',
            placeItems: 'center',
            background: `color-mix(in srgb, ${color} 15%, transparent)`,
            color,
          }}
        >
          <i className={icon} style={{ fontSize: 26 }} />
        </span>
        <Badge color={color} icon="ph-bold ph-ranking">
          Standings
        </Badge>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: 'var(--text-base)', lineHeight: 'var(--lh-normal)' }}>
          {blurb}
        </p>
      </Card>
    </div>
  );
}
