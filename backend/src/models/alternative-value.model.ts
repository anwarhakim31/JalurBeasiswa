export class NILAIALTERNATIF {
  kodeKriteria: string;
  nilai: number;
}
export class ReqGetAllAlternativeValue {
  page?: number;
  search?: string;
  limit?: number;
  kodeAlternatif?: string;
  kodeKriteria?: string;
}

export class ReqPutAlternativeValue {
  kodeAlternatif: string;
  nilaiAlternatif: NILAIALTERNATIF[];
}

export class ReqPostAlternativeValue {
  kodeAlternatif: string;
  nilaiAlternatif: NILAIALTERNATIF[];
}

export class ReqDeleteAlternativeValue {
  selected: string[];
}

export class AlternativeValueResponse {
  kodeAlternatif: string;
  alternatif: {
    pengguna: {
      namaLengkap: string;
    };
  };
  kodeKriteria: string;
  kriteria: {
    nama: string;
  };
  nilai: number;
}
