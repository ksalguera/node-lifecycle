export interface ReleaseInfo {
  codename?: string;     // official LTS codename, when assigned
  start?: string;        // release start (optional)
  lts?: string;          // LTS start (WG JSON uses "lts")
  maintenance?: string;  // maintenance start (WG uses "maintenance")
  end: string;           // EOL (required)
}

// Release keys have no "v" prefix (e.g. "26", or historical "0.10").
export type Schedule = Record<string, ReleaseInfo>;

export interface Classification {
  major: number;
  status: "current" | "active-lts" | "maintenance" | "eol" | "unknown";
  eol?: string;
  daysToEol?: number;
}
