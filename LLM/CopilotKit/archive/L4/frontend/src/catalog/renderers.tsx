
import React from "react";
import {
  PieChart as RechartsPie,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  createCatalog,
  type CatalogRenderers,
} from "@copilotkit/a2ui-renderer";
import {
  demonstrationCatalogDefinitions,
  type DemonstrationCatalogDefinitions,
} from "./definitions";

function resolveText(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "path" in value)
    return String((value as { path: string }).path);
  return String(value ?? "");
}

// ─── Renderers (type-checked against schema definitions) ────────────

const demonstrationCatalogRenderers: CatalogRenderers<DemonstrationCatalogDefinitions> =
  {
    Title: ({ props }) => {
      const Tag = (
        props.level === "h1" ? "h1" : props.level === "h3" ? "h3" : "h2"
      ) as "h1" | "h2" | "h3";
      const sizes: Record<string, string> = {
        h1: "1.75rem",
        h2: "1.25rem",
        h3: "1rem",
      };
      return (
        <Tag
          style={{
            margin: 0,
            fontWeight: 600,
            fontSize: sizes[props.level ?? "h2"],
            color: "#111827",
            letterSpacing: "-0.01em",
          }}
        >
          {resolveText(props.text)}
        </Tag>
      );
    },

    Text: ({ props }) => {
      const styles: Record<string, React.CSSProperties> = {
        h1: { fontSize: "1.5rem", fontWeight: 700, color: "#111827" },
        h2: { fontSize: "1.25rem", fontWeight: 700, color: "#111827" },
        h3: { fontSize: "1rem", fontWeight: 600, color: "#374151" },
        body: { fontSize: "0.875rem", color: "#374151" },
        caption: { fontSize: "0.75rem", color: "#6b7280" },
      };
      return (
        <span style={styles[props.variant ?? "body"]}>
          {resolveText(props.text)}
        </span>
      );
    },

    Icon: ({ props }) => (
      <span
        className="material-symbols-outlined"
        style={{ fontSize: props.size ?? 24, color: "#6b7280" }}
      >
        {props.name}
      </span>
    ),

    Image: ({ props }) => (
      <img
        src={resolveText(props.src)}
        alt={resolveText(props.alt ?? "")}
        style={{
          width: props.width ?? "auto",
          height: props.height ?? "auto",
          maxWidth: "100%",
          borderRadius: 8,
        }}
      />
    ),

    Divider: () => (
      <hr style={{ border: "none", borderTop: "1px solid #e5e7eb", margin: "4px 0" }} />
    ),

    Card: ({ props, children }) => (
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          border: "1px solid #e5e7eb",
          padding: 16,
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        {typeof props.child === "string" && children(props.child)}
      </div>
    ),

    List: ({ props, children }) => {
      const items = Array.isArray(props.children) ? props.children : [];
      const isHorizontal = (props as any).direction === "horizontal";
      return (
        <div
          style={{
            display: "flex",
            flexDirection: isHorizontal ? "row" : "column",
            gap: props.gap ?? 8,
            overflowX: isHorizontal ? "auto" : undefined,
            flexWrap: isHorizontal ? "nowrap" : undefined,
          }}
        >
          {items.map((item: any, i: number) => {
            if (typeof item === "string")
              return <React.Fragment key={`${item}-${i}`}>{children(item)}</React.Fragment>;
            if (item && typeof item === "object" && "id" in item)
              return (
                <div key={`${item.id}-${i}`} style={isHorizontal ? { flex: "0 0 auto", minWidth: 280 } : undefined}>
                  {(children as any)(item.id, item.basePath)}
                </div>
              );
            return null;
          })}
        </div>
      );
    },

    Tabs: ({ props, children }) => {
      const [active, setActive] = React.useState(0);
      const tabs = props.tabs ?? [];
      return (
        <div>
          <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #e5e7eb" }}>
            {tabs.map((tab: any, i: number) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                style={{
                  padding: "8px 16px",
                  fontSize: "0.85rem",
                  fontWeight: active === i ? 600 : 400,
                  color: active === i ? "#111827" : "#6b7280",
                  borderBottom: active === i ? "2px solid #111827" : "2px solid transparent",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div style={{ padding: "12px 0" }}>
            {tabs[active] && children(tabs[active].child)}
          </div>
        </div>
      );
    },

    Row: ({ props, children }) => {
      const justifyMap: Record<string, string> = {
        start: "flex-start",
        center: "center",
        end: "flex-end",
        spaceBetween: "space-between",
      };
      const items = Array.isArray(props.children) ? props.children : [];
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: `${props.gap ?? 16}px`,
            alignItems: props.align ?? "stretch",
            justifyContent:
              justifyMap[props.justify ?? "start"] ?? "flex-start",
            flexWrap: "wrap",
            width: "100%",
          }}
        >
          {items.map((item: any, i: number) => {
            if (typeof item === "string")
              return (
                <div
                  key={`${item}-${i}`}
                  style={{ flex: "1 1 0", minWidth: 0 }}
                >
                  {children(item)}
                </div>
              );
            if (item && typeof item === "object" && "id" in item)
              return (
                <div
                  key={`${item.id}-${i}`}
                  style={{ flex: "1 1 0", minWidth: 0 }}
                >
                  {(children as any)(item.id, item.basePath)}
                </div>
              );
            return null;
          })}
        </div>
      );
    },

    Column: ({ props, children }) => {
      const items = Array.isArray(props.children) ? props.children : [];
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: `${props.gap ?? 12}px`,
            width: "100%",
          }}
        >
          {items.map((item: any, i: number) => {
            if (typeof item === "string")
              return (
                <React.Fragment key={`${item}-${i}`}>
                  {children(item)}
                </React.Fragment>
              );
            if (item && typeof item === "object" && "id" in item)
              return (
                <React.Fragment key={`${item.id}-${i}`}>
                  {(children as any)(item.id, item.basePath)}
                </React.Fragment>
              );
            return null;
          })}
        </div>
      );
    },

    DashboardCard: ({ props, children }) => (
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          padding: "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <div>
          <div
            style={{ fontWeight: 600, fontSize: "0.9rem", color: "#111827" }}
          >
            {resolveText(props.title)}
          </div>
          {props.subtitle && (
            <div
              style={{
                fontSize: "0.75rem",
                color: "#6b7280",
                marginTop: "2px",
              }}
            >
              {resolveText(props.subtitle)}
            </div>
          )}
        </div>
        {typeof props.child === "string" && children(props.child)}
      </div>
    ),

    Metric: ({ props }) => {
      const trendColors: Record<string, string> = {
        up: "#059669",
        down: "#dc2626",
        neutral: "#6b7280",
      };
      const trendIcons: Record<string, string> = {
        up: "↑",
        down: "↓",
        neutral: "→",
      };
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span
            style={{
              fontSize: "0.75rem",
              color: "#6b7280",
              fontWeight: 500,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {resolveText(props.label)}
          </span>
          <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
            <span
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#111827",
                letterSpacing: "-0.02em",
              }}
            >
              {resolveText(props.value)}
            </span>
            {props.trend && props.trendValue && (
              <span
                style={{
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  color: trendColors[props.trend] ?? "#6b7280",
                }}
              >
                {trendIcons[props.trend]} {resolveText(props.trendValue)}
              </span>
            )}
          </div>
        </div>
      );
    },

    PieChart: ({ props }) => {
      const COLORS = [
        "#3b82f6",
        "#8b5cf6",
        "#ec4899",
        "#f59e0b",
        "#10b981",
        "#6366f1",
      ];
      const data = props.data ?? [];
      return (
        <div style={{ width: "100%", height: 200 }}>
          <ResponsiveContainer>
            <RechartsPie>
              <Pie
                data={data}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="50%"
                innerRadius={props.innerRadius ?? 40}
                outerRadius={80}
                paddingAngle={2}
              >
                {data.map((entry: any, i: number) => (
                  <Cell
                    key={i}
                    fill={entry.color ?? COLORS[i % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPie>
          </ResponsiveContainer>
        </div>
      );
    },

    BarChart: ({ props }) => {
      const data = props.data ?? [];
      return (
        <div style={{ width: "100%", height: 200 }}>
          <ResponsiveContainer>
            <RechartsBar data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#6b7280" }} />
              <YAxis tick={{ fontSize: 11, fill: "#6b7280" }} />
              <Tooltip />
              <Bar
                dataKey="value"
                fill={props.color ?? "#3b82f6"}
                radius={[4, 4, 0, 0]}
              />
            </RechartsBar>
          </ResponsiveContainer>
        </div>
      );
    },

    Badge: ({ props }) => {
      const variants: Record<string, { bg: string; color: string }> = {
        success: { bg: "#dcfce7", color: "#166534" },
        warning: { bg: "#fef3c7", color: "#92400e" },
        error: { bg: "#fee2e2", color: "#991b1b" },
        info: { bg: "#dbeafe", color: "#1e40af" },
        neutral: { bg: "#f3f4f6", color: "#374151" },
      };
      const v = variants[props.variant ?? "neutral"] ?? variants.neutral;
      return (
        <span
          style={{
            display: "inline-block",
            padding: "2px 8px",
            borderRadius: "9999px",
            fontSize: "0.7rem",
            fontWeight: 500,
            background: v.bg,
            color: v.color,
          }}
        >
          {resolveText(props.text)}
        </span>
      );
    },

    DataTable: ({ props }) => {
      const cols = props.columns ?? [];
      const rows = props.rows ?? [];
      return (
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.8rem",
            }}
          >
            <thead>
              <tr>
                {cols.map((col: any) => (
                  <th
                    key={col.key}
                    style={{
                      textAlign: "left",
                      padding: "8px 12px",
                      borderBottom: "2px solid #e5e7eb",
                      color: "#6b7280",
                      fontWeight: 600,
                      fontSize: "0.7rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row: any, i: number) => (
                <tr key={i} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  {cols.map((col: any) => (
                    <td
                      key={col.key}
                      style={{ padding: "8px 12px", color: "#374151" }}
                    >
                      {String(row[col.key] ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    },

    Button: ({ props, children, dispatch }) => {
      const variants: Record<string, React.CSSProperties> = {
        primary: { background: "#111827", color: "#fff", border: "none" },
        secondary: {
          background: "#fff",
          color: "#374151",
          border: "1px solid #d1d5db",
        },
        ghost: { background: "transparent", color: "#3b82f6", border: "none" },
      };
      const style = variants[props.variant ?? "primary"] ?? variants.primary;
      return (
        <button
          style={{
            ...style,
            padding: "8px 16px",
            borderRadius: "8px",
            fontSize: "0.8rem",
            fontWeight: 500,
            cursor: "pointer",
            transition: "opacity 0.15s",
            width: "100%",
          }}
          onClick={() => dispatch?.(props.action)}
        >
          {typeof props.child === "string" ? children(props.child) : (props as any).label ?? null}
        </button>
      );
    },
  };

// ─── Assembled Catalog ───────────────────────────────────────────────

export const demonstrationCatalog = createCatalog(
  demonstrationCatalogDefinitions,
  demonstrationCatalogRenderers,
  {
    catalogId: "copilotkit://app-dashboard-catalog",
    includeBasicCatalog: false,
  },
);
