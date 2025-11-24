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
  Chip,
  Tabs,
  Tab
} from '@mui/material';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PersonIcon from '@mui/icons-material/Person';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

// Category constants
const CATEGORIES = {
  VAKTRUTVA_KALA: 'vaktrutva_kala',
  SANGIT_KALA: 'sangit_kala'
};

const CATEGORY_NAMES = {
  [CATEGORIES.VAKTRUTVA_KALA]: 'Vaktrutva Kala',
  [CATEGORIES.SANGIT_KALA]: 'Sangit Kala'
};

const AudiencePoll = () => {
  // Static list of persons/contestants with categories - MODIFY THIS LIST with your actual contestants
  // Format: { id: 'unique-id', name: 'Display Name', category: 'vaktrutva_kala' or 'sangit_kala' }
  const [persons] = useState([
    // Vaktrutva Kala contestants
    { id: 'Aarya nagori', name: 'Aarya nagori', category: CATEGORIES.VAKTRUTVA_KALA },
    { id: 'Naksh', name: 'Naksh', category: CATEGORIES.VAKTRUTVA_KALA },
    { id: 'Aashvi', name: 'Aashvi', category: CATEGORIES.VAKTRUTVA_KALA },
    // Sangit Kala contestants
    { id: 'Lay Shah', name: 'Lay Shah', category: CATEGORIES.SANGIT_KALA },
    { id: 'Hriday Jain', name: 'Hriday Jain', category: CATEGORIES.SANGIT_KALA },
    { id: 'Devam Shah', name: 'Devam Shah', category: CATEGORIES.SANGIT_KALA },
    { id: 'Hem Shah', name: 'Hem Shah', category: CATEGORIES.SANGIT_KALA },
  ]); 

  const [activeCategory, setActiveCategory] = useState(CATEGORIES.VAKTRUTVA_KALA);
  const [votes, setVotes] = useState({}); // Structure: { category: { personId: voteCount } }
  const [lastVoteTimestamps, setLastVoteTimestamps] = useState({}); // Structure: { category: { personId: timestamp } }
  const [hasVoted, setHasVoted] = useState({}); // Structure: { category: boolean }
  const [deviceId, setDeviceId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [voting, setVoting] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [totalVotes, setTotalVotes] = useState({}); // Structure: { category: totalVotes }
  const unsubscribeRefs = React.useRef([]);

  // Get persons for active category
  const getPersonsForCategory = (category) => {
    return persons.filter(person => person.category === category);
  };

  // Load vote counts from Firestore
  const loadVoteCounts = useCallback(async () => {
    try {
      const votesData = {};
      const timestampsData = {};
      const totalsData = {};
      
      // Initialize structure for each category
      Object.values(CATEGORIES).forEach(category => {
        votesData[category] = {};
        timestampsData[category] = {};
        totalsData[category] = 0;
      });
      
      for (const person of persons) {
        const personRef = doc(db, 'pollResults', `${person.category}_${person.id}`);
        const personSnap = await getDoc(personRef);
        
        if (personSnap.exists()) {
          const voteCount = personSnap.data().votes || 0;
          const lastVoteTimestamp = personSnap.data().lastVoteTimestamp || null;
          votesData[person.category][person.id] = voteCount;
          timestampsData[person.category][person.id] = lastVoteTimestamp;
          totalsData[person.category] += voteCount;
        } else {
          votesData[person.category][person.id] = 0;
          timestampsData[person.category][person.id] = null;
        }
      }
      
      setVotes(votesData);
      setLastVoteTimestamps(timestampsData);
      setTotalVotes(totalsData);
    } catch (error) {
      console.error('Error loading vote counts:', error);
    }
  }, [persons]);

  // Set up real-time listener for vote counts
  const setupRealtimeListener = useCallback(() => {
    const unsubscribes = [];
    
    persons.forEach(person => {
      const personRef = doc(db, 'pollResults', `${person.category}_${person.id}`);
      
      const unsubscribe = onSnapshot(personRef, (snap) => {
        if (snap.exists()) {
          const voteCount = snap.data().votes || 0;
          const lastVoteTimestamp = snap.data().lastVoteTimestamp || null;
          
          setVotes(prev => {
            const newVotes = { ...prev };
            if (!newVotes[person.category]) {
              newVotes[person.category] = {};
            }
            newVotes[person.category][person.id] = voteCount;
            
            // Recalculate total for this category
            const categoryTotal = Object.values(newVotes[person.category] || {}).reduce((sum, count) => sum + count, 0);
            setTotalVotes(prev => ({
              ...prev,
              [person.category]: categoryTotal
            }));
            
            return newVotes;
          });
          
          setLastVoteTimestamps(prev => {
            const newTimestamps = { ...prev };
            if (!newTimestamps[person.category]) {
              newTimestamps[person.category] = {};
            }
            newTimestamps[person.category][person.id] = lastVoteTimestamp;
            return newTimestamps;
          });
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
        
        // Check if this device has already voted in each category
        const votedCategories = {};
        
        for (const category of Object.values(CATEGORIES)) {
          const voteCheckRef = doc(db, 'pollVotes', `${category}_${fingerprint}`);
          const voteCheckSnap = await getDoc(voteCheckRef);
          votedCategories[category] = voteCheckSnap.exists();
        }
        
        setHasVoted(votedCategories);
        
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
  const handleVote = async (personId, category) => {
    if (hasVoted[category]) {
      setSnackbar({ 
        open: true, 
        message: `You have already voted in ${CATEGORY_NAMES[category]}! Each device can only vote once per category.`, 
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

      // Check again if device has voted in this category (double-check)
      const voteCheckRef = doc(db, 'pollVotes', `${category}_${deviceId}`);
      const voteCheckSnap = await getDoc(voteCheckRef);
      
      if (voteCheckSnap.exists()) {
        setHasVoted(prev => ({ ...prev, [category]: true }));
        setSnackbar({ 
          open: true, 
          message: `You have already voted in ${CATEGORY_NAMES[category]}! Each device can only vote once per category.`, 
          severity: 'warning' 
        });
        setVoting(false);
        return;
      }

      // Record the vote
      await setDoc(voteCheckRef, {
        personId: personId,
        category: category,
        deviceId: deviceId,
        timestamp: new Date().toISOString(),
        votedAt: new Date()
      });

      // Update vote count for the person
      const currentTimestamp = new Date().toISOString();
      const personRef = doc(db, 'pollResults', `${category}_${personId}`);
      const personSnap = await getDoc(personRef);
      
      if (personSnap.exists()) {
        await updateDoc(personRef, {
          votes: increment(1),
          lastUpdated: currentTimestamp,
          lastVoteTimestamp: currentTimestamp
        });
      } else {
        await setDoc(personRef, {
          personId: personId,
          personName: persons.find(p => p.id === personId && p.category === category)?.name || personId,
          category: category,
          votes: 1,
          createdAt: currentTimestamp,
          lastUpdated: currentTimestamp,
          lastVoteTimestamp: currentTimestamp
        });
      }

      setHasVoted(prev => ({ ...prev, [category]: true }));
      setSnackbar({ 
        open: true, 
        message: `Your vote for ${CATEGORY_NAMES[category]} has been recorded successfully!`, 
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

  // Get top 3 winners for a category
  const getTop3ForCategory = (category) => {
    const categoryPersons = getPersonsForCategory(category);
    const categoryVotes = votes[category] || {};
    const categoryTimestamps = lastVoteTimestamps[category] || {};
    
    // Create array with vote counts and timestamps
    const personsWithVotes = categoryPersons.map(person => ({
      person: person,
      voteCount: categoryVotes[person.id] || 0,
      lastVoteTimestamp: categoryTimestamps[person.id] || null
    }));
    
    // Sort by vote count (descending), then by last vote timestamp (most recent first) for ties
    personsWithVotes.sort((a, b) => {
      if (b.voteCount !== a.voteCount) {
        return b.voteCount - a.voteCount;
      }
      // Tie-breaking: most recent vote wins
      if (a.lastVoteTimestamp && b.lastVoteTimestamp) {
        return new Date(b.lastVoteTimestamp) - new Date(a.lastVoteTimestamp);
      }
      if (a.lastVoteTimestamp) return -1;
      if (b.lastVoteTimestamp) return 1;
      return 0;
    });
    
    // Return top 3
    return personsWithVotes.slice(0, 3).filter(item => item.voteCount > 0);
  };

  // Handle category tab change
  const handleCategoryChange = (event, newValue) => {
    setActiveCategory(newValue);
  };

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

  const activeCategoryPersons = getPersonsForCategory(activeCategory);
  const top3Winners = getTop3ForCategory(activeCategory);
  const categoryTotalVotes = totalVotes[activeCategory] || 0;

  return (
    <>
      <Navbar />
      <div className="audience-poll-container">
        <Box className="poll-header" sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h3" className="poll-title">
            <HowToVoteIcon sx={{ fontSize: { xs: 24, sm: 32, md: 40 }, marginRight: { xs: 1, sm: 2 }, verticalAlign: 'middle' }} />
            Audience Poll
          </Typography>
          <Typography 
            variant="body1" 
            className="poll-subtitle"
            sx={{ 
              textAlign: 'center',
              width: '100%',
              maxWidth: '800px',
              mx: 'auto'
            }}
          >
            Cast your vote for your favorite contestant in each category. Each device can vote once per category.
          </Typography>
        </Box>

        {/* Category Tabs */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Tabs
            value={activeCategory}
            onChange={handleCategoryChange}
            sx={{
              '& .MuiTab-root': {
                fontSize: { xs: '0.9rem', sm: '1rem' },
                minWidth: { xs: 120, sm: 160 },
                fontWeight: 'bold'
              },
              '& .Mui-selected': {
                color: '#964b00 !important'
              },
              '& .MuiTabs-indicator': {
                backgroundColor: '#964b00'
              }
            }}
          >
            <Tab 
              label={CATEGORY_NAMES[CATEGORIES.VAKTRUTVA_KALA]} 
              value={CATEGORIES.VAKTRUTVA_KALA}
            />
            <Tab 
              label={CATEGORY_NAMES[CATEGORIES.SANGIT_KALA]} 
              value={CATEGORIES.SANGIT_KALA}
            />
          </Tabs>
        </Box>

        {/* Category Status Alert */}
        {hasVoted[activeCategory] && (
          <Alert severity="info" sx={{ mb: { xs: 2, sm: 3 }, maxWidth: 800, mx: 'auto', px: { xs: 1, sm: 2 } }}>
            You have already cast your vote in {CATEGORY_NAMES[activeCategory]}. Thank you for participating!
            {!hasVoted[Object.values(CATEGORIES).find(c => c !== activeCategory)] && (
              <span> You can still vote in the other category.</span>
            )}
          </Alert>
        )}

        {/* Top 3 Winners Display */}
        {top3Winners.length > 0 && (
          <Card className="top3-winners-card" sx={{ mb: { xs: 2, sm: 3, md: 4 }, maxWidth: 1000, mx: 'auto', px: { xs: 1, sm: 2 } }}>
            <CardContent sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
              <Typography variant="h5" sx={{ color: '#6d4c00', fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
                Top 3 Winners - {CATEGORY_NAMES[activeCategory]}
              </Typography>
              <Grid container spacing={2} justifyContent="center">
                {top3Winners.map((winner, index) => {
                  const position = index + 1;
                  const medalColors = ['#FFD700', '#C0C0C0', '#CD7F32']; // Gold, Silver, Bronze
                  const medalNames = ['🥇', '🥈', '🥉'];
                  
                  return (
                    <Grid item xs={12} sm={4} key={winner.person.id}>
                      <Card sx={{ 
                        textAlign: 'center', 
                        p: 2,
                        border: `2px solid ${medalColors[index]}`,
                        backgroundColor: index === 0 ? '#fffbe6' : '#fff'
                      }}>
                        <Box sx={{ fontSize: '3rem', mb: 1 }}>{medalNames[index]}</Box>
                        <Typography variant="h6" sx={{ color: '#6d4c00', fontWeight: 'bold', mb: 1 }}>
                          {winner.person.name}
                        </Typography>
                        <Typography variant="h5" sx={{ color: '#964b00', fontWeight: 'bold' }}>
                          {winner.voteCount} votes
                        </Typography>
                        <Chip 
                          label={`${position}${position === 1 ? 'st' : position === 2 ? 'nd' : 'rd'} Place`}
                          sx={{ 
                            mt: 1,
                            backgroundColor: medalColors[index],
                            color: '#fff',
                            fontWeight: 'bold'
                          }}
                        />
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        )}

        {/* Category Stats */}
        <Box className="poll-stats" sx={{ mb: { xs: 2, sm: 3, md: 4 } }}>
          <Chip 
            label={`${CATEGORY_NAMES[activeCategory]} - Total Votes: ${categoryTotalVotes}`} 
            color="primary" 
            sx={{ 
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' }, 
              padding: { xs: '6px 12px', sm: '8px 16px' },
              backgroundColor: '#964b00',
              color: '#fff'
            }} 
          />
        </Box>

        {/* Contestants Grid */}
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
          {activeCategoryPersons.map((person) => {
            const voteCount = votes[activeCategory]?.[person.id] || 0;
            const percentage = categoryTotalVotes > 0 ? ((voteCount / categoryTotalVotes) * 100).toFixed(1) : 0;
            const top3Index = top3Winners.findIndex(w => w.person.id === person.id);
            const isInTop3 = top3Index !== -1;
            const position = top3Index + 1; // 1, 2, or 3
            
            return (
              <Grid 
                item 
                xs={12} 
                sm={6} 
                md={4} 
                key={person.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'stretch'
                }}
              >
                <Card 
                  className={`person-card ${isInTop3 ? 'top3' : ''} ${hasVoted[activeCategory] ? 'voted' : ''}`}
                  sx={{
                    width: '100%',
                    maxWidth: { xs: '100%', sm: '400px', md: '100%' },
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    margin: '0 auto',
                    '&:hover': !hasVoted[activeCategory] ? {
                      transform: 'translateY(-5px)',
                      boxShadow: 6
                    } : {},
                    border: isInTop3 ? '2px solid #FFD700' : '1px solid #e0e0e0'
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

                    {isInTop3 && (
                      <Chip 
                        icon={<EmojiEventsIcon sx={{ fontSize: { xs: 16, sm: 18 } }} />}
                        label={`${position}${position === 1 ? 'st' : position === 2 ? 'nd' : 'rd'} Place`}
                        sx={{ 
                          mb: { xs: 1.5, sm: 2 }, 
                          fontSize: { xs: '0.75rem', sm: '0.875rem' },
                          backgroundColor: position === 1 ? '#FFD700' : position === 2 ? '#C0C0C0' : '#CD7F32',
                          color: '#fff',
                          fontWeight: 'bold'
                        }} 
                      />
                    )}

                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => handleVote(person.id, activeCategory)}
                      disabled={hasVoted[activeCategory] || voting}
                      sx={{
                        mt: { xs: 1.5, sm: 2 },
                        backgroundColor: hasVoted[activeCategory] ? '#ccc' : '#964b00',
                        color: '#fff',
                        fontSize: { xs: '0.875rem', sm: '1rem' },
                        padding: { xs: '8px 16px', sm: '10px 20px' },
                        '&:hover': {
                          backgroundColor: hasVoted[activeCategory] ? '#ccc' : '#7a3d00'
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
                      ) : hasVoted[activeCategory] ? (
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

        {/* Info Card */}
        <Box className="poll-info" sx={{ maxWidth: 800, mx: 'auto', mb: { xs: 2, sm: 3, md: 4 }, px: { xs: 1, sm: 2 } }}>
          <Card sx={{ backgroundColor: '#fffbe6', p: { xs: 1.5, sm: 2 } }}>
            <Typography variant="body2" sx={{ color: '#6d4c00', textAlign: 'center', fontSize: { xs: '0.8rem', sm: '0.875rem' }, lineHeight: 1.6 }}>
              <strong>Note:</strong> Your device ID is being tracked to ensure fair voting. 
              You can vote once in each category (Vaktrutva Kala and Sangit Kala). 
              Results are updated in real-time. Top 3 winners are displayed for each category.
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
