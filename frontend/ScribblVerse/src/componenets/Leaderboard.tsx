import "./Leaderboard.css";

function Leaderboard() {
  const leaderboardDict = {
    Alice: 1500,
    Bob: 1200,
    Charlie: 800,
    David: 970,
  };

  const leaderboardArray = Object.entries(leaderboardDict).map(
    ([name, score]) => ({
      name,
      score,
    })
  );


  return (
    <div className="leaderboard-container">
      <h1 className="title">Leaderboard</h1>
      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Score</th>
          </tr>
        </thead>
        <tbody>
          {leaderboardArray
            .sort((a, b) => b.score - a.score)
            .map((player, index) => (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{player.name}</td>
                <td>{player.score}</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

export default Leaderboard;
