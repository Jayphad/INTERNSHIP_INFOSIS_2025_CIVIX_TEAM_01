import React, { useState } from "react";
import ContentCard from "../ContentCard";
import { BarChart2 } from "../../assets/icons";
import "../../styles/Polls.css";

const mockPolls = [
  {
    id: 1,
    question: "What is your favorite programming language?",
    options: ["JavaScript", "Python", "Java", "C#"],
  },
  {
    id: 2,
    question: "Which frontend framework do you prefer?",
    options: ["React", "Angular", "Vue", "Svelte"],
  },
];

const PollsSection = () => {
  const [polls] = useState(mockPolls);
  const [selectedOptions, setSelectedOptions] = useState({});

  const handleOptionChange = (pollId, option) => {
    setSelectedOptions({ ...selectedOptions, [pollId]: option });
  };

  const handleVote = (pollId) => {
    alert(
      `You voted for "${selectedOptions[pollId]}" on poll #${pollId}. (Functionality to be implemented)`
    );
  };

  return (
    <div className="polls-section">
      <h2 className="dashboard-section-title">Polls</h2>
      <p className="dashboard-section-subtitle">
        Participate in polls or create your own.
      </p>

      {polls.map((poll) => (
        <ContentCard key={poll.id} title={poll.question} icon={<BarChart2 />}>
          <div className="poll-options">
            {poll.options.map((option) => (
              <label key={option} className="poll-option-label">
                <input
                  type="radio"
                  name={`poll-${poll.id}`}
                  value={option}
                  checked={selectedOptions[poll.id] === option}
                  onChange={() => handleOptionChange(poll.id, option)}
                />
                {option}
              </label>
            ))}
            <button
              className="poll-vote-btn"
              disabled={!selectedOptions[poll.id]}
              onClick={() => handleVote(poll.id)}
            >
              Vote
            </button>
          </div>
        </ContentCard>
      ))}
    </div>
  );
};

export default PollsSection;
