import React from 'react';
import SchemesPage from '../pages/SchemesPage';

/**
 * SchemesExplorer component (wraps SchemesPage with live Google Search Grounding fallback)
 */
export default function SchemesExplorer(props) {
  return <SchemesPage {...props} />;
}
