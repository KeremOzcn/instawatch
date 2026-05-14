import React, { ChangeEvent, useEffect, useState } from "react";
import { render } from "react-dom";
import "./styles.scss";

import { User, UserNode } from "./model/user";
import { Toast } from "./components/Toast";
import { DEFAULT_TIME_BETWEEN_SEARCH_CYCLES,
  DEFAULT_TIME_BETWEEN_UNFOLLOWS,
  DEFAULT_TIME_TO_WAIT_AFTER_FIVE_SEARCH_CYCLES,
  DEFAULT_TIME_TO_WAIT_AFTER_FIVE_UNFOLLOWS, INSTAGRAM_HOSTNAME } from "./constants/constants";
import {
  assertUnreachable,
  getCookie,
  getCurrentPageUnfollowers,
  getUsersForDisplay, sleep, unfollowUserUrlGenerator, followingUrlGenerator, followersUrlGeneratorV2,
} from "./utils/utils";
import { loadSnapshots, saveSnapshot, toLeanUser, deleteSnapshot } from "./utils/snapshot-manager";
import { ScanPhaseIndicator } from "./components/ScanPhaseIndicator";
import { NotSearching } from "./components/NotSearching";
import { State } from "./model/state";
import { Searching } from "./components/Searching";
import { Toolbar } from "./components/Toolbar";
import { Unfollowing } from "./components/Unfollowing";
import { Timings } from "./model/timings";
import { loadWhitelist, saveWhitelist, loadTimings, saveTimings } from "./utils/whitelist-manager";

// pause
let scanningPaused = false;

function pauseScan() {
  scanningPaused = !scanningPaused;
}


