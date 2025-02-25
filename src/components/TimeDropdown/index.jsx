import React, { useState, useEffect, useRef } from 'react';
import Dropdown from '../../shared/Dropdown/Default';

const TimeDropdown = ({ className, small, validationRules, value: externalValue, onChange, label, placeholder, disabled }) => {
    const [internalValue, setInternalValue] = useState(externalValue || null);
    const [inputValue, setInputValue] = useState(externalValue || '');
    const [error, setError] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const lastKeyPressRef = useRef(null);

    // Generate predefined time options from 8:00 to 23:45, incrementing by 15 minutes
    const generateTimeOptions = () => {
        const times = [];
        for (let hour = 8; hour < 24; hour++) {
            for (let minute = 0; minute < 60; minute += 15) {
                const formattedHour = hour.toString().padStart(2, '0');
                const formattedMinute = minute.toString().padStart(2, '0');
                times.push(`${formattedHour}:${formattedMinute}`);
            }
        }
        return times;
    };

    const timeOptions = generateTimeOptions();

    // Parse and validate time input
    const parseTimeInput = (input, isUserDeleting = false) => {
        // Allow empty input
        if (!input || input.trim() === '') {
            return { isValid: false, error: '', isEmpty: true, raw: '' };
        }

        // For deletion operations, just clean non-numeric/colon chars but don't format further
        if (isUserDeleting) {
            const cleaned = input.trim().replace(/[^0-9:]/g, '');
            return {
                isValid: false,
                error: '',
                isEmpty: false,
                raw: cleaned,
                formatted: cleaned
            };
        }

        // Remove any non-numeric characters except colon
        let cleaned = input.trim().replace(/[^0-9:]/g, '');

        let hours = 0;
        let minutes = 0;
        let isPartial = false;

        // Handle different input formats
        if (cleaned.includes(':')) {
            // Format: "8:", "8:1", "8:15", etc.
            const parts = cleaned.split(':');
            hours = parseInt(parts[0], 10) || 0;

            if (parts.length > 1) {
                if (parts[1] === '') {
                    isPartial = true;
                    minutes = 0;
                } else {
                    minutes = parseInt(parts[1], 10) || 0;
                }
            } else {
                isPartial = true;
                minutes = 0;
            }
        } else if (cleaned.length <= 2) {
            // Format: "8", "12", etc. (hours only)
            hours = parseInt(cleaned, 10) || 0;
            minutes = 0;
            isPartial = true;
        } else {
            // Format: "812", "1215", etc. (compressed)
            const parsedNumber = parseInt(cleaned, 10);

            if (cleaned.length === 3) {
                // Format: "812" -> 8:12
                hours = Math.floor(parsedNumber / 100);
                minutes = parsedNumber % 100;
            } else if (cleaned.length >= 4) {
                // Format: "1215" -> 12:15
                hours = Math.floor(parsedNumber / 100);
                minutes = parsedNumber % 100;
            } else {
                // Invalid input
                return {
                    isValid: false,
                    error: 'Некорректный формат времени',
                    raw: cleaned,
                    formatted: cleaned
                };
            }
        }

        // Apply validation rules
        const defaultRules = {
            minHour: 8,
            maxHour: 23,
            allowAnyMinute: true,
        };

        const rules = { ...defaultRules, ...validationRules };

        // Don't validate partial inputs for errors
        if (!isPartial) {
            // Validate hours
            if (hours < rules.minHour) {
                return {
                    isValid: false,
                    error: `Время должно быть не раньше ${rules.minHour}:00`,
                    raw: cleaned,
                    formatted: cleaned
                };
            }

            if (hours > rules.maxHour) {
                return {
                    isValid: false,
                    error: `Время должно быть не позже ${rules.maxHour}:59`,
                    raw: cleaned,
                    formatted: cleaned
                };
            }

            // Validate minutes
            if (minutes < 0 || minutes > 59) {
                return {
                    isValid: false,
                    error: 'Минуты должны быть от 0 до 59',
                    raw: cleaned,
                    formatted: cleaned
                };
            }

            // Check if minutes need to be in 15-minute increments
            if (!rules.allowAnyMinute && minutes % 15 !== 0) {
                return {
                    isValid: false,
                    error: 'Минуты должны быть кратны 15 (00, 15, 30, 45)',
                    raw: cleaned,
                    formatted: cleaned
                };
            }
        }

        // Format time for display and return
        const formattedHour = hours.toString().padStart(2, '0');
        const formattedMinute = minutes.toString().padStart(2, '0');

        // For partial inputs like "8:" just return what the user typed
        if (isPartial && cleaned.includes(':') && !cleaned.split(':')[1]) {
            return {
                isValid: true,
                hours,
                minutes,
                isPartial,
                raw: cleaned,
                formatted: `${hours}:`
            };
        }

        // For partial inputs like "8" - don't format yet
        if (isPartial && !cleaned.includes(':')) {
            return {
                isValid: true,
                hours,
                minutes,
                isPartial,
                raw: cleaned,
                formatted: cleaned
            };
        }

        const formattedTime = `${formattedHour}:${formattedMinute}`;

        return {
            isValid: true,
            hours,
            minutes,
            isPartial,
            raw: cleaned,
            formatted: formattedTime
        };
    };

    // Handle key down events to detect deletion
    const handleKeyDown = (event) => {
        lastKeyPressRef.current = event.key;
        if (event.key === 'Backspace' || event.key === 'Delete') {
            setIsDeleting(true);
        } else {
            setIsDeleting(false);
        }
    };

    // Handle async search for dropdown options
    const asyncSearch = async (searchValue) => {
        // Check if we're in deletion mode
        const isDeletingNow = isDeleting || lastKeyPressRef.current === 'Backspace' || lastKeyPressRef.current === 'Delete';

        // Allow empty input
        if (!searchValue || searchValue.trim() === '') {
            setInputValue('');
            setInternalValue(null);
            setError('');
            if (onChange) onChange(null);
            return timeOptions;
        }

        // Parse the input differently if we're deleting
        const parsed = parseTimeInput(searchValue, isDeletingNow);

        // When deleting, just use the raw cleaned input
        if (isDeletingNow) {
            setInputValue(parsed.raw);

            // Only validate complete time formats when deleting
            if (parsed.raw.match(/^\d{1,2}:\d{2}$/)) {
                const fullParsed = parseTimeInput(parsed.raw, false);
                if (fullParsed.isValid && !fullParsed.isPartial) {
                    setInternalValue(fullParsed.formatted);
                    setError('');
                    if (onChange) onChange(fullParsed.formatted);
                } else if (!fullParsed.isValid) {
                    setInternalValue(null);
                    setError(fullParsed.error);
                    if (onChange) onChange(null);
                } else {
                    setInternalValue(null);
                    setError('');
                    if (onChange) onChange(null);
                }
            } else {
                setInternalValue(null);
                setError('');
                if (onChange) onChange(null);
            }

            // Reset deletion flag after handling
            setTimeout(() => {
                setIsDeleting(false);
            }, 50);

            // Filter options based on the current input
            const filtered = timeOptions.filter(time =>
                time.toLowerCase().includes(parsed.raw.toLowerCase())
            );
            return filtered;
        }

        // Normal input handling for non-deletion
        if (parsed.isValid) {
            setInputValue(parsed.formatted);

            // Only set as valid value if it's a complete time
            if (!parsed.isPartial) {
                setInternalValue(parsed.formatted);
                setError('');
                if (onChange) onChange(parsed.formatted);
            } else {
                setInternalValue(null);
                setError('');
                if (onChange) onChange(null);
            }
        } else {
            setInputValue(parsed.raw || searchValue);
            setInternalValue(null);

            // Only show errors for non-empty inputs
            if (parsed.error) {
                setError(parsed.error);
            } else {
                setError('');
            }

            if (onChange) onChange(null);
        }

        // Filter options based on the current input
        const filtered = timeOptions.filter(time =>
            time.toLowerCase().includes((parsed.raw || searchValue).toLowerCase())
        );

        return filtered;
    };

    // Handle selection from dropdown
    const handleTimeChange = (time) => {
        if (!time) {
            setInternalValue(null);
            setInputValue('');
            setError('');
            if (onChange) onChange(null);
            return;
        }

        const parsed = parseTimeInput(time);

        if (parsed.isValid && !parsed.isPartial) {
            setInternalValue(parsed.formatted);
            setInputValue(parsed.formatted);
            setError('');
            if (onChange) onChange(parsed.formatted);
        } else if (!parsed.isValid) {
            setInternalValue(null);
            setInputValue(parsed.raw || time);
            setError(parsed.error || '');
            if (onChange) onChange(null);
        } else {
            // Handle partial inputs
            setInternalValue(null);
            setInputValue(parsed.raw || time);
            setError('');
            if (onChange) onChange(null);
        }
    };

    // Sync with external value
    useEffect(() => {
        if (externalValue !== undefined && externalValue !== internalValue) {
            if (!externalValue) {
                setInternalValue(null);
                setInputValue('');
                setError('');
            } else {
                const parsed = parseTimeInput(externalValue);
                if (parsed.isValid && !parsed.isPartial) {
                    setInternalValue(parsed.formatted);
                    setInputValue(parsed.formatted);
                    setError('');
                }
            }
        }
    }, [externalValue]);

    return (
        <Dropdown

            disabled={disabled}
            minAsyncInput={0} // Allow any input length
            value={internalValue}
            setValue={handleTimeChange}
            options={timeOptions}
            label={label}
            renderOption={(time) => time}
            renderValue={(time) => time || placeholder || 'Выберите время'}
            placeholder={placeholder}
            isAsync={true}
            asyncSearch={asyncSearch}
            classNameContainer={className}
            small={small}
            error={error}
            onKeyDown={handleKeyDown}
        />
    );
};

TimeDropdown.displayName = 'TimeDropdown';

export default TimeDropdown;