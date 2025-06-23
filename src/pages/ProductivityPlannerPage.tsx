import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: string;
  estimatedTime: number; // in minutes
  actualTime?: number; // in minutes
  category: string;
  createdAt: Date;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  targetDate: string;
  progress: number;
  tasks: string[]; // task IDs
}

const ProductivityPlannerPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('productivity-tasks');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [goals, setGoals] = useState<Goal[]>(() => {
    const saved = localStorage.getItem('productivity-goals');
    return saved ? JSON.parse(saved) : [];
  });

  const [activeTab, setActiveTab] = useState<'today' | 'tasks' | 'goals' | 'analytics'>('today');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    dueDate: new Date().toISOString().split('T')[0],
    estimatedTime: 60,
    category: ''
  });

  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetDate: new Date().toISOString().split('T')[0],
    progress: 0
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('productivity-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('productivity-goals', JSON.stringify(goals));
  }, [goals]);

  const addTask = () => {
    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      status: 'pending',
      dueDate: newTask.dueDate,
      estimatedTime: newTask.estimatedTime,
      category: newTask.category,
      createdAt: new Date()
    };
    
    setTasks(prev => [...prev, task]);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      dueDate: new Date().toISOString().split('T')[0],
      estimatedTime: 60,
      category: ''
    });
    setShowTaskForm(false);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const addGoal = () => {
    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      targetDate: newGoal.targetDate,
      progress: newGoal.progress,
      tasks: []
    };
    
    setGoals(prev => [...prev, goal]);
    setNewGoal({
      title: '',
      description: '',
      targetDate: new Date().toISOString().split('T')[0],
      progress: 0
    });
    setShowGoalForm(false);
  };

  const updateGoal = (goalId: string, updates: Partial<Goal>) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId ? { ...goal, ...updates } : goal
    ));
  };

  const deleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
  };

  const getTodaysTasks = () => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(task => task.dueDate === today);
  };

  const getCompletedTasksCount = () => {
    return tasks.filter(task => task.status === 'completed').length;
  };

  const getTotalEstimatedTime = () => {
    return tasks.reduce((total, task) => total + task.estimatedTime, 0);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'in-progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => (
    <div className="bg-white rounded-lg border border-[#e0d5c7] p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-[#382f29] text-lg">{task.title}</h3>
        <div className="flex gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
        </div>
      </div>
      
      <p className="text-[#b8a99d] text-sm mb-3">{task.description}</p>
      
      <div className="flex justify-between items-center text-sm text-[#b8a99d]">
        <div className="flex gap-4">
          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
          <span>Est: {task.estimatedTime}min</span>
          {task.category && <span>#{task.category}</span>}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => updateTask(task.id, { 
              status: task.status === 'completed' ? 'pending' : 'completed' 
            })}
            className="p-1 hover:bg-[#f1f1f1] rounded"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button
            onClick={() => setEditingTask(task)}
            className="p-1 hover:bg-[#f1f1f1] rounded"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => deleteTask(task.id)}
            className="p-1 hover:bg-red-100 text-red-600 rounded"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex size-full min-h-screen flex-col bg-[#f6f0e4]" style={{ fontFamily: '"Space Grotesk", "Noto Sans", sans-serif' }}>
      <Navbar />
      
      <main className="flex-1 px-4 sm:px-10 md:px-20 lg:px-40 py-5">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-[#382f29] text-3xl font-bold">Productivity Planner</h1>
              <p className="text-[#b8a99d] text-lg mt-2">Plan your day and manage your tasks effectively</p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowTaskForm(true)}
                className="px-4 py-2 bg-[#382f29] text-white rounded-lg hover:bg-[#4a3f37] transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add Task
              </button>
              <button
                onClick={() => setShowGoalForm(true)}
                className="px-4 py-2 border border-[#382f29] text-[#382f29] rounded-lg hover:bg-[#382f29] hover:text-white transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Add Goal
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg border border-[#e0d5c7] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#b8a99d] text-sm">Total Tasks</p>
                  <p className="text-2xl font-bold text-[#382f29]">{tasks.length}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-[#e0d5c7] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#b8a99d] text-sm">Completed</p>
                  <p className="text-2xl font-bold text-[#382f29]">{getCompletedTasksCount()}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-[#e0d5c7] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#b8a99d] text-sm">Today's Tasks</p>
                  <p className="text-2xl font-bold text-[#382f29]">{getTodaysTasks().length}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-[#e0d5c7] p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[#b8a99d] text-sm">Total Hours</p>
                  <p className="text-2xl font-bold text-[#382f29]">{Math.round(getTotalEstimatedTime() / 60)}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-[#e0d5c7] p-1 rounded-lg mb-6">
            {[
              { id: 'today', label: 'Today', icon: '📅' },
              { id: 'tasks', label: 'All Tasks', icon: '📋' },
              { id: 'goals', label: 'Goals', icon: '🎯' },
              { id: 'analytics', label: 'Analytics', icon: '📊' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-[#382f29] shadow-sm'
                    : 'text-[#b8a99d] hover:text-[#382f29]'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="space-y-4">
            {activeTab === 'today' && (
              <div>
                <h2 className="text-xl font-semibold text-[#382f29] mb-4">Today's Tasks</h2>
                {getTodaysTasks().length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto w-16 h-16 text-[#b8a99d] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-[#b8a99d] text-lg">No tasks for today!</p>
                    <button
                      onClick={() => setShowTaskForm(true)}
                      className="mt-4 px-4 py-2 bg-[#382f29] text-white rounded-lg hover:bg-[#4a3f37]"
                    >
                      Add Your First Task
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {getTodaysTasks().map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'tasks' && (
              <div>
                <h2 className="text-xl font-semibold text-[#382f29] mb-4">All Tasks</h2>
                {tasks.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto w-16 h-16 text-[#b8a99d] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-[#b8a99d] text-lg">No tasks yet!</p>
                    <button
                      onClick={() => setShowTaskForm(true)}
                      className="mt-4 px-4 py-2 bg-[#382f29] text-white rounded-lg hover:bg-[#4a3f37]"
                    >
                      Create Your First Task
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {tasks.map(task => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'goals' && (
              <div>
                <h2 className="text-xl font-semibold text-[#382f29] mb-4">Goals</h2>
                {goals.length === 0 ? (
                  <div className="text-center py-12">
                    <svg className="mx-auto w-16 h-16 text-[#b8a99d] mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-[#b8a99d] text-lg">No goals set yet!</p>
                    <button
                      onClick={() => setShowGoalForm(true)}
                      className="mt-4 px-4 py-2 bg-[#382f29] text-white rounded-lg hover:bg-[#4a3f37]"
                    >
                      Set Your First Goal
                    </button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {goals.map(goal => (
                      <div key={goal.id} className="bg-white rounded-lg border border-[#e0d5c7] p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-semibold text-[#382f29] text-xl">{goal.title}</h3>
                          <div className="flex gap-2">
                            <button
                              onClick={() => setEditingGoal(goal)}
                              className="p-1 hover:bg-[#f1f1f1] rounded"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteGoal(goal.id)}
                              className="p-1 hover:bg-red-100 text-red-600 rounded"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        
                        <p className="text-[#b8a99d] mb-4">{goal.description}</p>
                        
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-[#382f29]">Progress</span>
                            <span className="text-sm text-[#b8a99d]">{goal.progress}%</span>
                          </div>
                          <div className="w-full bg-[#e0d5c7] rounded-full h-2">
                            <div
                              className="bg-[#382f29] h-2 rounded-full transition-all duration-300"
                              style={{ width: `${goal.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center text-sm text-[#b8a99d]">
                          <span>Target: {new Date(goal.targetDate).toLocaleDateString()}</span>
                          <span>{goal.tasks.length} linked tasks</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'analytics' && (
              <div>
                <h2 className="text-xl font-semibold text-[#382f29] mb-4">Analytics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg border border-[#e0d5c7] p-6">
                    <h3 className="font-semibold text-[#382f29] mb-4">Task Completion Rate</h3>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-[#382f29] mb-2">
                        {tasks.length > 0 ? Math.round((getCompletedTasksCount() / tasks.length) * 100) : 0}%
                      </div>
                      <p className="text-[#b8a99d]">
                        {getCompletedTasksCount()} of {tasks.length} tasks completed
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg border border-[#e0d5c7] p-6">
                    <h3 className="font-semibold text-[#382f29] mb-4">Priority Distribution</h3>
                    <div className="space-y-3">
                      {['high', 'medium', 'low'].map(priority => {
                        const count = tasks.filter(t => t.priority === priority).length;
                        const percentage = tasks.length > 0 ? (count / tasks.length) * 100 : 0;
                        return (
                          <div key={priority} className="flex items-center justify-between">
                            <span className="capitalize text-[#382f29]">{priority}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-24 bg-[#e0d5c7] rounded-full h-2">
                                <div
                                  className={`h-2 rounded-full ${
                                    priority === 'high' ? 'bg-red-500' :
                                    priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <span className="text-[#b8a99d] text-sm">{count}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Task Form Modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-[#382f29] mb-4">Add New Task</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#382f29] mb-1">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full border border-[#e0d5c7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#382f29]"
                  placeholder="Task title..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#382f29] mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="w-full border border-[#e0d5c7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#382f29]"
                  rows={3}
                  placeholder="Task description..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#382f29] mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value as any})}
                    className="w-full border border-[#e0d5c7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#382f29]"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#382f29] mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    className="w-full border border-[#e0d5c7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#382f29]"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#382f29] mb-1">Estimated Time (min)</label>
                  <input
                    type="number"
                    value={newTask.estimatedTime}
                    onChange={(e) => setNewTask({...newTask, estimatedTime: parseInt(e.target.value)})}
                    className="w-full border border-[#e0d5c7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#382f29]"
                    min="1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#382f29] mb-1">Category</label>
                  <input
                    type="text"
                    value={newTask.category}
                    onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                    className="w-full border border-[#e0d5c7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#382f29]"
                    placeholder="work, personal..."
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowTaskForm(false)}
                className="flex-1 px-4 py-2 border border-[#e0d5c7] text-[#382f29] rounded-lg hover:bg-[#f1f1f1]"
              >
                Cancel
              </button>
              <button
                onClick={addTask}
                disabled={!newTask.title.trim()}
                className="flex-1 px-4 py-2 bg-[#382f29] text-white rounded-lg hover:bg-[#4a3f37] disabled:opacity-50"
              >
                Add Task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Goal Form Modal */}
      {showGoalForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-[#382f29] mb-4">Add New Goal</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#382f29] mb-1">Title</label>
                <input
                  type="text"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                  className="w-full border border-[#e0d5c7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#382f29]"
                  placeholder="Goal title..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[#382f29] mb-1">Description</label>
                <textarea
                  value={newGoal.description}
                  onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                  className="w-full border border-[#e0d5c7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#382f29]"
                  rows={3}
                  placeholder="Goal description..."
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#382f29] mb-1">Target Date</label>
                  <input
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal({...newGoal, targetDate: e.target.value})}
                    className="w-full border border-[#e0d5c7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#382f29]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[#382f29] mb-1">Initial Progress (%)</label>
                  <input
                    type="number"
                    value={newGoal.progress}
                    onChange={(e) => setNewGoal({...newGoal, progress: parseInt(e.target.value)})}
                    className="w-full border border-[#e0d5c7] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#382f29]"
                    min="0"
                    max="100"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowGoalForm(false)}
                className="flex-1 px-4 py-2 border border-[#e0d5c7] text-[#382f29] rounded-lg hover:bg-[#f1f1f1]"
              >
                Cancel
              </button>
              <button
                onClick={addGoal}
                disabled={!newGoal.title.trim()}
                className="flex-1 px-4 py-2 bg-[#382f29] text-white rounded-lg hover:bg-[#4a3f37] disabled:opacity-50"
              >
                Add Goal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductivityPlannerPage; 