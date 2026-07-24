
import { z } from "zod";

export const demonstrationCatalogDefinitions = {
  Title: {
    description: "A heading. Use for section titles and page headers.",
    props: z.object({
      text: z.string(),
      level: z.string().optional(),
    }),
  },

  Text: {
    description: "A text element. Use for labels, values, captions.",
    props: z.object({
      text: z.union([z.string(), z.object({ path: z.string() })]),
      variant: z.enum(["h1", "h2", "h3", "body", "caption"]).optional(),
    }),
  },

  Icon: {
    description: "A material icon by name.",
    props: z.object({
      name: z.string(),
      size: z.number().optional(),
    }),
  },

  Image: {
    description: "An image element.",
    props: z.object({
      src: z.union([z.string(), z.object({ path: z.string() })]),
      alt: z.union([z.string(), z.object({ path: z.string() })]).optional(),
      width: z.number().optional(),
      height: z.number().optional(),
    }),
  },

  Divider: {
    description: "A horizontal divider line.",
    props: z.object({}),
  },

  Card: {
    description: "A generic card container with a child slot.",
    props: z.object({
      child: z.string().optional(),
    }),
  },

  List: {
    description: "A list of children. Supports horizontal or vertical direction.",
    props: z.object({
      children: z.union([
        z.array(z.string()),
        z.object({ componentId: z.string(), path: z.string() }),
      ]),
      direction: z.enum(["horizontal", "vertical"]).optional(),
      gap: z.number().optional(),
    }),
  },

  Tabs: {
    description: "A tabbed container. Each tab has a label and child content.",
    props: z.object({
      tabs: z.array(z.object({ label: z.string(), child: z.string() })),
    }),
  },

  Row: {
    description: "Horizontal layout container.",
    props: z.object({
      gap: z.number().optional(),
      align: z.string().optional(),
      justify: z.string().optional(),
      children: z.union([
        z.array(z.string()),
        z.object({ componentId: z.string(), path: z.string() }),
      ]),
    }),
  },

  Column: {
    description: "Vertical layout container.",
    props: z.object({
      gap: z.number().optional(),
      align: z.string().optional(),
      children: z.union([
        z.array(z.string()),
        z.object({ componentId: z.string(), path: z.string() }),
      ]),
    }),
  },

  DashboardCard: {
    description:
      "A card container with title and optional subtitle. Has a 'child' slot for content (chart, metrics, etc). Use 'child' with a single component ID.",
    props: z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      child: z.string().optional(),
    }),
  },

  Metric: {
    description:
      "A key metric display with label, value, and optional trend indicator. Great for KPIs and stats.",
    props: z.object({
      label: z.string(),
      value: z.string(),
      trend: z.enum(["up", "down", "neutral"]).optional(),
      trendValue: z.string().optional(),
    }),
  },

  PieChart: {
    description:
      "A pie/donut chart. Provide data as array of {label, value, color} objects.",
    props: z.object({
      data: z.array(
        z.object({
          label: z.string(),
          value: z.number(),
          color: z.string().optional(),
        }),
      ),
      innerRadius: z.number().optional(),
    }),
  },

  BarChart: {
    description:
      "A bar chart. Provide data as array of {label, value} objects.",
    props: z.object({
      data: z.array(z.object({ label: z.string(), value: z.number() })),
      color: z.string().optional(),
    }),
  },

  Badge: {
    description:
      "A small status badge/tag. Use for labels, statuses, categories.",
    props: z.object({
      text: z.string(),
      variant: z
        .enum(["success", "warning", "error", "info", "neutral"])
        .optional(),
    }),
  },

  DataTable: {
    description: "A data table with columns and rows.",
    props: z.object({
      columns: z.array(z.object({ key: z.string(), label: z.string() })),
      rows: z.array(z.record(z.any())),
    }),
  },

  Button: {
    description:
      "An interactive button. Use 'label' for simple text or 'child' for a child component. 'action' is dispatched on click.",
    props: z.object({
      label: z.string().optional(),
      child: z
        .string()
        .describe(
          "The ID of the child component (e.g. a Text component for the label).",
        )
        .optional(),
      variant: z.enum(["primary", "secondary", "ghost"]).optional(),
      action: z
        .union([
          z.object({
            event: z.object({
              name: z.string(),
              context: z.record(z.any()).optional(),
            }),
          }),
          z.null(),
        ])
        .optional(),
    }),
  },
};

/** Type helper for renderers */
export type DemonstrationCatalogDefinitions =
  typeof demonstrationCatalogDefinitions;
