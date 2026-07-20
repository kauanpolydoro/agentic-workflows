import type { MaintainerId } from "./schema.js";

export interface MaintainerRegistryEntry {
  id: MaintainerId;
  displayName: string;
  members: readonly {
    github: string;
    responsibilities: readonly string[];
  }[];
}

export const maintainerRegistry: Readonly<Record<MaintainerId, MaintainerRegistryEntry>> = {
  "project-maintainers": {
    id: "project-maintainers",
    displayName: "Project maintainers",
    members: [
      {
        github: "kauanpolydoro",
        responsibilities: ["project stewardship", "releases", "security coordination"],
      },
    ],
  },
};
