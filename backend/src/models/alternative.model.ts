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
  code: string;
  nim: string;
  beasiswaCode: string;
}

export class ReqPostAlternative {
  code: string;
  nim: string;
  beasiswaCode: string;
}

export class ReqDeleteAlternative {
  selected: string[];
}

export class AlternativeResponse {
  code: string;
  nim: string;
  fullname?: string;
  id: string;
  name?: string;
  beasiswaCode: string;
  createdAt?: Date;
}
