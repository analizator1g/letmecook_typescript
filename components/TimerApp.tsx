'use client'

import React, { useState } from 'react'
import { useTimerStore, formatTime } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Play, Pause, Trash2 } from 'lucide-react'

export function TimerApp() {
  const { tasks, addTask, startTimer, stopTimer, deleteTask } = useTimerStore()
  const [newTaskName, setNewTaskName] = useState('')

  const handleAddTask = () => {
    if (newTaskName.trim()) {
      addTask(newTaskName)
      setNewTaskName('')
    }
  }

  return (
    <div className="container mx-auto max-w-md p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Śledzenie Czasu</h1>
      
      <div className="flex space-x-2 mb-6">
        <Input 
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          placeholder="Nazwa zadania" 
          onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
        />
        <Button onClick={handleAddTask}>Dodaj</Button>
      </div>

      <div className="space-y-4">
        {tasks.map((task) => {
          const lastSession = task.sessions[task.sessions.length - 1]
          const currentTime = task.totalTime + (task.isRunning 
            ? Math.round((Date.now() - (lastSession?.start instanceof Date 
              ? lastSession.start.getTime() 
              : Date.now())) / 1000)
            : 0)

          return (
            <Card key={task.id} className="w-full">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{task.name}</CardTitle>
                <span className="text-xs text-muted-foreground">{task.date}</span>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">{formatTime(currentTime)}</div>
                  <div className="flex space-x-2">
                    {task.isRunning ? (
                      <Button 
                        variant="destructive" 
                        size="icon" 
                        onClick={() => stopTimer(task.id)}
                      >
                        <Pause />
                      </Button>
                    ) : (
                      <Button 
                        variant="default" 
                        size="icon" 
                        onClick={() => startTimer(task.id)}
                      >
                        <Play />
                      </Button>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Trash2 className="text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Czy napewno chcesz usunąć zadanie?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tej operacji nie można cofnąć. Zadanie zostanie trwale usunięte.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Anuluj</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteTask(task.id)}>
                            Usuń
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}