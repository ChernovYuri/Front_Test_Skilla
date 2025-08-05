import type {CallFilters, CallsResponse} from "../types/CallTypes";

const API_URL = "https://api.skilla.ru/mango/getList";
const TOKEN = "testtoken";

export async function getCallsList(filters: CallFilters): Promise<CallsResponse> {
    const {
        date_start,
        date_end,
        sort_by,
        order,
        in_out,
        limit,
        offset,
    } = filters;

    // Формируем query-параметры
    const queryParams = new URLSearchParams();

    if (date_start) queryParams.append("date_start", date_start);
    if (date_end) queryParams.append("date_end", date_end);
    if (sort_by) queryParams.append("sort_by", sort_by);
    if (order) queryParams.append("order", order);
    if (in_out !== undefined && in_out !== null) queryParams.append("in_out", String(in_out));
    if (limit !== undefined) queryParams.append("limit", String(limit));
    if (offset !== undefined) queryParams.append("offset", String(offset));

    const response = await fetch(`${API_URL}?${queryParams.toString()}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.json();
}

export async function getCallRecord(recordId: string, partnershipId: string): Promise<Blob> {
    const RECORD_URL = `https://api.skilla.ru/mango/getRecord?record=${recordId}&partnership_id=${partnershipId}`;

    const response = await fetch(RECORD_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${TOKEN}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Ошибка получения записи! Статус: ${response.status}`);
    }

     // MP3-файл
    return await response.blob();
}
