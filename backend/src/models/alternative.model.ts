export class ReqGetAllAlternative {
  page?: number;
  search?: string;
  limit?: number;
  kodeBeasiswa?: string;
}

export class ReqPutAlternative {
  kode: string;
  nim: string;
  kodeBeasiswa: string;
}

export class ReqPostAlternative {
  kode: string;
  nim: string;
  kodeBeasiswa: string;
}

export class ReqDeleteAlternative {
  selected: string[];
}

export class AlternativeResponse {
  kode: string;
  nim: string;
  namaLengkap?: string;
  id: string;
  nama?: string;
  kodeBeasiswa: string;
  dibuatPada?: Date;
}
