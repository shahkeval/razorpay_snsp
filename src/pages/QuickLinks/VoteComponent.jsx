import React, { useState, useEffect } from "react";
import {
doc,
getDoc,
setDoc,
updateDoc,
increment,
collection,
} from "firebase/firestore";
import { db } from "../../firebase"; // Make sure this path points to your firebase.js config
import './VoteComponent.css'; // Import the CSS file
import RSSM from '../../assets/RSSM.png'
const VoteComponent = () => {
const [votes, setVotes] = useState({ gandhi: 0, laxmi: 0 ,mahaverr: 0});
const [voted, setVoted] = useState(false);

// Generate or retrieve a device ID
const getDeviceId = () => {
let deviceId = localStorage.getItem("snsparivar_device_id");
if (!deviceId) {
deviceId = crypto.randomUUID();
localStorage.setItem("snsparivar_device_id", deviceId);
}
return deviceId;
};

useEffect(() => {
const fetchVotes = async () => {
const voteDocRef = doc(db, "votes", "poll1");
const voteSnap = await getDoc(voteDocRef);

if (voteSnap.exists()) {
  setVotes(voteSnap.data());
} else {
  await setDoc(voteDocRef, { gandhi: 0, laxmi: 0 ,mahaverr : 0});
}

const deviceId = getDeviceId();
const deviceVoteRef = doc(collection(voteDocRef, "deviceVotes"), deviceId);
const deviceVoteSnap = await getDoc(deviceVoteRef);

if (deviceVoteSnap.exists()) {
  setVoted(true);
}
};

fetchVotes();
}, []);

const handleVote = async (option) => {
if (voted) return;

const deviceId = getDeviceId();
const voteDocRef = doc(db, "votes", "poll1");
const deviceVoteRef = doc(collection(voteDocRef, "deviceVotes"), deviceId);
const deviceVoteSnap = await getDoc(deviceVoteRef);

if (deviceVoteSnap.exists()) {
  alert("You have already voted from this device.");
  setVoted(true);
  return;
}

await updateDoc(voteDocRef, { [option]: increment(1) });
await setDoc(deviceVoteRef, { choice: option });

const updatedSnap = await getDoc(voteDocRef);
setVotes(updatedSnap.data());
setVoted(true);
};

return (
<div className="vote-container">
<div className="logo-container">
  <img src={RSSM} alt="Logo" className="logo" />
</div>
<h2 className="vote-heading">What do you like?</h2>

{!voted ? (
  <>
    <button
      className="vote-button optionA"
      onClick={() => handleVote("gandhi")}
      disabled={voted}
    >
      shree gandhinagar swe. sangh(shanti ni surbhio)
    </button>
    <button
      className="vote-button optionB"
      onClick={() => handleVote("laxmi")}
      disabled={voted}
    >
      shree laxmivardhak jain sangh(rushabh na range)
    </button>
    <button
      className="vote-button optionC"
      onClick={() => handleVote("mahaverr")}
      disabled={voted}
    >
      shree mahavirswami swe. sangh(jay giriraj)
    </button>
  </>
) : (
  <p className="thank-you-message"></p>
)}
<div className="vote-count">
<p> shree gandhinagar swe. sangh(shanti ni surbhio): {votes.gandhi}</p>
<p>shree laxmivardhak jain sangh(rushabh na range): {votes.laxmi}</p>
<p>shree mahavirswami swe. sangh(jay giriraj): {votes.mahaverr}</p>

{voted && (
<p className="thank-you-message">Thanks for voting!<br></br> Your Vote matters a lot ...!</p>
)}
</div>

</div>
);
};

export default VoteComponent;