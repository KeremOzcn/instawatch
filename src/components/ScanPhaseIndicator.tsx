import React from "react";
import { ScanPhase } from "../model/scan-phase";

interface ScanPhaseIndicatorProps {
  phase: ScanPhase;
  followingPercentage: number;
  followersPercentage: number;
  followingCount: number;
  followersCount: number;
}

export const ScanPhaseIndicator = ({
  phase,
  followingPercentage,
  followersPercentage,
  followingCount,
  followersCount,
}: ScanPhaseIndicatorProps) => {
  return (
    <div className="scan-phase-indicator">
      <div className="phase-row">
        <span className={`phase-label ${followingPercentage === 100 ? 'done' : phase === 'following' ? 'active' : 'pending'}`}>
          {followingPercentage === 100 ? '✓' : '→'} Takip Ettiklerin
        </span>
        <div className="phase-bar-track">
          <div
            className="phase-bar-fill following"
            style={{ width: `${followingPercentage}%` }}
          />
        </div>
        <span className="phase-count">{followingCount}</span>
      </div>
      <div className="phase-row">
        <span className={`phase-label ${phase === 'done' ? 'done' : phase === 'followers' ? 'active' : 'pending'}`}>
          {phase === 'done' ? '✓' : '→'} Takipçilerin
        </span>
        <div className="phase-bar-track">
          <div
            className="phase-bar-fill followers"
            style={{ width: `${followersPercentage}%` }}
          />
        </div>
        <span className="phase-count">{followersCount}</span>
      </div>
    </div>
  );
};
