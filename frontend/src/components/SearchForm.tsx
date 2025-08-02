import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setSearchParams } from '../redux/slices/searchSlice';
import PlaceAutocompleteInput, { PlaceAutocompleteInputHandle } from './PlaceAutocompleteInput';
import { useJsApiLoader } from '@react-google-maps/api';
import styles from '../styles/acrylicForm.module.css';

const PROVIDERS = [
  { value: 'gemini', label: 'Google Gemini API' },
  { value: 'ollama', label: 'Ollama' },
];

const libraries: Array<'places' | 'geometry' | 'drawing' | 'visualization'> = ['places'];

const SearchForm: React.FC = () => {
    const dispatch = useDispatch();
    const [source, setSource] = useState('');
    const [destination, setDestination] = useState('');
    const [provider, setProvider] = useState('ollama');
    const [loading, setLoading] = useState(false);
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
        libraries: libraries
    });
    const sourceRef = useRef<PlaceAutocompleteInputHandle>(null);
    const destRef = useRef<PlaceAutocompleteInputHandle>(null);

    useEffect(() => {
        // Debug: log value changes
        console.log('Source state changed:', source);
        console.log('Destination state changed:', destination);
    }, [source, destination]);

    const handleSetSource = (val: string) => {
        console.log('handleSetSource called with:', val);
        setSource(val);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        let latestSource = source;
        let latestDestination = destination;
        if (sourceRef.current) latestSource = sourceRef.current.getInputValue();
        if (destRef.current) latestDestination = destRef.current.getInputValue();
        console.log('State at submit (ref):', { latestSource, latestDestination });
        dispatch(setSearchParams({ source: latestSource, destination: latestDestination }));
        localStorage.setItem('llm_provider', provider);
        // Simulate search delay for animation demo
        setTimeout(() => setLoading(false), 2000);
    };

    return (
        <>
        <form
          onSubmit={handleSubmit}
          className={styles.acrylicForm + (loading ? ' ' + styles.formSlideLeft : '')}
          style={loading ? { pointerEvents: 'none', opacity: 0.5 } : {}}
        >
            <div>
                <label htmlFor="source">Source:</label>
                {isLoaded ? (
                  <PlaceAutocompleteInput
                    ref={sourceRef}
                    value={source}
                    onChange={handleSetSource}
                    placeholder="Enter source location"
                    id="source"
                  />
                ) : (
                  <input
                    type="text"
                    id="source"
                    value={source}
                    onChange={e => handleSetSource(e.target.value)}
                    required
                  />
                )}
            </div>
            <div>
                <label htmlFor="destination">Destination:</label>
                {isLoaded ? (
                  <PlaceAutocompleteInput
                    ref={destRef}
                    value={destination}
                    onChange={setDestination}
                    placeholder="Enter destination"
                    id="destination"
                  />
                ) : (
                  <input
                    type="text"
                    id="destination"
                    value={destination}
                    onChange={e => setDestination(e.target.value)}
                    required
                  />
                )}
            </div>
            <div className={styles.providerSection}>
                <label htmlFor="provider" className={styles.providerLabel}>LLM Provider:</label>
                <select
                    id="provider"
                    value={provider}
                    onChange={e => {
                        setProvider(e.target.value);
                        localStorage.setItem('llm_provider', e.target.value);
                    }}
                    className={styles.providerSelect}
                >
                    {PROVIDERS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
            <button type="submit">Search</button>
        </form>
        {loading && (
          <div className={styles.modalOverlay}>
            <div className={styles.searchingModal}>
                <center>
              <span>Searching for <br></br>
              <b>{source}</b> 
              <br></br>
              to 
              <br></br>
              <b>{destination}</b> 
              </span>
              <br></br>
              <span className={styles.dots}>
                <span>.</span><span>.</span><span>.</span>
              </span>
              </center>
            </div>
          </div>
        )}
        </>
    );
};

export default SearchForm;