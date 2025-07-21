"use client"

import { Block } from '@/components'
import React from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'

export const KanbanBoardWrapper = ({ children }: { children: React.ReactNode }) => (
    <DndProvider backend={HTML5Backend}>
        <Block className="page-content">{children}</Block>
    </DndProvider>
)
