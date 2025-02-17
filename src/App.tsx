// src/App.tsx
import { useState } from 'react';
import { useSupabase } from './hooks/useSupabase';
import { PlayerStats } from './components/PlayerStats';
import { ThreePointDistribution } from './components/ThreePointDistribution';
import Lineups from './components/Lineups';
import { RecordTracker } from './components/RecordTracker';
import './index.css'; // Global styles

type Tab = 'stats' | 'distribution' | 'lineups' | 'records';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('stats');
  const { players, threePointBuckets, last5Stats, last10Stats, recordData } = useSupabase();

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-[#0C2340] mb-8">
          Minnesota Timberwolves Statistics
        </h1>
        
        {/* Navigation */}
        <nav className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-4 px-6 text-sm font-medium ${
              activeTab === 'stats'
                ? 'border-b-2 border-[#78BE20] text-[#0C2340]'
                : 'text-[#9EA2A2] hover:text-[#0C2340]'
            }`}
          >
            Player Stats
          </button>
          <button
            onClick={() => setActiveTab('distribution')}
            className={`py-4 px-6 text-sm font-medium ${
              activeTab === 'distribution'
                ? 'border-b-2 border-[#78BE20] text-[#0C2340]'
                : 'text-[#9EA2A2] hover:text-[#0C2340]'
            }`}
          >
            3PT Distribution
          </button>
          <button
            onClick={() => setActiveTab('lineups')}
            className={`py-4 px-6 text-sm font-medium ${
              activeTab === 'lineups'
                ? 'border-b-2 border-[#78BE20] text-[#0C2340]'
                : 'text-[#9EA2A2] hover:text-[#0C2340]'
            }`}
          >
            Lineups
          </button>
          <button
            onClick={() => setActiveTab('records')}
            className={`py-4 px-6 text-sm font-medium ${
              activeTab === 'records'
                ? 'border-b-2 border-[#78BE20] text-[#0C2340]'
                : 'text-[#9EA2A2] hover:text-[#0C2340]'
            }`}
          >
            Record Tracker
          </button>
        </nav>

        {/* Render active page */}
        {activeTab === 'stats' && <PlayerStats />}
        {activeTab === 'distribution' && <ThreePointDistribution threePointBuckets={threePointBuckets} players={players} />}
        {activeTab === 'lineups' && <Lineups />}
        {activeTab === 'records' && <RecordTracker recordData={recordData} />}
      </div>
    </div>
  );
}

export default App;
