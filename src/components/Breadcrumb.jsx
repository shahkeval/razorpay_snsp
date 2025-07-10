import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Breadcrumb = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  return (
    <nav>
      <ul className="breadcrumb">
        <li><Link to="/">Home</Link></li>
        {pathnames.map((value, index) => {
          const path = `/${pathnames.slice(0, index + 1).join('/')}`;
          return (
            <li key={path}>
              <Link to={path}>{value.charAt(0).toUpperCase() + value.slice(1)}</Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default Breadcrumb;
