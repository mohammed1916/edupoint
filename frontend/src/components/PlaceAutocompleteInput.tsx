import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import styles from '../styles/acrylicForm.module.css';

export interface PlaceAutocompleteInputHandle {
  getInputValue: () => string;
}

interface PlaceAutocompleteInputProps {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  id: string;
  zIndex?: number;
}

const PlaceAutocompleteInput = forwardRef<PlaceAutocompleteInputHandle, PlaceAutocompleteInputProps>(
  ({ value, onChange, placeholder, id, zIndex }, ref) => {
    const inputRef = useRef<HTMLInputElement | null>(null);
    useImperativeHandle(ref, () => ({
      getInputValue: () => inputRef.current?.value || ''
    }), []);

    useEffect(() => {
      if (!window.google?.maps?.places?.Autocomplete || !inputRef.current) return;
      const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
        fields: ['place_id', 'geometry', 'name', 'formatted_address'],
        types: ['geocode'],
      });
      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        const val = place.formatted_address || place.name || inputRef.current?.value || '';
        onChange(val);
      });
      // Optionally, handle manual typing
      const handleInput = (e: any) => onChange(e.target.value);
      inputRef.current.addEventListener('input', handleInput);
      return () => {
        window.google.maps.event.clearInstanceListeners(autocomplete);
        if (inputRef.current) inputRef.current.removeEventListener('input', handleInput);
      };
    }, [onChange, id]);

    let zClass = styles.autocompleteContainer;
    if (zIndex === 11000) zClass += ' ' + styles.autocompleteSource;
    if (zIndex === 10000) zClass += ' ' + styles.autocompleteDestination;
    return (
      <div className={zClass}>
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          style={{ zIndex }}
        />
      </div>
    );
  }
);

export default PlaceAutocompleteInput;
