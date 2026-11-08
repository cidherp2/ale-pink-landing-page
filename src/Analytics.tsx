import { useEffect, useState } from "react";
import styled from "styled-components";
import { supabase } from "./utils/ClientSupabase";
import type { Database } from "./supabase/Database";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

type ChartRow = {
  songId: string;
  songLabel: string;
  [platform: string]: string | number;
};

type AdClickSummary = {
  song_id: string | null;
  platform_click: StreamingPlatform | null;
  click_count: number;
};

type MatrixRow = ChartRow & {
  total: number;
};

type DateFilterableQuery<T> = {
  gte: (column: string, value: string) => T;
  lt: (column: string, value: string) => T;
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

const DateFilter = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-main);
  font-size: 0.9rem;
`;

const DateInput = styled.input`
  background: var(--bg-card);
  color: var(--text-main);
  border: 1px solid var(--border-soft);
  border-radius: 10px;
  padding: 0.5rem 0.75rem;
  font: inherit;
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

const MatrixCard = styled.section`
  background: var(--bg-card);
  border: 1px solid var(--border-soft);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
`;

const MatrixWrapper = styled.div`
  overflow-x: auto;
  border: 1px solid var(--border-soft);
  border-radius: 10px;
`;

const MatrixTable = styled.table`
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
  font-size: 0.8rem;

  th,
  td {
    padding: 0.7rem 0.75rem;
    border-bottom: 1px solid var(--border-soft);
    white-space: nowrap;
    text-align: right;
  }

  th {
    background: var(--bg-card-soft);
    color: var(--text-muted);
    font-weight: 600;
    text-transform: capitalize;
  }

  th:first-child,
  td:first-child {
    position: sticky;
    left: 0;
    text-align: left;
    z-index: 1;
  }

  th:first-child {
    background: var(--bg-card-soft);
  }

  td:first-child {
    background: var(--bg-card);
    color: var(--text-main);
    font-weight: 600;
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }
`;

const MatrixTotalCell = styled.td`
  background: var(--bg-card-soft);
  color: var(--green-accent);
  font-weight: 700;
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

const Pagination = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
  color: var(--text-muted);
  font-size: 0.875rem;
`;

const PageButton = styled.button`
  background: var(--bg-card);
  color: var(--text-main);
  border: 1px solid var(--border-soft);
  border-radius: 8px;
  padding: 0.45rem 0.75rem;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
`;

const ChartCard = styled.section`
  background: var(--bg-card);
  border: 1px solid var(--border-soft);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
`;

const ChartTitle = styled.h2`
  color: var(--text-main);
  font-size: 1rem;
  margin: 0 0 1rem;
`;

const ChartEmpty = styled.p`
  color: var(--text-muted);
  margin: 0;
  padding: 2rem 0;
  text-align: center;
`;

const ErrorBanner = styled.p`
  background: rgba(227, 107, 107, 0.12);
  border: 1px solid rgba(227, 107, 107, 0.35);
  border-radius: 8px;
  color: #ffb3b3;
  margin: 0 0 1.5rem;
  padding: 0.75rem 1rem;
`;

const DashboardHeader = styled.div`
  margin-bottom: 1.25rem;
`;

const Subtitle = styled.p`
  color: var(--text-muted);
  margin: 0.35rem 0 0;
  font-size: 0.9rem;
`;

const Tabs = styled.div`
  display: flex;
  gap: 0.35rem;
  border-bottom: 1px solid var(--border-soft);
  margin-bottom: 1.5rem;
`;

const TabButton = styled.button<{ $active: boolean }>`
  background: ${({ $active }) =>
    $active ? "var(--bg-card-soft)" : "transparent"};
  color: ${({ $active }) =>
    $active ? "var(--green-accent)" : "var(--text-muted)"};
  border: 0;
  border-bottom: 2px solid
    ${({ $active }) => ($active ? "var(--green-main)" : "transparent")};
  padding: 0.7rem 1rem;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  border-radius: 8px 8px 0 0;
`;

const FilterPanel = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-soft);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
`;

const FilterPanelTitle = styled.h2`
  color: var(--text-main);
  font-size: 0.95rem;
  margin: 0 0 0.75rem;
`;

const SongSelection = styled.div`
  background: var(--bg-card);
  border: 1px solid var(--border-soft);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.5rem;
`;

const SongSelectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
`;

const SongSelectionActions = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const SongList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.5rem;
  max-height: 180px;
  overflow-y: auto;
