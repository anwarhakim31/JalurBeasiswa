export class ReqEditAlternative {
  nim: string;
  beasiswaId: string;
}

export class ReqGetAllAlternative {
  page?: number;
  search?: string;
  limit?: number;
}

export class ReqPutAlternative {
  nim: string;
  beasiswaId: string;
}

export class ReqPostAlternative {
  nim: string;
  beasiswaId: string;
}

export class ReqDeleteAlternative {
  selected: string[];
}

export class AlternativeResponse {
  nim: string;
  fullname?: string;
  id: string;
  name?: string;
  beasiswaId: string;
  createdAt?: Date;
}
