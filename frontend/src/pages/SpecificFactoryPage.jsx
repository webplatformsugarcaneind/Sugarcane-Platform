import React from 'react';
import { useParams } from 'react-router-dom';

const SpecificFactoryPage = () => {
  const { id } = useParams();

  return (
    <div className="specific-factory-page">
      <h1>SpecificFactoryPage</h1>
      <p>Factory Details for ID: {id}</p>
    </div>
  );
};

export default SpecificFactoryPage;