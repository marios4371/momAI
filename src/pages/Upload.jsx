import { useNavigate } from "react-router";
import { useState } from 'react';
import './Upload.css';

export default function Upload() {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('post');
  const [postContent, setPostContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [tweetContent, setTweetContent] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Εδώ θα γίνει το ανέβασμα στο backend
    console.log('Submitting:', { selectedType, postContent, imageFile, tweetContent });
    alert(`${selectedType} uploaded successfully!`);
    
    // Επαναφορά φόρμας
    setPostContent('');
    setImageFile(null);
    setPreviewUrl('');
    setTweetContent('');
  };

  const RightPanel = () => {
    if (selectedType === 'post') {
      return (
        <section className="panel-section">
          <h2>Create Post</h2>
          <p className="muted">Write your thoughts and share with the community</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="postContent">Content</label>
              <textarea
                id="postContent"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                rows="6"
                placeholder="What's on your mind?"
                required
              />
            </div>
            <button type="submit" className="btn">Publish Post</button>
          </form>
        </section>
      );
    }

    if (selectedType === 'image') {
      return (
        <section className="panel-section">
          <h2>Upload Image</h2>
          <p className="muted">Share your images with the community</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="imageUpload">Select Image</label>
              <input
                type="file"
                id="imageUpload"
                accept="image/*"
                onChange={handleImageChange}
                required
              />
            </div>
            {previewUrl && (
              <div className="image-preview">
                <img src={previewUrl} alt="Preview" />
              </div>
            )}
            <div className="form-group">
              <label htmlFor="imageCaption">Caption (optional)</label>
              <textarea
                id="imageCaption"
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                rows="3"
                placeholder="Add a caption for your image"
              />
            </div>
            <button type="submit" className="btn">Upload Image</button>
          </form>
        </section>
      );
    }

    if (selectedType === 'tweet') {
      return (
        <section className="panel-section">
          <h2>Share Tweet</h2>
          <p className="muted">Post a tweet to share with the community</p>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="tweetContent">Tweet Content</label>
              <textarea
                id="tweetContent"
                value={tweetContent}
                onChange={(e) => setTweetContent(e.target.value)}
                rows="4"
                placeholder="What's happening?"
                maxLength="280"
                required
              />
              <div className="char-count">{tweetContent.length}/280</div>
            </div>
            <button type="submit" className="btn">Post Tweet</button>
          </form>
        </section>
      );
    }
  };

  return (
    <div className="upload-root">
      <div className="centered-wrapper">
        <main className="upload-table" role="region" aria-label="Upload Content">
          <aside className="left-col">
            <div className="profile-header">
              <div className="avatar">UP</div>
              <div className="left-info">
                <div className="left-name">Upload Center</div>
                <div className="left-title">Share your content</div>
              </div>
            </div>
            <ul>
              <li
                className={selectedType === 'post' ? 'active' : ''}
                onClick={() => setSelectedType('post')}
              >
                <span className="nav-label">Post</span>
                <span className="nav-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                    <path d="M2 2l7.586 7.586"></path>
                    <circle cx="11" cy="11" r="2"></circle>
                  </svg>
                </span>
              </li>
              <li
                className={selectedType === 'image' ? 'active' : ''}
                onClick={() => setSelectedType('image')}
              >
                <span className="nav-label">Image</span>
                <span className="nav-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <path d="M21 15l-5-5L5 21"></path>
                  </svg>
                </span>
              </li>
              <li
                className={selectedType === 'tweet' ? 'active' : ''}
                onClick={() => setSelectedType('tweet')}
              >
                <span className="nav-label">Tweet</span>
                <span className="nav-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                  </svg>
                </span>
              </li>
            </ul>
          </aside>
          <section className="right-col">
            <RightPanel />
          </section>
        </main>
      </div>
      <button
      className="see-posts-btn"
      onClick={() => navigate('/post')}
      aria-haspopup="dialog"
      >
        See Posts
      </button>
    </div>
  );
}