import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { 
  NbaPlayerStats, 
  AllPlayer3pt, 
  RecordTrackerSeason, 
  ThreePointBucket, 
  LineupWithAdvanced
} from '../types/database.types';

export interface RecentStats {
  PTS: number;
  AST: number;
  REB: number;
  STL: number;
  BLK: number;
  PLUS_MINUS: number;
}

export function useSupabase() {
  const [players, setPlayers] = useState<NbaPlayerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [threePointBuckets, setThreePointBuckets] = useState<ThreePointBucket[]>([]);
  const [lineups, setLineups] = useState<{
    twoMan: LineupWithAdvanced[];
    threeMan: LineupWithAdvanced[];
    fiveMan: LineupWithAdvanced[];
  }>({
    twoMan: [],
    threeMan: [],
    fiveMan: [],
  });
  const [last5Stats, setLast5Stats] = useState<Record<string, RecentStats>>({});
  const [last10Stats, setLast10Stats] = useState<Record<string, RecentStats>>({});
  const [recordData, setRecordData] = useState<RecordTrackerSeason[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: twolvesData, error: twolvesError } = await supabase
          .from('nba_player_stats')
          .select('*')
          .order('player_name');
        
        if (twolvesError) throw twolvesError;
        setPlayers(twolvesData || []);

        const { data: allPlayersData, error: allPlayersError } = await supabase
          .from('all_player_3pt')
          .select('player_name, fg3_pct, fg3a, team_abbreviation');

        if (allPlayersError) throw allPlayersError;

        // Process three point data
        const buckets = processThreePointData(allPlayersData || []);
        setThreePointBuckets(buckets);

        // Fetch lineups
        const [twoManData, threeManData, fiveManData] = await Promise.all([
          fetchLineups(2, 3),
          fetchLineups(3, 3),
          fetchLineups(5, 3),
        ]);

        setLineups({
          twoMan: twoManData.map(processLineup),
          threeMan: threeManData.map(processLineup),
          fiveMan: fiveManData.map(processLineup),
        });

        // Fetch last 5 and last 10 game stats
        const { data: last5Data, error: last5Error } = await supabase
          .from('timberwolves_player_stats_last_5')
          .select('*');
        
        const { data: last10Data, error: last10Error } = await supabase
          .from('timberwolves_player_stats_last_10')
          .select('*');

        if (last5Error) throw last5Error;
        if (last10Error) throw last10Error;

        setLast5Stats(processRecentStats(last5Data || []));
        setLast10Stats(processRecentStats(last10Data || []));

        // Fetch record tracker data
        const { data: recordTrackerData, error: recordTrackerError } = await supabase
          .from('record_tracker_season')
          .select('*');

        if (recordTrackerError) throw recordTrackerError;
        setRecordData(recordTrackerData || []);

      } catch (error) {
        console.error('Error in fetchData:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  return {
    players,
    loading,
    threePointBuckets,
    lineups,
    last5Stats,
    last10Stats,
    recordData,
  };
}

// Helper functions
function processThreePointData(data: Pick<AllPlayer3pt, 'player_name' | 'fg3_pct' | 'fg3a' | 'team_abbreviation'>[]) {
  const buckets: ThreePointBucket[] = [];
  const bucketSize = 0.05;
  const minPct = 0;
  const maxPct = 0.55;

  for (let i = minPct; i < maxPct; i += bucketSize) {
    buckets.push({
      range: `${(i * 100).toFixed(1)}% - ${((i + bucketSize) * 100).toFixed(1)}%`,
      count: 0,
      players: []
    });
  }

  const validPlayers = data.filter(player => 
    player.fg3_pct !== null && 
    player.fg3a >= 1
  );

  validPlayers.forEach(player => {
    const bucketIndex = Math.min(
      Math.floor(player.fg3_pct / bucketSize),
      buckets.length - 1
    );
    if (bucketIndex >= 0 && bucketIndex < buckets.length) {
      buckets[bucketIndex].count++;
      buckets[bucketIndex].players.push(player);
    }
  });

  return buckets;
}

async function fetchLineups(size: number, limit: number) {
  const { data, error } = await supabase
    .from('lineups_advanced')
    .select('*, group_name, lineup_size, min, player1, player2, player3, player4, player5')
    .eq('team_abbreviation', 'MIN')
    .eq('lineup_size', size)
    .gte('min', 50)
    .order('net_rating', { ascending: false })
    .limit(limit);

  if (error) {
    console.error(`Error fetching ${size}-man lineups:`, error);
    return [];
  }

  return data || [];
}

function processLineup(lineup: any): LineupWithAdvanced {
  const playerNames = [
    lineup.player1,
    lineup.player2,
    lineup.player3,
    lineup.player4,
    lineup.player5,
  ].filter(Boolean);

  const players = playerNames.map(playerName => {
    if (!playerName) return { name: '', image_url: null };
    return {
      name: playerName,
      image_url: null
    };
  });

  return {
    group_name: lineup.group_name,
    lineup_size: lineup.lineup_size,
    min: lineup.min || 0,
    net_rating: lineup.net_rating || 0,
    off_rating: lineup.off_rating || 0,
    def_rating: lineup.def_rating || 0,
    ts_pct: lineup.ts_pct || 0,
    pace: lineup.pace || 0,
    players,
  };
}

function processRecentStats(data: any[]): Record<string, RecentStats> {
  return data.reduce((acc, curr) => {
    acc[curr.PLAYER_NAME] = curr;
    return acc;
  }, {} as Record<string, RecentStats>);
}