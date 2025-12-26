import { useState } from 'react'
import './App.css'

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [resultUrl, setResultUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResultUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', selectedFile);

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
        <div className="upload-section">
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileChange} 
            id="file-input"
            className="hidden"
          />
          <label htmlFor="file-input" className="upload-btn">
            {selectedFile ? '사진 변경하기' : '본인 사진 업로드'}
          </label>
        </div>

        <div className="display-section">
          {previewUrl && (
            <div className="image-box">
              <h3>원본 사진</h3>
              <img src={previewUrl} alt="Original" />
            </div>
          )}

          {resultUrl && (
            <div className="image-box">
              <h3>웨딩드레스 피팅 결과</h3>
              <img src={resultUrl} alt="Transformed" />
            </div>
          )}
        </div>

        {selectedFile && !resultUrl && (
          <button 
            onClick={handleUpload} 
            className="transform-btn"
            disabled={loading}
          >
            {loading ? 'AI가 드레스를 입혀드리는 중...' : '웨딩드레스 입혀보기'}
          </button>
        )}
      </main>

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          text-align: center;
          font-family: 'Pretendard', sans-serif;
        }
        header h1 { color: #ff69b4; margin-bottom: 0.5rem; }
        .upload-section { margin: 2rem 0; }
        .hidden { display: none; }
        .upload-btn, .transform-btn {
          background: #ff69b4;
          color: white;
          padding: 0.8rem 2rem;
          border-radius: 50px;
          cursor: pointer;
          border: none;
          font-size: 1.1rem;
          transition: transform 0.2s;
        }
        .upload-btn:hover, .transform-btn:hover { transform: scale(1.05); }
        .transform-btn:disabled { background: #ccc; cursor: not-allowed; }
        .display-section {
          display: flex;
          gap: 2rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 2rem;
        }
        .image-box {
          flex: 1;
          min-width: 300px;
          border: 2px dashed #ff69b4;
          padding: 1rem;
          border-radius: 15px;
        }
        .image-box img {
          width: 100%;
          height: auto;
          border-radius: 10px;
        }
      `}</style>
    </div>
  )
}

export default App