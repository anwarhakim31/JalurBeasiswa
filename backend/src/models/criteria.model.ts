export class ReqGetAllCriteria {
  page?: number;
  search?: string;
  limit?: number;
  type?: string;
}

export class ReqPutCriteria {
  code: string;
  name: string;
  type: string;
  weight: number;
  beasiswaCode: string;
}

export class ReqPostCriteria {
  code: string;
  name: string;
  type: string;
  weight: number;
  beasiswaCode: string;
}

export class ReqDeleteCriteria {
  selected: string[];
}

export class CriteriaResponse {
  id: string;
  name: string;
  code: string;
  weight: number;
  type: string;
  beasiswaCode: string;
  createdAt: Date;
}
