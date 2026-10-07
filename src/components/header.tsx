
import { FC } from "react";
import { Link } from "react-router-dom";
import logo from '../assets/logo.png';
import { useAuth } from "../contexts/AuthContext";

const Header: FC = () => {
  const { isAdminLoggedIn } = useAuth();

  return (
     <header style={{ backgroundColor: 'white', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', borderBottom: '1px solid rgba(0, 0, 0, 0.1)' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto', padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Logo and Company Name */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none', color: 'inherit' }}>
            <div>
              <img src={logo} alt="Logo" style={{ width: '4rem', height: '4rem' }} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', lineHeight: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>MH INTERNATIONAL</h1>
              <p style={{ fontSize: '0.875rem', lineHeight: '1.25rem', color: 'var(--muted-foreground)' }}>Premium Auto Sales</p>
            </div>
          </Link>

          {/* Navigation and Admin Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Link
              to="/admin/dashboard"
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#1f2937',
                padding: '0.5rem 1rem',
                borderRadius: '0.375rem',
                border: '1px solid #d1d5db',
                textDecoration: 'none',
                backgroundColor: '#f9fafb'
              }}
            >
              {isAdminLoggedIn ? 'Admin Dashboard' : 'Admin Login'}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
