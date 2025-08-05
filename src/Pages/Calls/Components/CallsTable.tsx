import React, {useMemo} from 'react';
import type {CallRecord, sortByTypes, sortOrderTypes} from '@/types/CallTypes.ts';
import styles from '../CallsPage.module.scss';
import {format, isToday, isYesterday} from 'date-fns';
import CallRow from './CallRow.tsx';
import {ChevronUp} from '@/assets/icons/ChevronUp.tsx';
import {ChevronDown} from '@/assets/icons/ChevronDown.tsx';

interface CallsTableProps {
    calls: CallRecord[];
    sortBy: sortByTypes;
    sortOrder: sortOrderTypes;
    onSort: (field: sortByTypes) => void;
}

const CallsTable: React.FC<CallsTableProps> = ({calls, sortBy, sortOrder, onSort}) => {
    const sortedCalls = useMemo(() => {
        return [...calls].sort((a, b) => {
            const aVal = sortBy === 'date' ? new Date(a.date).getTime() : a.time;
            const bVal = sortBy === 'date' ? new Date(b.date).getTime() : b.time;
            return sortOrder === 'ASC' ? aVal - bVal : bVal - aVal;
        });
    }, [calls, sortBy, sortOrder]);

    const groupedCalls = useMemo(() => {
        const groups = new Map<string, CallRecord[]>();

        sortedCalls.forEach(call => {
            const callDate = new Date(call.date);

            let label: string;
            if (isToday(callDate)) label = 'Сегодня';
            else if (isYesterday(callDate)) label = 'Вчера';
            else label = format(callDate, 'dd.MM.yyyy');

            if (!groups.has(label)) {
                groups.set(label, []);
            }

            groups.get(label)!.push(call);
        });

        return groups;
    }, [sortedCalls]);

    if (calls.length === 0) {
        return <div>Нет звонков за выбранный период</div>;
    }

    return (
        <div className={styles.tableWrapper}>
            <table className={styles.table}>
                <thead className={styles.tableHeader}>
                <tr>
                    <th>Тип</th>
                    <th className={styles.thWithSort} onClick={() => onSort('date')}>
                        <span>Время</span>
                        <span className={styles.sortChevron}>
                {sortBy === 'date' ? (sortOrder === 'ASC' ? ChevronUp : ChevronDown) : ''}
              </span>
                    </th>
                    <th>Сотрудник</th>
                    <th>Звонок</th>
                    <th>Источник</th>
                    <th>Оценка</th>
                    <th className={styles.thWithSort} onClick={() => onSort('duration')}>
                        <span>Длительность</span>
                        <span className={styles.sortChevron}>
                {sortBy === 'duration' ? (sortOrder === 'ASC' ? ChevronUp : ChevronDown) : ''}
              </span>
                    </th>
                </tr>
                </thead>
                <tbody>
                {Array.from(groupedCalls.entries()).map(([label, callsForDate]) => (
                    <React.Fragment key={label}>
                        {(sortBy === 'date') && (label !== 'Сегодня' || sortOrder === 'ASC') && (
                            <tr>
                                <td className={styles.dateRow} colSpan={7}>
                                    <div className={styles.dateRow__content}>
                                        <span>{label}</span> <sup>{callsForDate.length}</sup>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {callsForDate.map(call => (
                            <CallRow key={call.id} call={call}/>
                        ))}
                    </React.Fragment>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default CallsTable;
