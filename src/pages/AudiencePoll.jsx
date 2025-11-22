import React, { useState, useEffect, useCallback } from 'react';
import { db } from '../config/firebase';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  increment,
  onSnapshot
} from 'firebase/firestore';
import { generateDeviceFingerprint } from '../utils/deviceFingerprint';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './AudiencePoll.css';
import {
  Box,
  Button,
  Typography,
  Card,
  CardContent,
  Snackbar,
  Alert,
  CircularProgress,
  Grid,
  Chip
} from '@mui/material';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PersonIcon from '@mui/icons-material/Person';

const AudiencePoll = () => {
  // Static list of persons/contestants - MODIFY THIS LIST with your actual contestants
  // Format: { id: 'unique-id', name: 'Display Name' }
  // Example: { id: 'contestant1', name: 'John Doe' }
  const [persons] = useState([
    { id: 'Keval', name: 'Keval Shah' },
    { id: 'Ratnam', name: 'Ratnam Shah' },
    { id: 'Goyam', name: 'Goyam Shah' },
    { id: 'Dhruvi', name: 'Dhruvi Shah' },
    { id: 'Demo', name: 'Demo Shah' },
  ]);

  const [votes, setVotes] = useState({});
  const [lastVoteTimestamps, setLastVoteTimestamps] = useState({}); // Store last vote timestamp for each person
  const [hasVoted, setHasVoted] = useState(false);
  const [deviceId, setDeviceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [totalVotes, setTotalVotes] = useState(0);
  const unsubscribeRefs = React.useRef([]);

  // Load vote counts from Firestore
  const loadVoteCounts = useCallback(async () => {
    try {
      const votesData = {};
      const timestampsData = {};
      let total = 0;
      
      for (const person of persons) {
        const personRef = doc(db, 'pollResults', person.id);
        const personSnap = await getDoc(personRef);
        
        if (personSnap.exists()) {
          const voteCount = personSnap.data().votes || 0;
          const lastVoteTimestamp = personSnap.data().lastVoteTimestamp || null;
          votesData[person.id] = voteCount;
          timestampsData[person.id] = lastVoteTimestamp;
          total += voteCount;
        } else {
          votesData[person.id] = 0;
          timestampsData[person.id] = null;
        }
      }
      
      setVotes(votesData);
      setLastVoteTimestamps(timestampsData);
      setTotalVotes(total);
    } catch (error) {
      console.error('Error loading vote counts:', error);
    }
  }, [persons]);

  // Set up real-time listener for vote counts
  const setupRealtimeListener = useCallback(() => {
    const unsubscribes = [];
    
    persons.forEach(person => {
      const personRef = doc(db, 'pollResults', person.id);
      
      const unsubscribe = onSnapshot(personRef, (snap) => {
        if (snap.exists()) {
          const voteCount = snap.data().votes || 0;
          const lastVoteTimestamp = snap.data().lastVoteTimestamp || null;
          
          setVotes(prev => {
            const newVotes = { ...prev, [person.id]: voteCount };
            // Recalculate total
            const newTotal = Object.values(newVotes).reduce((sum, count) => sum + count, 0);
            setTotalVotes(newTotal);
            return newVotes;
          });
          
          setLastVoteTimestamps(prev => ({
            ...prev,
            [person.id]: lastVoteTimestamp
          }));
        }
      });
      
      unsubscribes.push(unsubscribe);
    });
    
    unsubscribeRefs.current = unsubscribes;
  }, [persons]);

  // Initialize device fingerprint and check voting status
  useEffect(() => {
    const initializePoll = async () => {
      try {
        setLoading(true);
        
        // Generate or retrieve device fingerprint
        const fingerprint = await generateDeviceFingerprint();
        setDeviceId(fingerprint);
        
        // Check if this device has already voted
        const voteCheckRef = doc(db, 'pollVotes', fingerprint);
        const voteCheckSnap = await getDoc(voteCheckRef);
        
        if (voteCheckSnap.exists()) {
          setHasVoted(true);
          const votedPersonId = voteCheckSnap.data().personId;
          // Highlight the voted person
          console.log('Already voted for:', votedPersonId);
        }
        
        // Load current vote counts
        await loadVoteCounts();
        
        // Set up real-time listener for vote counts
        setupRealtimeListener();
        
      } catch (error) {
        console.error('Error initializing poll:', error);
        setSnackbar({ 
          open: true, 
          message: 'Failed to initialize poll. Please refresh the page.', 
          severity: 'error' 
        });
      } finally {
        setLoading(false);
      }
    };

    initializePoll();
  }, [loadVoteCounts, setupRealtimeListener]);

  // Cleanup listeners on unmount
  useEffect(() => {
    return () => {
      unsubscribeRefs.current.forEach(unsubscribe => {
        if (unsubscribe) unsubscribe();
      });
    };
  }, []);

  // Handle vote submission
  const handleVote = async (personId) => {
    if (hasVoted) {
      setSnackbar({ 
        open: true, 
        message: 'You have already voted! Each device can only vote once.', 
        severity: 'warning' 
      });
      return;
    }

    if (!deviceId) {
      setSnackbar({ 
        open: true, 
        message: 'Device ID not available. Please refresh the page.', 
        severity: 'error' 
      });
      return;
    }

    try {
      setVoting(true);

      // Check again if device has voted (double-check)
      const voteCheckRef = doc(db, 'pollVotes', deviceId);
      const voteCheckSnap = await getDoc(voteCheckRef);
      
      if (voteCheckSnap.exists()) {
        setHasVoted(true);
        setSnackbar({ 
          open: true, 
          message: 'You have already voted! Each device can only vote once.', 
          severity: 'warning' 
        });
        setVoting(false);
        return;
      }

      // Record the vote
      await setDoc(voteCheckRef, {
        personId: personId,
        deviceId: deviceId,
        timestamp: new Date().toISOString(),
        votedAt: new Date()
      });

      // Update vote count for the person
      const currentTimestamp = new Date().toISOString();
      const personRef = doc(db, 'pollResults', personId);
      const personSnap = await getDoc(personRef);
      
      if (personSnap.exists()) {
        await updateDoc(personRef, {
          votes: increment(1),
          lastUpdated: currentTimestamp,
          lastVoteTimestamp: currentTimestamp // Store the timestamp of the last vote for tie-breaking
        });
      } else {
        await setDoc(personRef, {
          personId: personId,
          personName: persons.find(p => p.id === personId)?.name || personId,
          votes: 1,
          createdAt: currentTimestamp,
          lastUpdated: currentTimestamp,
          lastVoteTimestamp: currentTimestamp // Store the timestamp of the last vote for tie-breaking
        });
      }

      setHasVoted(true);
      setSnackbar({ 
        open: true, 
        message: 'Your vote has been recorded successfully!', 
        severity: 'success' 
      });

    } catch (error) {
      console.error('Error submitting vote:', error);
      setSnackbar({ 
        open: true, 
        message: 'Failed to submit vote. Please try again.', 
        severity: 'error' 
      });
    } finally {
      setVoting(false);
    }
  };

  // Get person with highest votes (with tie-breaking based on last vote timestamp)
  const getLeader = () => {
    if (totalVotes === 0) return null;
    
    let maxVotes = 0;
    let leaders = []; // Array to store all persons with max votes (for tie detection)
    
    // First, find the maximum vote count
    persons.forEach(person => {
      const voteCount = votes[person.id] || 0;
      if (voteCount > maxVotes) {
        maxVotes = voteCount;
      }
    });
    
    // Collect all persons with the maximum vote count
    persons.forEach(person => {
      const voteCount = votes[person.id] || 0;
      if (voteCount === maxVotes && maxVotes > 0) {
        leaders.push({
          person: person,
          voteCount: voteCount,
          lastVoteTimestamp: lastVoteTimestamps[person.id] || null
        });
      }
    });
    
    // If no leaders found, return null
    if (leaders.length === 0) return null;
    
    // If only one leader, return it
    if (leaders.length === 1) return leaders[0].person;
    
    // If there's a tie, break it based on the most recent vote timestamp
    // The person with the most recent vote timestamp wins
    let winner = leaders[0];
    
    for (let i = 1; i < leaders.length; i++) {
      const current = leaders[i];
      const currentTimestamp = current.lastVoteTimestamp;
      const winnerTimestamp = winner.lastVoteTimestamp;
      
      // If current has a timestamp and winner doesn't, current wins
      if (currentTimestamp && !winnerTimestamp) {
        winner = current;
      }
      // If both have timestamps, compare them (most recent wins)
      else if (currentTimestamp && winnerTimestamp) {
        if (new Date(currentTimestamp) > new Date(winnerTimestamp)) {
          winner = current;
        }
      }
      // If winner has timestamp but current doesn't, winner stays
    }
    
    return winner.person;
  };

  const leader = getLeader();

  if (loading) {
    return (
      <>
        <Navbar />
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight="60vh"
          flexDirection="column"
          gap={2}
        >
          <CircularProgress size={60} sx={{ color: '#964b00' }} />
          <Typography variant="h6" sx={{ color: '#6d4c00' }}>
            Loading poll...
          </Typography>
        </Box>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="audience-poll-container">
        <Box className="poll-header">
          <Typography variant="h3" className="poll-title">
            <HowToVoteIcon sx={{ fontSize: { xs: 24, sm: 32, md: 40 }, marginRight: { xs: 1, sm: 2 }, verticalAlign: 'middle' }} />
            Audience Poll
          </Typography>

          <Typography variant="body1" className="poll-subtitle">
            Cast your vote for your favorite contestant. Each device can vote only once.
          </Typography>
        </Box>

        {hasVoted && (
          <Alert severity="info" sx={{ mb: { xs: 2, sm: 3 }, maxWidth: 800, mx: 'auto', px: { xs: 1, sm: 2 } }}>
            You have already cast your vote. Thank you for participating!
          </Alert>
        )}

        {leader && totalVotes > 0 && (
          <Card className="leader-card" sx={{ mb: { xs: 2, sm: 3, md: 4 }, maxWidth: 800, mx: 'auto', px: { xs: 1, sm: 2 } }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
              <Box display="flex" alignItems="center" justifyContent="center" gap={{ xs: 1, sm: 2 }} flexDirection={{ xs: 'column', sm: 'row' }}>
                <EmojiEventsIcon sx={{ fontSize: { xs: 32, sm: 36, md: 40 }, color: '#FFD700' }} />
                <Box textAlign={{ xs: 'center', sm: 'left' }}>
                  <Typography variant="h6" sx={{ color: '#6d4c00', fontWeight: 'bold', fontSize: { xs: '1rem', sm: '1.25rem' } }}>
                    Current Leader
                  </Typography>
                  <Typography variant="h5" sx={{ color: '#964b00', fontWeight: 'bold', fontSize: { xs: '1.1rem', sm: '1.5rem', md: '1.75rem' } }}>
                    {leader.name} - {votes[leader.id] || 0} votes
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}

        <Box className="poll-stats" sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
          <Chip 
            label={`Total Votes: ${totalVotes}`} 
            color="primary" 
            sx={{ 
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }, 
              padding: { xs: '6px 12px', sm: '8px 16px' },
              backgroundColor: '#964b00',
              color: '#fff'
            }} 
          />
        </Box>

        <Grid 
          container 
          spacing={{ xs: 2, sm: 3 }} 
          className="poll-grid" 
          sx={{ 
            maxWidth: 1200, 
            mx: 'auto', 
            mb: { xs: 2, sm: 3, md: 4 }, 
            px: { xs: 1, sm: 2 },
            justifyContent: 'center',
            alignItems: 'stretch'
          }}
        >
          {persons.map((person) => {
            const voteCount = votes[person.id] || 0;
            const percentage = totalVotes > 0 ? ((voteCount / totalVotes) * 100).toFixed(1) : 0;
            const isLeader = leader && leader.id === person.id && totalVotes > 0;
            
            return (
              <Grid 
                item 
                xs={12} 
                sm={6} 
                md={4} 
                lg={persons.length > 5 ? 4 : 4} 
                key={person.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'stretch'
                }}
              >
                <Card 
                  className={`person-card ${isLeader ? 'leader' : ''} ${hasVoted ? 'voted' : ''}`}
                  sx={{
                    width: '100%',
                    maxWidth: { xs: '100%', sm: '400px', md: '100%' },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    margin: '0 auto',
                    '&:hover': !hasVoted ? {
                      transform: 'translateY(-5px)',
                      boxShadow: 6
                    } : {},
                    border: isLeader ? '2px solid #FFD700' : '1px solid #e0e0e0'
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: { xs: 2, sm: 2.5, md: 3 } }}>
                    <PersonIcon sx={{ fontSize: { xs: 48, sm: 54, md: 60 }, color: '#964b00', mb: { xs: 1, sm: 2 } }} />
                    <Typography variant="h5" sx={{ color: '#6d4c00', fontWeight: 'bold', mb: { xs: 1, sm: 2 }, fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' } }}>
                      {person.name}
                    </Typography>
                    
                    <Box sx={{ mb: { xs: 1.5, sm: 2 } }}>
                      <Typography variant="h4" sx={{ color: '#964b00', fontWeight: 'bold', fontSize: { xs: '1.75rem', sm: '2rem', md: '2.5rem' } }}>
                        {voteCount}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666', fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                        {percentage}% of total votes
                      </Typography>
                    </Box>

                    {isLeader && (
                      <Chip 
                        icon={<EmojiEventsIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                        label="Leader" 
                        color="warning" 
                        sx={{ mb: { xs: 1.5, sm: 2 }, fontSize: { xs: '0.75rem', sm: '0.875rem' } }} 
                      />
                    )}

                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleVote(person.id)}
                      disabled={hasVoted || voting}
                      sx={{
                        mt: { xs: 1.5, sm: 2 },
                        backgroundColor: hasVoted ? '#ccc' : '#964b00',
                        color: '#fff',
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        padding: { xs: '8px 16px', sm: '10px 20px' },
                        '&:hover': {
                          backgroundColor: hasVoted ? '#ccc' : '#7a3d00'
                        },
                        '&:disabled': {
                          backgroundColor: '#ccc',
                          color: '#666'
                        }
                      }}
                    >
                      {voting ? (
                        <>
                          <CircularProgress size={18} sx={{ mr: 1, color: '#fff' }} />
                          Voting...
                        </>
                      ) : hasVoted ? (
                        'Already Voted'
                      ) : (
                        'Vote Now'
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        <Box className="poll-info" sx={{ maxWidth: 800, mx: 'auto', mb: { xs: 2, sm: 3, md: 4 }, px: { xs: 1, sm: 2 } }}>
          <Card sx={{ backgroundColor: '#fffbe6', p: { xs: 1.5, sm: 2 } }}>
            <Typography variant="body2" sx={{ color: '#6d4c00', textAlign: 'center', fontSize: { xs: '0.8rem', sm: '0.875rem' }, lineHeight: 1.6 }}>
              <strong>Note:</strong> Your device ID is being tracked to ensure fair voting. 
              Each device can only vote once. Results are updated in real-time.
            </Typography>
          </Card>
        </Box>
      </div>
      <Footer />
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default AudiencePoll;

