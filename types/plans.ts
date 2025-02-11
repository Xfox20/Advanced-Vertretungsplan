export interface ItslearningResourceElement {
  elementUrl: string;
  title: string;
}

export type Substitution = {
  id: string;
  teacher: string;
  subject: string | { name: string; type: string };
  room: string;
  substitution?: {
    teacher?: string;
    subject?: string;
    room?: string;
  };
  note: string;
  classes: string[];
  hours: number[];
};

export type SubstitutionPlan = {
  date: Date;
  updatedAt: Date;
  notes: string[];
  substitutions: Substitution[];
};

export type DetailedSubstitutionPlan = SubstitutionPlan & {
  id: string;
  lastFetched: Date;
  faulty?: boolean;
};

export type DownloadManifest = {
  current: string;
  versions: {
    [key: string]: {
      fetchedAt: Date;
      lastChecked: Date;
      usedOcr?: boolean;
    };
  };
};
