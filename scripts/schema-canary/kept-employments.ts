export type KeptEmployment = {
  country: string;
  employmentId: string;
  companyId: string;
  version: number | 'latest';
  strategy: 'rebuild' | 'buildOnce';
  sent: Record<string, unknown>;
  knownUnsavedFields: string[];
};
