
import React from 'react';

import { SystemDesign } from '../utils/systemDesigner';



interface DesignViewerProps {

  design: SystemDesign | null;

}



const DesignViewer: React.FC<DesignViewerProps> = ({ design }) => {

  if (!design) {

    return <div>No design generated yet.</div>;

  }

  return (

    <div>

      <h3>System Design</h3>

      <pre>{JSON.stringify(design, null, 2)}</pre>

    </div>

  );

};



export default DesignViewer;