`;

const SongOption = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-main);
  background: var(--bg-card-soft);
  border-radius: 8px;
  padding: 0.55rem 0.65rem;
  cursor: pointer;
  font-size: 0.85rem;
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

const PAGE_SIZE = 50;
const CHART_COLORS = [
  "#79c267",
  "#4da3d9",
  "#e8a34a",
  "#c875d8",
  "#e36b6b",
  "#5bc0a8",
  "#8b91d9",
  "#d5c45b",
];

const shiftDateInput = (dateInput: string, days: number) => {
  const date = new Date(`${dateInput}T00:00:00`);
  date.setDate(date.getDate() + days);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

type ChartTooltipProps = {
  active?: boolean;
  payload?: Array<{
    color?: string;
    name?: string;
    value?: number;
  }>;
  label?: string | number;
};

const ChartTooltip = ({
  active,
  payload,
  label,
}: ChartTooltipProps) => {
  const visiblePayload = payload?.filter((entry) => (entry.value ?? 0) > 0);

  if (!active || !visiblePayload?.length) return null;

  return (
    <div
      style={{
        background: "#0f3b2d",
        border: "1px solid rgba(111, 211, 177, 0.35)",
        borderRadius: "8px",
        color: "#f2f6f4",
        padding: "0.75rem",
      }}
    >
      <strong>{label}</strong>
      {visiblePayload.map((entry) => (
        <div key={entry.name} style={{ color: entry.color, marginTop: 4 }}>
          {entry.name}: {entry.value ?? 0}
        </div>
      ))}
    </div>
  );
};

const Analytics = ({ profileId }: { profileId: string }) => {
  const [clicks, setClicks] = useState<AdClick[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSong, setFilterSong] = useState<string>("all");
  const [filterPlatform, setFilterPlatform] = useState<string>("all");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");
  const [page, setPage] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [platformCounts, setPlatformCounts] = useState<Record<string, number>>(
    {},
  );
  const [chartData, setChartData] = useState<ChartRow[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedSongIds, setSelectedSongIds] = useState<string[] | null>(null);
  const [songSearch, setSongSearch] = useState("");
  const [activeTab, setActiveTab] = useState<
    "summary" | "comparison" | "detail"
  >("summary");

  const dateRangeError =
    filterFrom && filterTo && filterFrom > filterTo
      ? "La fecha Desde no puede ser posterior a la fecha Hasta."
      : null;

  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    const fetchData = async () => {
      setLoading(true);
      setLoadError(null);

      if (dateRangeError) {
        setClicks([]);
        setTotalClicks(0);
        setPlatformCounts({});
        setChartData([]);
        setLoading(false);
        return;
      }

      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      const fromDate = filterFrom
        ? new Date(`${filterFrom}T00:00:00`)
        : null;
      const toDateExclusive = filterTo
        ? new Date(`${filterTo}T00:00:00`)
        : null;

      if (toDateExclusive) {
        toDateExclusive.setDate(toDateExclusive.getDate() + 1);
      }

      const applyDateFilters = <T extends DateFilterableQuery<T>>(query: T) => {
        if (fromDate) query = query.gte("created_at", fromDate.toISOString());
        if (toDateExclusive) {
          query = query.lt("created_at", toDateExclusive.toISOString());
        }
        return query;
      };

      let clicksQuery = applyDateFilters(
        supabase
        .from("ad_clicks")
        .select("id, created_at, platform_click, song_id, songs!inner(user_id)")
        .eq("songs.user_id", profileId)
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(from, to)
        .abortSignal(controller.signal),
      );
      let totalQuery = applyDateFilters(
        supabase
        .from("ad_clicks")
        .select("id, songs!inner(user_id)", { count: "exact", head: true })
        .eq("songs.user_id", profileId)
        .abortSignal(controller.signal),
      );
      if (filterSong !== "all") {
        clicksQuery = clicksQuery.eq("song_id", filterSong);
        totalQuery = totalQuery.eq("song_id", filterSong);
      }
      if (filterPlatform !== "all") {
        clicksQuery = clicksQuery.eq("platform_click", filterPlatform);
        totalQuery = totalQuery.eq("platform_click", filterPlatform);
      }

      const batchSize = 500;
      const fetchSongs = async () => {
        const allSongs: Song[] = [];
        for (let offset = 0; ; offset += batchSize) {
          const { data, error } = await supabase.from("songs")
            .select("id, title, artist")
            .eq("user_id", profileId)
            .order("id")
            .range(offset, offset + batchSize - 1)
            .abortSignal(controller.signal);
          if (error) throw error;
          allSongs.push(...data);
          if (data.length < batchSize) return allSongs;
        }
      };
      const fetchSummary = async () => {
        const rows: AdClickSummary[] = [];
        for (let offset = 0; ; offset += batchSize) {
          const { data, error } = await supabase.rpc("get_ad_clicks_summary", {
            p_from: fromDate?.toISOString() ?? null,
            p_to: toDateExclusive?.toISOString() ?? null,
            p_song_id: filterSong === "all" ? null : filterSong,
            p_platform: filterPlatform === "all" ? null : filterPlatform,
          }).range(offset, offset + batchSize - 1)
            .abortSignal(controller.signal);
          if (error) throw error;
          rows.push(...data);
          if (data.length < batchSize) return rows;
        }
      };

      try {
      const [songRows, clicksRes, totalRes, summaryRows] = await Promise.all([
        fetchSongs(), clicksQuery, totalQuery, fetchSummary(),
      ]);
      if (!active) return;
      if (clicksRes.error) throw clicksRes.error;
      if (totalRes.error) throw totalRes.error;
      if (totalRes.count === null) throw new Error("Missing click count");

      setSongs(songRows);
      setTotalClicks(totalRes.count);

      const chartPlatforms =
        filterPlatform === "all"
          ? [...PLATFORMS, "desconocida"]
          : [filterPlatform];

      {
        const songMap = new Map(
          songRows.map((song) => [
            song.id,
            `${song.title} — ${song.artist}`,
          ]),
        );
        const grouped = new Map<string, ChartRow>();

        summaryRows.forEach((click) => {
          const songKey = click.song_id ?? "desconocida";
          const platformKey = click.platform_click ?? "desconocida";
          const existing = grouped.get(songKey) ?? {
            songId: songKey,
            songLabel: click.song_id
              ? (songMap.get(click.song_id) ?? "Canción desconocida")
              : "Sin canción",
          };

          existing[platformKey] =
            Number(existing[platformKey] ?? 0) + click.click_count;
          grouped.set(songKey, existing);
        });

        setChartData(
          [...grouped.values()].map((row) => {
            chartPlatforms.forEach((platform) => {
              row[platform] = Number(row[platform] ?? 0);
            });
            return row;
          }),
        );
      }

      setPlatformCounts(
        summaryRows.reduce<
          Record<string, number>
        >((acc, row) => {
          const platform = row.platform_click ?? "desconocida";
          acc[platform] = (acc[platform] ?? 0) + row.click_count;
          return acc;
        }, {}),
      );

      if (clicksRes.data) {
        const songMap = new Map(
          songRows.map((s) => [
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

      } catch (error) {
        if (!active) return;
        console.error("Error loading analytics:", error);
        setClicks([]);
        setChartData([]);
        setPlatformCounts({});
        setTotalClicks(0);
        setLoadError("No se pudieron cargar las estadísticas. Verifica la conexión y la configuración de Supabase.");
      } finally {
        if (active) setLoading(false);
      }
    };

    void fetchData();
    return () => {
      active = false;
      controller.abort();
    };
  }, [dateRangeError, filterFrom, filterPlatform, filterSong, filterTo, page, profileId]);

  const totalPages = Math.ceil(totalClicks / PAGE_SIZE);
  const chartPlatforms =
    filterPlatform === "all"
      ? [...PLATFORMS, "desconocida"]
      : [filterPlatform];

  const topPlatform =
    Object.entries(platformCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
  const visibleChartData =
    selectedSongIds === null
      ? chartData
      : chartData.filter((row) => selectedSongIds.includes(row.songId));
  const selectableSongs = songs.filter((song) =>
    `${song.title} ${song.artist}`
      .toLocaleLowerCase()
      .includes(songSearch.toLocaleLowerCase()),
  );
  const matrixPlatforms = chartPlatforms.filter((platform) =>
    visibleChartData.some((row) => Number(row[platform] ?? 0) > 0),
  );
  const matrixRows: MatrixRow[] = visibleChartData
    .map((row) => ({
      ...row,
      total: matrixPlatforms.reduce(
        (sum, platform) => sum + Number(row[platform] ?? 0),
        0,
      ),
    }))
    .sort((a, b) => b.total - a.total);
  const matrixTotals = matrixPlatforms.reduce<Record<string, number>>(
    (totals, platform) => {
      totals[platform] = matrixRows.reduce(
        (sum, row) => sum + Number(row[platform] ?? 0),
        0,
      );
      return totals;
    },
    {},
  );
  const matrixMax = Math.max(
    1,
    ...matrixRows.flatMap((row) =>
      matrixPlatforms.map((platform) => Number(row[platform] ?? 0)),
    ),
  );
  const matrixTotal = matrixRows.reduce((sum, row) => sum + row.total, 0);

  return (
    <Page>
      <DashboardHeader>
        <Title>Telemetría · Ad Clicks</Title>
        <Subtitle>
          Monitorea el rendimiento de tus canciones y plataformas desde un solo lugar.
        </Subtitle>
      </DashboardHeader>

      <FilterPanel>
        <FilterPanelTitle>Filtros globales</FilterPanelTitle>
        <FiltersRow>
        <Select
          value={filterSong}
          onChange={(e) => {
            setFilterSong(e.target.value);
            setPage(0);
          }}
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
          onChange={(e) => {
            setFilterPlatform(e.target.value);
            setPage(0);
          }}
        >
          <option value="all">Todas las plataformas</option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>

        <DateFilter>
          Desde
          <DateInput
            type="date"
            value={filterFrom}
            onChange={(e) => {
              setFilterFrom(e.target.value);
              setPage(0);
            }}
          />
        </DateFilter>

        <DateFilter>
          Hasta
          <DateInput
            type="date"
            value={filterTo}
            onChange={(e) => {
              setFilterTo(e.target.value);
              setPage(0);
            }}
          />
        </DateFilter>

        {filterFrom && filterFrom === filterTo && !dateRangeError && (
          <>
            <PageButton
              type="button"
              onClick={() => {
                const previousDay = shiftDateInput(filterFrom, -1);
                setFilterFrom(previousDay);
                setFilterTo(previousDay);
                setPage(0);
              }}
            >
              Día anterior
            </PageButton>
            <PageButton
              type="button"
              onClick={() => {
                const nextDay = shiftDateInput(filterFrom, 1);
                setFilterFrom(nextDay);
                setFilterTo(nextDay);
                setPage(0);
              }}
            >
              Siguiente día
            </PageButton>
          </>
        )}
        </FiltersRow>
      </FilterPanel>

      {dateRangeError && (
        <p role="alert" style={{ color: "var(--text-muted)" }}>
          {dateRangeError}
        </p>
      )}
      {loadError && <ErrorBanner role="alert">{loadError}</ErrorBanner>}

      <Tabs role="tablist" aria-label="Secciones de Analytics">
        <TabButton
          type="button"
          role="tab"
          aria-selected={activeTab === "summary"}
          $active={activeTab === "summary"}
          onClick={() => setActiveTab("summary")}
        >
          Resumen
        </TabButton>
        <TabButton
          type="button"
          role="tab"
          aria-selected={activeTab === "comparison"}
          $active={activeTab === "comparison"}
          onClick={() => setActiveTab("comparison")}
        >
          Comparativa
        </TabButton>
        <TabButton
          type="button"
          role="tab"
          aria-selected={activeTab === "detail"}
          $active={activeTab === "detail"}
          onClick={() => setActiveTab("detail")}
        >
          Detalle
        </TabButton>
      </Tabs>

      {activeTab === "summary" && <StatsRow>
        <StatCard>
          <p>Total clicks</p>
          <span>{totalClicks}</span>
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
      </StatsRow>}

      {activeTab === "summary" && (
        <MatrixCard>
          <ChartTitle>Rendimiento por canción y plataforma</ChartTitle>
          <Subtitle>
            Ordenado por total de clicks. La intensidad indica dónde se concentra
            el rendimiento.
          </Subtitle>
          {matrixRows.length === 0 || matrixPlatforms.length === 0 ? (
            <ChartEmpty>
              {loading ? "Cargando datos..." : "Sin datos para mostrar"}
            </ChartEmpty>
          ) : (
            <MatrixWrapper>
              <MatrixTable>
                <thead>
                  <tr>
                    <th>Canción</th>
                    {matrixPlatforms.map((platform) => (
                      <th key={platform}>
                        {platform === "desconocida"
                          ? "Sin plataforma"
                          : platform.replace(/_/g, " ")}
                      </th>
                    ))}
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {matrixRows.map((row) => (
                    <tr key={row.songId}>
                      <td>{row.songLabel}</td>
                      {matrixPlatforms.map((platform) => {
                        const value = Number(row[platform] ?? 0);
                        const intensity = value / matrixMax;
                        return (
                          <td
                            key={platform}
                            title={`${value} clicks`}
                            style={{
                              backgroundColor:
                                value > 0
                                  ? `rgba(111, 211, 177, ${0.08 + intensity * 0.48})`
                                  : undefined,
                              color:
                                value > 0
                                  ? "var(--text-main)"
                                  : "var(--text-muted)",
                              fontWeight: value > 0 ? 600 : 400,
                            }}
                          >
                            {value > 0 ? value.toLocaleString("es-MX") : "—"}
                          </td>
                        );
                      })}
                      <MatrixTotalCell>
                        {row.total.toLocaleString("es-MX")}
                      </MatrixTotalCell>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <MatrixTotalCell>Total</MatrixTotalCell>
                    {matrixPlatforms.map((platform) => (
                      <MatrixTotalCell key={platform}>
                        {(matrixTotals[platform] ?? 0).toLocaleString("es-MX")}
                      </MatrixTotalCell>
                    ))}
                    <MatrixTotalCell>{matrixTotal.toLocaleString("es-MX")}</MatrixTotalCell>
                  </tr>
                </tfoot>
              </MatrixTable>
            </MatrixWrapper>
          )}
        </MatrixCard>
      )}

      {activeTab === "comparison" && (
        <>
          <SongSelection>
            <SongSelectionHeader>
              <div>
                <ChartTitle>Seleccionar canciones</ChartTitle>
                <Subtitle>
                  Elige qué canciones quieres comparar en el gráfico.
                </Subtitle>
              </div>
              <SongSelectionActions>
                <PageButton
                  type="button"
                  onClick={() => setSelectedSongIds(null)}
                >
                  Seleccionar todas
                </PageButton>
                <PageButton
                  type="button"
                  onClick={() => setSelectedSongIds([])}
                >
                  Limpiar
                </PageButton>
              </SongSelectionActions>
            </SongSelectionHeader>
            <DateInput
              type="search"
              placeholder="Buscar canción o artista"
              aria-label="Buscar canción o artista"
              value={songSearch}
              onChange={(event) => setSongSearch(event.target.value)}
              style={{ width: "100%", boxSizing: "border-box", marginBottom: "0.75rem" }}
            />
            <SongList>
              {selectableSongs.map((song) => {
                const checked =
                  selectedSongIds === null || selectedSongIds.includes(song.id);
                return (
                  <SongOption key={song.id}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        if (selectedSongIds === null) {
                          setSelectedSongIds(
                            songs.filter((item) => item.id !== song.id).map((item) => item.id),
                          );
                        } else if (checked) {
                          setSelectedSongIds(
                            selectedSongIds.filter((id) => id !== song.id),
                          );
                        } else {
                          setSelectedSongIds([...selectedSongIds, song.id]);
                        }
                      }}
                    />
                    <span>{song.title} — {song.artist}</span>
                  </SongOption>
                );
              })}
            </SongList>
          </SongSelection>

          <ChartCard>
            <ChartTitle>Clicks por canción y plataforma</ChartTitle>
            {visibleChartData.length === 0 ? (
          <ChartEmpty>
                {loading
                  ? "Cargando datos..."
                  : selectedSongIds?.length === 0
                    ? "Selecciona al menos una canción."
                    : "Sin datos para mostrar"}
              </ChartEmpty>
            ) : (
              <ResponsiveContainer width="100%" height={360}>
                <BarChart
                  data={visibleChartData}
              margin={{ top: 8, right: 24, left: 0, bottom: 56 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-soft)" />
                  <XAxis
                    dataKey="songLabel"
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                    height={80}
                    tick={{ fill: "var(--text-muted)", fontSize: 11 }}
                  />
                  <YAxis allowDecimals={false} tick={{ fill: "var(--text-muted)" }} />
                  <Tooltip content={<ChartTooltip />} cursor={false} />
                  <Legend />
                  {chartPlatforms.map((platform, index) => (
                    <Bar
                      key={platform}
                      dataKey={platform}
                      name={
                        platform === "desconocida"
                          ? "Sin plataforma"
                          : platform.replace(/_/g, " ")
                      }
                      stackId="platforms"
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </>
      )}

      {activeTab === "detail" && <TableWrapper>
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
            ) : clicks.length === 0 ? (
              <tr>
                <EmptyRow colSpan={5}>Sin resultados</EmptyRow>
              </tr>
            ) : (
              clicks.map((c, i) => (
                <tr key={c.id}>
                  <td>{page * PAGE_SIZE + i + 1}</td>
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
      </TableWrapper>}

      {activeTab === "detail" && totalPages > 0 && (
        <Pagination>
          <PageButton
            type="button"
            disabled={page === 0 || loading}
            onClick={() => setPage((current) => current - 1)}
          >
            Anterior
          </PageButton>
          <span>
            Página {page + 1} de {totalPages}
          </span>
          <PageButton
            type="button"
            disabled={page + 1 >= totalPages || loading}
            onClick={() => setPage((current) => current + 1)}
          >
            Siguiente
          </PageButton>
        </Pagination>
      )}
    </Page>
  );
};

export default Analytics;