function App() {
  const [state, setState] = useState<State>({
    status: "initial",
  });

  const [toast, setToast] = useState<{ readonly show: false } | { readonly show: true; readonly text: string }>({
    show: false,
  });

  const [timings, setTimings] = useState<Timings>(() => {
    const storedTimings = loadTimings();
    return storedTimings ?? {
      timeBetweenSearchCycles: DEFAULT_TIME_BETWEEN_SEARCH_CYCLES,
      timeToWaitAfterFiveSearchCycles: DEFAULT_TIME_TO_WAIT_AFTER_FIVE_SEARCH_CYCLES,
      timeBetweenUnfollows: DEFAULT_TIME_BETWEEN_UNFOLLOWS,
      timeToWaitAfterFiveUnfollows: DEFAULT_TIME_TO_WAIT_AFTER_FIVE_UNFOLLOWS,
    };
  });

  // Save timings whenever they change
  useEffect(() => {
    saveTimings(timings);
  }, [timings]);


  let isActiveProcess: boolean;
  switch (state.status) {
    case "initial":
      isActiveProcess = false;
      break;
    case "scanning":
    case "unfollowing":
      isActiveProcess = state.percentage < 100;
      break;
    default:
      assertUnreachable(state);
  }

  const onScan = async () => {
    if (state.status !== "initial") {
      return;
    }
    const whitelistedResults = loadWhitelist();
    const snapshots = loadSnapshots();
    setState({
      status: "scanning",
      phase: 'following',
      mainTab: 'dashboard',
      page: 1,
      searchTerm: "",
      currentTab: "non_whitelisted",
      percentage: 0,
      followingPercentage: 0,
      followersPercentage: 0,
      followingResults: [],
      followersResults: [],
      selectedResults: [],
      whitelistedResults,
      filter: {
        showNonFollowers: true,
        showFollowers: false,
        showVerified: true,
        showPrivate: true,
      },
      snapshots,
      currentSnapshotId: null,
    });
  };

  const handleScanFilter = (e: ChangeEvent<HTMLInputElement>) => {
    if (state.status !== "scanning") {
      return;
    }
    if (state.selectedResults.length > 0) {
      if (!confirm("Changing filter options will clear selected users")) {
        // Force re-render. Bit of a hack but had an issue where the checkbox state was still
        // changing in the UI even even when not confirming. So updating the state fixes this
        // by synchronizing the checkboxes with the filter statuses in the state.
        setState({ ...state });
        return;
      }
    }
    setState({
      ...state,
      // Make sure to clear selected results when changing filter options. This is to avoid having
      // users selected in the unfollow queue but not visible in the UI, which would be confusing.
      selectedResults: [],
      filter: {
        ...state.filter,
        [e.currentTarget.name]: e.currentTarget.checked,
      },
    });
  };

  const handleUnfollowFilter = (e: ChangeEvent<HTMLInputElement>) => {
    if (state.status !== "unfollowing") {
      return;
    }
    setState({
      ...state,
      filter: {
        ...state.filter,
        [e.currentTarget.name]: e.currentTarget.checked,
      },
    });
  };

  const toggleUser = (newStatus: boolean, user: UserNode) => {
    if (state.status !== "scanning") {
      return;
    }
    if (newStatus) {
      setState({
        ...state,
        selectedResults: [...state.selectedResults, user],
      });
    } else {
      setState({
        ...state,
        selectedResults: state.selectedResults.filter(result => result.id !== user.id),
      });
    }
  };

  const toggleAllUsers = (e: ChangeEvent<HTMLInputElement>) => {
    if (state.status !== "scanning") {
      return;
    }
    if (e.currentTarget.checked) {
      setState({
        ...state,
        selectedResults: getUsersForDisplay(
          state.followingResults,
          state.whitelistedResults,
          state.currentTab,
          state.searchTerm,
          state.filter,
        ),
      });
    } else {
      setState({
        ...state,
        selectedResults: [],
      });
    }
  };

  // it will work the same as toggleAllUsers, but it will select everyone on the current page.
  const toggleCurrentePageUsers = (e: ChangeEvent<HTMLInputElement>) => {
    if (state.status !== "scanning") {
      return;
    }
    if (e.currentTarget.checked) {
      setState({
        ...state,
        selectedResults: getCurrentPageUnfollowers(
          getUsersForDisplay(
            state.followingResults,
            state.whitelistedResults,
            state.currentTab,
            state.searchTerm,
            state.filter,
          ),
          state.page,
        ),
      });
    } else {
      setState({
        ...state,
        selectedResults: [],
      });
    }
  };

  const onWhitelistUpdate = (updatedWhitelist: readonly UserNode[]) => {
    saveWhitelist(updatedWhitelist);
    if (state.status === "scanning") {
      setState({
        ...state,
        whitelistedResults: updatedWhitelist,
      });
    }
  };

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      // Prompt user if he tries to leave while in the middle of a process (searching / unfollowing / etc..)
      // This is especially good for avoiding accidental tab closing which would result in a frustrating experience.
      if (!isActiveProcess) {
        return;
      }

      // `e` Might be undefined in older browsers, so silence linter for this one.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      e = e || window.event;

      // `e` Might be undefined in older browsers, so silence linter for this one.
      // For IE and Firefox prior to version 4
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (e) {
        e.returnValue = "Changes you made may not be saved.";
      }

      // For Safari
      return "Changes you made may not be saved.";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isActiveProcess, state]);

  useEffect(() => {
    const scan = async () => {
      if (state.status !== "scanning") {
        return;
      }

      const scanPaginated = async (
        urlGen: (cursor?: string) => string,
        edgeKey: string,
        onBatch: (nodes: UserNode[], pct: number) => void,
      ) => {
        const collected: UserNode[] = [];
        let scrollCycle = 0;
        let url = urlGen();
        let hasNext = true;
        let currentCount = 0;
        let totalCount = -1;

        while (hasNext) {
          let receivedData: User;
          try {
            const json = await fetch(url).then(res => res.json());
            receivedData = json.data.user[edgeKey];
          } catch (e) {
            console.error(e);
            continue;
          }

          if (totalCount === -1) {
            totalCount = receivedData.count;
          }

          hasNext = receivedData.page_info.has_next_page;
          url = urlGen(receivedData.page_info.end_cursor);
          currentCount += receivedData.edges.length;
          receivedData.edges.forEach(x => collected.push(x.node));

          const pct = Math.round((currentCount / totalCount) * 100);
          onBatch([...collected], pct);

          while (scanningPaused) {
            await sleep(1000);
          }

          const microPause = Math.floor(Math.random() * 1500) + 500;
          await sleep(microPause);
          await sleep(Math.floor(Math.random() * (timings.timeBetweenSearchCycles - timings.timeBetweenSearchCycles * 0.7)) + timings.timeBetweenSearchCycles);

          scrollCycle++;
          if (scrollCycle > 6) {
            scrollCycle = 0;
            const longSleepVar = Math.max(
              0,
              timings.timeToWaitAfterFiveSearchCycles + (Math.random() * 10000 - 5000),
            );
            setToast({ show: true, text: `Oran sınırını aşmamak için ${Math.round(longSleepVar / 1000)} saniye bekleniyor...` });
            await sleep(longSleepVar);
          }
          setToast({ show: false });
        }
        return collected;
      };

      // Phase 1: following
      const followingResults = await scanPaginated(
        followingUrlGenerator,
        'edge_follow',
        (nodes, pct) => {
          setState(prevState => {
            if (prevState.status !== "scanning") return prevState;
            return {
              ...prevState,
              followingResults: nodes,
              followingPercentage: pct,
              percentage: Math.round(pct / 2),
            };
          });
        },
      );

      setState(prevState => {
        if (prevState.status !== "scanning") return prevState;
        return { ...prevState, phase: 'followers' };
      });

      setToast({ show: true, text: 'Takipçiler taranıyor...' });

      // Phase 2: followers — uses newer /api/v1/friendships/ endpoint
      const scanFollowers = async (
        onBatch: (nodes: UserNode[], pct: number) => void,
      ): Promise<UserNode[]> => {
        const collected: UserNode[] = [];
        let scrollCycle = 0;
        let cursor: string | undefined;
        let hasNext = true;
        let currentCount = 0;
        const estimatedTotal = Math.max(followingResults.length, 200);

        while (hasNext) {
          let json: any; // eslint-disable-line @typescript-eslint/no-explicit-any
          try {
            json = await fetch(followersUrlGeneratorV2(cursor), {
              headers: { 'X-IG-App-ID': '936619743392459' },
              credentials: 'include',
            }).then(res => res.json());
          } catch (e) {
            console.error(e);
            continue;
          }

          if (!json.users) break;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const batch: UserNode[] = json.users.map((u: any) => ({
            id: u.pk,
            username: u.username,
            full_name: u.full_name,
            profile_pic_url: u.profile_pic_url,
            is_private: u.is_private,
            is_verified: u.is_verified,
            follows_viewer: true,
            followed_by_viewer: u.followed_by_viewer ?? false,
            requested_by_viewer: false,
            reel: null,
          } as unknown as UserNode));

          cursor = json.next_max_id || undefined;
          hasNext = !!cursor;
          currentCount += batch.length;
          batch.forEach(u => collected.push(u));

          const pct = Math.min(Math.round((currentCount / estimatedTotal) * 95), 95);
          onBatch([...collected], pct);

          while (scanningPaused) {
            await sleep(1000);
          }

          const microPause = Math.floor(Math.random() * 1500) + 500;
          await sleep(microPause);
          await sleep(Math.floor(Math.random() * (timings.timeBetweenSearchCycles - timings.timeBetweenSearchCycles * 0.7)) + timings.timeBetweenSearchCycles);

          scrollCycle++;
          if (scrollCycle > 6) {
            scrollCycle = 0;
            const longSleepVar = Math.max(
              0,
              timings.timeToWaitAfterFiveSearchCycles + (Math.random() * 10000 - 5000),
            );
            setToast({ show: true, text: `Oran sınırını aşmamak için ${Math.round(longSleepVar / 1000)} saniye bekleniyor...` });
            await sleep(longSleepVar);
          }
          setToast({ show: false });
        }

        onBatch([...collected], 100);
        return collected;
      };

      const followersResults = await scanFollowers(
        (nodes, pct) => {
          setState(prevState => {
            if (prevState.status !== "scanning") return prevState;
            return {
              ...prevState,
              followersResults: nodes,
              followersPercentage: pct,
              percentage: 50 + Math.round(pct / 2),
            };
          });
        },
      );

      // Save snapshot
      const snap = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        following: followingResults.map(toLeanUser),
        followers: followersResults.map(toLeanUser),
        version: 1 as const,
      };
      const updatedSnapshots = saveSnapshot(snap);

      setState(prevState => {
        if (prevState.status !== "scanning") return prevState;
        return {
          ...prevState,
          phase: 'done',
          percentage: 100,
          followingPercentage: 100,
          followersPercentage: 100,
          snapshots: updatedSnapshots,
          currentSnapshotId: snap.id,
        };
      });

      setToast({ show: true, text: "Tarama tamamlandı!" });
    };
    scan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  useEffect(() => {
    const unfollow = async () => {
      if (state.status !== "unfollowing") {
        return;
      }

      const csrftoken = getCookie("csrftoken");
      if (csrftoken === null) {
        throw new Error("csrftoken cookie is null");
      }

      let counter = 0;
      for (const user of state.selectedResults) {
        counter += 1;
        // Fix: Changed from Math.floor to Math.round to ensure progress reaches 100%
        // Math.floor would leave progress at 99% when near completion
        const percentage = Math.round((counter / state.selectedResults.length) * 100);
        try {
          await fetch(unfollowUserUrlGenerator(user.id), {
            headers: {
              "content-type": "application/x-www-form-urlencoded",
              "x-csrftoken": csrftoken,
            },
            method: "POST",
            mode: "cors",
            credentials: "include",
          });
          setState(prevState => {
            if (prevState.status !== "unfollowing") {
              return prevState;
            }
            return {
              ...prevState,
              percentage,
              unfollowLog: [
                ...prevState.unfollowLog,
                {
                  user,
                  unfollowedSuccessfully: true,
                },
              ],
            };
          });
        } catch (e) {
          console.error(e);
          setState(prevState => {
            if (prevState.status !== "unfollowing") {
              return prevState;
            }
            return {
              ...prevState,
              percentage,
              unfollowLog: [
                ...prevState.unfollowLog,
                {
                  user,
                  unfollowedSuccessfully: false,
                },
              ],
            };
          });
        }
        // If unfollowing the last user in the list, no reason to wait.
        if (user === state.selectedResults[state.selectedResults.length - 1]) {
          break;
        }
        await sleep(Math.floor(Math.random() * (timings.timeBetweenUnfollows * 1.2 - timings.timeBetweenUnfollows)) + timings.timeBetweenUnfollows);

        if (counter % 5 === 0) {
          setToast({ show: true, text: `Sleeping ${timings.timeToWaitAfterFiveUnfollows / 60000 } minutes to prevent getting temp blocked` });
          await sleep(timings.timeToWaitAfterFiveUnfollows);
        }
        setToast({ show: false });
      }
    };
    unfollow();
    // Dependency array not entirely legit, but works this way. TODO: Find a way to fix.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.status]);

  let markup: React.JSX.Element;
  switch (state.status) {
    case "initial":
      markup = <NotSearching onScan={onScan}></NotSearching>;
      break;

    case "scanning":
      markup = <Searching
        state={state}
        handleScanFilter={handleScanFilter}
        toggleUser={toggleUser}
        pauseScan={pauseScan}
        setState={setState}
        scanningPaused={scanningPaused}
        onTabChange={(tab) => setState({ ...state, mainTab: tab })}
        onDeleteSnapshot={(id) => {
          const updated = deleteSnapshot(id);
          setState({ ...state, snapshots: updated });
        }}
      />;
      break;

    case "unfollowing":
      markup = <Unfollowing
        state={state}
        handleUnfollowFilter={handleUnfollowFilter}
      ></Unfollowing>;
      break;

    default:
      assertUnreachable(state);
  }

  return (
    <main id="main" role="main" className="iu">
      <section className="overlay">
        <Toolbar
          state={state}
          setState={setState}
          isActiveProcess={isActiveProcess}
          toggleAllUsers={toggleAllUsers}
          toggleCurrentePageUsers={toggleCurrentePageUsers}
          setTimings={setTimings}
          currentTimings={timings}
          whitelistedUsers={state.status === "scanning" ? state.whitelistedResults : loadWhitelist()}
          onWhitelistUpdate={onWhitelistUpdate}
        ></Toolbar>

        {state.status === 'scanning' && state.phase !== 'done' && (
          <ScanPhaseIndicator
            phase={state.phase}
            followingPercentage={state.followingPercentage}
            followersPercentage={state.followersPercentage}
            followingCount={state.followingResults.length}
            followersCount={state.followersResults.length}
          />
        )}

        {markup}

        {toast.show && <Toast show={toast.show} message={toast.text} onClose={() => setToast({ show: false })} />}
      </section>
    </main>
  );
}

if (location.hostname !== INSTAGRAM_HOSTNAME) {
  alert("Can be used only on Instagram routes");
} else {
  document.title = "InstagramUnfollowers";
  document.body.innerHTML = "";
  render(<App />, document.body);
}
