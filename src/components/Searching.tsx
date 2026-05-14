import React from "react";
import { assertUnreachable, getCurrentPageUnfollowers, getMaxPage, getUsersForDisplay } from "../utils/utils";
import { State } from "../model/state";
import { UserNode } from "../model/user";
import { WHITELISTED_RESULTS_STORAGE_KEY } from "../constants/constants";
import { MainTab } from "../model/main-tab";
import { HistoryView } from "./history/HistoryView";
import { Statistics } from "./Statistics";
import { ExportPage } from "./ExportPage";

export interface SearchingProps {
  state: State;
  setState: (state: State) => void;
  scanningPaused: boolean;
  pauseScan: () => void;
  handleScanFilter: (e: React.ChangeEvent<HTMLInputElement>) => void;
  toggleUser: (checked: boolean, user: UserNode) => void;
  onTabChange: (tab: MainTab) => void;
  onDeleteSnapshot: (id: string) => void;
}

const NAV_ITEMS: { tab: MainTab; label: string; icon: string }[] = [
  { tab: 'dashboard',   label: 'Dashboard',      icon: '⊹' },
  { tab: 'history',     label: 'Geçmiş',          icon: '◷' },
  { tab: 'statistics',  label: 'İstatistikler',   icon: '◈' },
  { tab: 'export',      label: 'Dışa Aktar',      icon: '↑' },
];

