// src/components/DialPad/index.jsx
import React, { useState, useCallback, useEffect, useMemo } from 'react';
import styles from './DialPad.module.sass';
import useStore from '../../../hooks/useStore';
import Icon from '../../../shared/Icon';
import Dropdown from '../../../shared/Dropdown/Default';
import useAppApi from '../../../api';
import cn from 'classnames';
import useClientsApi from '../../../pages/Clients/clients.api';
import PhoneContact from '../PhoneContact';

const DialPad = ({ onCallInitiated }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [clientData, setClientData] = useState(null);
  const [selectedPhone, setSelectedPhone] = useState('');
  const [showKeypad, setShowKeypad] = useState(false);

  const appApi = useAppApi();
  const clientsApi = useClientsApi();
  const { callsStore } = useStore();

  const validatePhoneNumber = (phone) => {
    const phoneRegex =
      /^\+?\d{1,4}?[-.\s]?\(?\d{1,4}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;
    return phoneRegex.test(phone);
  };

  const asyncSearch = useCallback(
    async (query) => {
      const response = await appApi.getCompanies(query);
      return response || [];
    },
    [appApi],
  );

  const asyncGetCompany = useCallback(
    async (id) => {
      const response = await clientsApi.getFlatClientById(id);
      if (response.status === 'success') {
        return response.body;
      }
      return null;
    },
    [clientsApi],
  );

  const handleNumberClick = (number) => {
    setPhoneNumber((prevNumber) => prevNumber + number);
  };

  const handleClear = () => {
    setPhoneNumber('');
    setClientData(null);
    setSelectedPhone('');
  };

  const toggleKeypad = () => {
    setShowKeypad((prev) => !prev);
  };

  const handleCall = async () => {
    const phoneToCall = selectedPhone || phoneNumber;

    if (!phoneToCall.trim()) return;

    const result = await callsStore.makeCall(phoneToCall);
    if (result.success && onCallInitiated) {
      onCallInitiated(phoneToCall);
      setPhoneNumber('');
      setClientData(null);
      setSelectedPhone('');
      setShowKeypad(false);
    }
  };

  // Update dropdown options when phoneNumber changes
  useEffect(() => {
    const updateOptions = async () => {
      if (!phoneNumber) {
        setSearchResults([]);
        return;
      }

      // Check if it's a valid phone number
      const isValidPhone = validatePhoneNumber(phoneNumber);

      // If we have client data, don't search
      if (clientData) {
        return;
      }

      // If phone number is at least 3 characters, search for companies
      if (phoneNumber.length >= 3) {
        const results = await asyncSearch(phoneNumber);

        // If it's a valid phone number and not already in the results, add it
        if (isValidPhone) {
          const phoneOption = {
            id: 'direct-phone',
            name: phoneNumber,
            isDirectPhone: true,
          };

          // Check if the phone number is already in the results
          const phoneExists = results.some((r) => r.name === phoneNumber);

          if (!phoneExists) {
            setSearchResults([phoneOption, ...results]);
          } else {
            setSearchResults(results);
          }
        } else {
          setSearchResults(results);
        }
      } else if (isValidPhone) {
        // If it's a valid phone number but less than 3 characters
        setSearchResults([
          {
            id: 'direct-phone',
            name: phoneNumber,
            isDirectPhone: true,
          },
        ]);
      } else {
        setSearchResults([]);
      }
    };

    updateOptions();
  }, [phoneNumber, asyncSearch, clientData]);

  const handlePhoneSelected = (phone) => {
    setSelectedPhone(phone);
  };

  const dropDown = useMemo(
    () => (
      <Dropdown
        isAsync={true}
        value={phoneNumber}
        setValue={async (e) => {
          setShowKeypad(false);
          setPhoneNumber(e.name);

          // If it's a direct phone option, don't fetch client data
          if (e.isDirectPhone) {
            setClientData(null);
            setSelectedPhone(e.name);
            return;
          }

          // Fetch client data and set it
          const clientDetails = await asyncGetCompany(e.id);
          setClientData(clientDetails);

          // If there's a phone number available, select it by default
          if (
            clientDetails?.contactData?.tel &&
            Object.keys(clientDetails.contactData.tel).length > 0
          ) {
            setSelectedPhone(clientDetails.contactData.tel[0]);
          }
        }}
        options={searchResults}
        asyncSearch={asyncSearch}
        renderOption={({ name, isDirectPhone }) => (
          <div>
            {isDirectPhone ? (
              <span>
                <Icon name="call" size={16} style={{ marginRight: '8px' }} />
                {name}
              </span>
            ) : (
              name
            )}
          </div>
        )}
        placeholder="Телефон или имя"
        minAsyncInput={3}
        classNameContainer={styles.dropdownContainer}
        className={styles.dropdown}
        classDropdownHead={styles.dropdownHead}
        noMinWidth={true}
      />
    ),
    [phoneNumber, asyncSearch, searchResults],
  );

  const isCallButtonEnabled = selectedPhone || validatePhoneNumber(phoneNumber);

  return (
    <div className={styles.dialPad}>
      <div className={styles.inputContainer}>
        {dropDown}

        <div className={styles.inputControls}>
          {phoneNumber ? (
            <button className={styles.controlButton} onClick={handleClear}>
              <Icon name="close-circle" size={24} />
            </button>
          ) : (
            <button
              className={cn(styles.controlButton, {
                [styles.active]: showKeypad,
              })}
              onClick={toggleKeypad}
            >
              <Icon
                name="keypad"
                fill={showKeypad ? '#FF6A55' : '#6F767E'}
                viewBox={'0 0 24 24'}
                size={24}
              />
            </button>
          )}
          <button className={styles.controlButton}>
            <Icon name="setting" size={24} />
          </button>
        </div>
      </div>

      {/* Phone Contact Selection */}
      {clientData && clientData.contactData && (
        <PhoneContact
          phoneData={clientData.contactData}
          selectedPhone={selectedPhone}
          onPhoneSelected={handlePhoneSelected}
        />
      )}

      {showKeypad && (
        <div className={styles.keypad}>
          <div className={styles.keypadRow}>
            <button
              className={styles.keypadButton}
              onClick={() => handleNumberClick('1')}
            >
              1
            </button>
            <button
              className={styles.keypadButton}
              onClick={() => handleNumberClick('2')}
            >
              2
            </button>
            <button
              className={styles.keypadButton}
              onClick={() => handleNumberClick('3')}
            >
              3
            </button>
          </div>
          <div className={styles.keypadRow}>
            <button
              className={styles.keypadButton}
              onClick={() => handleNumberClick('4')}
            >
              4
            </button>
            <button
              className={styles.keypadButton}
              onClick={() => handleNumberClick('5')}
            >
              5
            </button>
            <button
              className={styles.keypadButton}
              onClick={() => handleNumberClick('6')}
            >
              6
            </button>
          </div>
          <div className={styles.keypadRow}>
            <button
              className={styles.keypadButton}
              onClick={() => handleNumberClick('7')}
            >
              7
            </button>
            <button
              className={styles.keypadButton}
              onClick={() => handleNumberClick('8')}
            >
              8
            </button>
            <button
              className={styles.keypadButton}
              onClick={() => handleNumberClick('9')}
            >
              9
            </button>
          </div>
          <div className={styles.keypadRow}>
            <button
              className={styles.keypadButton}
              onClick={() => handleNumberClick('*')}
            >
              *
            </button>
            <button
              className={styles.keypadButton}
              onClick={() => handleNumberClick('0')}
            >
              0
            </button>
            <button
              className={styles.keypadButton}
              onClick={() => handleNumberClick('#')}
            >
              #
            </button>
          </div>
        </div>
      )}

      <button
        className={styles.callButton}
        onClick={handleCall}
        disabled={!isCallButtonEnabled}
      >
        Позвонить
      </button>
    </div>
  );
};

export default DialPad;
