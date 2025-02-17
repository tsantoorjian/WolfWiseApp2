import { useState } from 'react';
import { NbaPlayerStats } from '../types/database.types';

type ThreePointData = {
  player_name: string;
  fg3_pct: number;
  fg3a: number;
  team_abbreviation: string;
};

type ThreePointBucket = {
  range: string;
  count: number;
  players: ThreePointData[];
};

type ThreePointDistributionProps = {
  threePointBuckets: ThreePointBucket[];
  players: NbaPlayerStats[];
};

export function ThreePointDistribution({ threePointBuckets, players }: ThreePointDistributionProps) {
  const [hoveredPlayer, setHoveredPlayer] = useState<ThreePointData | null>(null);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-[#0C2340] mb-4">League-wide 3PT Percentage Distribution</h3>
      <div className="relative h-96 pb-12">
        <div className="absolute left-0 h-[calc(100%-48px)] flex flex-col justify-between text-xs text-[#9EA2A2]">
          {Array.from({ length: 6 }, (_, i) => {
            const maxCount = Math.max(...threePointBuckets.map(b => b.count));
            const value = Math.round((5 - i) * maxCount / 5);
            return <span key={i}>{value}</span>;
          })}
        </div>
        
        <div className="absolute inset-0 ml-8 flex items-end h-[calc(100%-48px)]">
          {threePointBuckets.map((bucket, index) => {
            const maxCount = Math.max(...threePointBuckets.map(b => b.count));
            const heightPercentage = maxCount > 0 ? (bucket.count / maxCount) * 100 : 0;
            const twolvesPlayers = bucket.players.filter(p => p.team_abbreviation === 'MIN');
            
            return (
              <div
                key={index}
                className="relative flex-1 mx-1 h-full"
              >
                <div
                  className={`absolute bottom-0 w-full ${twolvesPlayers.length > 0 ? 'bg-[#78BE20]' : 'bg-[#9EA2A2]'}`}
                  style={{
                    height: `${heightPercentage}%`
                  }}
                />

                {twolvesPlayers.length > 0 && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 flex flex-col items-center gap-1 mb-1">
                    {twolvesPlayers.map((player) => {
                      const playerData = players.find(p => p.player_name === player.player_name);
                      return playerData?.image_url ? (
                        <div key={player.player_name} className="relative group">
                          <img
                            src={playerData.image_url}
                            alt={player.player_name}
                            className="w-8 h-8 rounded-full border-2 border-[#78BE20] bg-white object-cover hover:border-[#236192] transition-colors cursor-pointer"
                            onMouseEnter={() => setHoveredPlayer(player)}
                            onMouseLeave={() => setHoveredPlayer(null)}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/32';
                            }}
                          />
                          {hoveredPlayer?.player_name === player.player_name && (
                            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-[#0C2340] text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">
                              <div className="font-semibold">{player.player_name}</div>
                              <div>3PT%: {(player.fg3_pct * 100).toFixed(1)}%</div>
                              <div>3PA: {player.fg3a.toFixed(1)}</div>
                            </div>
                          )}
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        <div className="absolute bottom-0 left-8 right-0 flex justify-between text-xs text-[#9EA2A2] pt-4">
          {threePointBuckets.map((bucket, index) => (
            <div 
              key={index} 
              className="flex-1 text-center transform -rotate-45 origin-top-left translate-y-6"
            >
              {index % 2 === 0 ? bucket.range.split(' - ')[0] : ''}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-16 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#78BE20] rounded"></div>
          <span className="text-[#0C2340]">Timberwolves Players</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#9EA2A2] rounded"></div>
          <span className="text-[#0C2340]">Other NBA Players</span>
        </div>
      </div>
      
      <div className="mt-2 text-sm text-[#9EA2A2]">
        * Minimum 1 three-point attempt per game required
      </div>
    </div>
  );
}