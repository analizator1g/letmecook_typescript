import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Task {
  id: number
  name: string
  date: string
  totalTime: number
  sessions: Array<{
    start: Date
    duration: number
  }>
  isRunning?: boolean
}

interface TimerState {
  tasks: Task[]
  addTask: (name: string) => void
  startTimer: (taskId: number) => void
  stopTimer: (taskId: number) => void
  deleteTask: (taskId: number) => void
}

export const useTimerStore = create<TimerState>()(
  persist(
    (set) => ({
      tasks: [],
      
      addTask: (name: string) => {
        const newTask: Task = {
          id: Date.now(),
          name,
          date: new Date().toLocaleDateString(),
          totalTime: 0,
          sessions: [],
          isRunning: true
        }
        set(state => ({ tasks: [newTask, ...state.tasks] }))
      },
      
      startTimer: (taskId: number) => {
        set(state => ({
          tasks: state.tasks.map(task => 
            task.id === taskId
              ? { ...task, isRunning: true }
              : task
          )
        }))
      },
      
      stopTimer: (taskId: number) => {
        set(state => {
          const updatedTasks = state.tasks.map(task => {
            if (task.id === taskId && task.isRunning) {
              const lastSession = task.sessions[task.sessions.length - 1]
              const sessionDuration = Math.round(
                (Date.now() - (lastSession?.start instanceof Date 
                  ? lastSession.start.getTime() 
                  : Date.now())) / 1000
              )
              
              return {
                ...task,
                totalTime: task.totalTime + sessionDuration,
                sessions: [
                  ...task.sessions,
                  { start: new Date(), duration: sessionDuration }
                ],
                isRunning: false
              }
            }
            return task
          })
          
          return { tasks: updatedTasks }
        })
      },
      
      deleteTask: (taskId: number) => {
        set(state => ({
          tasks: state.tasks.filter(task => task.id !== taskId)
        }))
      }
    }),
    {
      name: 'timer-storage',
      storage: localStorage // Zmieniono z getStorage na storage
    }
  )
)

export const formatTime = (totalSeconds: number) => {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}