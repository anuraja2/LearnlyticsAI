import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Volume2, Star, PlayCircle } from 'lucide-react';
import './StoryLearning.css';
import SOSButton from '../components/SOSButton';

const StoryLearning = () => {
  const stories = [
    { id: 1, title: 'The Number Knights', subject: 'Math', level: 'Beginner', color: '#3b82f6' },
    { id: 2, title: 'Journey to Mars', subject: 'Science', level: 'Intermediate', color: '#8b5cf6' },
    { id: 3, title: 'Dinosaur Discoveries', subject: 'History', level: 'Beginner', color: '#f59e0b' },
  ];

  return (
    <div className="story-container">
      <header className="story-header">
        <Link to="/child-dashboard" className="back-btn-story">
          <ArrowLeft size={24} /> Back
        </Link>
        <h1>Story Library</h1>
        <div className="stars-badge">
          <Star size={20} fill="#f59e0b" color="#f59e0b" /> 15 Stars
        </div>
      </header>

      <main className="story-main">
        <div className="featured-story">
          <div className="featured-content">
            <span className="featured-tag">AI Recommended</span>
            <h2>The Number Knights</h2>
            <p>Join Sir Add-a-Lot on a quest to save the kingdom of Mathmatica!</p>
            <button className="read-btn">
              <PlayCircle size={24} /> Read & Listen
            </button>
          </div>
          <div className="featured-image">
            <BookOpen size={100} color="#3b82f6" opacity={0.8} />
          </div>
        </div>

        <h3 className="section-title">More Stories</h3>
        <div className="story-grid">
          {stories.map(story => (
            <div key={story.id} className="story-card" style={{ borderTop: `6px solid ${story.color}` }}>
              <div className="story-card-icon" style={{ backgroundColor: `${story.color}20`, color: story.color }}>
                <BookOpen size={32} />
              </div>
              <div className="story-info">
                <h4>{story.title}</h4>
                <span>{story.subject} • {story.level}</span>
              </div>
              <button className="listen-btn" style={{ color: story.color, backgroundColor: `${story.color}15` }}>
                <Volume2 size={20} />
              </button>
            </div>
          ))}
        </div>
      </main>

      <SOSButton />
    </div>
  );
};

export default StoryLearning;
