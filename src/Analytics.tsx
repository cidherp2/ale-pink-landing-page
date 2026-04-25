import { useEffect, useState } from "react";
import styled from "styled-components";
import { supabase } from "./utils/ClientSupabase";
import type { Database } from "./supabase/Database";

type StreamingPlatform = Database["public"]["Enums"]["streaming_platform"];

type AdClick = {
  id: number;
  created_at: string;
  platform_click: StreamingPlatform | null;
  song_id: string | null;
  song_title: string | null;
  song_artist: string | null;
};

type Song = {
  id: string;
  title: string;
  artist: string;
};

// ─── Styled Components ────────────────────────────────────────────────────────

const Page = styled.div`
  min-height: 100vh;
  background: var(--bg-main);
  color: var(--text-main);
  padding: 2rem 1rem;
  box-sizing: border-box;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1.5rem;
  color: var(--green-accent);
`;

const FiltersRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const Select = styled.select`
  background: var(--bg-card);
  color: var(--text-main);
  border: 1px solid var(--border-soft);
  border-radius: 10px;
  padding: 0.5rem 0.75rem;
  font-size: 0.9rem;
  cursor: pointer;
  outline: none;

  &:focus {
    border-color: var(--green-main);
  }
`;

const StatsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StatCard = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-soft);
  border-radius: 12px;
  padding: 0.75rem 1.25rem;
  min-width: 120px;

  p {
    margin: 0;
    font-size: 0.75rem;
    color: var(--text-muted);
  }

  span {
    font-size: 1.6rem;
    font-weight: 700;
    color: var(--green-accent);
  }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid var(--border-soft);
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;

  thead {
    background: var(--bg-card);
    color: var(--text-muted);
    text-align: left;

    th {
      padding: 0.75rem 1rem;
      font-weight: 600;
      white-space: nowrap;
    }
  }

  tbody tr {
    border-top: 1px solid var(--border-soft);
    transition: background 0.15s;

    &:hover {
      background: var(--bg-card-soft);
    }

    td {
      padding: 0.65rem 1rem;
      white-space: nowrap;
    }
  }
`;

const PlatformBadge = styled.span`
  background: var(--bg-card-soft);
  color: var(--green-accent);
  border-radius: 6px;
  padding: 2px 8px;
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: capitalize;
`;

const EmptyRow = styled.td`
  text-align: center;
  padding: 2rem !important;
  color: var(--text-muted);
`;

// ─── Component ────────────────────────────────────────────────────────────────

const PLATFORMS: StreamingPlatform[] = [
  "spotify",
  "apple_music",
  "youtube_music",
  "youtube",
  "soundcloud",
  "amazon_music",
  "deezer",
  "tidal",
  "pandora",
  "audiomack",
  "bandcamp",
  "napster",
  "anghami",
  "boomplay",
  "mixcloud",
  "tiktok",
];

const Analytics = () => {
  const [clicks, setClicks] = useState<AdClick[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSong, setFilterSong] = useState<string>("all");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const [songsRes, clicksRes] = await Promise.all([
        supabase.from("songs").select("id, title, artist").order("title"),
        supabase
          .from("ad_clicks")
          .select("id, created_at, platform_click, song_id")
          .order("created_at", { ascending: false }),
      ]);

      if (songsRes.data) setSongs(songsRes.data);

      if (clicksRes.data && songsRes.data) {
        const songMap = new Map(
          songsRes.data.map((s) => [
            s.id,
            { title: s.title, artist: s.artist },
          ]),
        );
        const enriched: AdClick[] = clicksRes.data.map((c) => ({
          ...c,
          song_title: c.song_id
            ? (songMap.get(c.song_id)?.title ?? null)
            : null,
          song_artist: c.song_id
            ? (songMap.get(c.song_id)?.artist ?? null)
            : null,
        }));
        setClicks(enriched);
      }

      setLoading(false);
    };

    fetchData();
  }, []);

  const filtered = clicks.filter((c) => {
    const matchSong = filterSong === "all" || c.song_id === filterSong;
    const matchPlatform =
      filterPlatform === "all" || c.platform_click === filterPlatform;
    return matchSong && matchPlatform;
  });

  // Contar clicks por plataforma (sobre datos filtrados)
  const platformCounts = filtered.reduce<Record<string, number>>((acc, c) => {
    const key = c.platform_click ?? "desconocida";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const topPlatform =
    Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";

  return (
    <Page>
      <Title>Telemetría · Ad Clicks</Title>

      <FiltersRow>
        <Select
          value={filterSong}
          onChange={(e) => setFilterSong(e.target.value)}
        >
          <option value="all">Todas las canciones</option>
          {songs.map((s) => (
            <option key={s.id} value={s.id}>
              {s.title} — {s.artist}
            </option>
          ))}
        </Select>

        <Select
          value={filterPlatform}
          onChange={(e) => setFilterPlatform(e.target.value)}
        >
          <option value="all">Todas las plataformas</option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
      </FiltersRow>

      <StatsRow>
        <StatCard>
          <p>Total clicks</p>
          <span>{filtered.length}</span>
        </StatCard>
        <StatCard>
          <p>Plataforma líder</p>
          <span style={{ fontSize: "1rem" }}>{topPlatform}</span>
        </StatCard>
        {Object.entries(platformCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 4)
          .map(([platform, count]) => (
            <StatCard key={platform}>
              <p style={{ textTransform: "capitalize" }}>{platform}</p>
              <span>{count}</span>
            </StatCard>
          ))}
      </StatsRow>

      <TableWrapper>
        <Table>
          <thead>
            <tr>
              <th>#</th>
              <th>Canción</th>
              <th>Artista</th>
              <th>Plataforma</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <EmptyRow colSpan={5}>Cargando...</EmptyRow>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <EmptyRow colSpan={5}>Sin resultados</EmptyRow>
              </tr>
            ) : (
              filtered.map((c, i) => (
                <tr key={c.id}>
                  <td>{i + 1}</td>
                  <td>
                    {c.song_title ?? (
                      <em style={{ color: "var(--text-muted)" }}>—</em>
                    )}
                  </td>
                  <td>
                    {c.song_artist ?? (
                      <em style={{ color: "var(--text-muted)" }}>—</em>
                    )}
                  </td>
                  <td>
                    {c.platform_click ? (
                      <PlatformBadge>{c.platform_click}</PlatformBadge>
                    ) : (
                      <em style={{ color: "var(--text-muted)" }}>—</em>
                    )}
                  </td>
                  <td>
                    {new Date(c.created_at).toLocaleString("es-MX", {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </TableWrapper>
    </Page>
  );
};

export default Analytics;
