export default function MainContent({ children }) {
  return (
    <div
      style={{
        marginLeft: '200px',
        padding: '20px',
        minHeight: '100vh',
        backgroundColor: 'white',
      }}
    >
      {children}
    </div>
  );
}