export const Searching = ({
  state, setState, scanningPaused, pauseScan,
  handleScanFilter, toggleUser, onTabChange, onDeleteSnapshot,
}: SearchingProps) => {
  if (state.status !== "scanning") return null;

  const { mainTab } = state;

  const usersForDisplay = getUsersForDisplay(
    state.followingResults,
    state.whitelistedResults,
    state.currentTab,
    state.searchTerm,
    state.filter,
  );

  const toggleWhitelist = (e: React.MouseEvent<HTMLElement>, user: UserNode) => {
    e.preventDefault();
    e.stopPropagation();
    let whitelistedResults: readonly UserNode[];
    switch (state.currentTab) {
      case "non_whitelisted":
        whitelistedResults = [...state.whitelistedResults, user];
        break;
      case "whitelisted":
        whitelistedResults = state.whitelistedResults.filter(r => r.id !== user.id);
        break;
      default:
        assertUnreachable(state.currentTab);
    }
    localStorage.setItem(WHITELISTED_RESULTS_STORAGE_KEY, JSON.stringify(whitelistedResults));
    setState({ ...state, whitelistedResults });
  };

  const addVerified = () => {
    const ids = new Set(state.selectedResults.map(u => u.id));
    const toAdd = usersForDisplay.filter(u => u.is_verified && !ids.has(u.id));
    setState({ ...state, selectedResults: [...state.selectedResults, ...toAdd] });
  };

  const addPrivate = () => {
    const ids = new Set(state.selectedResults.map(u => u.id));
    const toAdd = usersForDisplay.filter(u => u.is_private && !ids.has(u.id));
    setState({ ...state, selectedResults: [...state.selectedResults, ...toAdd] });
  };

  const clearSelection = () => setState({ ...state, selectedResults: [] });

  const maxPage = getMaxPage(usersForDisplay);
  let currentLetter = "";

  const renderMainContent = () => {
    switch (mainTab) {
      case 'dashboard':
        return (
          <>
            <nav className="iw-tabs">
              {(["non_whitelisted", "whitelisted"] as const).map(tab => (
                <button
                  key={tab}
                  className={`iw-tab ${state.currentTab === tab ? "iw-tab--active" : ""}`}
                  onClick={() => state.currentTab !== tab && setState({ ...state, currentTab: tab, selectedResults: [] })}
                >
                  {tab === "non_whitelisted" ? "Non-Whitelisted" : "Whitelisted"}
                </button>
              ))}
            </nav>

            <div className="iw-card-list">
              {getCurrentPageUnfollowers(usersForDisplay, state.page).map(user => {
                const firstLetter = user.username[0].toUpperCase();
                const isSelected = state.selectedResults.some(s => s.id === user.id);
                const isWhitelisted = state.whitelistedResults.some(r => r.id === user.id);
                const showDivider = firstLetter !== currentLetter;
                if (showDivider) currentLetter = firstLetter;

                return (
                  <React.Fragment key={user.id}>
                    {showDivider && (
                      <div className="iw-alpha-divider">
                        <span>{firstLetter}</span>
                        <div className="iw-alpha-line" />
                      </div>
                    )}
                    <label className={`iw-card ${isSelected ? "iw-card--selected" : ""}`}>
                      {isSelected && <div className="iw-card-accent" />}

                      <input
                        className="iw-card-checkbox"
                        type="checkbox"
                        checked={isSelected}
                        onChange={e => toggleUser(e.currentTarget.checked, user)}
                      />

                      <div className="iw-card-avatar-wrap" onClick={e => toggleWhitelist(e, user)}>
                        <img className="iw-card-avatar" src={user.profile_pic_url} alt={user.username} />
                        <div className="iw-card-avatar-overlay">
                          <span>{isWhitelisted ? "★" : "☆"}</span>
                        </div>
                      </div>

                      <div className="iw-card-info">
                        <div className="iw-card-username-row">
                          <a
                            className="iw-card-username"
                            href={`https://www.instagram.com/${user.username}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={e => e.stopPropagation()}
                          >
                            @{user.username}
                          </a>
                          {user.is_verified && <span className="iw-badge-verified">✓</span>}
                          {user.is_private && <span className="iw-badge-private">🔒 Private</span>}
                        </div>
                        <span className="iw-card-fullname">{user.full_name}</span>
                      </div>

                      <button
                        className="iw-card-star"
                        title={isWhitelisted ? "Remove from whitelist" : "Add to whitelist"}
                        onClick={(e: React.MouseEvent<HTMLElement>) => toggleWhitelist(e, user)}
                      >
                        {isWhitelisted ? "★" : "☆"}
                      </button>
                    </label>
                  </React.Fragment>
                );
              })}

              {usersForDisplay.length === 0 && (
                <div className="iw-empty-state">
                  <div className="iw-empty-icon">⊘</div>
                  <h3>Hiç sonuç yok</h3>
                  <p>Filtreleri değiştirmeyi deneyin.</p>
                </div>
              )}
            </div>
          </>
        );

      case 'history':
        return (
          <HistoryView
            snapshots={state.snapshots}
            currentSnapshotId={state.currentSnapshotId}
            onDelete={onDeleteSnapshot}
          />
        );

      case 'statistics':
        return <Statistics snapshots={state.snapshots} />;

      case 'export':
        return (
          <ExportPage
            followingResults={state.followingResults}
            followersResults={state.followersResults}
            snapshots={state.snapshots}
          />
        );

      default:
        assertUnreachable(mainTab);
    }
  };

  return (
    <section className="iw-layout">
      {/* ── Sidebar ── */}
      <aside className="iw-sidebar">
        <div className="iw-sidebar-body">

          {/* Nav */}
          <nav className="iw-sidebar-nav">
            {NAV_ITEMS.map(({ tab, label, icon }) => (
              <button
                key={tab}
                className={`iw-nav-item ${mainTab === tab ? 'iw-nav-item--active' : ''}`}
                onClick={() => onTabChange(tab)}
              >
                <span className="iw-nav-icon">{icon}</span>
                {label}
              </button>
            ))}
          </nav>

          {mainTab === 'dashboard' && (
            <>
              {/* Scan status */}
              <div className="iw-sidebar-status">
                <div className="iw-sidebar-status-dot" />
                <div>
                  <div className="iw-sidebar-status-title">
                    {state.percentage < 100 ? "Scanning…" : "Scan Complete"}
                  </div>
                  <div className="iw-sidebar-status-sub">{state.followingResults.length} profiles</div>
                </div>
              </div>

              {/* Filters */}
              <div className="iw-section">
                <span className="iw-label">FILTERS</span>
                <div className="iw-filter-grid">
                  {(["showNonFollowers", "showFollowers", "showVerified", "showPrivate"] as const).map(key => {
                    const labels: Record<string, string> = {
                      showNonFollowers: "Non-Followers",
                      showFollowers: "Followers",
                      showVerified: "Verified",
                      showPrivate: "Private",
                    };
                    return (
                      <label key={key} className={`iw-filter-pill ${state.filter[key] ? "iw-filter-pill--active" : ""}`}>
                        <input type="checkbox" name={key} checked={state.filter[key]} onChange={handleScanFilter} />
                        {labels[key]}
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Select helpers */}
              <div className="iw-section">
                <span className="iw-label">SELECT</span>
                <div className="iw-select-buttons">
                  <button className="iw-select-btn" onClick={addVerified}>+ Verified</button>
                  <button className="iw-select-btn" onClick={addPrivate}>+ Private</button>
                  <button className="iw-select-btn iw-select-btn--danger" onClick={clearSelection}>Clear</button>
                </div>
              </div>

              {/* Stats */}
              <div className="iw-stats-card">
                <div className="iw-stats-row">
                  <span>Displayed</span><strong>{usersForDisplay.length}</strong>
                </div>
                <div className="iw-stats-row">
                  <span>Total</span><strong>{state.followingResults.length}</strong>
                </div>
                <div className="iw-stats-row">
                  <span>★ Whitelisted</span><strong>{state.whitelistedResults.length}</strong>
                </div>
              </div>

              {/* Scan summary */}
              {state.percentage === 100 && (
                <div className="iw-scan-summary">
                  <span className="iw-label">SCAN SUMMARY</span>
                  <div className="iw-summary-grid">
                    <div className="iw-summary-item">
                      <span>{state.followingResults.filter(u => !u.follows_viewer).length}</span>
                      <small>Non-Followers</small>
                    </div>
                    <div className="iw-summary-item">
                      <span>{state.followingResults.filter(u => u.is_verified).length}</span>
                      <small>Verified</small>
                    </div>
                    <div className="iw-summary-item">
                      <span>{state.followingResults.filter(u => u.is_private).length}</span>
                      <small>Private</small>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar footer — only for dashboard */}
        {mainTab === 'dashboard' && (
          <div className="iw-sidebar-footer">
            <div className="iw-sidebar-controls">
              <button className="iw-ctrl-btn" onClick={pauseScan}>
                {scanningPaused ? "▶ Resume" : "⏸ Pause"}
              </button>
              <div className="iw-pagination">
                <button
                  className="iw-page-btn"
                  onClick={() => state.page > 1 && setState({ ...state, page: state.page - 1 })}
                >‹</button>
                <span>{state.page} / {maxPage}</span>
                <button
                  className="iw-page-btn"
                  onClick={() => state.page < maxPage && setState({ ...state, page: state.page + 1 })}
                >›</button>
              </div>
            </div>

            <button
              className="iw-unfollow-btn"
              onClick={() => {
                if (!confirm("Are you sure?")) return;
                // @ts-ignore
                setState(prev => {
                  if (prev.status !== "scanning") return prev;
                  if (prev.selectedResults.length === 0) {
                    alert("Select at least one user.");
                    return prev;
                  }
                  return {
                    ...prev,
                    status: "unfollowing",
                    percentage: 0,
                    unfollowLog: [],
                    filter: { showSucceeded: true, showFailed: true },
                  };
                });
              }}
            >
              UNFOLLOW ({state.selectedResults.length})
            </button>
          </div>
        )}
      </aside>

      {/* ── Main content ── */}
      <article className="iw-main">
        {renderMainContent()}
      </article>
    </section>
  );
};
