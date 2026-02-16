interface ProgressVisualizationProps {
  title: string;
  description: string;
  content: {
    stats?: { label: string; value: string | number; detail?: string }[];
    schools?: { name: string; progress: number; sessions: number }[];
    milestones?: { label: string; achieved: boolean; date?: string }[];
  };
  philosopher?: { name: string; school: string; relevance: string };
}

export function ProgressVisualization({
  title,
  description,
  content,
  philosopher,
}: ProgressVisualizationProps) {
  return (
    <div className="rounded-lg border border-muted-light bg-paper-light p-6 my-4">
      <span className="font-mono text-xs font-medium text-warm uppercase tracking-wider">
        Progress
      </span>
      <h3 className="text-h3 mt-2 text-ink">{title}</h3>
      <p className="text-body-sm mt-1 mb-6 text-muted">{description}</p>

      {/* Stat blocks */}
      {content.stats && content.stats.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 mb-6">
          {content.stats.map((stat, i) => (
            <div
              key={i}
              className="rounded-md border border-muted-light bg-paper p-4 text-center"
            >
              <p className="font-display text-2xl font-bold text-ink">{stat.value}</p>
              <p className="text-caption text-muted mt-1">{stat.label}</p>
              {stat.detail && (
                <p className="text-caption text-muted/60 mt-0.5">{stat.detail}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* School mastery progress bars */}
      {content.schools && content.schools.length > 0 && (
        <div className="space-y-3 mb-6">
          <p className="text-label text-muted">School Mastery</p>
          {content.schools.map((school, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-body-sm font-medium text-ink">{school.name}</p>
                <p className="font-mono text-xs text-muted">
                  {school.sessions} sessions
                </p>
              </div>
              <div className="h-2 rounded-full bg-muted-light overflow-hidden">
                <div
                  className="h-full rounded-full bg-warm transition-all duration-500"
                  style={{ width: `${Math.min(100, school.progress)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Milestones */}
      {content.milestones && content.milestones.length > 0 && (
        <div>
          <p className="text-label text-muted mb-3">Milestones</p>
          <div className="space-y-2">
            {content.milestones.map((milestone, i) => (
              <div
                key={i}
                className="flex items-center gap-3"
              >
                <div
                  className={`h-4 w-4 shrink-0 rounded-full border-2 flex items-center justify-center ${
                    milestone.achieved
                      ? "border-warm bg-warm"
                      : "border-muted-light"
                  }`}
                >
                  {milestone.achieved && (
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path
                        d="M1 4L3 6L7 2"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={`text-body-sm ${
                      milestone.achieved ? "text-ink" : "text-muted"
                    }`}
                  >
                    {milestone.label}
                  </p>
                </div>
                {milestone.date && (
                  <p className="font-mono text-xs text-muted">{milestone.date}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {philosopher && (
        <div className="mt-4 border-t border-muted-light pt-4">
          <p className="text-caption text-muted">
            <span className="font-semibold">{philosopher.name}</span> &middot; {philosopher.school}
          </p>
          <p className="text-body-sm mt-1 italic text-muted">{philosopher.relevance}</p>
        </div>
      )}
    </div>
  );
}
