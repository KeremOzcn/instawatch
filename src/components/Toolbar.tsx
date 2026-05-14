import React, { ChangeEvent, useState } from "react";
import { State } from "../model/state";
import { assertUnreachable, copyListToClipboard, exportToCSV, exportToJSON, getCurrentPageUnfollowers, getUsersForDisplay } from "../utils/utils";
import { SettingMenu } from "./SettingMenu";
import { Timings } from "../model/timings";
import { UserNode } from "../model/user";

interface ToolBarProps {
  isActiveProcess: boolean;
  state: State;
  setState: (state: State) => void;
  toggleAllUsers: (e: ChangeEvent<HTMLInputElement>) => void;
  toggleCurrentePageUsers: (e: ChangeEvent<HTMLInputElement>) => void;
  currentTimings: Timings;
  setTimings: (timings: Timings) => void;
  whitelistedUsers: readonly UserNode[];
  onWhitelistUpdate: (users: readonly UserNode[]) => void;
}

export const Toolbar = ({
  isActiveProcess,
  state,
  setState,
  toggleAllUsers,
  toggleCurrentePageUsers,
  currentTimings,
  setTimings,
  whitelistedUsers,
  onWhitelistUpdate,
}: ToolBarProps) => {
  const [settingMenu, setSettingMenu] = useState(false);

  const isScan = state.status === "scanning";

  const getDisplayedUsers = () => {
    if (state.status !== "scanning") return [];
    return getUsersForDisplay(
      state.followingResults,
      state.whitelistedResults,
      state.currentTab,
      state.searchTerm,
      state.filter,
    );
  };

  const handleLogoClick = () => {
    if (isActiveProcess) return;
    switch (state.status) {
      case "initial":
        if (confirm("Go back to Instagram?")) location.reload();
        break;
      case "scanning":
      case "unfollowing":
        setState({ status: "initial" });
        break;
      default:
        assertUnreachable(state);
    }
  };

  const progressPct = isActiveProcess && state.status === "unfollowing"
    ? state.percentage
    : isScan ? state.percentage : 0;

  return (
    <header className="app-header">
      <div className="app-header-logo" onClick={handleLogoClick}>
        INSTAWATCH
      </div>

      <div className="app-header-search">
        <span className="app-header-search-icon">⌕</span>
        <input
          type="text"
          className="app-header-search-input"
          placeholder="Search profiles..."
          disabled={!isScan && state.status !== "unfollowing"}
          value={state.status === "initial" ? "" : state.searchTerm}
          onChange={e => {
            switch (state.status) {
              case "initial": return;
              case "scanning":
                return setState({ ...state, searchTerm: e.currentTarget.value });
              case "unfollowing":
                return setState({ ...state, searchTerm: e.currentTarget.value });
              default:
                assertUnreachable(state);
            }
          }}
        />
      </div>

      <div className="app-header-actions">
        {isScan && (
          <>
            <button className="app-header-btn" title="Copy list" onClick={() => copyListToClipboard(getDisplayedUsers())}>⎘</button>
            <button className="app-header-btn" title="Export JSON" onClick={() => exportToJSON(getDisplayedUsers())}>JSON</button>
            <button className="app-header-btn" title="Export CSV" onClick={() => exportToCSV(getDisplayedUsers())}>CSV</button>
          </>
        )}
        {isScan && (
          <label className="app-header-select-label" title="Select page">
            <input
              type="checkbox"
              disabled={state.percentage < 100}
              checked={(() => {
                const p = getCurrentPageUnfollowers(getDisplayedUsers(), state.page);
                return p.length > 0 && p.every(u => state.selectedResults.some(s => s.id === u.id));
              })()}
              onChange={toggleCurrentePageUsers}
            />
            <span>Page</span>
          </label>
        )}
        {isScan && (
          <label className="app-header-select-label" title="Select all">
            <input
              type="checkbox"
              disabled={state.percentage < 100}
              checked={state.selectedResults.length > 0 && state.selectedResults.length === getDisplayedUsers().length}
              onChange={toggleAllUsers}
            />
            <span>All</span>
          </label>
        )}
        <button className="app-header-btn app-header-btn--icon" title="Settings" onClick={() => setSettingMenu(true)}>⚙</button>
      </div>

      <div className="app-header-progress" style={{ '--progress-width': `${progressPct}%` } as React.CSSProperties} />

      {settingMenu && (
        <SettingMenu
          setSettingState={setSettingMenu}
          currentTimings={currentTimings}
          setTimings={setTimings}
          whitelistedUsers={whitelistedUsers}
          onWhitelistUpdate={onWhitelistUpdate}
        />
      )}
    </header>
  );
};
