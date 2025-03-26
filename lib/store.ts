import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface Session {
  start: Date
  end?: Date
}

interface Task {
  id: string
  name: string
  date: string
  totalTime: number
  isRunning: boolean
  sessions: Session[]
}

interface TimerState {
  tasks: Task[]
  addTask: (name: string) => void
  startTimer: (taskId: string) => void
  stopTimer: (taskId: string) => void
  deleteTask: (taskId: string) => void
}

export const formatTime = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

// Funkcje do serializacji i deserializacji
const serializeState = (state: TimerState) => {
  return JSON.stringify({
    tasks: state.tasks.map(task => ({
      ...task,
      sessions: task.sessions.map(session => ({
        ...session,
        start: session.start ? session.start.toISOString() : undefined,
        end: session.end ? session.end.toISOString() : undefined
      }))
    }))
  })
}

const deserializeState = (str: string): Partial<TimerState> => {
  const parsed = JSON.parse(str)
  return {
    tasks: parsed.tasks.map((task: Task) => ({
      ...task,
      sessions: task.sessions.map(session => ({
        ...session,
        start: session.start ? new Date(session.start) : undefined,
        end: session.end ? new Date(session.end) : undefined
      }))
    }))
  }
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set) => ({
      tasks: [],
      
      addTask: (name) => set((state) => ({
        tasks: [
          ...state.tasks, 
          {
            id: `task-${Date.now()}`,
            name, 
            date: new Date().toLocaleDateString(),
            totalTime: 0,
            isRunning: false,
            sessions: []
          }
        ]
      })),
      
      startTimer: (taskId) => set((state) => ({
        tasks: state.tasks.map(task => 
          task.id === taskId 
            ? {
                ...task, 
                isRunning: true,
                sessions: [...task.sessions, { start: new Date() }]
              }
            : task
        )
      })),
      
      stopTimer: (taskId) => set((state) => {
        const updatedTasks = state.tasks.map(task => {
          if (task.id === taskId && task.isRunning) {
            const lastSession = task.sessions[task.sessions.length - 1]
            const endTime = new Date()
            const sessionDuration = Math.round((endTime.getTime() - lastSession.start.getTime()) / 1000)
            
            return {
              ...task,
              isRunning: false,
              totalTime: task.totalTime + sessionDuration,
              sessions: task.sessions.map((session, index) => 
                index === task.sessions.length - 1 
                  ? { ...session, end: endTime }
                  : session
              )
            }
          }
          return task
        })
        
        return { tasks: updatedTasks }
      }),
      
      deleteTask: (taskId) => set((state) => ({
        tasks: state.tasks.filter(task => task.id !== taskId)
      }))
    }),
    {
      name: 'timer-storage',
      storage: createJSONStorage(() => localStorage),
      
      // Własna implementacja serializacji
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          return str ? deserializeState(str) : null
        },
        setItem: (name, value) => {
          localStorage.setItem(name, serializeState(value as TimerState))
        },
        removeItem: (name) => {
          localStorage.removeItem(name)
        }
      }
    }
  )
)