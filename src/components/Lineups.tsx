// src/pages/Lineups.tsx
import React, { useState } from 'react';
import { useSupabase } from '../hooks/useSupabase';
import { useLineups } from '../hooks/useLineups';
import LineupCard from '../components/LineupCard';

const Lineups: React.FC = () => {
  const [showTopLineups, setShowTopLineups] = useState(true);
  const { players, loading: playersLoading } = useSupabase();
  const { lineups, loading: lineupsLoading } = useLineups(showTopLineups, players);
  const loading = playersLoading || lineupsLoading;

  if (loading) {
    return <div>Loading lineups...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowTopLineups(!showTopLineups)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showTopLineups ? 'bg-[#78BE20] text-white' : 'bg-[#DC2626] text-white'
          }`}
        >
          {showTopLineups ? 'Showing Top Lineups' : 'Showing Bottom Lineups'}
        </button>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-[#0C2340] mb-4">
          {showTopLineups ? 'Top' : 'Bottom'} 2-Man Lineups
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lineups.twoMan.map((lineup, index) => (
            <LineupCard key={index} lineup={lineup} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-[#0C2340] mb-4">
          {showTopLineups ? 'Top' : 'Bottom'} 3-Man Lineups
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {lineups.threeMan.map((lineup, index) => (
            <LineupCard key={index} lineup={lineup} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xl font-semibold text-[#0C2340] mb-4">
          {showTopLineups ? 'Top' : 'Bottom'} 5-Man Lineups
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {lineups.fiveMan.map((lineup, index) => (
            <LineupCard key={index} lineup={lineup} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Lineups;
