# Geçmiş Takip Özelliği (Historical Tracking Feature)

## Özet

Bu geliştirme, InstagramUnfollowers projesine iki fazlı tarama ve geçmiş karşılaştırma özelliği ekler.
Her taramada hem takip edilen hem de takipçi listesi çekilir, localStorage'a snapshot olarak kaydedilir
ve snapshotlar arası farklar "Geçmiş" sekmesinde görüntülenir.

---

## Yeni Özellikler

### İki Fazlı Tarama

1. **Faz 1 — Following**: `edge_follow` (query hash: `3dec7e2c57367ef3da3d987d89f9dbc8`)
2. **Faz 2 — Followers**: `edge_followed_by` (query hash: `c76146de99bb02f6415203be841dd25`)

Her faz `scanPaginated()` helper fonksiyonuyla yürütülür. İki fazlı ilerleme `ScanPhaseIndicator` bileşeniyle gösterilir.

### Snapshot Sistemi

Her başarılı tarama sonunda localStorage'a kaydedilir:

```json
{
  "iu_snapshots": {
    "version": 1,
    "snapshots": [
      {
        "id": "uuid-v4",
        "timestamp": 1746700000000,
        "following": [{ "id": "...", "username": "...", "full_name": "...", "profile_pic_url": "...", "is_private": false, "is_verified": false }],
        "followers": [...],
        "version": 1
      }
    ]
  }
}
```

- Maks. 20 snapshot saklanır (`MAX_SNAPSHOTS = 20`), en eski otomatik silinir.
- `LeanUserNode` formatı kullanılır (~200B/kullanıcı) — tam `UserNode`'dan çok daha küçük.
- `QuotaExceededError` yakalanır; en eski snapshot silinerek yeniden denenir.

### Geçmiş Sekmesi

| Kategori | Açıklama | Renk |
|---|---|---|
| Seni Bırakanlar | Önceki snapshotda takipçiydi, şimdi değil | Kırmızı |
| Bıraktıklarım | Önceki snapshotda takip ediyordun, şimdi değil | Sarı |
| Yeni Takipçiler | Önceki snapshotda takipçi değildi, şimdi var | Yeşil |
| Yeni Takip Ettiklerim | Önceki snapshotda takip etmiyordun, şimdi ediyorsun | Mavi |

- Diff algoritması: Map-based, O(n+m).
- Sade görünüm: avatar + kullanıcı adı + Instagram profil linki. Checkbox veya unfollow butonu yok.
- Geçmiş sekmesi en az 2 snapshot olduğunda aktif olur.

---

## Eklenen Dosyalar

| Dosya | Açıklama |
|---|---|
| `src/model/scan-phase.ts` | `ScanPhase = 'following' \| 'followers' \| 'done'` tipi |
| `src/model/main-tab.ts` | `MainTab = 'current' \| 'history'` tipi |
| `src/model/snapshot.ts` | `LeanUserNode`, `Snapshot`, `SnapshotDiff` interfaceleri |
| `src/utils/snapshot-diff.ts` | `diffSnapshots(prev, curr)` — saf, Map tabanlı diff fonksiyonu |
| `src/utils/snapshot-manager.ts` | `loadSnapshots`, `saveSnapshot`, `deleteSnapshot`, `toLeanUser`, `pruneSnapshots` |
| `src/components/ScanPhaseIndicator.tsx` | İki fazlı ilerleme çubuğu bileşeni |
| `src/components/MainTabs.tsx` | "Tarama Sonuçları" / "Geçmiş" sekme navigasyonu |
| `src/components/history/HistoryView.tsx` | Geçmiş sekmesi kök bileşeni |
| `src/components/history/SnapshotTimeline.tsx` | Sol panel: tarihli snapshot listesi |
| `src/components/history/SnapshotDiffPanel.tsx` | Sağ panel: 4 kategori diff görünümü |
| `src/components/history/ChangeCategoryList.tsx` | Tek kategori listesi (avatar + profil linki) |

---

## Değiştirilen Dosyalar

| Dosya | Değişiklik |
|---|---|
| `src/constants/constants.ts` | `SNAPSHOTS_STORAGE_KEY`, `MAX_SNAPSHOTS`, `FOLLOWING_QUERY_HASH`, `FOLLOWERS_QUERY_HASH` eklendi |
| `src/model/state.ts` | `ScanningState`'e `phase`, `mainTab`, `followingPercentage`, `followersPercentage`, `followersResults`, `snapshots`, `currentSnapshotId` eklendi; `results` → `followingResults` |
| `src/utils/utils.ts` | `urlGenerator` imzası değişti (`queryHash` parametresi aldı); `followingUrlGenerator`, `followersUrlGenerator` export edildi |
| `src/components/Searching.tsx` | `state.results` → `state.followingResults` |
| `src/components/Toolbar.tsx` | `state.results` → `state.followingResults`; progress bar yalnızca `unfollowing` fazında gösterilir |
| `src/main.tsx` | İki fazlı scan döngüsü, snapshot kaydetme, `mainTab` state'i, `ScanPhaseIndicator` ve `HistoryView` render |
| `src/styles/main.scss` | Tüm yeni bileşenler için CSS stilleri eklendi |

---

## localStorage Anahtarları

| Anahtar | Açıklama |
|---|---|
| `iu_snapshots` | Snapshot listesi (JSON, `{ version: 1, snapshots: [] }` formatında) |
| `iu_whitelisted-results` | Beyaz liste (mevcut, değişmedi) |
| `iu_timings` | Scan zamanlamaları (mevcut, değişmedi) |

---

## Önemli Notlar

- **`urlGenerator` imza değişikliği**: Eski `urlGenerator(nextCode?)` → Yeni `urlGenerator(queryHash, nextCode?)`. Bu değişiklik `followingUrlGenerator` ve `followersUrlGenerator` sarmalayıcıları tarafından gizlenir; dışarıdan etkilenen kod yok.
- **Kısmi tarama kaydedilmez**: Snapshot yalnızca her iki faz da tamamlandıktan sonra kaydedilir. Yarıda kalan taramalar hiçbir şey kaydetmez.
- **Sekme görünürlüğü**: "Geçmiş" sekmesi yalnızca `snapshots.length > 1` olduğunda aktif görünür.
- **Aksiyon yok**: Geçmiş sekmesinde unfollow, checkbox veya herhangi bir aksiyon butonu bulunmaz — yalnızca görüntüleme.
- **`LeanUserNode`**: Sadece `id`, `username`, `full_name`, `profile_pic_url`, `is_private`, `is_verified` alanlarını içerir. Reel, video ve diğer Instagram-spesifik alanlar çıkarılmıştır.

---

## Build

```bash
npm install
npx webpack          # veya npm run build
```

Dev server:

```bash
npx webpack serve    # http://localhost:8080
```
