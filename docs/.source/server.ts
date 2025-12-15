// @ts-nocheck
import { frontmatter as __fd_glob_10 } from "../content/docs/trading-strategies.md?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_9 } from "../content/docs/timeseries-correlations.md?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_8 } from "../content/docs/technical-indicators.md?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_7 } from "../content/docs/research-analyst-debate.md?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_6 } from "../content/docs/investment-dictionary.md?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_5 } from "../content/docs/index.md?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_4 } from "../content/docs/fundamentals.md?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_3 } from "../content/docs/DASHBOARD_API_README.md?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_2 } from "../content/docs/brokers.md?collection=docs&only=frontmatter"
import { frontmatter as __fd_glob_1 } from "../content/docs/API_DATA_SUMMARY.md?collection=docs&only=frontmatter"
import { default as __fd_glob_0 } from "../content/docs/meta.json?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
    docs: {
      /**
       * extracted references (e.g. hrefs, paths), useful for analyzing relationships between pages.
       */
      extractedReferences: import("fumadocs-mdx").ExtractedReference[];
    },
  }
} & {
  DocData: {
    docs: {
      /**
       * Last modified date of document file, obtained from version control.
       *
       */
      lastModified?: Date;
    },
  }
}>({"doc":{"passthroughs":["extractedReferences","lastModified"]}});

export const docs = await create.docsLazy("docs", "content/docs", {"meta.json": __fd_glob_0, }, {"API_DATA_SUMMARY.md": __fd_glob_1, "brokers.md": __fd_glob_2, "DASHBOARD_API_README.md": __fd_glob_3, "fundamentals.md": __fd_glob_4, "index.md": __fd_glob_5, "investment-dictionary.md": __fd_glob_6, "research-analyst-debate.md": __fd_glob_7, "technical-indicators.md": __fd_glob_8, "timeseries-correlations.md": __fd_glob_9, "trading-strategies.md": __fd_glob_10, }, {"API_DATA_SUMMARY.md": () => import("../content/docs/API_DATA_SUMMARY.md?collection=docs"), "brokers.md": () => import("../content/docs/brokers.md?collection=docs"), "DASHBOARD_API_README.md": () => import("../content/docs/DASHBOARD_API_README.md?collection=docs"), "fundamentals.md": () => import("../content/docs/fundamentals.md?collection=docs"), "index.md": () => import("../content/docs/index.md?collection=docs"), "investment-dictionary.md": () => import("../content/docs/investment-dictionary.md?collection=docs"), "research-analyst-debate.md": () => import("../content/docs/research-analyst-debate.md?collection=docs"), "technical-indicators.md": () => import("../content/docs/technical-indicators.md?collection=docs"), "timeseries-correlations.md": () => import("../content/docs/timeseries-correlations.md?collection=docs"), "trading-strategies.md": () => import("../content/docs/trading-strategies.md?collection=docs"), });