export interface LeanUserNode {
  readonly id: string;
  readonly username: string;
  readonly full_name: string;
  readonly profile_pic_url: string;
  readonly is_private: boolean;
  readonly is_verified: boolean;
}

export interface Snapshot {
  readonly id: string;
  readonly timestamp: number;
  readonly following: readonly LeanUserNode[];
  readonly followers: readonly LeanUserNode[];
  readonly version: 1;
}

export type ChangeCategory =
  | 'mutual_unfollowed'
  | 'unfollowed_me'
  | 'i_unfollowed'
  | 'new_follower'
  | 'new_following';

export interface SnapshotDiff {
  readonly prevId: string;
  readonly currId: string;
  readonly mutual_unfollowed: readonly LeanUserNode[];
  readonly unfollowed_me: readonly LeanUserNode[];
  readonly i_unfollowed: readonly LeanUserNode[];
  readonly new_follower: readonly LeanUserNode[];
  readonly new_following: readonly LeanUserNode[];
}
