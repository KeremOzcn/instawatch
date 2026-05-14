import { Snapshot, SnapshotDiff } from "../model/snapshot";

export function diffSnapshots(prev: Snapshot, curr: Snapshot): SnapshotDiff {
  const prevFollowers = new Map(prev.followers.map(u => [u.id, u]));
  const currFollowers = new Map(curr.followers.map(u => [u.id, u]));
  const prevFollowing = new Map(prev.following.map(u => [u.id, u]));
  const currFollowing = new Map(curr.following.map(u => [u.id, u]));

  const lostFollowerIds = new Set(
    prev.followers.filter(u => !currFollowers.has(u.id)).map(u => u.id)
  );
  const lostFollowingIds = new Set(
    prev.following.filter(u => !currFollowing.has(u.id)).map(u => u.id)
  );
  const mutualIds = new Set(Array.from(lostFollowerIds).filter(id => lostFollowingIds.has(id)));

  return {
    prevId: prev.id,
    currId: curr.id,
    mutual_unfollowed: prev.followers.filter(u => mutualIds.has(u.id)),
    unfollowed_me: prev.followers.filter(u => lostFollowerIds.has(u.id) && !mutualIds.has(u.id)),
    i_unfollowed: prev.following.filter(u => lostFollowingIds.has(u.id) && !mutualIds.has(u.id)),
    new_follower: curr.followers.filter(u => !prevFollowers.has(u.id)),
    new_following: curr.following.filter(u => !prevFollowing.has(u.id)),
  };
}
