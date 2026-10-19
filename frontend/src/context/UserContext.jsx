import { createContext, useContext, useEffect, useState } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [role, setRole] = useState(() => localStorage.getItem('role') || 'Maker');
  const [userName, setUserName] = useState(() => localStorage.getItem('userName') || 'maker');

  useEffect(() => {
    localStorage.setItem('role', role);
    localStorage.setItem('userName', userName);
  }, [role, userName]);

  function changeRole(nextRole) {
    setRole(nextRole);
    setUserName(nextRole === 'Maker' ? 'maker' : 'checker');
  }

  return (
    <UserContext.Provider value={{ role, userName, setUserName, changeRole }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
