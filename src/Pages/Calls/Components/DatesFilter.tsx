import React, {useState, useEffect, useRef, useMemo} from 'react';
import {format} from 'date-fns';
import styles from '../CallsPage.module.scss';
import {ChevronLeft} from "@/assets/icons/ChevronLeft.tsx";
import {ChevronRight} from "@/assets/icons/ChevronRight.tsx";
import {Calendar} from "@/assets/icons/Calendar.tsx";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import type {CustomDateRange, datesFilterTypes} from "@/types/CallTypes.ts";

interface DatesFilterProps {
    days: number;
    customRange: CustomDateRange;
    selectedOption: datesFilterTypes;
    onOptionChange: (option: datesFilterTypes) => void;
    onDateChange: (start: string, end: string) => void;
    onDaysChange: (days: number) => void;
}

export const DatesFilter: React.FC<DatesFilterProps> = ({
                                                          days,
                                                          customRange,
                                                          selectedOption,
                                                          onOptionChange,
                                                          onDateChange,
                                                          onDaysChange
                                                      }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [isCalendarVisible , setIsCalendarVisible ] = useState<boolean>(false);
    const [startDate, setStartDate] = useState<Date | null>(customRange.start);
    const [endDate, setEndDate] = useState<Date | null>(customRange.end);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleOptionSelect = (option: datesFilterTypes) => {
        onOptionChange(option);

        if (option === 'Указать даты') {
            setIsCalendarVisible(true);
        } else {
            setIsOpen(false);
            setIsCalendarVisible(false);
        }
    };

    const decreaseDays = () => {
        onDaysChange(Math.max(days - 1, 1));
    };

    const increaseDays = () => {
        onDaysChange(days + 1);
    };

    const getDayWord = (num: number): string => {
        if (num % 100 >= 11 && num % 100 <= 14) return 'дней';
        const lastDigit = num % 10;
        if (lastDigit === 1) return 'день';
        if (lastDigit >= 2 && lastDigit <= 4) return 'дня';
        return 'дней';
    };

    type DropdownOption = {
        key: datesFilterTypes;
        label: string;
        isCustomDate?: boolean;
    };

    const dropdownOptions: DropdownOption[] = useMemo(() => [
        { key: 'custom', label: `${days} ${getDayWord(days)}` },
        { key: 'Неделя', label: 'Неделя' },
        { key: 'Месяц', label: 'Месяц' },
        { key: 'Год', label: 'Год' },
        { key: 'Указать даты', label: 'Указать даты', isCustomDate: true }
    ], [days]);

    let displayLabel;

    switch (selectedOption) {
        case 'custom':
            displayLabel = `${days} ${getDayWord(days)}`;
            break;

        case 'Указать даты':
            if (customRange.start && customRange.end) {
                if (customRange.start.getTime() === customRange.end.getTime()) {
                    displayLabel = `${format(customRange.start, 'dd.MM')}`;
                } else {
                    displayLabel = `${format(customRange.start, 'dd.MM')} – ${format(customRange.end, 'dd.MM')}`;
                }
            }
            break;

        default:
            displayLabel = selectedOption;
            break;
    }

    return (
        <div className={styles.datesFilterWrapper} ref={ref}>
            <span className={styles.datesFilter}>
                {selectedOption === 'custom' &&
                    <button onClick={decreaseDays} className={styles.datesFilterChevron}>
                        {ChevronLeft}
                    </button>
                }
                <button className={styles.daysFilterText} onClick={() => setIsOpen(!isOpen)}>
                    <span className={styles.datesFilterBlockSelect}>
                        <span className={`${styles.datesFilterCalendar} ${isOpen ? 'accent' : ''}`}>
                            {Calendar}
                        </span>
                        <span className={`${styles.datesFilterText} ${isOpen ? 'text' : ''}`}>
                            {displayLabel}
                        </span>
                    </span>
                </button>
                {selectedOption === 'custom' &&
                    <button onClick={increaseDays} className={styles.datesFilterChevron}>
                        {ChevronRight}
                    </button>
                }
            </span>

            {isOpen && (
                <ul className={styles.dropdown}>
                    {dropdownOptions.map((option) => (
                        <li
                            key={option.key}
                            className={`${styles.dropdownItem} ${selectedOption === option.key ? styles.active : ''}`}
                            onClick={() => {handleOptionSelect(option.key);}}
                        >
                            {option.isCustomDate ? (
                                <>
                                    Указать даты <br/>
                                    <small>
                                        {customRange.start && customRange.end
                                            ? `${format(customRange.start, 'dd.MM.yyyy')} – ${format(customRange.end, 'dd.MM.yyyy')}`
                                            : '__.__.____ – __.__.____'} {Calendar}
                                    </small>
                                </>
                            ) : option.label}
                        </li>
                    ))}
                    {isCalendarVisible && (
                        <div className={styles.calendar}>
                            <ReactDatePicker
                                showMonthYearDropdown
                                selected={startDate}
                                onChange={(update) => {
                                    const [start, end] = update as [Date | null, Date | null];
                                    setStartDate(start);
                                    setEndDate(end);

                                    if (start && end) {
                                        const [from, to] = start > end ? [end, start] : [start, end];
                                        onDateChange(format(from, 'yyyy-MM-dd'), format(to, 'yyyy-MM-dd'));
                                        setIsCalendarVisible(false);
                                        setIsOpen(false);
                                    }
                                }}
                                startDate={startDate}
                                endDate={endDate}
                                selectsRange
                                inline
                                minDate={new Date(1900, 0, 1)}
                                maxDate={new Date(2100, 11, 31)}
                            />
                        </div>
                    )}
                </ul>
            )}
        </div>
    );
};
