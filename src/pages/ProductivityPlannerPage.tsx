import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { supabase } from '../utils/supabaseClient';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  due_date: string;
  estimated_time: number; // in minutes
  actual_time?: number; // in minutes
  category: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  target_date: string;
  progress: number;
  created_at: string;
  updated_at: string;
  user_id: string;
}

const ProductivityPlannerPage: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'today' | 'tasks' | 'goals' | 'analytics'>('today');
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    due_date: new Date().toISOString().split('T')[0],
    estimated_time: 60,
    category: ''
  });

  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    target_date: new Date().toISOString().split('T')[0],
    progress: 0
  });

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchTasks();
      fetchGoals();
    }
  }, [user]);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTasks = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('productivity_tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchGoals = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('productivity_goals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
    }
  };

  const addTask = async () => {
    if (!user || !newTask.title.trim()) return;

    try {
      const { data, error } = await supabase
        .from('productivity_tasks')
        .insert([{
          title: newTask.title,
          description: newTask.description,
          priority: newTask.priority,
          status: 'pending',
          due_date: newTask.due_date,
          estimated_time: newTask.estimated_time,
          category: newTask.category,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setTasks(prev => [data, ...prev]);
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        due_date: new Date().toISOString().split('T')[0],
        estimated_time: 60,
        category: ''
      });
      setShowTaskForm(false);
    } catch (error) {
      console.error('Error adding task:', error);
      alert('Error adding task. Please try again.');
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('productivity_tasks')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;

      setTasks(prev => prev.map(task => 
        task.id === taskId ? { ...task, ...updates } : task
      ));
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Error updating task. Please try again.');
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user || !confirm('Are you sure you want to delete this task?')) return;

    try {
      const { error } = await supabase
        .from('productivity_tasks')
        .delete()
        .eq('id', taskId)
        .eq('user_id', user.id);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Error deleting task. Please try again.');
    }
  };

  const addGoal = async () => {
    if (!user || !newGoal.title.trim()) return;

    try {
      const { data, error } = await supabase
        .from('productivity_goals')
        .insert([{
          title: newGoal.title,
          description: newGoal.description,
          target_date: newGoal.target_date,
          progress: newGoal.progress,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) throw error;

      setGoals(prev => [data, ...prev]);
      setNewGoal({
        title: '',
        description: '',
        target_date: new Date().toISOString().split('T')[0],
        progress: 0
      });
      setShowGoalForm(false);
    } catch (error) {
      console.error('Error adding goal:', error);
      alert('Error adding goal. Please try again.');
    }
  };

  const updateGoal = async (goalId: string, updates: Partial<Goal>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('productivity_goals')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) throw error;

      setGoals(prev => prev.map(goal => 
        goal.id === goalId ? { ...goal, ...updates } : goal
      ));
    } catch (error) {
      console.error('Error updating goal:', error);
      alert('Error updating goal. Please try again.');
    }
  };

  const deleteGoal = async (goalId: string) => {
    if (!user || !confirm('Are you sure you want to delete this goal?')) return;

    try {
      const { error } = await supabase
        .from('productivity_goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) throw error;

      setGoals(prev => prev.filter(goal => goal.id !== goalId));
    } catch (error) {
      console.error('Error deleting goal:', error);
      alert('Error deleting goal. Please try again.');
    }
  };

  const getTodaysTasks = () => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(task => task.due_date === today);
  };

  const getCompletedTasksCount = () => {
    return tasks.filter(task => task.status === 'completed').length;
  };

  const getTotalEstimatedTime = () => {
    return tasks.reduce((total, task) => total + task.estimated_time, 0);
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

  // Show login prompt if not authenticated
  if (loading) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: 'url(/images/bg_image.png)' }}>
        <div className="min-h-screen bg-black/10">
          <Navbar />
          <div className="pt-20 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                <p className="text-white/80 mt-4">Loading...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-cover bg-center bg-fixed" style={{ backgroundImage: 'url(/images/bg_image.png)' }}>
        <div className="min-h-screen bg-black/10">
          <Navbar />
          <div className="pt-20 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-white/20 backdrop-blur-md rounded-xl p-8 border border-white/30 text-center">
                <h1 className="text-3xl font-bold text-white mb-4">Productivity Planner</h1>
                <p className="text-white/80 mb-8">Please log in to access your productivity planner and manage your tasks and goals.</p>
                <a
                  href="/login"
                  className="inline-block bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200"
                >
                  Log In
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const TaskCard: React.FC<{ task: Task }> = ({ task }) => (
    <div className="bg-white/20 backdrop-blur-md rounded-lg border border-white/30 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-white text-lg">{task.title}</h3>
        <div className="flex gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
            {task.priority}
          </span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(task.status)}`}>
            {task.status}
          </span>
        </div>
      </div>
      
      <p className="text-white/70 text-sm mb-3">{task.description}</p>
      
      <div className="flex justify-between items-center text-sm text-white/60">
        <div className="flex gap-4">
          <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
          <span>Est: {task.estimated_time}min</span>
          {task.category && <span>#{task.category}</span>}
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={() => updateTask(task.id, { 
              status: task.status === 'completed' ? 'pending' : 'completed' 
            })}
            className="p-1 hover:bg-white/20 rounded text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </button>
          <button
            onClick={() => setEditingTask(task)}
            className="p-1 hover:bg-white/20 rounded text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => deleteTask(task.id)}
            className="p-1 hover:bg-red-500/20 text-red-300 rounded"
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
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ backgroundImage: 'url(/images/bg_image.png)' }}
    >
      <div className="min-h-screen bg-black/10">
        <Navbar />
        
        <main className="pt-20 pb-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-white text-3xl font-bold">Productivity Planner</h1>
                <p className="text-white/70 text-lg mt-2">Plan your day and manage your tasks effectively</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowTaskForm(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200 flex items-center gap-2 shadow-lg"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Task
                </button>
                <button
                  onClick={() => setShowGoalForm(true)}
                  className="px-4 py-2 border border-white/40 text-white rounded-lg hover:bg-white/20 hover:border-white/60 transition-all duration-200 flex items-center gap-2 backdrop-blur-sm"
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
              <div className="bg-white/20 backdrop-blur-md rounded-lg border border-white/30 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Total Tasks</p>
                    <p className="text-2xl font-bold text-white">{tasks.length}</p>
                  </div>
                  <div className="p-3 bg-blue-500/20 rounded-full">
                    <svg className="w-6 h-6 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-md rounded-lg border border-white/30 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Completed</p>
                    <p className="text-2xl font-bold text-white">{getCompletedTasksCount()}</p>
                  </div>
                  <div className="p-3 bg-green-500/20 rounded-full">
                    <svg className="w-6 h-6 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-md rounded-lg border border-white/30 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Today's Tasks</p>
                    <p className="text-2xl font-bold text-white">{getTodaysTasks().length}</p>
                  </div>
                  <div className="p-3 bg-yellow-500/20 rounded-full">
                    <svg className="w-6 h-6 text-yellow-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white/20 backdrop-blur-md rounded-lg border border-white/30 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Total Hours</p>
                    <p className="text-2xl font-bold text-white">{Math.round(getTotalEstimatedTime() / 60)}</p>
                  </div>
                  <div className="p-3 bg-purple-500/20 rounded-full">
                    <svg className="w-6 h-6 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 bg-white/20 backdrop-blur-md p-1 rounded-lg mb-6 border border-white/30">
              {[
                { id: 'today', label: 'Today', icon: '📅' },
                { id: 'tasks', label: 'All Tasks', icon: '📋' },
                { id: 'goals', label: 'Goals', icon: '🎯' },
                { id: 'analytics', label: 'Analytics', icon: '📊' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-white/30 text-white shadow-sm backdrop-blur-sm'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
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
                  <h2 className="text-xl font-semibold text-white mb-4">Today's Tasks</h2>
                  {getTodaysTasks().length === 0 ? (
                    <div className="text-center py-12 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                      <svg className="mx-auto w-16 h-16 text-white/60 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-white/70 text-lg">No tasks for today!</p>
                      <button
                        onClick={() => setShowTaskForm(true)}
                        className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200"
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
                  <h2 className="text-xl font-semibold text-white mb-4">All Tasks</h2>
                  {tasks.length === 0 ? (
                    <div className="text-center py-12 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                      <svg className="mx-auto w-16 h-16 text-white/60 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <p className="text-white/70 text-lg">No tasks yet!</p>
                      <button
                        onClick={() => setShowTaskForm(true)}
                        className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200"
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
                  <h2 className="text-xl font-semibold text-white mb-4">Goals</h2>
                  {goals.length === 0 ? (
                    <div className="text-center py-12 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                      <svg className="mx-auto w-16 h-16 text-white/60 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-white/70 text-lg">No goals set yet!</p>
                      <button
                        onClick={() => setShowGoalForm(true)}
                        className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all duration-200"
                      >
                        Set Your First Goal
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {goals.map(goal => (
                        <div key={goal.id} className="bg-white/20 backdrop-blur-md rounded-lg border border-white/30 p-6 shadow-sm">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="font-semibold text-white text-xl">{goal.title}</h3>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingGoal(goal)}
                                className="p-1 hover:bg-white/20 rounded text-white"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => deleteGoal(goal.id)}
                                className="p-1 hover:bg-red-500/20 text-red-300 rounded"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          
                          <p className="text-white/70 mb-4">{goal.description}</p>
                          
                          <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-white">Progress</span>
                              <span className="text-sm text-white/70">{goal.progress}%</span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${goal.progress}%` }}
                              ></div>
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center text-sm text-white/60">
                            <span>Target: {new Date(goal.target_date).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'analytics' && (
                <div>
                  <h2 className="text-xl font-semibold text-white mb-4">Analytics</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white/20 backdrop-blur-md rounded-lg border border-white/30 p-6">
                      <h3 className="font-semibold text-white mb-4">Task Completion Rate</h3>
                      <div className="text-center">
                        <div className="text-4xl font-bold text-white mb-2">
                          {tasks.length > 0 ? Math.round((getCompletedTasksCount() / tasks.length) * 100) : 0}%
                        </div>
                        <p className="text-white/70">
                          {getCompletedTasksCount()} of {tasks.length} tasks completed
                        </p>
                      </div>
                    </div>

                    <div className="bg-white/20 backdrop-blur-md rounded-lg border border-white/30 p-6">
                      <h3 className="font-semibold text-white mb-4">Priority Distribution</h3>
                      <div className="space-y-3">
                        {['high', 'medium', 'low'].map(priority => {
                          const count = tasks.filter(t => t.priority === priority).length;
                          const percentage = tasks.length > 0 ? (count / tasks.length) * 100 : 0;
                          return (
                            <div key={priority} className="flex items-center justify-between">
                              <span className="capitalize text-white">{priority}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-24 bg-white/20 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      priority === 'high' ? 'bg-red-400' :
                                      priority === 'medium' ? 'bg-yellow-400' : 'bg-green-400'
                                    }`}
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-white/70 text-sm">{count}</span>
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/20 backdrop-blur-md rounded-lg p-6 w-full max-w-md border border-white/30">
              <h2 className="text-xl font-bold text-white mb-4">Add New Task</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Title</label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full bg-white/10 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    placeholder="Task title..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Description</label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                    className="w-full bg-white/10 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    rows={3}
                    placeholder="Task description..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Priority</label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask({...newTask, priority: e.target.value as any})}
                      className="w-full bg-white/10 border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    >
                      <option value="low" className="text-gray-800">Low</option>
                      <option value="medium" className="text-gray-800">Medium</option>
                      <option value="high" className="text-gray-800">High</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Due Date</label>
                    <input
                      type="date"
                      value={newTask.due_date}
                      onChange={(e) => setNewTask({...newTask, due_date: e.target.value})}
                      className="w-full bg-white/10 border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Estimated Time (min)</label>
                    <input
                      type="number"
                      value={newTask.estimated_time}
                      onChange={(e) => setNewTask({...newTask, estimated_time: parseInt(e.target.value)})}
                      className="w-full bg-white/10 border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                      min="1"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Category</label>
                    <input
                      type="text"
                      value={newTask.category}
                      onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                      className="w-full bg-white/10 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                      placeholder="work, personal..."
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowTaskForm(false)}
                  className="flex-1 px-4 py-2 border border-white/30 text-white rounded-lg hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={addTask}
                  disabled={!newTask.title.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all disabled:opacity-50"
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Goal Form Modal */}
        {showGoalForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white/20 backdrop-blur-md rounded-lg p-6 w-full max-w-md border border-white/30">
              <h2 className="text-xl font-bold text-white mb-4">Add New Goal</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Title</label>
                  <input
                    type="text"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal({...newGoal, title: e.target.value})}
                    className="w-full bg-white/10 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    placeholder="Goal title..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-white mb-1">Description</label>
                  <textarea
                    value={newGoal.description}
                    onChange={(e) => setNewGoal({...newGoal, description: e.target.value})}
                    className="w-full bg-white/10 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    rows={3}
                    placeholder="Goal description..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Target Date</label>
                    <input
                      type="date"
                      value={newGoal.target_date}
                      onChange={(e) => setNewGoal({...newGoal, target_date: e.target.value})}
                      className="w-full bg-white/10 border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-white mb-1">Initial Progress (%)</label>
                    <input
                      type="number"
                      value={newGoal.progress}
                      onChange={(e) => setNewGoal({...newGoal, progress: parseInt(e.target.value)})}
                      className="w-full bg-white/10 border border-white/30 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowGoalForm(false)}
                  className="flex-1 px-4 py-2 border border-white/30 text-white rounded-lg hover:bg-white/10 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={addGoal}
                  disabled={!newGoal.title.trim()}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg transition-all disabled:opacity-50"
                >
                  Add Goal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductivityPlannerPage; 