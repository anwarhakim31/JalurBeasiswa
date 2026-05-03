export class ReqGetAllCriteria {
  page?: number;
  search?: string;
  limit?: number;
  tipe?: string;
  kodeBeasiswa?: string;
}

export class ReqPutCriteria {
  kode: string;
  nama: string;
  tipe: string;
  bobot: number;
  kodeBeasiswa: string;
}

export class ReqPostCriteria {
  kode: string;
  nama: string;
  tipe: string;
  bobot: number;
  kodeBeasiswa: string;
}

export class ReqDeleteCriteria {
  selected: string[];
}

export class CriteriaResponse {
  id: string;
  nama: string;
  kode: string;
  bobot: number;
  tipe: string;
  kodeBeasiswa: string;
  dibuatPada: Date;
}
