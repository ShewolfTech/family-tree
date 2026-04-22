'use client';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  addEdge,
  useNodesState,
  useEdgesState,
  Connection,
  Edge,
  BackgroundVariant,
  MarkerType,
  NodeTypes,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Member, Relationship } from '@/types';
import MemberNode from './MemberNode';

interface TreeCanvasProps {
  members: Member[];
  relationships: Relationship[];
  onNodePositionChange: (id: string, x: number, y: number) => void;
  onEditMember: (member: Member) => void;
  onDeleteMember: (id: string) => void;
  onAddRelative: (member: Member) => void;
  onAddEdge: (connection: Connection) => void;
}

const edgeStyleByType: Record<string, { stroke: string; strokeDasharray?: string; label?: string }> = {
  'parent-child': { stroke: '#a78bfa' },
  'spouse': { stroke: '#f472b6', strokeDasharray: '5,3' },
  'sibling': { stroke: '#60a5fa', strokeDasharray: '2,2' },
};

export default function TreeCanvas({
  members,
  relationships,
  onNodePositionChange,
  onEditMember,
  onDeleteMember,
  onAddRelative,
  onAddEdge,
}: TreeCanvasProps) {
  const nodeTypes: NodeTypes = useMemo(
    () => ({ memberNode: MemberNode }),
    []
  );

  const nodes = useMemo(
    () =>
      members.map((m) => ({
        id: m._id,
        type: 'memberNode',
        position: { x: m.positionX, y: m.positionY },
        data: {
          member: m,
          onEdit: onEditMember,
          onDelete: onDeleteMember,
          onAddRelative: onAddRelative,
        },
      })),
    [members, onEditMember, onDeleteMember, onAddRelative]
  );

  const edges = useMemo(
    () =>
      relationships.map((r) => {
        const style = edgeStyleByType[r.type] || { stroke: '#3d3a6e' };
        return {
          id: r._id,
          source: r.sourceId,
          target: r.targetId,
          type: 'smoothstep',
          animated: r.type === 'spouse',
          style: { stroke: style.stroke, strokeWidth: 2, strokeDasharray: style.strokeDasharray },
          markerEnd: r.type === 'parent-child' ? { type: MarkerType.ArrowClosed, color: style.stroke } : undefined,
          label: r.type === 'spouse' ? '💑' : r.type === 'sibling' ? '👫' : undefined,
          labelStyle: { fill: '#9b96c2', fontSize: 12 },
          labelBgStyle: { fill: 'var(--bg-card)', fillOpacity: 0.9 },
        };
      }),
    [relationships]
  );

  const [rfNodes, setRfNodes, onNodesChange] = useNodesState(nodes);
  const [rfEdges, setRfEdges, onEdgesChange] = useEdgesState(edges);

  // Sync external changes → RF state
  useEffect(() => { setRfNodes(nodes); }, [nodes, setRfNodes]);
  useEffect(() => { setRfEdges(edges); }, [edges, setRfEdges]);

  // Debounce position saves
  const posTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const handleNodesChange = useCallback(
    (changes: Parameters<typeof onNodesChange>[0]) => {
      onNodesChange(changes);
      changes.forEach((change) => {
        if (change.type === 'position' && change.position && !change.dragging) {
          const { id } = change;
          clearTimeout(posTimers.current[id]);
          posTimers.current[id] = setTimeout(() => {
            onNodePositionChange(id, change.position!.x, change.position!.y);
          }, 600);
        }
      });
    },
    [onNodesChange, onNodePositionChange]
  );

  const handleConnect = useCallback(
    (connection: Connection) => {
      setRfEdges((eds) => addEdge(connection, eds));
      onAddEdge(connection);
    },
    [setRfEdges, onAddEdge]
  );

  return (
    <div style={{ flex: 1, position: 'relative' }}>
      <ReactFlow
        nodes={rfNodes}
        edges={rfEdges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        defaultEdgeOptions={{ type: 'smoothstep' }}
        deleteKeyCode={null}
        style={{ background: 'var(--bg-deep)' }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1}
          color="#2e2c52"
        />
        <Controls showInteractive={false} />
        <MiniMap
          nodeColor={(node) => {
            const m = node.data?.member as Member;
            if (!m) return '#3d3a6e';
            return m.gender === 'male' ? '#60a5fa' : m.gender === 'female' ? '#f472b6' : '#a78bfa';
          }}
          maskColor="rgba(15,14,26,0.8)"
          style={{ bottom: 16, right: 16 }}
        />
      </ReactFlow>

      {/* Edge legend */}
      <div style={{
        position: 'absolute', bottom: 16, left: 16, display: 'flex', flexDirection: 'column', gap: '6px',
        background: 'rgba(26,25,46,0.9)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 14px',
        backdropFilter: 'blur(8px)', zIndex: 5,
      }}>
        {[
          { color: '#a78bfa', label: 'Parent → Child', dash: 'none' },
          { color: '#f472b6', label: 'Spouse / Partner', dash: '5,3' },
          { color: '#60a5fa', label: 'Sibling', dash: '2,2' },
        ].map(({ color, label, dash }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="24" height="8"><line x1="0" y1="4" x2="24" y2="4" stroke={color} strokeWidth="2" strokeDasharray={dash === 'none' ? undefined : dash} /></svg>
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
