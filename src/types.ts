export interface ReleaseInfo {
  start?: string;        // release start (optional)
  lts?: string;          // LTS start (WG JSON uses "lts")
  maintenance?: string;  // maintenance start (WG uses "maintenance")
  end: string;           // EOL (required)
}

export type Schedule = Record<string, ReleaseInfo>;

export interface Classification {
  major: number;
  status: "current" | "active-lts" | "maintenance" | "eol" | "unknown";
  eol?: string;
  daysToEol?: number;
}