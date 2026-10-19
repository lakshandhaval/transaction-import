import { NavLink } from 'react-router-dom';
import { useUser } from '../context/UserContext';

export default function Navbar() {
  const { role, userName, setUserName, changeRole } = useUser();
  return (
    <header className="navbar">
      <div className="nav-inner">
        <NavLink className="brand" to="/">Transaction Import</NavLink>
        <nav>
          <NavLink to="/">Upload</NavLink>
          <NavLink to="/batches">Batches</NavLink>
          <NavLink to="/audit-logs">Audit Logs</NavLink>
        </nav>
        <div className="user-controls">
          <select aria-label="Role" value={role} onChange={(event) => changeRole(event.target.value)}>
            <option>Maker</option><option>Checker</option>
          </select>
          <input aria-label="User name" value={userName} onChange={(event) => setUserName(event.target.value)} />
        </div>
      </div>
      <p className="auth-note">Demo role switcher only — this is not real authentication.</p>
    </header>
  );
}
