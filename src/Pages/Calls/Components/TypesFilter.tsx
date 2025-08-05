import React, {useState, useRef, useEffect} from 'react';
import {ChevronUp} from "@/assets/icons/ChevronUp.tsx";
import {ChevronDown} from "@/assets/icons/ChevronDown.tsx";
import styles from '../CallsPage.module.scss';
import {Cross} from "@/assets/icons/Cross.tsx";
import {type callsTypeOption, callsTypes} from "@/types/CallTypes.ts";

type Props = {
    selectedType: callsTypeOption;
    onChange: (type: callsTypeOption) => void;
};

export const TypesFilter: React.FC<Props> = ({selectedType, onChange}) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const ref = useRef<HTMLDivElement>(null);

    const toggleOpen = () => setIsOpen(!isOpen);

    const resetFilters = () => onChange(callsTypes[0]);

    const onSelect = (type: callsTypeOption) => {
        onChange(type);
        setIsOpen(false);
    };

    // Закрытие dropdown по клику вне компонента
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className={styles.typesFilterWrapper} ref={ref}>
          <span className={styles.typesFilter}>
              <button className={styles.typesFilterBlockSelect} onClick={toggleOpen}>
                  <span className={`${styles.typesFilterText} ${isOpen ? 'text' : ''}`}>{selectedType}</span>
                  <span className={`${styles.typesFilterChevron} ${isOpen ? 'accent' : ''}`}>
                    {isOpen ? ChevronUp : ChevronDown}
                  </span>
              </button>
              {selectedType !== "Все типы" &&
                  <button onClick={resetFilters} className={styles.typesFilterBlockReset}>
                      <span className={styles.typesFilterText}>Сбросить фильтры</span>
                      <span className={styles.typesFilterCross}>{Cross}</span>
                  </button>
              }
          </span>

            {isOpen && (
                <ul
                    className={styles.dropdown}
                >
                    {callsTypes.map((type) => (
                        <li
                            key={type}
                            className={`${styles.dropdownItem} ${selectedType === type ? styles.active : ''}`}
                            onClick={() => onSelect(type)}

                        >
                            {type}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
