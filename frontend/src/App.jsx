import { useState } from 'react'
import './App.css'

function App() {
  const [userFile, setUserFile] = useState(null);
  const [userPreviewUrl, setUserPreviewUrl] = useState(null);
  const [dressFile, setDressFile] = useState(null);
  const [dressPreviewUrl, setDressPreviewUrl] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (type === 'user') {
        setUserFile(file);
        setUserPreviewUrl(URL.createObjectURL(file));
      } else if (type === 'dress') {
        setDressFile(file);
        setDressPreviewUrl(URL.createObjectURL(file));
      }
      setResultUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!userFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', userFile);
    if (dressFile) {
      formData.append('dress', dressFile);
    }

    try {
      // Use proxy path for cloud environment
      const response = await fetch('/api/transform', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setResultUrl(data.transformedImageUrl);
      } else {
        alert('Transformation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <header>
        <h1>🍌 MZSZ Wedding</h1>
        <p>AI 웨딩드레스 가상 피팅 서비스</p>
      </header>

      <main>
        <div className="upload-container">
            {/* User Image Upload */}
            <div className="upload-section">
              <h3>1. 본인 사진</h3>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleFileChange(e, 'user')} 
                id="user-input"
                className="hidden"
              />
              <label htmlFor="user-input" className="upload-btn">
                {userFile ? '사진 변경' : '업로드'}
              </label>
            </div>

            {/* Dress Reference Upload */}
            <div className="upload-section">
              <h3>2. 입고 싶은 드레스 (선택)</h3>
              <input 
                type="file" 
                accept="image/*" 
                onChange={(e) => handleFileChange(e, 'dress')} 
                id="dress-input"
                className="hidden"
              />
              <label htmlFor="dress-input" className="upload-btn">
                {dressFile ? '드레스 변경' : '참고 드레스 업로드'}
              </label>
            </div>
        </div>

        <div className="display-section">
          {userPreviewUrl && (
            <div className="image-box">
              <h3>원본 사진</h3>
              <img src={userPreviewUrl} alt="User Original" />
            </div>
          )}

          {dressPreviewUrl && (
            <div className="image-box">
              <h3>참고 드레스</h3>
              <img src={dressPreviewUrl} alt="Dress Reference" />
            </div>
          )}

          {resultUrl && (
            <div className="image-box result-box">
              <h3>피팅 결과</h3>
              <img src={resultUrl} alt="Transformed" />
            </div>
          )}
        </div>

        {userFile && !resultUrl && (
          <button 
            onClick={handleUpload} 
            className="transform-btn"
            disabled={loading}
          >
            {loading ? 'AI가 드레스를 입혀드리는 중...' : '웨딩드레스 입혀보기'}
          </button>
        )}
      </main>
    </div>
  )
}

export default App