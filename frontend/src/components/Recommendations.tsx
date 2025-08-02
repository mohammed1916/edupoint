import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import styles from '../styles/modern.module.css';

interface Recommendation {
    name: string;
    description: string;
    cost: number;
    // add other fields if needed
}

const Recommendations: React.FC = () => {
    const recommendations = useSelector((state: RootState) => state.search.recommendations) as Recommendation[];
    const budget = useSelector((state: RootState) => state.search.budget);

    return (
        <div>
            <h2>Recommended Tourist Spots</h2>
            {recommendations.length > 0 ? (
                <ul className={styles['results-section']}>
                    {recommendations.map((spot: Recommendation, index) => (
                        <li key={index} className={styles['result-card']}>
                            <h3>{spot.name}</h3>
                            <p>{spot.description}</p>
                            <p>Estimated Cost: {spot.cost} (Budget: {budget})</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No recommendations available based on your preferences.</p>
            )}
        </div>
    );
};

export default Recommendations;