import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SearchForm from '../components/SearchForm';
import Results from '../components/Results';
import Recommendations from '../components/Recommendations';
import MapDisplay from '../components/MapDisplay';
import HotelResults from '../components/HotelResults';
import FlightResults from '../components/FlightResults';
import ActivityResults from '../components/ActivityResults';
import UtilityInfo from '../components/UtilityInfo';
import Footer from '../components/Footer';
import { RootState } from '../redux/store';
import { fetchRecommendations } from '../redux/slices/apiThunks';
import styles from '../styles/modern.module.css';

const HomePage = () => {
    const dispatch = useDispatch();
    const { source, destination, results, touristSpots, budget } = useSelector((state: RootState) => state.search);
    const weather = useSelector((state: RootState) => state.search.weather);
    const currency = useSelector((state: RootState) => state.search.currency);
    const events = useSelector((state: RootState) => state.search.events);

    useEffect(() => {
        if (source && destination) {
            dispatch(fetchRecommendations() as any);
        }
    }, [source, destination, dispatch]);

    return (
        <div className={styles['main-container']}>
            <h1 className={styles['main-title']}>Welcome to Tour Mate</h1>
            <div className={styles['search-section']}>
                <SearchForm />
            </div>
            <div className={styles['map-section']}>
                <MapDisplay source={source} destination={destination} />
            </div>
            <div className={styles['results-section']}>
                <HotelResults hotels={results.hotels || []} />
                <FlightResults flights={results.flights || []} />
                <ActivityResults activities={touristSpots || []} />
            </div>
            <div className={styles['utility-section']}>
                <UtilityInfo weather={weather} currency={currency} events={events} />
            </div>
            <Recommendations />
            <Footer />
        </div>
    );
};

export default HomePage;