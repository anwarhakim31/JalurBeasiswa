export class ReqGetAllBeasiswa {
  page?: number;
  search?: string;
  limit?: number;
  status?: string;
}

export class ReqPutBeasiswa {
  code: string;
  name: string;
  description: string;
  period: string;
  isActive: boolean;
}

export class ReqPostBeasiswa {
  code: string;
  name: string;
  description: string;
  period: string;
  isActive: boolean;
}

export class ReqDeleteBeasiswa {
  selected: string[];
}

export class BeasiswaResponse {
  id: string;
  code: string;
  name: string;
  description: string;
  period: string;
  isActive: boolean;
  createdAt?: Date;
}
