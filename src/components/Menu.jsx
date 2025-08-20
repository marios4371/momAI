export default function MenuButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        position: 'fixed',
        top: '20px',
        left: '20px',
        zIndex: 1100,
        padding: '10px 15px',
        fontSize: '16px',
        backgroundColor: '#e6e6e6',
        color: 'black',
      }}
    >
      ☰
    </button>
  );
}
