export class ReqEditBeasiswa {
  fullname?: string;
  photo?: string;
  email: string;
}

export class ReqGetAllBeasiswa {
  page?: number;
  search?: string;
  limit?: number;
  status?: string;
}

export class ReqPutBeasiswa {
  name: string;
  description: string;
  period: string;
  isActive: boolean;
}

export class ReqPostBeasiswa {
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
  name: string;
  description: string;
  period: string;
  isActive: boolean;
  createdAt?: Date;
}
