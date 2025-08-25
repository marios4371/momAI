import { useNavigate } from "react-router";

export default function Post() {

    const navigate = useNavigate();
    return(
        <div
        style = {{
            paddingLeft : '200px'
        }}
        >
            <h1>Hello Post</h1>
            <button
      className="see-upload-btn"
      onClick={() => navigate('/upload')}
      aria-haspopup="dialog"
      >
        Upload
      </button>

            
        </div>
    );
}