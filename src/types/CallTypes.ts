export interface CallFilters {
    date_start: string;
    date_end: string;
    in_out?: 0 | 1 | null;
    limit?: number;
    offset?: number;
    sort_by?: "date" | "duration";
    order?: "ASC" | "DESC";
    status?: "success" | "fail";
    from_type?: string[];
    from_persons?: number[];
    sources?: string[];
    duration_gte?: number;
    duration_lte?: number;
    errors?: string[];
    results?: string[];
    search?: string;
    ids?: number[];
    xls?: 1;
}

export interface CallRecord {
    id: number;
    partnership_id: string;
    partner_data: {
        id: string;
        name: string;
        phone: string;
    };
    date: string;             // дата и время звонка, например "2022-04-19 12:10:08"
    date_notime: string;      // дата без времени, например "2022-04-19"
    time: number;             // длительность звонка в секундах
    from_number: string;      // номер, с которого был звонок
    from_extension?: string;  // внутренний номер, с которого был звонок (может отсутствовать)
    to_number: string;        // номер, на который был звонок
    to_extension?: string;    // внутренний номер, на который был звонок (может отсутствовать)
    is_skilla: number;        // признак, что звонок ушёл в КЦ (0 или 1)
    status: string;           // статус звонка ("Дозвонился", "Не дозвонился" и т.п.)
    record?: string;          // id записи звонка (опционально)
    line_number: string;      // номер линии звонка
    line_name: string;        // название линии (источник)
    in_out: number;           // входящий/исходящий звонок (например, 1 — входящий)
    from_site: number;        // признак, что звонок с сайта (0/1)
    source: string;           // источник звонка
    errors: Array<{ title: string }>;  // массив ошибок, например [{title: "Ошибка 1"}]
    disconnect_reason: string;         // причина дисконнекта (если звонок не состоялся)
    results: Array<{
        type: string;           // тип итога, например "is_new", "message"
        title: string;          // заголовок результата
        tooltip?: string;       // всплывающая подсказка (опционально)
    }>;
    stages: Array<{
        person_name: string;         // имя оператора
        person_surname: string;      // фамилия оператора
        person_mango_phone: string;  // внутренний номер сотрудника
        duration: string;            // длительность дозвона (строка)
        disconnect_reason: string;   // причина дисконнекта
    }>;
    abuse?: {
        date: string;                  // дата подачи жалобы
        person_name: string;           // имя жалующегося
        message: string;               // текст жалобы
        support_read_status: number;   // статус прочтения жалобы поддержкой
        support_answer_status: number; // статус ответа на жалобу
        answers: Array<{
            message: string;             // текст ответа
            from_support: number;        // 1 — от поддержки, 0 — от директора
            support_read_status: number; // статус прочтения поддержкой
            person_read_status: number;  // статус прочтения директором
        }>;
    };
    contact_name: string;       // имя абонента (если определено)
    contact_company: string;    // компания абонента (если определено)
    person_id: number;          // id сотрудника
    person_name: string;        // имя сотрудника
    person_surname: string;     // фамилия сотрудника
    person_avatar: string;      // аватар сотрудника (URL)
}

export interface CallsResponse {
    total_rows: string;
    results: CallRecord[];
}

export const callsTypes = ['Все типы', 'Входящие', 'Исходящие'];
export type callsTypeOption = typeof callsTypes[number];
export type datesFilterTypes = 'custom' | 'Неделя' | 'Месяц' | 'Год' | 'Указать даты';
export type sortByTypes = 'date' | 'duration';
export type sortOrderTypes = 'ASC' | 'DESC';
export interface DateRange {
    start: string;
    end: string;
}
export interface CustomDateRange {
    start: Date | null;
    end: Date | null;
}
