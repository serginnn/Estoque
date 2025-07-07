
//recebe a lista de atividades e a exibe.
export default function RecentActivity({ sessionActivity }) {
  return (
    <div className="recent-activity-container">
      <h4>Sua Atividade na Sessão</h4>
      {sessionActivity.length === 0 ? (
        <p>Nenhuma atividade registrada nesta sessão.</p>
      ) : (
        <ul>
          {sessionActivity.map((item, index) => (
            <li key={index}>
              <span className="activity-time">{item.time}</span>
              <span className="activity-details">{item.message}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}