import React, {useCallback, useEffect, useState} from 'react';
import {
    type CallFilters,
    type CallRecord,
    type callsTypeOption, type CustomDateRange, type DateRange,
    type datesFilterTypes,
    type sortByTypes, type sortOrderTypes
} from '@/types/CallTypes.ts';
import styles from './CallsPage.module.scss';
import {getCallsList} from '@/api/calls.ts';
import {format, subDays, subMonths, subWeeks, subYears} from 'date-fns';
import {TypesFilter} from "@/Pages/Calls/Components/TypesFilter.tsx";
import {DatesFilter} from "@/Pages/Calls/Components/DatesFilter.tsx";
import CallsTable from "@/Pages/Calls/Components/CallsTable.tsx";

const CallsPage: React.FC = () => {
    const [calls, setCalls] = useState<CallRecord[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<sortByTypes>('date');
    const [sortOrder, setSortOrder] = useState<sortOrderTypes>('DESC');
    const [selectedType, setSelectedType] = useState<callsTypeOption>('Все типы');
    const [days, setDays] = useState<number>(3);
    const [selectedOption, setSelectedOption] = useState<datesFilterTypes>('custom');
    const [customRange, setCustomRange] = useState<CustomDateRange>({start: null, end: null});
    const [dateRange, setDateRange] = useState<DateRange>({
        start: format(subDays(new Date(), days - 1), 'yyyy-MM-dd'),
        end: format(new Date(), 'yyyy-MM-dd'),
    });

    useEffect(() => {
        const today = new Date();
        let startDate = subDays(today, days - 1);
        const endDate = today;

        if (selectedOption === 'Неделя') startDate = subWeeks(today, 1);
        else if (selectedOption === 'Месяц') startDate = subMonths(today, 1);
        else if (selectedOption === 'Год') startDate = subYears(today, 1);

        const formattedStart = format(startDate, 'yyyy-MM-dd');
        const formattedEnd = format(endDate, 'yyyy-MM-dd');

        setDateRange(prev => {
            if (prev.start === formattedStart && prev.end === formattedEnd) return prev;
            return {start: formattedStart, end: formattedEnd};
        });
    }, [days, selectedOption]);

    useEffect(() => {
        if (dateRange.start && dateRange.end) {
            (async () => {
                try {
                    setIsLoading(true);
                    setError(null);

                    const filters: CallFilters = {
                        date_start: dateRange.start,
                        date_end: dateRange.end,
                        sort_by: sortBy,
                        order: sortOrder,
                    };

                    if (selectedType === 'Входящие') filters.in_out = 1;
                    else if (selectedType === 'Исходящие') filters.in_out = 0;

                    const data = await getCallsList(filters);
                    setCalls(data.results);
                } catch (err) {
                    console.error(err);
                    setError('Ошибка загрузки звонков');
                } finally {
                    setIsLoading(false);
                }
            })();
        }
    }, [dateRange, selectedType, sortBy, sortOrder]);

    const handleDateChange = useCallback((start: string, end: string) => {
        setCustomRange({
            start: new Date(start),
            end: new Date(end),
        });

        setDateRange(prev => {
            if (prev.start === start && prev.end === end) return prev;
            return {start, end};
        });
    }, []);

    const handleSort = (field: sortByTypes) => {
        if (sortBy === field) {
            setSortOrder(prev => (prev === 'ASC' ? 'DESC' : 'ASC'));
        } else {
            setSortBy(field);
            setSortOrder('ASC');
        }
    };

    if (error) return <div>{error}</div>;

    return (
        <div className={styles.content}>
            <div className={styles.filters}>
                <TypesFilter selectedType={selectedType} onChange={setSelectedType}/>
                <DatesFilter
                    days={days}
                    customRange={customRange}
                    selectedOption={selectedOption}
                    onOptionChange={setSelectedOption}
                    onDateChange={handleDateChange}
                    onDaysChange={setDays}
                />
            </div>
            {isLoading ?
                <div>Загрузка...</div>
                :
                <CallsTable calls={calls} sortBy={sortBy} sortOrder={sortOrder} onSort={handleSort}/>
            }
        </div>
    );
};

export default CallsPage;
