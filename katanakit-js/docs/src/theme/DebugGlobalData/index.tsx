import React, {type ReactNode} from 'react';
import useGlobalData from '@docusaurus/useGlobalData';
import DebugLayout from '@theme/DebugLayout';
import DebugJsonView from '@theme/DebugJsonView';

export default function DebugMetadata(): ReactNode {
  const globalData = useGlobalData();
  return (
    <DebugLayout>
      <h2>Global data</h2>
      <DebugJsonView src={globalData} collapseDepth={3} />
    </DebugLayout>
  );
}
