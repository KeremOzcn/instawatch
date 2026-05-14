import React from "react";
import { SnapshotDiff } from "../../model/snapshot";
import { ChangeCategoryList } from "./ChangeCategoryList";

interface SnapshotDiffPanelProps {
  diff: SnapshotDiff | null;
}

export const SnapshotDiffPanel = ({ diff }: SnapshotDiffPanelProps) => {
  if (!diff) {
    return (
      <div className="diff-panel diff-panel--empty">
        <p>Karşılaştırma için soldaki listeden bir tarama seçin</p>
      </div>
    );
  }

  return (
    <div className="diff-panel">
      <div style={{ gridColumn: '1 / -1' }}>
        <ChangeCategoryList
          title="Karşılıklı Ayrılanlar"
          users={diff.mutual_unfollowed}
          variant="purple"
          emptyText="Karşılıklı ayrılan yok"
        />
      </div>
      <ChangeCategoryList
        title="Seni Bırakanlar"
        users={diff.unfollowed_me}
        variant="danger"
        emptyText="Kimse seni takipten çıkarmadı"
      />
      <ChangeCategoryList
        title="Bıraktıklarım"
        users={diff.i_unfollowed}
        variant="warning"
        emptyText="Kimseyi takipten çıkarmadın"
      />
      <ChangeCategoryList
        title="Yeni Takipçiler"
        users={diff.new_follower}
        variant="success"
        emptyText="Yeni takipçi yok"
      />
      <ChangeCategoryList
        title="Yeni Takip Ettiklerim"
        users={diff.new_following}
        variant="info"
        emptyText="Yeni takip ettiğin hesap yok"
      />
    </div>
  );
};
