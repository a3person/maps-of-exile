import { useEffect, useMemo, useRef, useState } from 'react'
import { deduplicate, filter, ratingColor, scrollToElement, tierColor } from '../common'
import ReactFlow, { ControlButton, Controls, Panel } from 'reactflow'

import 'reactflow/dist/base.css'
import '@fortawesome/fontawesome-free/css/all.min.css'
import { possibleVoidstones } from '../data'
import useKeyPress from '../hooks/useKeyPress'
import usePersistedState from '../hooks/usePersistedState'

const scale = 2.5
const fullWidth = 1003.52
const fullHeight = 564.48
const offset = 6
const bgId = 'bg'

function toNode(map, matchingNodes, scoreHeatmap, voidstones) {
  let mapColor
  if (scoreHeatmap) {
    mapColor = `text-${ratingColor(map.score, 10)}`
  } else {
    mapColor = `text-${tierColor(map, voidstones)}`
  }

  let opacity = 1

  if (!matchingNodes.includes(map.name)) {
    opacity = 0.4
  }

  return {
    id: map.name,
    parentNode: bgId,
    position: {
      x: map.x * scale + offset,
      y: map.y * scale + offset
    },
    data: {
      label: (scoreHeatmap ? map.score + ' ' : 'T' + map.tiers[parseInt(voidstones)] + ' ') + map.name
    },
    className: `btn btn-dark border-1 ${mapColor}`,
    style: {
      opacity
    }
  }
}

function toLinks(map) {
  return map.connected.map(c => {
    const con = [map.name, c].sort()

    return {
      id: con[0] + '-' + con[1],
      source: con[0],
      target: con[1]
    }
  })
}

function onNodeClick(e, node) {
  if (node.id === bgId) {
    return
  }

  scrollToElement(node.id)
}

function fitView(flow, matchingNodes) {
  if (!flow) {
    return
  }

  flow.fitView({
    nodes: matchingNodes.map(n => ({ id: n }))
  })
}

function BackgroundNode({ data }) {
  return <img src={data.image} width={data.width} height={data.height} alt="" />
}

const Atlas = ({ maps, currentSearch }) => {
  const flowRef = useRef()
  const [full, setFull] = useState(false)
  const [scoreHeatmap, setScoreHeatmap] = usePersistedState('scoreHeatmap', false)
  const [voidstones, setVoidstones] = usePersistedState('voidstones', 0)

  const nodeTypes = useMemo(() => ({ background: BackgroundNode }), [])
  const connectedMaps = useMemo(() => maps.filter(m => m.connected.length > 0 && m.x > 0 && m.y > 0), [maps])
  const matchingNodes = useMemo(
    () => connectedMaps.filter(m => filter(currentSearch, m.search)).map(m => m.name),
    [connectedMaps, currentSearch]
  )

  const data = useMemo(
    () => ({
      nodes: [
        {
          id: bgId,
          type: 'background',
          position: {
            x: 0,
            y: 0
          },
          data: {
            image: '/atlas.webp',
            width: fullWidth * scale,
            height: fullHeight * scale
          },
          zIndex: -1,
          className: 'nodrag'
        }
      ].concat(connectedMaps.map(m => toNode(m, matchingNodes, scoreHeatmap, voidstones))),
      edges: deduplicate(
        connectedMaps.flatMap(m => toLinks(m)),
        'id'
      )
    }),
    [connectedMaps, matchingNodes, scoreHeatmap, voidstones]
  )

  useKeyPress(['Escape'], () => {
    if (full) {
      setFull(false)
    }
  })

  useEffect(() => {
    setTimeout(() => fitView(flowRef.current, matchingNodes), 150)
  }, [matchingNodes, full])

  return (
    <div
      className="d-none d-md-block"
      style={{
        width: '100%',
        height: full ? '100vh' : '50vh',
        backgroundColor: 'black'
      }}
    >
      <ReactFlow
        zoomOnScroll={full}
        preventScrolling={full}
        nodesDraggable={false}
        nodesConnectable={false}
        nodesFocusable={false}
        edgesFocusable={false}
        elementsSelectable={false}
        nodes={data.nodes}
        edges={data.edges}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        nodeOrigin={[0.5, 0.5]}
        defaultEdgeOptions={{
          type: 'simplebezier'
        }}
        proOptions={{
          hideAttribution: true
        }}
        onInit={flow => {
          flowRef.current = flow
          fitView(flowRef.current, matchingNodes)
        }}
      >
        <Panel position="bottom-left" className="card bg-light text-dark">
          <div className="card-body p-1">
            <i className="fa-solid fa-fw fa-gem" title="Voidstones" />{' '}
            <div className="btn-group" role="group">
              {possibleVoidstones.map(v => (
                <>
                  <button
                    className={'btn ' + (v === voidstones ? 'btn-dark' : 'text-secondary btn-outline-dark')}
                    onClick={e => setVoidstones(v)}
                  >
                    {v}
                  </button>
                </>
              ))}
            </div>
          </div>
        </Panel>
        <Controls position="bottom-right" showInteractive={false} showFitView={false}>
          <ControlButton onClick={() => fitView(flowRef.current, matchingNodes)} title="Reset position">
            <i className="fa-solid fa-fw fa-refresh" />
          </ControlButton>
          <ControlButton onClick={() => setScoreHeatmap(!scoreHeatmap)} title="Score heatmap">
            <i
              className="fa-solid fa-fw fa-sack-dollar"
              style={{
                color: scoreHeatmap ? 'green' : 'black'
              }}
            />
          </ControlButton>
          <ControlButton onClick={() => setFull(!full)} title="Fullscreen">
            {full ? <i className="fa-solid fa-fw fa-minimize" /> : <i className="fa-solid fa-fw fa-expand" />}
          </ControlButton>
        </Controls>
      </ReactFlow>
    </div>
  )
}

export default Atlas
