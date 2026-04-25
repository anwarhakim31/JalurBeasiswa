export class ReqGetAllCriteria {
  page?: number;
  search?: string;
  limit?: number;
  type?: string;
}

export class ReqPutCriteria {
  name: string;
  type: string;
  weight: number;
  beasiswaId: string;
}

export class ReqPostCriteria {
  name: string;
  type: string;
  weight: number;
  beasiswaId: string;
}

export class ReqDeleteCriteria {
  selected: string[];
}

export class CriteriaResponse {
  id: string;
  name: string;
  weight: string;
  type: string;
  beasiswaId: string;
  createdAt: Date;
}
