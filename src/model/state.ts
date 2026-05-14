import { UserNode } from "./user";
import { ScanningTab } from "./scanning-tab";
import { ScanningFilter } from "./scanning-filter";
import { UnfollowLogEntry } from "./unfollow-log-entry";
import { UnfollowFilter } from "./unfollow-filter";
import { ScanPhase } from "./scan-phase";
import { MainTab } from "./main-tab";
import { Snapshot } from "./snapshot";

type ScanningState = {
  readonly status: 'scanning';
  readonly phase: ScanPhase;
  readonly mainTab: MainTab;
  readonly page: number;
  readonly currentTab: ScanningTab;
  readonly searchTerm: string;
  readonly percentage: number;
  readonly followingPercentage: number;
  readonly followersPercentage: number;
  readonly followingResults: readonly UserNode[];
  readonly followersResults: readonly UserNode[];
  readonly whitelistedResults: readonly UserNode[];
  readonly selectedResults: readonly UserNode[];
  readonly filter: ScanningFilter;
  readonly snapshots: readonly Snapshot[];
  readonly currentSnapshotId: string | null;
};

type UnfollowingState = {
  readonly status: 'unfollowing';
  readonly searchTerm: string;
  readonly percentage: number;
  readonly selectedResults: readonly UserNode[];
  readonly unfollowLog: readonly UnfollowLogEntry[];
  readonly filter: UnfollowFilter;
};

//TODO THIS TYPE OF MULTIPLE STATE NEEDS TO BE SEPARETED IN DIFFERENT FILES ASAP (Global state,unfollowing state, scanning state etc...)
export type State = { readonly status: 'initial' } | ScanningState | UnfollowingState;
